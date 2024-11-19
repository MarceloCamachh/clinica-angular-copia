import { MatDialog } from '@angular/material/dialog';

import { User } from '@app/core/models/user/User';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { AddPatientComponent } from '../../components/add-patient/add-patient.component';
import { EditPatientComponent } from '../../components/edit-patient/edit-patient.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { UserRole } from '@app/core/enums/UserRole';
import { SpinnerService } from '@app/shared/spinner/spinner.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '@app/core/services/user.service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';


import { PaginatorComponent } from '@app/shared/components/paginator/paginator.component';

import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-manage-patients-page',
  standalone: true,
  imports: [
    MatPaginator,
    MatTable,
    MatHeaderCellDef,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatRowDef,
    MatHeaderRowDef,
    MatHeaderRow,
    MatCell,
    MatRow,
    MatIcon,
    MatIconButton,
    MatButton,
    PaginatorComponent
  ],
  templateUrl: './manage-patients-page.component.html',
  styleUrls: ['./manage-patients-page.component.scss']
})
export class ManagePatientsPageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource: MatTableDataSource<User>;
  displayedColumns: string[] = ['name', 'surname', 'email', 'phoneNumber', 'actions'];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private toast: SnackbarService,
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new MatTableDataSource<User>();
  }

  ngOnInit() {
    this.loadPatients();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  loadPatients() {
    this.spinnerService.show();
    this.userService.getPagedUsers({ 
      roles: [UserRole.PATIENT],
      'page-size': 10,
      'page-num': 0
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
      },
      error: () => {
        this.toast.openFailureSnackBar({
          message: 'Error al cargar los pacientes'
        });
      },
      complete: () => {
        this.spinnerService.hide();
      }
    });
  }

  openAddPatientDialog() {
    const dialogRef = this.dialog.open(AddPatientComponent, {
      width: '800px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPatients();
      }
    });
  }

  editPatient(patient: User) {
    const dialogRef = this.dialog.open(EditPatientComponent, {
      width: '800px',
      data: { user: patient },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPatients();
      }
    });
  }

  deletePatient(patient: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Paciente',
        message: `¿Está seguro que desea eliminar al paciente ${patient.name} ${patient.surname}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinnerService.show();
        this.userService.deleteUser(patient.id).subscribe({
          next: () => {
            this.toast.openSuccessSnackBar({
              message: 'Paciente eliminado exitosamente'
            });
            this.loadPatients();
          },
          error: () => {
            this.toast.openFailureSnackBar({
              message: 'Error al eliminar el paciente'
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
