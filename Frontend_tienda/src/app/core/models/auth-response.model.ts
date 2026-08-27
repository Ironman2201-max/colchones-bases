import { User } from './user.model';

export interface AuthResponse {
  status: string;
  message: string;
  user: User;
  authorization: {
    token: string;
    type: string;
  };
}