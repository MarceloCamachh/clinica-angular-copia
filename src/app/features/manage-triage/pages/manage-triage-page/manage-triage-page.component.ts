import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { AddTriageComponent } from '../../components/add-triage/add-triage.component';
import { EditTriageComponent } from '../../components/edit-triage/edit-triage.component';
import { TriageTableHelper } from '../../helpers/triage-table.helper';
import { Triage } from '../../models/triage.model';
import { TriageService } from '../../services/triage.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@shared/services/snackbar.service';
import { SpinnerService } from '@shared/spinner/spinner.service';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { PageRequestResponseData } from '@app/shared/models/PageRequestResponseData';
import { PageRequestParams } from '@app/shared/models/PageRequestParams';

export interface TriagePageRequestParams extends PageRequestParams {
  'page-number': number;
  'page-size': number;
  sort?: string;
}

@Component({
  selector: 'app-manage-triage-page',
  templateUrl: './manage-triage-page.component.html',
  styleUrls: ['./manage-triage-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDialogModule,
    PaginatorComponent
  ]
})
export class ManageTriagePageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource: MatTableDataSource<Triage>;
  tableHelper: TriageTableHelper;
  pageTriageResponseData?: PageRequestResponseData<Triage>;
  requestParams: TriagePageRequestParams = {
    'page-number': 0,
    'page-size': 10,
    sort: 'createdAt,desc'
  };

  constructor(
    private triageService: TriageService,
    private dialog: MatDialog,
    private snackBarService: SnackbarService,
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new MatTableDataSource<Triage>();
    this.tableHelper = new TriageTableHelper();
  }

  ngOnInit() {
    this.loadTriages();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  loadTriages() {
    this.spinnerService.show();
    this.getPagedTriages(this.requestParams);
  }

  getPagedTriages(params: TriagePageRequestParams) {
    this.requestParams = {
      ...this.requestParams,
      ...params
    };
    this.triageService.getPagedTriages(this.requestParams).subscribe({
      next: (response) => {
        this.pageTriageResponseData = response;
        this.dataSource.data = response.content;
      },
      error: () => {
        this.snackBarService.openFailureSnackBar({
          message: 'Error al cargar los triajes'
        });
      },
      complete: () => {
        this.spinnerService.hide();
      }
    });
  }

  openAddTriageDialog() {
    const dialogRef = this.dialog.open(AddTriageComponent, {
      width: '800px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadTriages();
      }
    });
  }

  openEditTriageDialog(triage: Triage) {
    const dialogRef = this.dialog.open(EditTriageComponent, {
      width: '800px',
      disableClose: true,
      data: { triage }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadTriages();
      }
    });
  }
}
