import { Group, Text } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { FC } from "react";

interface DropzoneProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onFilesChange?: (
    filesWithPaths: { file: File; webkitRelativePath: string }[]
  ) => void;
}

export const Dropzone: FC<DropzoneProps> = ({
  files = [],
  setFiles,
  onFilesChange,
}) => {
  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);

      if (onFilesChange) {
        const filesWithPaths = selectedFiles.map((file) => ({
          file,
          webkitRelativePath: file.webkitRelativePath || file.name,
        }));
        onFilesChange(filesWithPaths);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      setFiles(droppedFiles);

      if (onFilesChange) {
        const filesWithPaths = droppedFiles.map((file) => ({
          file,
          webkitRelativePath: file.webkitRelativePath || file.name,
        }));
        onFilesChange(filesWithPaths);
      }
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        const input = document.querySelector<HTMLInputElement>("#folderInput");
        input?.click();
      }}
      style={{
        border: "2px dashed #ccc",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <input
        id="folderInput"
        type="file"
        //@ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
      />
      <Group
        style={{
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <IconUpload size={52} color="#007bff" stroke={1.5} />
        <div style={{ textAlign: "center" }}>
          {files.length === 0 && (
            <Text size="xl" inline>
              Drag folders here or click to select
            </Text>
          )}
          {files.length > 0 && (
            <Text size="xl" inline>
              {files.length === 1
                ? `Selected file: ${files[0].webkitRelativePath || files[0].name}`
                : `Selected files (${files.length}): ${files
                    .map((f) => f.webkitRelativePath || f.name)
                    .join(", ")}`}
            </Text>
          )}

          <Text size="sm" c="dimmed" inline mt={7}>
            Attach as many files as you like
          </Text>
        </div>
      </Group>
    </div>
  );
};
