import { VitalSigns } from './vital-signs.model';
import { NeurologicalAssessment } from './neurological-assessment.model';

export interface CreateTriageDTO {
  patientId: string;
  doctorId: string;
  vitalSigns: VitalSigns;
  priority: string;
  chiefComplaint: string;
  medicalHistory?: string;
  allergies?: string;
  neurologicalAssessment?: NeurologicalAssessment;
  observations?: string;
}
