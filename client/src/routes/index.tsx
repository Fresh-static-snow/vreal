import {
  createFolder,
  deleteFolder,
  downloadFile,
  getFiles,
  getFolders,
  getSharedFiles,
  searchFiles,
  uploadFiles,
} from "@/api";
import { Dropzone } from "@/components/Dropzone";
import { FileItem } from "@/components/FileItem";
import { useAuth } from "@/contexts";
import { useDebounce } from "@/hooks";
import { routes } from "@/routes";
import { UserFile, UserFolder } from "@/types/";
import { Box, Button, Text, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { Fragment, useEffect, useState } from "react";

export const Route = createFileRoute(routes.root)({
  component: Dashboard,
});

function Dashboard() {
  const { logout } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{
    files: UserFile[];
    folders: UserFolder[];
  }>({
    files: [],
    folders: [],
  });
  const [opened, setOpened] = useState(false);

  const searchDebounced = useDebounce(search, 500);
  const queryClient = useQueryClient();

  const { data: files = [], refetch: refetchFiles } = useQuery<UserFile[]>({
    queryKey: ["files"],
    queryFn: getFiles,
  });

  const { data: filesShared = [] } = useQuery<UserFile[]>({
    queryKey: ["files", "shared"],
    queryFn: getSharedFiles,
  });

  const { data: folders = [] } = useQuery<UserFolder[]>({
    queryKey: ["files", "folders"],
    queryFn: getFolders,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: () => {
      setSelectedFiles([]);
      notifications.show({ message: "Upload successful!", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (err) => {
      notifications.show({
        title: "Upload failed.",
        message: err.message,
        color: "red",
      });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["files", "folders"] });
    },
    onError: (err) => {
      notifications.show({
        title: "Create folder failed.",
        message: err.message,
        color: "red",
      });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["files", "folders"] });
    },
    onError: (err) => {
      notifications.show({
        title: "Delete folder failed.",
        message: err.message,
        color: "red",
      });
    },
  });

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

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    uploadMutation.mutate(selectedFiles);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolderMutation.mutate(newFolderName);
    setNewFolderName("");
    setOpened(false);
  };

  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchDebounced.trim()) {
        setResults({ files: [], folders: [] });
        return;
      }
      try {
        const res = await searchFiles(searchDebounced);
        setResults(res);
      } catch (err) {
        if (err instanceof AxiosError) {
          notifications.show({
            title: "Delete folder failed.",
            message: err.message,
            color: "red",
          });
        }
      }
    };

    fetchSearch();
  }, [searchDebounced]);

  return (
    <Fragment>
      <Box>
        <Box style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button onClick={logout}>Logout</Button>
          <Button onClick={() => setOpened(true)}>Create Folder</Button>
        </Box>

        <Box mt="md" mb="md">
          <Text mb="xs">Search:</Text>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginRight: 8, padding: 4 }}
          />
        </Box>

        {results.files.length > 0 && (
          <Box>
            <Text fw={500}>Found Files:</Text>
            <ul>
              {results.files.map((f) => (
                <li key={f.id}>{f.name}</li>
              ))}
            </ul>
          </Box>
        )}

        {results.folders.length > 0 && (
          <Box>
            <Text fw={500}>Found Folders:</Text>
            <ul>
              {results.folders.map((f) => (
                <li key={f.id}>{f.name}</li>
              ))}
            </ul>
          </Box>
        )}

        <Box mt="lg">
          <Text w={700}>Your Files:</Text>
          {files?.length === 0 && (
            <Text c="dimmed">No files uploaded yet.</Text>
          )}
          <ul>
            {files &&
              files?.map((f) => (
                <FileItem
                  key={f.id}
                  file={f}
                  fetchFiles={refetchFiles}
                  handleDownload={handleDownload}
                  allowEdit={true}
                />
              ))}
          </ul>
        </Box>

        <Box mt="lg">
          <Text w={500}>Your Folders:</Text>
          {folders?.length === 0 && (
            <Text c="dimmed">No folders uploaded yet.</Text>
          )}
          <ul>
            {folders &&
              folders?.map((folder) => (
                <li
                  key={folder.id}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Link to={`/folders/${folder.id}`}>{folder.name}</Link>
                  <Button
                    size="xs"
                    color="red"
                    variant="outline"
                    onClick={async () => {
                      if (
                        confirm(
                          `Delete folder "${folder.name}" and all its contents?`
                        )
                      ) {
                        deleteFolderMutation.mutate(folder.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))}
          </ul>
        </Box>

        <Box mt="lg">
          <Text w={500}>Shared with you Files:</Text>
          {filesShared?.length === 0 && (
            <Text c="dimmed">No files uploaded yet.</Text>
          )}
          <ul>
            {filesShared &&
              filesShared?.map((f) => (
                <li
                  key={f.id}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {f.name}
                  <Button
                    size="xs"
                    onClick={() => handleDownload(f.id, f.name)}
                    variant="outline"
                  >
                    Download
                  </Button>
                </li>
              ))}
          </ul>
        </Box>

        <Dropzone setFiles={setSelectedFiles} files={selectedFiles} />
        <Button
          mt="sm"
          onClick={handleUpload}
          loading={uploadMutation.isPending}
          variant="outline"
          disabled={selectedFiles.length === 0 || uploadMutation.isPending}
        >
          Send to Server
        </Button>
      </Box>

      <Modal opened={opened} onClose={() => setOpened(false)}>
        <TextInput
          placeholder="Folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.currentTarget.value)}
          mb="md"
        />
        <Button fullWidth onClick={handleCreateFolder}>
          Create Folder
        </Button>
      </Modal>
    </Fragment>
  );
}
