import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '@environments/environment.development';
import { CreateTriageDTO } from '../models/triage-form.model';
import { Triage } from '../models/triage.model';
import { PageRequestResponseData } from '@shared/models/PageRequestResponseData';
import { PageRequestParams } from '@shared/models/PageRequestParams';
import { tap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TriageService {
  private apiUrl = `${environment.apiUrl}/api/v1/triages`;

  constructor(private http: HttpClient) {}

  createTriage(triageData: any): Observable<any> {
    console.log('Enviando datos al servidor:', triageData);
    return this.http.post(this.apiUrl, triageData).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(error => {
        console.error('Error en createTriage:', error);
        return throwError(() => error);
      })
    );
  }

  updateTriage(id: string, triage: Partial<CreateTriageDTO>): Observable<Triage> {
    return this.http.put<Triage>(`${this.apiUrl}/${id}`, triage);
  }

  getTriageById(id: string): Observable<Triage> {
    return this.http.get<Triage>(`${this.apiUrl}/${id}`);
  }

  getPagedTriages(params: PageRequestParams): Observable<PageRequestResponseData<Triage>> {
    const httpParams = new HttpParams()
      .set('page-num', (params['page-num'] ?? 0).toString())
      .set('page-size', (params['page-size'] ?? 10).toString())
      .set('sort', params.sort || 'createdAt,desc');

    return this.http.get<PageRequestResponseData<Triage>>(this.apiUrl, { params: httpParams });
  }

  deleteTriage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
