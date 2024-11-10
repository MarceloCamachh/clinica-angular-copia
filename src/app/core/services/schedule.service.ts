import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '@environments/environment.development';
import { Schedule } from '@core/models/schedule.model';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl1 = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  createSchedule(schedule: Schedule): Observable<Schedule> {
    const formattedSchedule = {
      ...schedule,
      specificDate: schedule.specificDate ? 
        new Date(schedule.specificDate[0], schedule.specificDate[1] - 1, schedule.specificDate[2])
          .toISOString().split('T')[0] : null,
      startTime: Array.isArray(schedule.startTime) ? 
        `${schedule.startTime[0].toString().padStart(2, '0')}:${schedule.startTime[1].toString().padStart(2, '0')}` : 
        schedule.startTime,
      endTime: Array.isArray(schedule.endTime) ? 
        `${schedule.endTime[0].toString().padStart(2, '0')}:${schedule.endTime[1].toString().padStart(2, '0')}` : 
        schedule.endTime,
      dayOfWeek: schedule.scheduleType === 'WEEKLY' ? schedule.dayOfWeek : null,
      dayOfMonth: schedule.scheduleType === 'MONTHLY' ? schedule.dayOfMonth : null
    };

    return this.http.post<Schedule>(`${this.apiUrl1}`, formattedSchedule).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en la operación:', error);
    return throwError(() => new Error(error.error?.message || 'Error en la operación'));
  }

  getDoctorSchedules(doctorId: string): Observable<Schedule[]> {
    return this.http.get<any[]>(`${this.apiUrl1}/doctor/${doctorId}`).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      map(schedules => schedules.map(schedule => ({
        ...schedule,
        startTime: Array.isArray(schedule.startTime) ? schedule.startTime : 
          schedule.startTime.split(':').map((n: string) => parseInt(n, 10)),
        endTime: Array.isArray(schedule.endTime) ? schedule.endTime : 
          schedule.endTime.split(':').map((n: string) => parseInt(n, 10)),
        specificDate: schedule.specificDate ? (
          Array.isArray(schedule.specificDate) ? schedule.specificDate :
          schedule.specificDate.split('-').map((n: string) => parseInt(n, 10))
        ) : null,
        dayOfWeek: schedule.dayOfWeek ? parseInt(schedule.dayOfWeek.toString(), 10) : null,
        dayOfMonth: schedule.dayOfMonth ? parseInt(schedule.dayOfMonth.toString(), 10) : null
      }))),
      catchError(error => {
        console.error('Error obteniendo horarios:', error);
        return throwError(() => error);
      })
    );
  }

  updateSchedule(scheduleId: string, schedule: Schedule): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.apiUrl1}/${scheduleId}`, schedule);
  }
  getSchedulesByDoctor(doctorId: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl1}/doctor/${doctorId}`);
  }
  getAllSchedules(doctorId: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl1}?doctorId=${doctorId}`);
  }
  getDoctorSchedulesByDateRange(doctorId: string, start: string, end: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl1}/doctor/${doctorId}/range`, {
      params: {
        start: start,
        end: end
      }
    });
  }
}