import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { PageRequestParams } from '../../models/PageRequestParams';
import { PageRequestResponseData } from '../../models/PageRequestResponseData';
import { TriagePageRequestParams } from '@app/features/manage-triage/pages/manage-triage-page/manage-triage-page.component';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [MatPaginator],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  @Input() data?: PageRequestResponseData<any>;
  @Input() requestParams?: PageRequestParams;
  @Output() load = new EventEmitter<TriagePageRequestParams>();
  pageSizeOptions: number[] = [1, 5, 10, 15, 50, 100, 1000];

  onPageChange(event: PageEvent): void {
    if (!this.requestParams) {
      this.requestParams = {};
    }
    this.requestParams['page-num'] = event.pageIndex;
    this.requestParams['page-size'] = event.pageSize;
    this.load.emit(this.requestParams as TriagePageRequestParams);
  }

  get currentRange(): string {
    if (!this.data) return '';
    const start = this.data.number * this.data.size + 1;
    const end = Math.min(start + this.data.size - 1, this.data.totalElements);
    return `${start} - ${end} de ${this.data.totalElements}`;
  }
}
