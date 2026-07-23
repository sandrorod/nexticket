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
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1440 },
  },
  typography: {
    fontFamily: `"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        maxWidthXl: { maxWidth: "90rem" },
      },
    },
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
          boxShadow: "none",
          border: "1px solid rgba(231, 234, 243, 0.95)",
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
