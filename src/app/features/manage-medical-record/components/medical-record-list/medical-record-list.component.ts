import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MedicalRecordService } from '../../services/medical-record.service';
import { MedicalRecordDTO } from '../../models/medical-record.model';
import { SnackbarService } from '@app/shared/services/snackbar.service';

@Component({
  selector: 'app-medical-record-list',
  templateUrl: './medical-record-list.component.html',
  styleUrls: ['./medical-record-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class MedicalRecordListComponent implements OnInit {
  displayedColumns: string[] = ['patient', 'bloodType', 'createdAt', 'actions'];
  dataSource: MedicalRecordDTO[] = [];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private medicalRecordService: MedicalRecordService,
    private dialog: MatDialog,
    private snackBarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  loadMedicalRecords(): void {
    this.loading = true;
    // Aquí implementaremos la carga de registros cuando tengamos el endpoint paginado
  }

  editMedicalRecord(record: MedicalRecordDTO): void {
    // Implementaremos la edición cuando creemos el componente de edición
  }

  deleteMedicalRecord(record: MedicalRecordDTO): void {
    if (confirm(`¿Está seguro de eliminar el historial médico del paciente ${record.patient.name}?`)) {
      this.medicalRecordService.deleteMedicalRecord(record.id).subscribe({
        next: () => {
          this.snackBarService.openSuccessSnackBar({
            message: 'Historial médico eliminado con éxito'
          });
          this.loadMedicalRecords();
        },
        error: (error) => {
          this.snackBarService.openFailureSnackBar({
            message: `Error al eliminar el historial médico: ${error.error?.message || 'Error desconocido'}`
          });
        }
      });
    }
  }
}
