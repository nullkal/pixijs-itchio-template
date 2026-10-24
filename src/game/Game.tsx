import { useEffect, useRef, useState } from "react";
import { Alert, Box } from "@mui/material";
import { init } from "./init";
import type { OverlayStore } from "../overlay/overlayStore";

export function Game({ store }: { store: OverlayStore }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const game = init(containerRef.current!, store);
    let active = true;
    setError(null);
    void game.ready.catch((cause: unknown) => {
      if (active) {
        console.error("ゲームの起動に失敗しました", cause);
        setError(
          "ゲームを起動できませんでした。ページを再読み込みしてください。",
        );
      }
    });
    return () => {
      active = false;
      game.destroy();
    };
  }, [store]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100vh",
        "@supports (height: 100dvh)": { height: "100dvh" },
        overflow: "hidden",
        "& > canvas": {
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
        },
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
