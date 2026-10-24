import { useStore } from "zustand";
import { Box } from "@mui/material";
import { NameDialog } from "./name/NameDialog";
import type { OverlayStore } from "./overlayStore";

export function Overlay({ store }: { store: OverlayStore }) {
  const nameStore = useStore(store, (state) => state.name);
  const activeDialog = useStore(store, (state) => state.activeDialog);
  const confirmName = useStore(store, (state) => state.confirmName);
  const close = useStore(store, (state) => state.close);

  return (
    <Box sx={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
      <NameDialog
        store={nameStore}
        open={activeDialog === "name"}
        onConfirm={confirmName}
        onClose={close}
      />
    </Box>
  );
}
