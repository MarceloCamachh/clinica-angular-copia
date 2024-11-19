import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormType } from '@app/shared/enums/FormType';
import { UserRole } from '@app/core/enums/UserRole';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserFormComponent } from '@app/shared/components/user-form/user-form.component';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    UserFormComponent
  ],
  template: `
    <mat-dialog-content id="addPatientPopup">
      <app-user-form
        [action]="'Crear Paciente'"
        [dialogRef]="dialogRef"
        [formType]="FormType.PopupForm"
        [forceRole]="UserRole.PATIENT"
      >
        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>Cancelar</button>
          <button mat-raised-button color="primary" type="submit">Guardar</button>
        </mat-dialog-actions>
      </app-user-form>
    </mat-dialog-content>
  `
})
export class AddPatientComponent {
  FormType = FormType;
  UserRole = UserRole;

  constructor(public dialogRef: MatDialogRef<AddPatientComponent>) {}
}
