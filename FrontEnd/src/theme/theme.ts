import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#5B3DF5" },
    secondary: { main: "#00C2A8" },
    background: { default: "#F7F7FB" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
  },
});
