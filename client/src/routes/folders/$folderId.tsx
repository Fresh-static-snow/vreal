import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, downloadFile } from "@/api";
import { Box, Text, Button, TextInput, Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Dropzone } from "@/components/Dropzone";
import { FileItem } from "@/components/FileItem";
import { notifications } from "@mantine/notifications";

export const Route = createFileRoute("/folders/$folderId")({
  component: RouteComponent,
});

interface Folder {
  id: string;
  name: string;
  parent?: Folder;
  children?: Folder[];
}

function RouteComponent() {
  const { folderId } = Route.useParams();
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const queryClient = useQueryClient();

  const folderQuery = useQuery({
    queryKey: ["folder", folderId],
    queryFn: async () => {
      const response = await api.get(`/files/folders/${folderId}`);
      return response.data;
    },
  });

  const filesQuery = useQuery({
    queryKey: ["files", folderId],
    queryFn: async () => {
      const res = await api.get(`/files/folders/${folderId}/files`);
      return res.data;
    },
  });

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await api.post("/files/folders", {
        name: newFolderName,
        parentId: folderId,
      });
      setNewFolderName("");
      queryClient.invalidateQueries({ queryKey: ["folder", folderId] });
    } catch (err) {
      console.error("Failed to create folder:", err);
      alert("Error creating folder");
    }
  };

  // uploadFiles function for useMutation
  const uploadFiles = async (filesToUpload: File[]) => {
    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("folderId", folderId);
    await api.post("/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const uploadMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: () => {
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["files", folderId] });
    },
    onError: (err) => {
      console.error("Failed to upload files:", err);
      alert("Error uploading files");
    },
  });

  const handleUploadFiles = () => {
    if (selectedFiles.length === 0) return;
    uploadMutation.mutate(selectedFiles);
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      await downloadFile(fileId, fileName);
    } catch (err) {
      notifications.show({
        message: "Download failed",
        color: "red",
      });
    }
  };

  return (
    <Box>
      {folderQuery.isLoading ? (
        <div>Загрузка...</div>
      ) : folderQuery.isError ? (
        <div>Ошибка загрузки папки</div>
      ) : (
        <>
          <Text>
            Вы на странице папки с id: {folderQuery.data.id}, названием:{" "}
            {folderQuery.data.name}
          </Text>

          <Box mt="md">
            <Text>Подпапки:</Text>
            {folderQuery.data.children &&
            folderQuery.data.children.length > 0 ? (
              <ul>
                {folderQuery.data.children.map((child: Folder) => (
                  <li key={child.id}>
                    <Link to={`/folders/${child.id}`}>{child.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Text c="dimmed">Нет подпапок</Text>
            )}
          </Box>

          {/* Create subfolder */}
          <Box mt="md">
            <Text mb="xs">Создать подпапку:</Text>
            <Group>
              <TextInput
                placeholder="Название новой папки"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button onClick={handleCreateFolder}>Создать</Button>
            </Group>
          </Box>

          <Box mt="md">
            <Text mb="xs">Загрузить файлы:</Text>
            <Dropzone files={selectedFiles} setFiles={setSelectedFiles} />
            <Button
              mt="sm"
              onClick={handleUploadFiles}
              disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              loading={uploadMutation.isPending}
            >
              Send to Server
            </Button>
          </Box>

          <Box mt="md">
            {filesQuery.isLoading ? (
              <div>Загрузка файлов...</div>
            ) : filesQuery.isError ? (
              <div>Ошибка загрузки файлов</div>
            ) : (
              <ul>
                {filesQuery.data.map((file: any) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    fetchFiles={() => filesQuery.refetch()}
                    handleDownload={handleDownload}
                  />
                ))}
              </ul>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
