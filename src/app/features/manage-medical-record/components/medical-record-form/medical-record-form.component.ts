import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MedicalRecordService } from '../../services/medical-record.service';
import { UserService } from '@app/core/services/user.service';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { CreateMedicalRecordDTO } from '../../models/medical-record.model';
import { Observable } from 'rxjs';
import { User } from '@app/core/models/user/User';

@Component({
  selector: 'app-medical-record-form',
  templateUrl: './medical-record-form.component.html',
  styleUrls: ['./medical-record-form.component.scss'],
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
export class MedicalRecordFormComponent implements OnInit {
  medicalRecordForm: FormGroup;
  loading = false;
  patients$: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private medicalRecordService: MedicalRecordService,
    private userService: UserService,
    private SnackbarService: SnackbarService,
    private dialogRef: MatDialogRef<MedicalRecordFormComponent>
  ) {
    this.medicalRecordForm = this.fb.group({
      patientId: ['', Validators.required],
      bloodType: [''],
      allergies: [''],
      chronicConditions: [''],
      familyHistory: [''],
      height: [''],
      weight: ['']
    });
    
    this.patients$ = this.userService.getPatients();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.medicalRecordForm.valid && !this.loading) {
      this.loading = true;
      const formData = this.prepareMedicalRecordData();

      this.medicalRecordService.createMedicalRecord(formData).subscribe({
        next: () => {
          this.SnackbarService.openSuccessSnackBar({
            message: 'Historial médico creado con éxito'
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.SnackbarService.openFailureSnackBar({
            message: 'Error al crear el historial médico: ' + (error.error?.message || 'Error desconocido')
          });
          this.loading = false;
        }
      });
    }
  }

  private prepareMedicalRecordData(): CreateMedicalRecordDTO {
    const formValue = this.medicalRecordForm.value;
    return {
      patientId: formValue.patientId,
      bloodType: formValue.bloodType,
      allergies: formValue.allergies?.split(',').map((item: string) => item.trim()) || [],
      chronicConditions: formValue.chronicConditions?.split(',').map((item: string) => item.trim()) || [],
      familyHistory: formValue.familyHistory?.split(',').map((item: string) => item.trim()) || [],
      height: formValue.height,
      weight: formValue.weight
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
