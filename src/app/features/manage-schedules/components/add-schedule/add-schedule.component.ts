import { Component, Inject, ViewChild, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ScheduleService } from '@core/services/schedule.service';
import { FormType } from '@shared/enums/FormType';
import { SnackbarService } from '@shared/services/snackbar.service';
import { Schedule } from '@core/models/schedule.model';
import { ScheduleFormComponent } from '../schedule-form/schedule-form.component';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-schedule',
  standalone: true,
  imports: [
    ScheduleFormComponent,
    MatDialogModule,
    MatButtonModule,
    MatNativeDateModule
  ],
  providers: [
    {provide: DateAdapter, useClass: NativeDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS}
  ],
  template: `
    <h2 mat-dialog-title>Agregar Horario</h2>
    <mat-dialog-content class="dialog-content">
      <app-schedule-form
        #scheduleForm
        [action]="'Create Schedule'"
        [dialogRef]="dialogRef"
        [formType]="FormType.PopupForm"
        [doctorId]="data.doctorId"
        [startTime]="data.start"
        [endTime]="data.end"
        (submitForm)="onSubmit($event)">
      </app-schedule-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="scheduleForm.onSubmit()">
        Guardar
      </button>
    </mat-dialog-actions>
  `
})
export class AddScheduleComponent {
  @ViewChild(ScheduleFormComponent) scheduleForm!: ScheduleFormComponent;
  FormType = FormType;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      doctorId: string;
      start?: string;
      end?: string;
    },
    public dialogRef: MatDialogRef<AddScheduleComponent>,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar
  ) {
    if (!data.doctorId) {
      console.error('doctorId es requerido');
      this.dialogRef.close();
    }
  }

  onSubmit(schedule: Schedule) {
    console.log('Recibiendo datos del formulario:', schedule);
    
    const scheduleWithDoctor = {
      ...schedule,
      doctorId: this.data.doctorId
    };
    
    this.scheduleService.createSchedule(scheduleWithDoctor).subscribe({
      next: (response) => {
        console.log('Horario creado exitosamente:', response);
        this.snackBar.open('Horario creado con éxito', 'Cerrar', {
          duration: 3000
        });
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al crear horario:', error);
        this.snackBar.open('Error al crear el horario', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
} 