import { useStore } from "zustand";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import type { NameStore } from "./nameStore";

type NameDialogProps = {
  store: NameStore;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function NameDialog({
  store,
  open,
  onConfirm,
  onClose,
}: NameDialogProps) {
  const draft = useStore(store, (state) => state.draft);
  const error = useStore(store, (state) => state.error);
  const setDraft = useStore(store, (state) => state.setDraft);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="name-title"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // 日本語の変換確定に使った Enter では送信しない。
          onConfirm();
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            (event.nativeEvent.isComposing || event.keyCode === 229)
          )
            event.preventDefault();
        }}
      >
        <DialogTitle id="name-title">あなたの名前は？</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="名前"
            slotProps={{ htmlInput: { "data-1p-ignore": true } }}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            error={Boolean(error)}
            helperText={error ?? ""}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained">
            決定
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
