import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicalRecordReportComponent } from '../../reporte/MedicalRecordReportComponent';
import { MedicalRecordDTO } from '../../models/medical-record.model';
import { MappedMedicalHistory } from '../../models/MappedTriage.model';
import { TriageService } from '../../../manage-triage/services/triage.service';
import { AppointmentService } from '@shared/services/appointment.service';
import { SnackbarService } from '@shared/services/snackbar.service';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MedicalRecordReportDialogComponent } from '../../reporte/medical-record-report-dialog.component';

@Component({
  selector: 'app-personal-medical-record',
  templateUrl: './personal-medical-record.component.html',
  styleUrls: ['./personal-medical-record.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MedicalRecordReportComponent,
    MatDialogModule
  ]
})
export class PersonalMedicalRecordComponent implements OnInit {
  @Input() medicalRecord!: MedicalRecordDTO;
  mappedHistory: MappedMedicalHistory = {
    triages: [],
    appointments: [],
    prescriptions: [],
    labResults: []
  };
  loading = false;

  constructor(
    private triageService: TriageService,
    private appointmentService: AppointmentService,
    private snackBarService: SnackbarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.medicalRecord) {
      this.loadAssociatedData();
    }
  }

  private loadAssociatedData(): void {
    if (!this.medicalRecord?.triageIds?.length) {
      this.loading = false;
      return;
    }

    this.loading = true;
    const triageRequests = this.medicalRecord.triageIds.map(id =>
      this.triageService.getTriageById(id)
    );

    forkJoin(triageRequests).subscribe({
      next: (triages) => {
        this.mappedHistory.triages = triages.map(triage => ({
          id: triage.id,
          doctor: triage.doctor ? 
            `${triage.doctor.name || ''} ${triage.doctor.surname || ''}`.trim() : 
            'Doctor no especificado',
          especialidad: triage.doctor?.doctorDetails?.specialization || 'No especificada',
          prioridad: triage.priority,
          quejaPrincipal: triage.chiefComplaint || 'No especificado',
          observaciones: triage.observations || null,
          signosVitales: {
            presionArterial: triage.vitalSigns ? 
              `${triage.vitalSigns.systolicBP || 0}/${triage.vitalSigns.diastolicBP || 0}` : 
              'No registrado',
            frecuenciaCardiaca: triage.vitalSigns?.heartRate || 0,
            temperatura: triage.vitalSigns?.temperature || 0,
            saturacionOxigeno: triage.vitalSigns?.oxygenSaturation || 0,
            frecuenciaRespiratoria: triage.vitalSigns?.respiratoryRate || 0
          }
        }));
      },
      error: (error) => {
        console.error('Error al obtener triages:', error);
        this.snackBarService.openFailureSnackBar({
          message: 'Error al cargar los datos de triaje'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openReportGenerator(): void {
    this.dialog.open(MedicalRecordReportDialogComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: this.mappedHistory,
      panelClass: 'report-dialog'
    });
  }
}
