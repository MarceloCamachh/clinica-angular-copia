import { UserService } from '@app/core/services/user.service';
import { UserRole } from '@app/core/enums/UserRole';
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

import { PageRequestResponseData } from '@app/shared/models/PageRequestResponseData';
import { User } from '@app/core/models/user/User';
import { CapitalizeSpaceBetweenPipe } from '@app/shared/pipes/capitalize-space-between.pipe';
import { TableHelper } from '@app/shared/helpers/tableHelper';
import { LastPropertyPipe } from '@app/shared/pipes/last-property.pipe';
import { PaginatorComponent } from '@app/shared/components/paginator/paginator.component';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { UserPageRequestParams } from '@app/shared/models/UserPageRequestParams';
import { DatePipe } from '@app/shared/pipes/date.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { MatCheckbox } from '@angular/material/checkbox';
import { SpinnerService } from '@app/shared/spinner/spinner.service';
//import { EditUserComponent } from '../../components/edit-user/edit-user.component';
import { UserRoles, RoleDescription } from '@app/features/manage-roles/UserRoles';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RoleDialogComponent } from './components/role-dialog/role-dialog.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { RoleService } from './services/role.service';

@Component({
    selector: 'app-manage-roles',
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
      DatePipe,
      MatIcon,
      MatIconButton,
      MatButton,
      MatCheckbox,
      PaginatorComponent
    ],
    templateUrl: './manage-roles.component.html',
    styleUrl: './manage-roles.component.scss',
  })
  export class ManageRolesComponent implements OnInit {
    @ViewChild(MatPaginator) paginator?: MatPaginator;
    dataSource: MatTableDataSource<RoleDescription>;
    pageUserResponseData?: PageRequestResponseData<User>;
    tableHelper = new TableHelper();
    requestParams: UserPageRequestParams = {};
    showDisabled?: boolean = false;
    displayedColumns: string[] = ['code', 'name', 'description', 'actions'];
  
    constructor(
      private readonly roleService: RoleService,
      private readonly toast: SnackbarService,
      private readonly dialog: MatDialog
    ) {
      this.dataSource = new MatTableDataSource<RoleDescription>([]);
    }
  
    ngOnInit(): void {
      this.loadRoles();
    }
  
    ngAfterViewInit() {
      if (this.paginator) this.dataSource.paginator = this.paginator;
    }
  
    loadRoles() {
      this.roleService.getRoles().subscribe(roles => {
        this.dataSource.data = roles;
      });
    }
  
    openCreateRoleDialog() {
      const dialogRef = this.dialog.open(RoleDialogComponent, {
        width: '500px',
        data: {}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.roleService.addRole(result);
          this.toast.openSuccessSnackBar({
            message: 'Rol creado exitosamente'
          });
        }
      });
    }
  
    editRole(role: RoleDescription) {
      const dialogRef = this.dialog.open(RoleDialogComponent, {
        width: '500px',
        data: { role }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.roleService.updateRole(result);
          this.toast.openSuccessSnackBar({
            message: 'Rol actualizado exitosamente'
          });
        }
      });
    }
  
    deleteRole(role: RoleDescription) {
      if (role.isSystem) {
        this.toast.openFailureSnackBar({
          message: 'Los roles del sistema no pueden ser eliminados porque están relacionados con otras tablas'
        });
        return;
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Eliminar Rol',
          message: `¿Está seguro que desea eliminar el rol ${role.name}?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.roleService.deleteRole(role.code);
          this.toast.openSuccessSnackBar({
            message: 'Rol eliminado exitosamente'
          });
        }
      });
    }
  } 