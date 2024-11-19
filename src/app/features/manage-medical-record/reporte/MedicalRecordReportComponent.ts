import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MappedMedicalHistory } from '../models/MappedTriage.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MedicalRecordDTO } from '../models/medical-record.model';

interface ReportOption {
  label: string;
  selected: boolean;
}

interface ReportSection {
  label: string;
  options: {
    [key: string]: ReportOption;
  };
}

interface ReportOptions {
  [key: string]: ReportSection;
}

@Component({
  selector: 'app-medical-record-report',
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
      <mat-card-header>
        <mat-card-title>Generador de Reportes</mat-card-title>
      </mat-card-header>

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
          <h2>Historial Clínico</h2>

          <!-- Triages -->
          <ng-container *ngIf="anyTriageOptionSelected()">
            <div class="section">
              <h3>Historial de Triages</h3>
              <div *ngFor="let triage of medicalHistory.triages" class="triage-card">
                <div *ngIf="reportForm.get('triages_doctor')?.value">
                  <strong>Doctor:</strong> {{ triage.doctor }}
                </div>
                <div *ngIf="reportForm.get('triages_especialidad')?.value">
                  <strong>Especialidad:</strong> {{ triage.especialidad }}
                </div>
                <div *ngIf="reportForm.get('triages_quejaPrincipal')?.value">
                  <strong>Queja Principal:</strong> {{ triage.quejaPrincipal }}
                </div>
                <div *ngIf="reportForm.get('triages_observaciones')?.value">
                  <strong>Observaciones:</strong> {{ triage.observaciones }}
                </div>
                <div *ngIf="reportForm.get('triages_signosVitales')?.value">
                  <strong>Signos Vitales:</strong>
                  <ul>
                    <li>Presión Arterial: {{ triage.signosVitales.presionArterial }}</li>
                    <li>Frecuencia Cardíaca: {{ triage.signosVitales.frecuenciaCardiaca }}</li>
                    <li>Temperatura: {{ triage.signosVitales.temperatura }}</li>
                    <li>Saturación O2: {{ triage.signosVitales.saturacionOxigeno }}</li>
                    <li>Frec. Respiratoria: {{ triage.signosVitales.frecuenciaRespiratoria }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <div class="action-buttons">
          <button mat-raised-button color="primary" (click)="generatePDF()">
            <mat-icon>picture_as_pdf</mat-icon>
            Exportar a PDF
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

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .triage-card {
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      justify-content: flex-end;
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
export class MedicalRecordReportComponent implements OnInit {
  @Input() medicalHistory!: MappedMedicalHistory;
  @Input() medicalRecord!: MedicalRecordDTO;
  
  reportForm!: FormGroup;
  
  reportOptions: ReportOptions = {
    /* informacionBasica: {
      label: 'Información Básica',
      options: {
        bloodType: { label: 'Tipo de Sangre', selected: true },
        height: { label: 'Altura', selected: true },
        weight: { label: 'Peso', selected: true }
      }
    }, */
    triages: {
      label: 'Información de Triages',
      options: {
        doctor: { label: 'Doctor', selected: true },
        especialidad: { label: 'Especialidad', selected: true },
        quejaPrincipal: { label: 'Queja Principal', selected: true },
        observaciones: { label: 'Observaciones', selected: true },
        signosVitales: { label: 'Signos Vitales', selected: true }
      }
    },
    historiaFamiliar: {
      label: 'Historia Familiar',
      options: {
        antecedentes: { label: 'Antecedentes', selected: true }
      }
    }
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const group: { [key: string]: any } = {};
    
    Object.keys(this.reportOptions).forEach(sectionKey => {
      const section = this.reportOptions[sectionKey];
      Object.keys(section.options).forEach(optionKey => {
        const option = section.options[optionKey];
        group[`${sectionKey}_${optionKey}`] = [option.selected];
      });
    });
    
    this.reportForm = this.fb.group(group);
  }

  anyTriageOptionSelected(): boolean {
    return Object.keys(this.reportOptions['triages'].options).some(key => 
      this.reportForm.get(`triages_${key}`)?.value
    );
  }

  generatePDF(): void {
    const element = document.getElementById('report-preview');
    if (!element) return;

    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('historial-clinico.pdf');
    });
  }

  generateExcel(): void {
    // Implementación pendiente
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
