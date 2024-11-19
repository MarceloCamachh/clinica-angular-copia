import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CapitalizeSpaceBetweenPipe } from '@app/shared/pipes/capitalize-space-between.pipe';
import { DatePipe } from '@app/shared/pipes/date.pipe';
import { LastPropertyPipe } from '@app/shared/pipes/last-property.pipe';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';

import { PaginatorComponent } from '@app/shared/components/paginator/paginator.component';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { PageRequestResponseData } from '@app/shared/models/PageRequestResponseData';
import { TableHelper } from '@app/shared/helpers/tableHelper';
import { SnackbarService } from '@app/shared/services/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { Appointment } from '@app/core/models/appointment/Appointment';
import { PageRequestParams } from '@app/shared/models/PageRequestParams';
import { AppointmentService } from '@app/shared/services/appointment.service';
import { AppointmentPageRequestParams } from '@app/shared/models/AppointmentPageRequestParams';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '@app/shared/dialog/dialog.service';
import { AppointmentFormComponent } from '../components/appointment-form/appointment-form.component';
import { DateHelper } from '@app/shared/helpers/dateHelper';

@Component({
  selector: 'app-manage-appointments',
  standalone: true,
  imports: [
    CapitalizeSpaceBetweenPipe,
    DatePipe,
    LastPropertyPipe,
    MatButton,
    MatCell,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatIconButton,
    PaginatorComponent,
    MatRowDef,
    MatRow,
    MatHeaderRowDef,
    MatHeaderRow,
    MatIcon,
  ],
  templateUrl: './manage-appointments.component.html',
  styleUrl: './manage-appointments.component.scss',
})
export class ManageAppointmentsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource: MatTableDataSource<Appointment> =
    new MatTableDataSource<Appointment>();
  pageAppointmentResponseData?: PageRequestResponseData<Appointment>;
  tableHelper = new TableHelper();
  requestParams: PageRequestParams = {};
  doctorId?: string;

  constructor(
    private readonly toast: SnackbarService,
    private readonly dialog: MatDialog,
    private readonly appointmentService: AppointmentService,
    private readonly route: ActivatedRoute,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.doctorId = params['id'];
    });
    this.getPagedAppointments(this.requestParams);
  }

  ngAfterViewInit() {
    if (this.paginator) this.dataSource.paginator = this.paginator;
  }

  getPagedAppointments(params: AppointmentPageRequestParams) {
    if (!this.doctorId) return;
    
    this.appointmentService
      .getPagedDoctorAppointments(params, this.doctorId)
      .subscribe({
        next: (requestResponseData: PageRequestResponseData<Appointment>) => {
          if (!requestResponseData?.content?.length) {
            this.toast.openInfoSnackBar({
              message: 'No se encontraron citas.',
            });
            return;
          }

          const formattedContent = requestResponseData.content.map(appointment => {
            const formatted: Appointment = {
              ...appointment,
              date: appointment.date instanceof Date ? appointment.date : new Date(appointment.date),
            };

            if (Array.isArray(appointment.startTime)) {
              formatted.startTime = `${String(appointment.startTime[0]).padStart(2, '0')}:${String(appointment.startTime[1]).padStart(2, '0')}`;
            }
            
            if (Array.isArray(appointment.endTime)) {
              formatted.endTime = `${String(appointment.endTime[0]).padStart(2, '0')}:${String(appointment.endTime[1]).padStart(2, '0')}`;
            }

            return formatted;
          });

          this.dataSource = new MatTableDataSource<Appointment>(formattedContent);
          this.pageAppointmentResponseData = {
            ...requestResponseData,
            content: formattedContent
          };

          this.tableHelper.setSpecifiedBaseColumnNamesFromRequestData(
            this.pageAppointmentResponseData,
            [
              'id',
              'date',
              'status',
              'patient.email',
              'doctor.email',
              'examination.name',
              'examination.price',
              'examination.duration',
            ],
            {
              'patient.email': 'Paciente',
              'doctor.email': 'Doctor',
              'examination.name': 'Examen',
              'examination.price': 'Precio',
              'examination.duration': 'Duración',
              'date': 'Fecha',
              'status': 'Estado'
            },
          );
          this.tableHelper.setAllColumnNames(['edit']);
        },
        error: (error) => {
          console.error('Error al cargar las citas:', error);
          this.toast.openFailureSnackBar({
            message: 'Error al cargar las citas médicas.',
          });
        }
      });
  }

  openEditAppointmentDialog(appointment: Appointment) {
    this.dialogService
      .openDialog<Appointment, AppointmentFormComponent>(
        AppointmentFormComponent,
        appointment,
        {
          width: '700px',
          height: '700px',
        },
      )
      .subscribe(result => {
        if (result) {
          this.getPagedAppointments(this.requestParams);
        }
      });
  }
}
