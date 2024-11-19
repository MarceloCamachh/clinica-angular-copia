import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ScheduleService } from '@core/services/schedule.service';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { tap, map } from 'rxjs/operators';
import { Schedule } from '@app/core/models/schedule.model';
import { EditScheduleComponent } from '../edit-schedule/edit-schedule.component';

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatDialogModule
  ],
  template: `
    <div class="calendar-wrapper">
      <full-calendar #calendar [options]="calendarOptions"></full-calendar>
    </div>
  `,
  styles: [`
    .calendar-wrapper {
      height: 100%;
      min-height: 500px;
      padding: 1rem;
    }
    ::ng-deep {
      .fc-event {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .fc-event:hover {
        filter: brightness(0.9);
      }
      .fc-timegrid-event {
        border-radius: 4px !important;
      }
      .fc-day-today {
        background-color: rgba(0,0,0,0.02) !important;
      }
      .fc-timegrid-slot {
        height: 40px !important;
      }
    }
  `]
})
export class ScheduleCalendarComponent implements OnInit, OnChanges {
  @Input() doctorId!: string;
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: (info) => {
      this.handleEventClick(info.event);
    }
  };

  constructor(
    private scheduleService: ScheduleService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['doctorId'] && !changes['doctorId'].firstChange) {
      console.log('DoctorId cambió:', this.doctorId);
      this.loadEvents();
    }
  }

  loadEvents(): void {
    const doctorId = this.doctorId;
    if (!doctorId) return;

    this.scheduleService.getDoctorSchedules(doctorId).subscribe({
      next: (schedules) => {
        this.updateCalendarEvents(schedules);
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
      }
    });
  }

  private getNextDayOfWeek(dayOfWeek: number): Date {
    const date = new Date();
    const currentDay = date.getDay();
    const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
    date.setDate(date.getDate() + daysUntilNext);
    return date;
  }

  private getNextDayOfMonth(dayOfMonth: number): Date {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    
    let targetDate = new Date(currentYear, currentMonth, dayOfMonth);
    if (targetDate.getTime() < date.getTime()) {
      // Si la fecha ya pasó, ir al próximo mes
      targetDate = new Date(currentYear, currentMonth + 1, dayOfMonth);
    }
    return targetDate;
  }

  private mapScheduleToEvent(schedule: Schedule) {
    try {
      if (!schedule.startTime || !schedule.endTime) {
        return null;
      }

      let eventDate: Date;
      let recurring = false;

      switch (schedule.scheduleType) {
        case 'DAILY':
          eventDate = schedule.specificDate ? 
            new Date(schedule.specificDate[0], schedule.specificDate[1] - 1, schedule.specificDate[2]) : 
            new Date();
          break;
        case 'WEEKLY':
          eventDate = this.getNextDayOfWeek(schedule.dayOfWeek || 0);
          recurring = true;
          break;
        case 'MONTHLY':
          eventDate = this.getNextDayOfMonth(schedule.dayOfMonth || 1);
          recurring = true;
          break;
        default:
          return null;
      }

      const start = new Date(eventDate);
      start.setHours(schedule.startTime[0], schedule.startTime[1]);

      const end = new Date(eventDate);
      end.setHours(schedule.endTime[0], schedule.endTime[1]);

      return {
        id: schedule.id,
        title: `Horario: ${schedule.startTime[0].toString().padStart(2, '0')}:${schedule.startTime[1].toString().padStart(2, '0')} - 
                ${schedule.endTime[0].toString().padStart(2, '0')}:${schedule.endTime[1].toString().padStart(2, '0')}`,
        start,
        end,
        backgroundColor: schedule.isActive ? '#4CAF50' : '#9E9E9E',
        borderColor: schedule.isActive ? '#2E7D32' : '#757575',
        textColor: '#ffffff',
        extendedProps: {
          scheduleId: schedule.id,
          recurring,
          scheduleType: schedule.scheduleType
        }
      };
    } catch (error) {
      console.error('Error mapeando horario:', error);
      return null;
    }
  }

  private handleEventClick(event: any) {
    const scheduleId = event.extendedProps.scheduleId;
    // Aquí puedes abrir el diálogo de edición
    this.openEditDialog(scheduleId);
  }

  private openEditDialog(scheduleId: string) {
    this.dialog.open(EditScheduleComponent, {
      width: '500px',
      data: {
        scheduleId: scheduleId,
        doctorId: this.doctorId,
        start: this.formatTimeString(new Date()),
        end: this.formatTimeString(new Date())
      }
    });
  }

  private formatTimeString(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private updateCalendarEvents(schedules: Schedule[]) {
    const events = schedules.map(schedule => this.mapScheduleToEvent(schedule))
      .filter(event => event !== null);
    
    this.calendarOptions.events = events;
    
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.refetchEvents();
    }
  }
} 