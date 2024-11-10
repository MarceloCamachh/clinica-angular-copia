import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ScheduleService } from '@core/services/schedule.service';
import { FormType } from '@shared/enums/FormType';
import { SnackbarService } from '@shared/services/snackbar.service';
import { Schedule } from '@core/models/schedule.model';
import { ScheduleFormComponent } from '../schedule-form/schedule-form.component';

@Component({
  selector: 'app-edit-schedule',
  standalone: true,
  imports: [
    ScheduleFormComponent,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Editar Horario</h2>
    <mat-dialog-content class="dialog-content">
      <app-schedule-form
        [action]="'Edit Schedule'"
        [dialogRef]="dialogRef"
        [formType]="FormType.PopupForm"
        [doctorId]="data.doctorId"
        [scheduleId]="data.scheduleId"
        [startTime]="startTimeString"
        [endTime]="endTimeString">
      </app-schedule-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="scheduleForm.onSubmit()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      min-width: 300px;
      max-width: 500px;
      width: 100%;
      @media (max-width: 600px) {
        min-width: 250px;
      }
    }
  `]
})
export class EditScheduleComponent {
  @ViewChild(ScheduleFormComponent) scheduleForm!: ScheduleFormComponent;
  FormType = FormType;

  // Propiedades computadas para los inputs
  get startTimeString(): string | undefined {
    return this.formatTimeValue(this.data.start);
  }

  get endTimeString(): string | undefined {
    return this.formatTimeValue(this.data.end);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      scheduleId: string;
      doctorId: string;
      start?: string | Date;
      end?: string | Date;
    },
    public dialogRef: MatDialogRef<EditScheduleComponent>,
    private scheduleService: ScheduleService,
    private snackBarService: SnackbarService
  ) {}

  private formatTimeValue(value?: string | Date): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date) {
      return value.toTimeString().slice(0, 5);
    }
    return value;
  }
}
