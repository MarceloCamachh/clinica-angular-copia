import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { Schedule } from '@app/core/models/schedule.model';

export enum ScheduleType {
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY'
}

export enum FormType {
  PopupForm = 'PopupForm',
  WholePageForm = 'WholePageForm'
}

export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7
}

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule
  ],
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.scss']
})
export class ScheduleFormComponent implements OnInit {
  @Input() action!: string;
  @Input() formType!: FormType;
  @Input() dialogRef?: MatDialogRef<any>;
  @Input() scheduleId?: string;
  @Input() doctorId!: string;
  @Input() startTime?: string;
  @Input() endTime?: string;
  @Output() submitForm = new EventEmitter<Schedule>();
  @Output() cancelForm = new EventEmitter<void>();
  
  scheduleForm: FormGroup;
  scheduleTypes = Object.values(ScheduleType);
  daysOfWeek = Object.entries(DayOfWeek)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ name: key, value }));

  constructor(private fb: FormBuilder) {
    this.scheduleForm = this.fb.group({
      scheduleType: ['DAILY', Validators.required],
      dayOfWeek: [null],
      specificDate: [null],
      dayOfMonth: [null],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isActive: [true]
    });

    this.scheduleForm.get('scheduleType')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });
  }

  ngOnInit() {
    this.scheduleForm.patchValue({
      doctorId: this.doctorId
    });
  }

  private updateValidators(type: string) {
    const dayOfWeek = this.scheduleForm.get('dayOfWeek');
    const specificDate = this.scheduleForm.get('specificDate');
    const dayOfMonth = this.scheduleForm.get('dayOfMonth');

    // Resetear todos los validadores
    dayOfWeek?.clearValidators();
    specificDate?.clearValidators();
    dayOfMonth?.clearValidators();

    // Aplicar validadores según el tipo
    switch (type) {
      case 'WEEKLY':
        dayOfWeek?.setValidators([Validators.required]);
        break;
      case 'DAILY':
        specificDate?.setValidators([Validators.required]);
        break;
      case 'MONTHLY':
        dayOfMonth?.setValidators([Validators.required]);
        break;
    }

    // Actualizar el estado de los controles
    dayOfWeek?.updateValueAndValidity();
    specificDate?.updateValueAndValidity();
    dayOfMonth?.updateValueAndValidity();
  }

  private validateTimeRange() {
    const startTime = this.scheduleForm.get('startTime')?.value;
    const endTime = this.scheduleForm.get('endTime')?.value;

    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');
      
      const start = new Date(2000, 0, 1, parseInt(startHour), parseInt(startMinute));
      const end = new Date(2000, 0, 1, parseInt(endHour), parseInt(endMinute));

      if (end <= start) {
        this.scheduleForm.get('endTime')?.setErrors({ invalidRange: true });
      } else {
        this.scheduleForm.get('endTime')?.setErrors(null);
      }
    }
  }

  onSubmit() {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;
      const schedule: Schedule = {
        doctorId: this.doctorId,
        scheduleType: formValue.scheduleType,
        dayOfWeek: formValue.scheduleType === 'WEEKLY' ? formValue.dayOfWeek : null,
        specificDate: formValue.scheduleType === 'DAILY' && formValue.specificDate ? 
          [
            formValue.specificDate.getFullYear(),
            formValue.specificDate.getMonth() + 1,
            formValue.specificDate.getDate()
          ] : null,
        dayOfMonth: formValue.scheduleType === 'MONTHLY' ? formValue.dayOfMonth : null,
        startTime: formValue.startTime.split(':').map(Number),
        endTime: formValue.endTime.split(':').map(Number),
        isActive: formValue.isActive
      };
      
      console.log('Datos del formulario a emitir:', schedule);
      this.submitForm.emit(schedule);
    } else {
      console.log('Formulario inválido:', this.scheduleForm.errors);
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.scheduleForm.controls).forEach(key => {
        this.scheduleForm.controls[key].markAsTouched();
      });
    }
  }

  private initializeForm() {
    this.scheduleForm = this.fb.group({
      scheduleType: ['DAILY', Validators.required],
      dayOfWeek: [{ value: null, disabled: true }],
      specificDate: [{ value: null, disabled: true }],
      dayOfMonth: [{ value: null, disabled: true }],
      startTime: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      endTime: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      isActive: [true]
    });
  }
}
