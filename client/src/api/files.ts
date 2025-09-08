import { api } from "@/api";
import { UserFile, UserFolder } from "@/types/";

export const getFiles = async (): Promise<UserFile[]> => {
  const response = await api.get("/files");
  return response.data;
};

export const getSharedFiles = async (): Promise<UserFile[]> => {
  const response = await api.get("/files/shared");
  return response.data;
};

export const getFolders = async (): Promise<UserFolder[]> => {
  const response = await api.get("/files/folders");
  return response.data;
};

export const searchFiles = async (
  query: string
): Promise<{
  files: UserFile[];
  folders: UserFolder[];
}> => {
  const response = await api.get("/files/search", { params: { q: query } });
  return response.data;
};

export const uploadFiles = async (filesToUpload: File[]): Promise<void> => {
  const formData = new FormData();
  filesToUpload.forEach((file) => {
    const path = file.webkitRelativePath || file.name;
    formData.append("files", file, path);
  });

  await api.post("/files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const createFolder = async (folderName: string): Promise<void> => {
  await api.post("/files/folders", { name: folderName });
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  await api.delete(`/files/folders/${folderId}`);
};

export const downloadFile = async (
  fileId: string,
  fileName: string
): Promise<void> => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
