import { Injectable } from '@angular/core';
import { UserToAddOrUpdate } from '../models/user/UserToAddOrUpdate';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, throwError } from 'rxjs';
import { User } from '../models/user/User';
import { environment } from '@environments/environment.development';
import { PageRequestResponseData } from '@app/shared/models/PageRequestResponseData';
import { UserPageRequestParams } from '@app/shared/models/UserPageRequestParams';
import { DateHelper } from '@app/shared/helpers/dateHelper';
import { HttpParamsHelper } from '@app/shared/helpers/httpParamsHelper';
import { AuthService } from '@app/core/authentication/auth.service';
import { UserRole } from '../enums/UserRole';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  dateHelper: DateHelper<User>;
  httpParamsHelper: HttpParamsHelper;
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private readonly http: HttpClient,
    private authService: AuthService
  ) {
    this.dateHelper = new DateHelper();
    this.httpParamsHelper = new HttpParamsHelper();
  }

  updateUser(user: UserToAddOrUpdate, userId: string): Observable<User> {
    return this.http.put<any>(`${environment.apiUrl}/users/${userId}`, user);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${userId}`);
  }

  getPagedUsers(params: any): Observable<PageRequestResponseData<User>> {
    const httpParams = new HttpParams()
      .set('page-num', params['page-num'] || '0')
      .set('page-size', params['page-size'] || '10')
      .set('roles', params.roles ? params.roles.join(',') : '')
      .set('sort', 'createdAt')
      .set('sort-dir', 'DESC');

    return this.http.get<PageRequestResponseData<User>>(`${this.apiUrl}/users/paged`, { params: httpParams });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/email/${email}`);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.patch<void>(
      `${environment.apiUrl}/users/${userId}/disable`,
      {},
    );
  }

  getPatients(): Observable<User[]> {
    return this.getPagedUsers({ 
      roles: [UserRole.PATIENT],
      'page-size': 1000, // Un número grande para obtener todos
    }).pipe(
      map(response => response.content)
    );
  }

  getCurrentUser(): Observable<User> {
    const userEmail = this.authService.getEmailFromToken();
    if (!userEmail) {
      return throwError(() => new Error('No se encontró el email del usuario'));
    }
    return this.getUserByEmail(userEmail);
  }

  getCurrentDoctor(): Observable<User> {
    const userEmail = this.authService.getEmailFromToken();
    if (!userEmail) {
      return throwError(() => new Error('No se encontró el email del usuario'));
    }
    return this.http.get<User>(`${this.apiUrl}/doctors/email/${userEmail}`);
  }

  getPagedDoctors(params: any): Observable<PageRequestResponseData<User>> {
    const httpParams = new HttpParams()
      .set('page-num', params['page-num'] || '0')
      .set('page-size', params['page-size'] || '10')
      .set('sort', params.sort || 'name')
      .set('sort-dir', params.sortDir || 'ASC')
      .set('search', params.search || '');

    return this.http.get<PageRequestResponseData<User>>(`${this.apiUrl}/doctors/paged`, { params: httpParams });
  }
}
