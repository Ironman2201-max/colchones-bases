// src/app/core/models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'seller' | 'client';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// src/app/core/models/auth-response.model.ts
export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  authorization: {
    token: string;
    type: string;
  };
}


