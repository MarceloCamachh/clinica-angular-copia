import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { Doctor } from '@app/core/models/Doctor';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  selector: 'app-doctor-report',
  templateUrl: './doctor-report.component.html',
  styleUrls: ['./doctor-report.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule
  ]
})
export class DoctorReportComponent {
  reportOptions: ReportOptions = {
    basic: {
      label: 'Información Básica',
      options: {
        id: { label: 'ID', selected: true },
        name: { label: 'Nombre', selected: true },
        surname: { label: 'Apellido', selected: true },
        email: { label: 'Correo', selected: true }
      }
    },
    professional: {
      label: 'Información Profesional',
      options: {
        specialization: { label: 'Especialización', selected: true },
        education: { label: 'Educación', selected: true },
        description: { label: 'Descripción', selected: false }
      }
    },
    contact: {
      label: 'Contacto',
      options: {
        phoneNumber: { label: 'Teléfono', selected: true }
      }
    },
    status: {
      label: 'Estado',
      options: {
        isEnabled: { label: 'Estado', selected: true }
      }
    }
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { doctors: Doctor[] },
    private dialogRef: MatDialogRef<DoctorReportComponent>
  ) {}

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getDoctorValue(doctor: Doctor, option: string): string {
    const value = doctor[option as keyof Doctor];
    if (option === 'isEnabled') {
      return value ? 'Activo' : 'Inactivo';
    }
    return value as string;
  }

  exportToExcel(): void {
    const data = this.data.doctors.map(doctor => {
      const row: any = {};
      
      Object.keys(this.reportOptions).forEach(section => {
        Object.keys(this.reportOptions[section].options).forEach(option => {
          if (this.reportOptions[section].options[option].selected) {
            if (option === 'isEnabled') {
              row[this.reportOptions[section].options[option].label] = doctor[option as keyof Doctor] ? 'Activo' : 'Inactivo';
            } else {
              row[this.reportOptions[section].options[option].label] = doctor[option as keyof Doctor];
            }
          }
        });
      });
      
      return row;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctores');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, 'reporte_doctores.xlsx');
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
      pdf.save('reporte_doctores.pdf');
    });
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
