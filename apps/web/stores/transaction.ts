import { create } from "zustand";

export interface TransactionInstruction {
  id: string;
  programId: string;
  instructionName: string;
  accounts: {
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }[];
  data?: Uint8Array;
}

export interface TransactionAccount {
  pubkey: string;
  label: string;
  isSigner: boolean;
  isWritable: boolean;
}

interface TransactionStore {
  instructions: TransactionInstruction[];
  accounts: TransactionAccount[];
  recentBlockhash: string | null;
  feePayer: string | null;

  // Actions
  addInstruction: (instruction: TransactionInstruction) => void;
  removeInstruction: (id: string) => void;
  updateInstruction: (id: string, instruction: Partial<TransactionInstruction>) => void;
  reorderInstructions: (fromIndex: number, toIndex: number) => void;
  addAccount: (account: TransactionAccount) => void;
  removeAccount: (pubkey: string) => void;
  setRecentBlockhash: (blockhash: string | null) => void;
  setFeePayer: (pubkey: string | null) => void;
  reset: () => void;
}

const initialState = {
  instructions: [],
  accounts: [],
  recentBlockhash: null,
  feePayer: null,
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  ...initialState,
  addInstruction: (instruction) =>
    set((state) => ({
      instructions: [...state.instructions, instruction],
    })),
  removeInstruction: (id) =>
    set((state) => ({
      instructions: state.instructions.filter((inst) => inst.id !== id),
    })),
  updateInstruction: (id, updates) =>
    set((state) => ({
      instructions: state.instructions.map((inst) =>
        inst.id === id ? { ...inst, ...updates } : inst
      ),
    })),
  reorderInstructions: (fromIndex, toIndex) =>
    set((state) => {
      const newInstructions = [...state.instructions];
      const removed = newInstructions[fromIndex];
      if (removed) {
        newInstructions.splice(fromIndex, 1);
        newInstructions.splice(toIndex, 0, removed);
      }
      return { instructions: newInstructions };
    }),
  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, account],
    })),
  removeAccount: (pubkey) =>
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.pubkey !== pubkey),
    })),
  setRecentBlockhash: (blockhash) => set({ recentBlockhash: blockhash }),
  setFeePayer: (pubkey) => set({ feePayer: pubkey }),
  reset: () => set(initialState),
}));

