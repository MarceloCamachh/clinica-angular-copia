import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MedicalRecordService } from '../../services/medical-record.service';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { MedicalRecordDTO } from '../../models/medical-record.model';
import { SpinnerService } from '@app/shared/spinner/spinner.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { MedicalRecordFormComponent } from '../../components/medical-record-form/medical-record-form.component';
import { EditMedicalRecordComponent } from '../../components/edit-medical-record/edit-medical-record.component';
import { AuthService } from '@app/core/authentication/auth.service';

@Component({
  selector: 'app-manage-medical-record-page',
  templateUrl: './manage-medical-record-page.component.html',
  styleUrls: ['./manage-medical-record-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule
  ]
})
export class ManageMedicalRecordPageComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<MedicalRecordDTO>();
  displayedColumns = ['patient', 'bloodType', 'updatedAt'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private medicalRecordService: MedicalRecordService,
    private snackBarService: SnackbarService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadMedicalRecords(): void {
    this.spinnerService.show();
    this.medicalRecordService.getPagedMedicalRecords({}).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.spinnerService.hide();
      },
      error: () => {
        this.snackBarService.openFailureSnackBar({
          message: 'Error al cargar los historiales médicos'
        });
        this.spinnerService.hide();
      }
    });
  }

  openAddMedicalRecordDialog() {
    const dialogRef = this.dialog.open(MedicalRecordFormComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMedicalRecords();
      }
    });
  }

  editMedicalRecord(record: MedicalRecordDTO) {
    const dialogRef = this.dialog.open(EditMedicalRecordComponent, {
      width: '600px',
      data: { medicalRecord: record }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMedicalRecords();
      }
    });
  }

  deleteMedicalRecord(record: MedicalRecordDTO) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Historial Médico',
        message: `¿Está seguro que desea eliminar el historial médico del paciente ${record.patient.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinnerService.show();
        this.medicalRecordService.deleteMedicalRecord(record.id).subscribe({
          next: () => {
            this.snackBarService.openSuccessSnackBar({
              message: 'Historial médico eliminado exitosamente'
            });
            this.loadMedicalRecords();
          },
          error: () => {
            this.snackBarService.openFailureSnackBar({
              message: 'Error al eliminar el historial médico'
            });
          },
          complete: () => {
            this.spinnerService.hide();
          }
        });
      }
    });
  }
}
