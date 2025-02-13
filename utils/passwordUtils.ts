export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordValidation {
  isValid: boolean;
  strength: PasswordStrength;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  message: string;
}

export const validatePassword = (password: string): PasswordValidation => {
  const result = {
    isValid: false,
    strength: "weak" as PasswordStrength,
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    message: "",
  };

  let score = 0;
  if (result.hasMinLength) score++;
  if (result.hasUpperCase) score++;
  if (result.hasLowerCase) score++;
  if (result.hasNumber) score++;
  if (result.hasSpecialChar) score++;

  if (score >= 4) {
    result.strength = "strong";
    result.isValid = true;
    result.message = "Strong password";
  } else if (score >= 3) {
    result.strength = "medium";
    result.isValid = true;
    result.message = "Medium strength password";
  } else {
    result.strength = "weak";
    result.isValid = false;
    result.message = "Weak password";
  }

  return result;
};
