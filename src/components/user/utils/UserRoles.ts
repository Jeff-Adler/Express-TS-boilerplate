export interface UserRoles {
  ADMIN: string;
  USER: string;
}

export type UserRole = keyof UserRoles;
