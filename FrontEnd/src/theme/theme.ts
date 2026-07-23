import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#377dff" },
    secondary: { main: "#00a650" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#132144", secondary: "#677788" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});
