import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MappedMedicalHistory } from '../models/MappedTriage.model';
import { MedicalRecordReportComponent } from './MedicalRecordReportComponent';

@Component({
  selector: 'app-medical-record-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MedicalRecordReportComponent
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Generador de Reportes</h2>
      <mat-dialog-content>
        <app-medical-record-report [medicalHistory]="data"></app-medical-record-report>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    mat-dialog-content {
      max-height: none;
    }
  `]
})
export class MedicalRecordReportDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MedicalRecordReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MappedMedicalHistory
  ) {}
}
