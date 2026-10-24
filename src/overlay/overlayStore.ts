import { createStore } from "zustand/vanilla";
import { createNameStore, type NameStore } from "./name/nameStore";

type OverlayState = {
  readonly activeDialog: "name" | null;
  readonly name: NameStore;
  openName: () => void;
  confirmName: () => void;
  close: () => void;
  reset: () => void;
};

export function createOverlayStore() {
  const name = createNameStore();
  return createStore<OverlayState>()((set, get) => ({
    activeDialog: null,
    name,
    openName: () => {
      if (get().activeDialog === "name") return;
      name.getState().prepare();
      set({ activeDialog: "name" });
    },
    confirmName: () => {
      if (get().activeDialog !== "name") return;
      if (name.getState().confirm()) set({ activeDialog: null });
    },
    close: () => {
      if (get().activeDialog === null) return;
      name.getState().prepare();
      set({ activeDialog: null });
    },
    reset: () => {
      name.getState().reset();
      set({ activeDialog: null });
    },
  }));
}

export type OverlayStore = ReturnType<typeof createOverlayStore>;
