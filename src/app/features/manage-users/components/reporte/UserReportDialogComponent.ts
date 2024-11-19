import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { User } from '@app/core/models/user/User';
import { UserReportComponent } from './UserReportComponent';

@Component({
  selector: 'app-user-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    UserReportComponent
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Generador de Reportes de Usuarios</h2>
      <mat-dialog-content>
        <app-user-report [users]="data"></app-user-report>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    mat-dialog-content {
      max-height: none;
    }
  `]
})
export class UserReportDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UserReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User[]
  ) {}
}
