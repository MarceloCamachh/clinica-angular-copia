import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormType } from '@app/shared/enums/FormType';
import { UserRole } from '@app/core/enums/UserRole';
import { User } from '@app/core/models/user/User';
import { UserFormComponent } from '@app/shared/components/user-form/user-form.component';

@Component({
  selector: 'app-edit-patient',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    UserFormComponent
  ],
  template: `
    <mat-dialog-content id="editPatientPopup">
      <app-user-form
        [action]="'Editar Paciente'"
        [dialogRef]="dialogRef"
        [formType]="FormType.PopupForm"
        [userId]="data.user.id"
        [forceRole]="UserRole.PATIENT"
      >
        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>Cancelar</button>
          <button mat-raised-button color="primary" type="submit">Actualizar</button>
        </mat-dialog-actions>
      </app-user-form>
    </mat-dialog-content>
  `
})
export class EditPatientComponent {
  FormType = FormType;
  UserRole = UserRole;

  constructor(
    public dialogRef: MatDialogRef<EditPatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}
}
