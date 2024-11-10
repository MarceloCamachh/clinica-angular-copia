import { AbstractControl, ValidationErrors } from '@angular/forms';

export const PasswordStrengthValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: string = control.value || '';
  if (!value) {
    return null;
  }

  let errorMessage = '';

  const upperCaseCharacters = /[A-Z]+/g;
  if (!upperCaseCharacters.test(value)) {
    errorMessage += 'mayúscula, ';
  }

  const lowerCaseCharacters = /[a-z]+/g;
  if (!lowerCaseCharacters.test(value)) {
    errorMessage += 'minúscula, ';
  }

  const numberCharacters = /[0-9]+/g;
  if (!numberCharacters.test(value)) {
    errorMessage += 'número, ';
  }

  const specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (!specialCharacters.test(value)) {
    errorMessage += 'carácter especial, ';
  }

  if (errorMessage === '') {
    return null;
  } else
    return {
      passwordStrength: 'Falta: ' + errorMessage.replace(/,\s*$/, ''),
    };
};
