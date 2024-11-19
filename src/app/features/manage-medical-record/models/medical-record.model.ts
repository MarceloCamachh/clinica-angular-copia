import { User } from '@app/core/models/user/User';

export interface MedicalRecordDTO {
  id: string;
  patient: User;
  bloodType: string;
  allergies: string[];
  chronicConditions?: string[];
  familyHistory?: string[];
  height: number;
  weight: number;
  triageIds: string[];
  appointmentIds: string[];
  prescriptionIds: string[];
  labResultIds: string[];
  imagingResultIds: string[];
  surgeryIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

export interface CreateMedicalRecordDTO {
  patientId: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  familyHistory?: string[];
  height?: number;
  weight?: number;
}

export interface UpdateMedicalRecordDTO {
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  familyHistory?: string[];
  height?: number;
  weight?: number;
  isActive?: boolean;
}
