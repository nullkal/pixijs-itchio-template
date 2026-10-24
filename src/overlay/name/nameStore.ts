import { createStore } from "zustand/vanilla";

type NameState = {
  readonly name: string;
  readonly draft: string;
  readonly error: string | null;

  prepare: () => void;
  setDraft: (draft: string) => void;
  confirm: () => boolean;
  reset: () => void;
};

const initialState = { name: "", draft: "", error: null };

export function createNameStore() {
  return createStore<NameState>()((set, get) => ({
    ...initialState,
    prepare: () => set({ draft: get().name, error: null }),
    setDraft: (draft) => set({ draft, error: null }),
    confirm: () => {
      const name = get().draft.trim();
      if (!name || [...name].length > 20) {
        set({ error: "名前は1〜20文字で入力してください。" });
        return false;
      }
      set({ name, draft: name, error: null });
      return true;
    },
    reset: () => set(initialState),
  }));
}

export type NameStore = ReturnType<typeof createNameStore>;
