import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { Box, Alert, Typography } from "@mui/material";

interface Props {
  onScan: (text: string) => void;
  active: boolean;
}

export default function QrScanner({ onScan, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastScanRef = useRef<{ text: string; time: number }>({ text: "", time: 0 });

  useEffect(() => {
    if (!active) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }

    setError(null);
    const reader = new BrowserQRCodeReader();
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (!result || cancelled) return;

        const text = result.getText();
        const now = Date.now();
        const last = lastScanRef.current;

        // Evita disparar o mesmo scan repetidamente enquanto o QR segue no quadro.
        if (text === last.text && now - last.time < 3000) return;

        lastScanRef.current = { text, time: now };
        onScan(text);
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      })
      .catch((err) => {
        setError(
          err?.name === "NotAllowedError"
            ? "Permissão de câmera negada. Habilite o acesso à câmera nas configurações do navegador."
            : "Não foi possível acessar a câmera neste dispositivo."
        );
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <Box>
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            maxWidth: 400,
            mx: "auto",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "black",
          }}
        >
          <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
        Aponte a câmera para o QR Code do ingresso
      </Typography>
    </Box>
  );
}
