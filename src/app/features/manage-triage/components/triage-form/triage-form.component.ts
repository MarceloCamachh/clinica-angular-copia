import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormType } from '@shared/enums/FormType';
import { Triage } from '../../models/triage.model';
import { TriageService } from '../../services/triage.service';
import { UserService } from '@core/services/user.service';
import { Observable, EMPTY } from 'rxjs';
import { User } from '@core/models/user/User';
import { SnackbarService } from '@shared/services/snackbar.service';
import { catchError, finalize } from 'rxjs/operators';



@Component({
  selector: 'app-triage-form',
  templateUrl: './triage-form.component.html',
  styleUrls: ['./triage-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ]
})
export class TriageFormComponent implements OnInit {
  FormType = FormType;
  @Input() action!: string;
  @Input() formType!: FormType;
  @Input() dialogRef?: MatDialogRef<any>;
  @Input() triageData?: Triage;

  triageForm: FormGroup;
  loading = false;
  formErrors: { [key: string]: string } = {};
  patients$: Observable<User[]>;
  currentDoctor?: User;

  priorityLevels = [
    { value: 'LEVEL_1', label: 'Nivel 1 - Resucitación' },
    { value: 'LEVEL_2', label: 'Nivel 2 - Emergencia' },
    { value: 'LEVEL_3', label: 'Nivel 3 - Urgente' },
    { value: 'LEVEL_4', label: 'Nivel 4 - Menor Urgencia' },
    { value: 'LEVEL_5', label: 'Nivel 5 - No Urgente' }
  ];

  constructor(
    private fb: FormBuilder,
    private triageService: TriageService,
    private userService: UserService,
    private snackBarService: SnackbarService
  ) {
    this.triageForm = this.fb.group({});
    this.patients$ = this.userService.getPatients();
    this.loadCurrentDoctor();
    this.initForm();
  }

  ngOnInit() {
    if (this.triageData) {
      this.triageForm.patchValue(this.triageData);
    }
  }

  private loadCurrentDoctor() {
    this.loading = true;
    this.userService.getCurrentDoctor().subscribe({
      next: (doctor) => {
        this.currentDoctor = doctor;
        this.triageForm.patchValue({
          doctorId: doctor.id
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el doctor:', error);
        this.snackBarService.openFailureSnackBar({
          message: 'Error al cargar la información del doctor'
        });
        this.loading = false;
      }
    });
  }

  private initForm() {
    this.triageForm = this.fb.group({
      patientId: ['', Validators.required],
      vitalSigns: this.fb.group({
        temperature: ['', [Validators.required, Validators.min(35), Validators.max(42)]],
        systolicBP: ['', [Validators.required, Validators.min(60), Validators.max(200)]],
        diastolicBP: ['', [Validators.required, Validators.min(40), Validators.max(130)]],
        heartRate: ['', [Validators.required, Validators.min(40), Validators.max(200)]],
        respiratoryRate: ['', [Validators.required, Validators.min(8), Validators.max(40)]],
        oxygenSaturation: ['', [Validators.required, Validators.min(70), Validators.max(100)]],
        bloodGlucose: ['']
      }),
      priority: ['', Validators.required],
      chiefComplaint: ['', Validators.required],
      medicalHistory: [''],
      allergies: [''],
      neurologicalAssessment: this.fb.group({
        verbalResponse: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
        eyeOpening: ['', [Validators.required, Validators.min(1), Validators.max(4)]],
        motorResponse: ['', [Validators.required, Validators.min(1), Validators.max(6)]],
        basicNeurologicalFunctions: ['', Validators.required]
      }),
      observations: ['']
    });
  }

  onSubmit() {
    console.log('Estado del formulario:', this.triageForm.value);
    console.log('¿Formulario válido?', this.triageForm.valid);
    console.log('Errores del formulario:', this.triageForm.errors);
    
    if (!this.currentDoctor) {
      console.error('No hay doctor actual');
      this.snackBarService.openFailureSnackBar({
        message: 'Error: No se ha cargado la información del doctor'
      });
      return;
    }

    if (this.triageForm.valid && !this.loading) {
      const formData = this.triageForm.value;
      const triageData = {
        ...formData,
        nurseId: this.currentDoctor.id,
        triageDate: new Date().toISOString()
      };
      
      console.log('Datos a enviar:', triageData);
      this.loading = true;

      this.triageService.createTriage(triageData).pipe(
        finalize(() => {
          console.log('Finalizando request');
          this.loading = false;
        })
      ).subscribe({
        next: (response) => {
          console.log('Respuesta exitosa:', response);
          this.snackBarService.openSuccessSnackBar({
            message: 'Triaje creado con éxito'
          });
          this.dialogRef?.close(true);
        },
        error: (error) => {
          console.error('Error al crear triaje:', error);
          this.snackBarService.openFailureSnackBar({
            message: `Error al crear el triaje: ${error.error?.message || 'Error desconocido'}`
          });
        }
      });
    } else {
      console.log('Formulario inválido. Revisando errores...');
      this.checkFormErrors();
      Object.keys(this.triageForm.controls).forEach(key => {
        const control = this.triageForm.get(key);
        console.log(`Control ${key}:`, {
          errors: control?.errors,
          valid: control?.valid,
          value: control?.value
        });
      });
    }
  }

  private checkFormErrors() {
    Object.keys(this.triageForm.controls).forEach(key => {
      const control = this.triageForm.get(key);
      if (control?.errors) {
        this.formErrors[key] = this.getErrorMessage(control.errors);
      }
    });
  }

  public getErrorMessage(errors: any): string {
    if (errors.required) return 'Este campo es requerido';
    if (errors.min) return `El valor mínimo es ${errors.min.min}`;
    if (errors.max) return `El valor máximo es ${errors.max.max}`;
    return 'Campo inválido';
  }

  onCancel(): void {
    this.dialogRef?.close();
  }
}
