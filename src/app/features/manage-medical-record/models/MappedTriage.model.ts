import { User } from '@core/models/user/User';
import { VitalSigns } from '../../manage-triage/models/vital-signs.model';

// Interfaz para los datos mapeados que se mostrarán
export interface MappedTriage {
  id?: string;
  doctor: string;
  especialidad: string;
  prioridad: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';
  quejaPrincipal: string;
  observaciones: string | null | undefined;
  signosVitales: {
    presionArterial: string;
    frecuenciaCardiaca: number;
    temperatura: number;
    saturacionOxigeno: number;
    frecuenciaRespiratoria: number;
  };
}

export interface MappedMedicalHistory {
  triages: MappedTriage[];
  appointments: any[];
  prescriptions: any[];
  labResults: any[];
  
}
