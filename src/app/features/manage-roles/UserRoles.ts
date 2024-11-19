export interface RoleDescription {
    code: string;
    name: string;
    description: string;
    isSystem: boolean;
  }
  
  export const UserRoles: { [key: string]: RoleDescription } = {
    ADMIN: {
      code: 'ROLE_ADMIN',
      name: 'Administrador',
      description: 'Control total del sistema',
      isSystem: true
    },
    DOCTOR: {
      code: 'ROLE_DOCTOR',
      name: 'Doctor',
      description: 'Gestión de pacientes y citas',
      isSystem: true
    },
    PATIENT: {
      code: 'ROLE_PATIENT',
      name: 'Paciente',
      description: 'Acceso a citas y perfil personal',
      isSystem: true
    },
    REGISTRAR: {
      code: 'ROLE_REGISTRAR',
      name: 'Registrador',
      description: 'Gestión de registros y citas',
      isSystem: true
    }
  };