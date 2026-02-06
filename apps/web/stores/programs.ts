import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProgramMap, FunctionSpec, PrecomputedState, TemplateMetadata } from "@solana-playground/types";
import { PROGRAM_TYPE_MAP, type ProgramTypeId } from "@/lib/program-types";

export type ProgramSource = "template" | "custom";

export interface ProgramSession {
  id: string;
  name: string;
  source: ProgramSource;
  typeId: ProgramTypeId;
  templateId?: string;
  code: string;
  metadata: TemplateMetadata;
  functionSpecs: FunctionSpec[];
  programMap: ProgramMap;
  precomputedState: PrecomputedState;
  checklist: string[];
  createdAt: string;
  updatedAt: string;
  isDirty: boolean;
}

interface ProgramState {
  programs: Record<string, ProgramSession>;
  activeProgramId: string | null;
  createProgram: (name: string, typeId: ProgramTypeId) => ProgramSession;
  openTemplateProgram: (template: {
    id: string;
    code: string;
    metadata: TemplateMetadata;
    functionSpecs: FunctionSpec[];
    programMap: ProgramMap;
    precomputedState: PrecomputedState;
  }) => ProgramSession;
  setActiveProgram: (id: string) => void;
  updateProgramCode: (id: string, code: string) => void;
}

const nowIso = () => new Date().toISOString();

const createSessionId = () =>
  `program-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      programs: {},
      activeProgramId: null,
      createProgram: (name, typeId) => {
        const definition = PROGRAM_TYPE_MAP.get(typeId);
        if (!definition) {
          throw new Error(`Unknown program type: ${typeId}`);
        }

        const id = createSessionId();
        const session: ProgramSession = {
          id,
          name,
          source: "custom",
          typeId,
          code: definition.scaffold,
          metadata: {
            ...definition.metadata,
            id,
          },
          functionSpecs: definition.functionSpecs,
          programMap: definition.programMap,
          precomputedState: definition.precomputedState,
          checklist: definition.checklist,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          isDirty: false,
        };

        set((state) => ({
          programs: { ...state.programs, [id]: session },
          activeProgramId: id,
        }));

        return session;
      },
      openTemplateProgram: (template) => {
        const existing = Object.values(get().programs).find(
          (program) => program.source === "template" && program.templateId === template.id
        );
        if (existing) {
          set({ activeProgramId: existing.id });
          return existing;
        }

        const id = `template-${template.id}`;
        const session: ProgramSession = {
          id,
          name: template.metadata.name,
          source: "template",
          typeId: template.id as ProgramTypeId,
          templateId: template.id,
          code: template.code,
          metadata: template.metadata,
          functionSpecs: template.functionSpecs,
          programMap: template.programMap,
          precomputedState: template.precomputedState,
          checklist: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
          isDirty: false,
        };

        set((state) => ({
          programs: { ...state.programs, [id]: session },
          activeProgramId: id,
        }));

        return session;
      },
      setActiveProgram: (id) => set({ activeProgramId: id }),
      updateProgramCode: (id, code) =>
        set((state) => {
          const program = state.programs[id];
          if (!program) return state;
          return {
            programs: {
              ...state.programs,
              [id]: {
                ...program,
                code,
                updatedAt: nowIso(),
                isDirty: program.source === "custom" ? true : program.isDirty,
              },
            },
          };
        }),
    }),
    {
      name: "solana-playground-programs",
      partialize: (state) => ({
        programs: state.programs,
        activeProgramId: state.activeProgramId,
      }),
    }
  )
);
