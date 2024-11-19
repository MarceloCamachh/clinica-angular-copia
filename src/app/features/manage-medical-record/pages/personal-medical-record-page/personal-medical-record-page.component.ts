import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicalRecordService } from '../../services/medical-record.service';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { MedicalRecordDTO } from '../../models/medical-record.model';
import { AuthService } from '@app/core/authentication/auth.service';
import { PersonalMedicalRecordComponent } from '../../components/personal-medical-record/personal-medical-record.component';

@Component({
  selector: 'app-personal-medical-record-page',
  templateUrl: './personal-medical-record-page.component.html',
  styleUrls: ['./personal-medical-record-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    PersonalMedicalRecordComponent
  ]
})
export class PersonalMedicalRecordPageComponent implements OnInit {
  medicalRecord: MedicalRecordDTO | null = null;
  loading = false;

  constructor(
    private medicalRecordService: MedicalRecordService,
    private snackBarService: SnackbarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPersonalRecord();
  }

  private loadPersonalRecord(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.snackBarService.openFailureSnackBar({
        message: 'No se pudo obtener el usuario actual'
      });
      this.loading = false;
      return;
    }

    this.medicalRecordService.getMedicalRecordByPatientId(currentUser.id).subscribe({
      next: (record) => {
        this.medicalRecord = record;
        this.loading = false;
      },
      error: (error) => {
        this.snackBarService.openFailureSnackBar({
          message: 'Error al cargar el historial médico'
        });
        this.loading = false;
      }
    });
  }
}
