import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BitacoraService } from '@app/core/services/bitacoraService'; 
import { MatPaginator } from '@angular/material/paginator'; 
import { MatTable, MatTableDataSource } from '@angular/material/table'; 
import { Bitacora } from '@app/core/models/bitacora'; 
import { SpinnerService } from '@app/shared/spinner/spinner.service'; 
import { SnackbarService } from '@app/shared/services/snackbar.service'; 
import { DatePipe } from '@app/shared/pipes/date.pipe'; // Para formatear la fecha

import { MatTableModule } from '@angular/material/table';  // Importamos MatTableModule para la tabla
import { MatPaginatorModule } from '@angular/material/paginator';  // Importamos MatPaginatorModule para la paginación
import { CommonModule } from '@angular/common';  // Importamos CommonModule

@Component({
  selector: 'app-bitacora',
  standalone: true,  // Esto le dice a Angular que este componente es independiente y no requiere un módulo adicional
  imports: [
    CommonModule,  // Asegúrate de importar CommonModule
    MatTableModule,  // Asegúrate de importar el MatTableModule
    MatPaginatorModule,  // Asegúrate de importar el MatPaginatorModule
    DatePipe,
  ],
  providers: [
    BitacoraService,
    SpinnerService,
    SnackbarService,
    DatePipe // Asegúrate de incluir DatePipe si lo usas
  ],
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css'],
})
export class ManageBitacorasPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource: MatTableDataSource<Bitacora> = new MatTableDataSource<Bitacora>();

  displayedColumns: string[] = ['username', 'action', 'timestamp']; // Definimos las columnas que se van a mostrar en la tabla

  constructor(
    private readonly bitacoraService: BitacoraService,
    private readonly spinnerService: SpinnerService,
    private readonly snackBarService: SnackbarService,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadBitacoras();  // Cargar las bitácoras cuando se inicializa el componente
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;  // Asignamos el paginator a la dataSource
    }
  }

  loadBitacoras(): void {
    this.spinnerService.show();  // Mostrar el spinner mientras cargamos los datos

    this.bitacoraService.obtenerBitacoras().subscribe({
      next: (bitacoras) => {
        // Mapear las bitácoras para formatear la fecha
        const mappedBitacoras = bitacoras.map(item => {
          return {
            ...item,
            timestamp: this.formatTimestamp(item.timestamp)  // Formateamos el timestamp
          };
        });

        // Asignamos las bitácoras a la tabla
        this.dataSource = new MatTableDataSource(mappedBitacoras);
        this.spinnerService.hide();  // Ocultar el spinner después de cargar los datos
      },
      error: (error) => {
        this.snackBarService.openFailureSnackBar({
          message: 'Error al cargar las bitácoras',
        });
        this.spinnerService.hide();  // Ocultar el spinner en caso de error
      }
    });
  }

  // Método para formatear el timestamp
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return this.datePipe.transform(date) || 'Fecha no disponible';
  }
}
