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
        // Asegúrate de que 'timestamp' sea un string o null
        this.bitacoras = data.map(item => ({
          ...item,
          timestamp: item.timestamp ? this.datePipe.transform(item.timestamp, 'short') : null  // Usar null si no se puede formatear
        }));
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
