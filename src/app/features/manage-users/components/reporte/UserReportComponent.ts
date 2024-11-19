import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { User } from '@app/core/models/user/User';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface ReportOption {
  label: string;
  selected: boolean;
}

interface ReportSectionOptions {
  [key: string]: ReportOption;
}

interface ReportSection {
  label: string;
  options: ReportSectionOptions;
}

interface ReportOptions {
  [key: string]: ReportSection;
}

@Component({
  selector: 'app-user-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  template: `
    <mat-card>
      <mat-card-content>
        <form [formGroup]="reportForm">
          <div *ngFor="let sectionKey of getObjectKeys(reportOptions)" class="section-container">
            <h3>{{ reportOptions[sectionKey].label }}</h3>
            <div class="options-grid">
              <mat-checkbox 
                *ngFor="let optionKey of getObjectKeys(reportOptions[sectionKey].options)"
                [formControlName]="sectionKey + '_' + optionKey">
                {{ reportOptions[sectionKey].options[optionKey].label }}
              </mat-checkbox>
            </div>
          </div>
        </form>

        <div id="report-preview" class="report-preview">
          <h2>Reporte de Usuarios</h2>
          
          <div class="users-table" *ngIf="users.length > 0">
            <table>
              <thead>
                <tr>
                  <th *ngIf="reportForm.get('basic_id')?.value">ID</th>
                  <th *ngIf="reportForm.get('basic_name')?.value">Nombre</th>
                  <th *ngIf="reportForm.get('basic_email')?.value">Email</th>
                  <th *ngIf="reportForm.get('basic_role')?.value">Rol</th>
                  <th *ngIf="reportForm.get('contact_phone')?.value">Teléfono</th>
                  <th *ngIf="reportForm.get('contact_pesel')?.value">PESEL</th>
                  <th *ngIf="reportForm.get('status_enabled')?.value">Estado</th>
                  <th *ngIf="reportForm.get('dates_created')?.value">Creado</th>
                  <th *ngIf="reportForm.get('dates_lastLogin')?.value">Último Login</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td *ngIf="reportForm.get('basic_id')?.value">{{user.id}}</td>
                  <td *ngIf="reportForm.get('basic_name')?.value">{{user.name}} {{user.surname}}</td>
                  <td *ngIf="reportForm.get('basic_email')?.value">{{user.email}}</td>
                  <td *ngIf="reportForm.get('basic_role')?.value">{{user.role}}</td>
                  <td *ngIf="reportForm.get('contact_phone')?.value">{{user.phoneNumber || 'N/A'}}</td>
                  <td *ngIf="reportForm.get('contact_pesel')?.value">{{user.pesel}}</td>
                  <td *ngIf="reportForm.get('status_enabled')?.value">
                    {{user.isEnabled ? 'Activo' : 'Inactivo'}}
                  </td>
                  <td *ngIf="reportForm.get('dates_created')?.value">
                    {{user.createdAt | date:'dd/MM/yyyy'}}
                  </td>
                  <td *ngIf="reportForm.get('dates_lastLogin')?.value">
                    {{user.lastLogin | date:'dd/MM/yyyy HH:mm' || 'Nunca'}}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="action-buttons">
          <button mat-raised-button color="primary" (click)="exportToPDF()">
            <mat-icon>picture_as_pdf</mat-icon>
            Exportar a PDF
          </button>
          <button mat-raised-button color="accent" (click)="exportToExcel()">
            <mat-icon>file_download</mat-icon>
            Exportar a Excel
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .section-container {
      margin-bottom: 1.5rem;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .report-preview {
      margin: 2rem 0;
      padding: 2rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
    }

    .users-table {
      overflow-x: auto;
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        
        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: 500;
        }
        
        tr:hover {
          background-color: #f9f9f9;
        }
      }
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
      
      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        mat-icon {
          margin-right: 4px;
        }
      }
    }

    @media print {
      .action-buttons,
      form {
        display: none;
      }

      .report-preview {
        border: none;
        padding: 0;
      }
    }
  `]
})
export class UserReportComponent implements OnInit {
  @Input() users: User[] = [];
  reportForm!: FormGroup;

  reportOptions: ReportOptions = {
    basic: {
      label: 'Información Básica',
      options: {
        id: { label: 'ID', selected: true },
        name: { label: 'Nombre', selected: true },
        email: { label: 'Correo', selected: true },
        role: { label: 'Rol', selected: true }
      }
    },
    contact: {
      label: 'Información de Contacto',
      options: {
        phone: { label: 'Teléfono', selected: true },
        pesel: { label: 'PESEL', selected: true }
      }
    },
    status: {
      label: 'Estado',
      options: {
        enabled: { label: 'Estado de Activación', selected: true }
      }
    },
    dates: {
      label: 'Fechas',
      options: {
        created: { label: 'Fecha de Creación', selected: true },
        lastLogin: { label: 'Último Acceso', selected: true }
      }
    }
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const group: any = {};
    
    Object.keys(this.reportOptions).forEach(section => {
      Object.keys(this.reportOptions[section].options).forEach(option => {
        group[`${section}_${option}`] = [
          this.reportOptions[section].options[option].selected
        ];
      });
    });
    
    this.reportForm = this.fb.group(group);
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  exportToPDF(): void {
    const element = document.getElementById('report-preview');
    
    html2canvas(element!).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('reporte_usuarios.pdf');
    });
  }

  exportToExcel(): void {
    const data = this.users.map(user => {
      const row: any = {};
      
      if (this.reportForm.get('basic_id')?.value) row['ID'] = user.id;
      if (this.reportForm.get('basic_name')?.value) row['Nombre'] = `${user.name} ${user.surname}`;
      if (this.reportForm.get('basic_email')?.value) row['Email'] = user.email;
      if (this.reportForm.get('basic_role')?.value) row['Rol'] = user.role;
      if (this.reportForm.get('contact_phone')?.value) row['Teléfono'] = user.phoneNumber || 'N/A';
      if (this.reportForm.get('contact_pesel')?.value) row['PESEL'] = user.pesel;
      if (this.reportForm.get('status_enabled')?.value) row['Estado'] = user.isEnabled ? 'Activo' : 'Inactivo';
      
      return row;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, 'reporte_usuarios.xlsx');
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = window.URL.createObjectURL(data);
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
