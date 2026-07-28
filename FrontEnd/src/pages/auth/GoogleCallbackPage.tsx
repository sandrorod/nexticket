import { useEffect, useRef, useState } from "react";
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
  const emAndamento = useRef(false);

  useEffect(() => {
    const trocarToken = async (accessToken: string) => {
      if (emAndamento.current) return;
      emAndamento.current = true;
      try {
        const auth = await loginWithGoogleAccessToken(accessToken);
        setAuth(auth);
        await supabase.auth.signOut();
        navigate(lerELimparRetornoOAuth() ?? "/eventos", { replace: true });
      } catch (err: any) {
        setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível concluir o login com o Google.");
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) trocarToken(session.access_token);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) trocarToken(data.session.access_token);
    });

    const timeout = setTimeout(() => {
      if (!emAndamento.current) {
        setError("Não foi possível concluir o login com o Google.");
      }
    }, 8000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
