import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormType } from '@shared/enums/FormType';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TriageFormComponent } from '../triage-form/triage-form.component';

@Component({
  selector: 'app-add-triage',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    TriageFormComponent
  ],
  template: `
    <mat-dialog-content id="addTriagePopup">
      <app-triage-form
        [action]="'Crear Triaje'"
        [dialogRef]="dialogRef"
        [formType]="FormType.PopupForm"
      >
      </app-triage-form>
    </mat-dialog-content>
  `
})
export class AddTriageComponent {
  FormType = FormType;

  constructor(public dialogRef: MatDialogRef<AddTriageComponent>) {}
}
