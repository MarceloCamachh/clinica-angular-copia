import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { TriageService } from '../../services/triage.service';
import { SnackbarService } from '@shared/services/snackbar.service';
import { Triage } from '../../models/triage.model';

@Component({
  selector: 'app-triage-details',
  templateUrl: './triage-details.component.html',
  styleUrls: ['./triage-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class TriageDetailsComponent implements OnInit {
  triage?: Triage;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private triageService: TriageService,
    private toast: SnackbarService,
    private router: Router
  ) {}

  ngOnInit() {
    const triageId = this.route.snapshot.paramMap.get('id');
    if (triageId) {
      this.loadTriageDetails(triageId);
    }
  }

  loadTriageDetails(id: string) {
    this.loading = true;
    this.triageService.getTriageById(id).subscribe({
      next: (triage) => {
        this.triage = triage;
        this.loading = false;
      },
      error: (error) => {
        this.error = true;
        this.loading = false;
        this.toast.openFailureSnackBar({
          message: 'Error al cargar los detalles del triaje'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/manage-triage']);
  }
}
