import { TableHelper } from '@shared/helpers/tableHelper';

export class TriageTableHelper extends TableHelper {
  constructor() {
    super();
    this.baseColumnNames = [
      'triageDate',
      'patient.name',
      'patient.surname',
      'priority',
      'chiefComplaint'
    ];
    
    this.baseColumnTitles = [
      'Fecha',
      'Nombre Paciente',
      'Apellido Paciente',
      'Prioridad',
      'Motivo de Consulta'
    ];

    this.allColumnNames = [...this.baseColumnNames, 'edit'];
  }

  override nestedPropertyAccessor(obj: any, path: string) {
    const value = super.nestedPropertyAccessor(obj, path);
    
    if (path === 'triageDate' && value) {
      // Convertir el array a formato de fecha
      if (Array.isArray(value)) {
        return new Date(value[0], value[1] - 1, value[2], value[3], value[4], value[5]);
      }
      // Si ya es string, intentar parsearlo
      return new Date(value);
    }
    
    return value;
  }
}
