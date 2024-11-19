import { User } from '@core/models/user/User';
import { VitalSigns } from './vital-signs.model';
import { NeurologicalAssessment } from './neurological-assessment.model';

export interface Triage {
  id?: string;
  patient: User;
  doctor: User;
  vitalSigns: VitalSigns;
  priority: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';
  chiefComplaint: string;
  medicalHistory?: string;
  allergies?: string;
  neurologicalAssessment?: NeurologicalAssessment;
  observations?: string;
  triageDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
