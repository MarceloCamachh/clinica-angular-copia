import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RoleDescription, UserRoles } from '../UserRoles';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roles: { [key: string]: RoleDescription } = { ...UserRoles };
  private rolesSubject = new BehaviorSubject<RoleDescription[]>(Object.values(this.roles));

  getRoles(): Observable<RoleDescription[]> {
    return this.rolesSubject.asObservable();
  }

  addRole(role: RoleDescription): void {
    this.roles[role.code] = role;
    this.updateRoles();
  }

  updateRole(role: RoleDescription): void {
    this.roles[role.code] = role;
    this.updateRoles();
  }

  deleteRole(code: string): void {
    delete this.roles[code];
    this.updateRoles();
  }

  private updateRoles(): void {
    this.rolesSubject.next(Object.values(this.roles));
  }
}
