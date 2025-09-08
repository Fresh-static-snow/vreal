import { api } from "@/api";
import { UserFile } from "@/types/";
import { Button, Modal, Paper, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { FC, Fragment, useState } from "react";

interface FileItemProps {
  file: UserFile;
  fetchFiles: () => void;
  handleDownload: (fileId: string, fileName: string) => void;
  allowDownload?: boolean;
  allowEdit?: boolean;
}

export const FileItem: FC<FileItemProps> = ({
  file,
  fetchFiles,
  handleDownload,
  allowDownload = true,
  allowEdit = false,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [open, setOpen] = useState(false);

  const handleShare = async () => {
    try {
      const res = await api.post(`/files/${file.id}/share`);
      const shareLink = res.data.link;

      notifications.show({
        title: "Share Link",
        color: "purple",
        message: (
          <a href={shareLink} target="_blank" rel="noreferrer">
            {shareLink}
          </a>
        ),
      });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to get the share link",
        color: "red",
      });
    }
  };

  return (
    <Fragment>
      <Paper
        p={4}
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        {isRenaming && (
          <Fragment>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button
              size="xs"
              onClick={async () => {
                try {
                  await api.patch(`/files/${file.id}/rename`, {
                    name: newName,
                  });
                  setIsRenaming(false);
                  fetchFiles();
                } catch (err) {
                  if (err instanceof AxiosError) {
                    notifications.show({
                      title: "Rename failed",
                      message: err.message,
                      color: "red",
                    });
                  }
                }
              }}
            >
              Send
            </Button>
          </Fragment>
        )}

        {!isRenaming && (
          <Fragment>
            <Text w={300}>{file.name}</Text>

            {allowDownload && (
              <Button
                size="xs"
                onClick={() => handleDownload(file.id, file.name)}
                variant="outline"
              >
                Download
              </Button>
            )}

            {allowEdit && (
              <Fragment>
                <Button
                  size="xs"
                  onClick={() => setIsRenaming(true)}
                  variant="outline"
                >
                  Rename
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await api.post(`/files/${file.id}/clone`);
                      fetchFiles();
                    } catch (err) {
                      if (err instanceof AxiosError) {
                        notifications.show({
                          title: "Clone failed",
                          message: err.message,
                          color: "red",
                        });
                      }
                    }
                  }}
                >
                  Clone
                </Button>
                <Button size="xs" onClick={handleShare}>
                  Share
                </Button>
                <Button size="xs" color="red" onClick={() => setOpen(true)}>
                  Delete
                </Button>
              </Fragment>
            )}
          </Fragment>
        )}
      </Paper>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Confirm Delete"
      >
        <Text>Are you sure to delete "{file.name}"?</Text>
        <div
          style={{
            marginTop: 15,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <Button variant="default" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={async () => {
              try {
                await api.delete(`/files/${file.id}`);
                fetchFiles();
                setOpen(false);
              } catch (err) {
                if (err instanceof AxiosError) {
                  notifications.show({
                    title: "Delete failed",
                    message: err.message,
                    color: "red",
                  });
                }
              }
            }}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </Fragment>
  );
};
