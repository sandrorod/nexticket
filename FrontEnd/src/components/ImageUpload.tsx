import { useRef, useState } from "react";
import { Box, Button, Typography, Alert, CircularProgress, IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { uploadEventImage } from "../api/uploads";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato inválido. Envie uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadEventImage(file);
      onChange(url);
    } catch {
      setError("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} mb={1}>
        Capa do evento
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "grey.100",
          border: "1px dashed",
          borderColor: "grey.400",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value && !uploading && (
          <>
            <Box component="img" src={value} alt="Capa do evento" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <IconButton
              size="small"
              onClick={() => onChange(undefined)}
              sx={{ position: "absolute", top: 8, right: 8, bgcolor: "background.paper", "&:hover": { bgcolor: "grey.200" } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}

        {!value && !uploading && (
          <Button
            component="label"
            startIcon={<CloudUploadIcon />}
            onClick={() => inputRef.current?.click()}
          >
            Enviar imagem (formato 16:9, estilo capa de vídeo)
          </Button>
        )}

        {uploading && <CircularProgress size={32} />}
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handleFileSelect}
      />

      {value && !uploading && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => inputRef.current?.click()}>
          Trocar imagem
        </Button>
      )}

      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </Box>
  );
}
