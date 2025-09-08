export type User = {
  id: number;
  email: string;
  role: Role;
};

export enum Role {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  USER = "USER",
}
