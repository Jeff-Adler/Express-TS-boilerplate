interface Roles {
  ADMIN: string;
  USER: string;
}

export type Role = keyof Roles;
