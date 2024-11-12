import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';  // Importa DatePipe
import { BitacoraService } from '../../core/services/bitacoraService';

interface Bitacora { 
  username: string; 
  action: string; 
  timestamp: string|null; 
}

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css'],
  providers: [DatePipe]  // Agrega DatePipe a los proveedores del componente
})
export class BitacoraComponent implements OnInit {
  bitacoras: Bitacora[] = [];

  constructor(private bitacoraService: BitacoraService, private datePipe: DatePipe) { }  // Inyecta DatePipe

  ngOnInit(): void {
    this.cargarBitacoras();
  }

  cargarBitacoras(): void {
    this.bitacoraService.obtenerBitacoras().subscribe({
      next: (data) => {
        // Mapeamos los datos de la respuesta y formateamos la fecha
        this.bitacoras = data.map(item => {
          const timestampArray = item.timestamp;
          
          // Asegurémonos de convertir todos los valores a números
          const date = timestampArray 
            ? new Date(
                Number(timestampArray[0]), // Año
                Number(timestampArray[1]) - 1, // Mes (ajustado a base 0)
                Number(timestampArray[2]), // Día
                Number(timestampArray[3]), // Hora
                Number(timestampArray[4]), // Minuto
                Number(timestampArray[5]), // Segundo
                Number(timestampArray[6])  // Milisegundo
              )
            : null;
          
          return {
            ...item,
            timestamp: date ? this.datePipe.transform(date, 'short') : 'Fecha no disponible'  // Usar formato 'short' o asignar 'Fecha no disponible'
          };
        });
        console.log('Bitacoras cargadas:', this.bitacoras);  // Verifica que los datos estén correctamente formateados
      },
      error: (error) => {
        console.error('Error al cargar bitácoras:', error);
      }
    });
  }
  
  
  

  registrarAccion(): void {
    const username = 'usuarioEjemplo';  // Este valor debe provenir de la sesión o JWT del usuario
    const action = 'Acción de ejemplo';  // Aquí puede ser cualquier acción relevante
    this.bitacoraService.registrarAccion(username, action).subscribe(() => {
      this.cargarBitacoras();
    });
  }
}
