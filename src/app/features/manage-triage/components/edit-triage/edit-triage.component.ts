import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormType } from '@shared/enums/FormType';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TriageFormComponent } from '../triage-form/triage-form.component';
import { Triage } from '../../models/triage.model';

@Component({
  selector: 'app-edit-triage',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    TriageFormComponent
  ],
  template: `
    <mat-dialog-content id="editTriagePopup">
      <app-triage-form
        [action]="'Editar Triaje'"
        [dialogRef]="dialogRef"
        [formType]="FormType.PopupForm"
        [triageData]="data.triage"
      >
      </app-triage-form>
    </mat-dialog-content>
  `
})
export class EditTriageComponent {
  FormType = FormType;

  constructor(
    public dialogRef: MatDialogRef<EditTriageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { triage: Triage }
  ) {}
}
