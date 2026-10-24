import { useEffect, useState } from "react";
import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Game } from "./game/Game";
import { Overlay } from "./overlay/Overlay";
import { createOverlayStore } from "./overlay/overlayStore";

const theme = createTheme({
  palette: { background: { default: "#000000" } },
  typography: { fontFamily: 'system-ui, "Noto Sans JP", sans-serif' },
});

export function App() {
  const [store] = useState(createOverlayStore);

  useEffect(() => () => store.getState().reset(), [store]);

  return (
    <ThemeProvider theme={theme}>
      <title>PixiJS itch.io Template</title>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "html, body, #root": { width: "100%", height: "100%" },
          "html, body": { overflow: "hidden", overscrollBehavior: "none" },
        }}
      />
      <Game store={store} />
      <Overlay store={store} />
    </ThemeProvider>
  );
}
