import { AppointmentStatus } from '../../enums/AppointmentStatus';
import { User } from '../user/User';
import { Examination } from '../Examination';
import { Medicine } from './Medicine';

export interface Appointment {
  id: string;
  date: Date | string;
  startTime: [number, number] | string;
  endTime: [number, number] | string;
  status: AppointmentStatus;
  description: string;
  doctor: User;
  patient: User;
  examination: Examination;
  medicines?: Medicine[];
}
