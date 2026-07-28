import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { supabase } from "../../api/supabaseClient";
import { loginWithGoogleAccessToken } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { lerELimparRetornoOAuth } from "../../utils/oauthReturn";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalizarLogin = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (sessionError || !accessToken) {
        setError("Não foi possível concluir o login com o Google.");
        return;
      }

      try {
        const auth = await loginWithGoogleAccessToken(accessToken);
        setAuth(auth);
        await supabase.auth.signOut();
        navigate(lerELimparRetornoOAuth() ?? "/eventos", { replace: true });
      } catch {
        setError("Não foi possível concluir o login com o Google.");
      }
    };

    finalizarLogin();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "calc(100vh - 4.75rem)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 3,
      }}
    >
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <CircularProgress size={32} />
          <Typography color="text.secondary">Entrando com o Google...</Typography>
        </>
      )}
    </Box>
  );
}
