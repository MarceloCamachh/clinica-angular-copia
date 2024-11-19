import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicalRecordService } from '../../services/medical-record.service';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { MedicalRecordDTO, UpdateMedicalRecordDTO } from '../../models/medical-record.model';

@Component({
  selector: 'app-edit-medical-record',
  templateUrl: './edit-medical-record.component.html',
  styleUrls: ['./edit-medical-record.component.scss'],
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
export class EditMedicalRecordComponent implements OnInit {
  medicalRecordForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private medicalRecordService: MedicalRecordService,
    private snackBarService: SnackbarService,
    private dialogRef: MatDialogRef<EditMedicalRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { medicalRecord: MedicalRecordDTO }
  ) {
    this.medicalRecordForm = this.fb.group({
      bloodType: [data.medicalRecord.bloodType || ''],
      allergies: [data.medicalRecord.allergies?.join(', ') || ''],
      chronicConditions: [data.medicalRecord.chronicConditions?.join(', ') || ''],
      familyHistory: [data.medicalRecord.familyHistory?.join(', ') || ''],
      height: [data.medicalRecord.height || ''],
      weight: [data.medicalRecord.weight || '']
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.medicalRecordForm.valid && !this.loading) {
      this.loading = true;
      const formData = this.prepareMedicalRecordData();

      this.medicalRecordService.updateMedicalRecord(this.data.medicalRecord.id, formData).subscribe({
        next: () => {
          this.snackBarService.openSuccessSnackBar({
            message: 'Historial médico actualizado con éxito'
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBarService.openFailureSnackBar({
            message: 'Error al actualizar el historial médico: ' + (error.error?.message || 'Error desconocido')
          });
          this.loading = false;
        }
      });
    }
  }

  private prepareMedicalRecordData(): UpdateMedicalRecordDTO {
    const formValue = this.medicalRecordForm.value;
    return {
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
