import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment.development';
import { MedicalRecordDTO, CreateMedicalRecordDTO, UpdateMedicalRecordDTO } from '../models/medical-record.model';
import { PageRequestParams } from '@app/shared/models/PageRequestParams';
import { PageRequestResponseData } from '@app/shared/models/PageRequestResponseData';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private apiUrl = `${environment.apiUrl}/api/medical-records`;

  constructor(private http: HttpClient) {}

  getPagedMedicalRecords(params: PageRequestParams): Observable<PageRequestResponseData<MedicalRecordDTO>> {
    const httpParams = new HttpParams()
      .set('page-num', params['page-num'] || '0')
      .set('page-size', params['page-size'] || '10')
      .set('sort', 'createdAt')
      .set('sort-dir', 'DESC');

    return this.http.get<PageRequestResponseData<MedicalRecordDTO>>(`${this.apiUrl}/paged`, { params: httpParams });
  }

  getMedicalRecordById(id: string): Observable<MedicalRecordDTO> {
    return this.http.get<MedicalRecordDTO>(`${this.apiUrl}/${id}`);
  }

  getMedicalRecordByPatientId(patientId: string): Observable<MedicalRecordDTO> {
    return this.http.get<MedicalRecordDTO>(`${this.apiUrl}/patient/${patientId}`);
  }

  createMedicalRecord(record: CreateMedicalRecordDTO): Observable<MedicalRecordDTO> {
    return this.http.post<MedicalRecordDTO>(this.apiUrl, record);
  }

  updateMedicalRecord(id: string, record: UpdateMedicalRecordDTO): Observable<MedicalRecordDTO> {
    return this.http.put<MedicalRecordDTO>(`${this.apiUrl}/${id}`, record);
  }

  deleteMedicalRecord(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
