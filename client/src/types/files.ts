import { User } from "./user";

export type UserFile = {
  id: string;
  name: string;
  folder: UserFolder | null;
  folderId: number | null;
  owner: User;
  relativePath: string;
  isPublic: boolean;
};

export type UserFolder = {
  id: string;
  name: string;
  parentFolderId: number | null;
  owner: User;
  relativePath: string;
  isPublic: boolean;
  files: UserFile[] | null;
  children: UserFolder[] | null;
};
