import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, downloadFile } from "@/api";
import { Box, Text, Button } from "@mantine/core";
import { routes } from "@/routes";
import { redirect } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";

export const Route = createFileRoute(routes.sharedId)({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    try {
      const res = await api.get(`/files/shared/${params.sharedId}/validate`);
      if (!res.data.valid) {
        throw redirect({ to: routes.login });
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      throw redirect({ to: routes.login });
    }
  },
});

interface File {
  id: string;
  name: string;
}

function RouteComponent() {
  const { sharedId } = Route.useParams();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFile = async () => {
    try {
      const res = await api.get(`/files/shared/${sharedId}`);
      if (res.data.valid) {
        setFile(res.data.file);
      } else {
        setFile(null);
      }
    } catch (err) {
      console.error("Failed to fetch file:", err);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [sharedId]);

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

  if (loading) return <Text>Загрузка файла...</Text>;

  return (
    <Box>
      {file ? (
        <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text>{file.name}</Text>
          <Button size="xs" onClick={() => handleDownload(file.id, file.name)}>
            Download
          </Button>
        </Box>
      ) : (
        <Text c="dimmed">Файл не найден</Text>
      )}
    </Box>
  );
}
