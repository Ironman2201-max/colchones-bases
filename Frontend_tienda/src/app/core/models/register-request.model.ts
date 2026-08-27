// src/app/core/models/register-request.model.ts
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
}