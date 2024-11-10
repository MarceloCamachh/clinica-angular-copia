import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RoleDescription } from '@app/features/manage-roles/UserRoles';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss']
})
export class RoleDialogComponent {
  roleForm: FormGroup;
  dialogTitle: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role?: RoleDescription }
  ) {
    this.dialogTitle = data.role ? 'Editar Rol' : 'Crear Nuevo Rol';
    this.roleForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^ROLE_[A-Z_]+$')]],
      name: ['', Validators.required],
      description: ['', Validators.required]
    });

    if (data.role) {
      this.roleForm.patchValue(data.role);
      this.roleForm.get('code')?.disable();
    }
  }

  onSubmit() {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      this.dialogRef.close({
        ...formValue,
        code: this.roleForm.get('code')?.disabled ? 
          this.data.role?.code : 
          formValue.code,
        isSystem: this.data.role?.isSystem || false
      });
    }
  }
}
