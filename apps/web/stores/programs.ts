import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";
import type { ProgramMap, FunctionSpec, PrecomputedState, TemplateMetadata } from "@solana-playground/types";
import { PROGRAM_TYPE_MAP, type ProgramTypeId } from "@/lib/program-types";
import type { TestSuiteResult } from "@/lib/test-runner";

export type ProgramSource = "template" | "custom";

export interface ProgramSession {
  id: string;
  savedId?: string;
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
  mermaidDiagram?: string;
  testCode?: string;
  lastTestResult?: TestSuiteResult;
  createdAt: string;
  updatedAt: string;
  isDirty: boolean;
}

interface ProgramState {
  programs: Record<string, ProgramSession>;
  activeProgramId: string | null;
  createProgram: (
    name: string,
    typeId: ProgramTypeId,
    customCode?: string,
    checklist?: string[],
    metadata?: TemplateMetadata,
    programMap?: ProgramMap,
    functionSpecs?: FunctionSpec[],
    precomputedState?: PrecomputedState,
    mermaidDiagram?: string,
    testCode?: string
  ) => ProgramSession;
  openTemplateProgram: (template: {
    id: string;
    code: string;
    metadata: TemplateMetadata;
    functionSpecs: FunctionSpec[];
    programMap: ProgramMap;
    precomputedState: PrecomputedState;
    checklist?: string[];
    mermaidDiagram?: string;
  }) => ProgramSession;
  setActiveProgram: (id: string) => void;
  updateProgramCode: (id: string, code: string) => void;
  updateProgramSavedId: (id: string, savedId: string) => void;
  openUserProgram: (userCode: {
    id: string;
    templateId: string;
    title: string;
    code: string;
      template: {
        metadata: TemplateMetadata;
        functionSpecs: FunctionSpec[];
        programMap: ProgramMap;
        precomputedState: PrecomputedState;
        checklist: string[];
        testCode?: string;
      };
    }) => ProgramSession;
  removeProgramBySavedId: (savedId: string) => void;
  updateProgramTestCode: (id: string, testCode: string) => void;
  setProgramTestResult: (id: string, result: TestSuiteResult) => void;
}

const nowIso = () => new Date().toISOString();

const createSessionId = () =>
  `program-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useProgramStore = createWithEqualityFn<ProgramState>()(
  persist(
    (set, get) => ({
      programs: {},
      activeProgramId: null,
      createProgram: (
        name,
        typeId,
        customCode,
        checklist,
        metadata,
        programMap,
        functionSpecs,
        precomputedState,
        mermaidDiagram,
        testCode
      ) => {
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
          code: customCode || definition.scaffold,
          metadata: metadata || {
            ...definition.metadata,
            id,
          },
          functionSpecs: functionSpecs || definition.functionSpecs,
          programMap: programMap || definition.programMap,
          precomputedState: precomputedState || definition.precomputedState,
          checklist: checklist || definition.checklist,
          mermaidDiagram: mermaidDiagram,
          testCode: testCode ?? (definition as any).testCode,
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
          // Update session with fresh template data while preserving user state
          const updatedSession = {
            ...existing,
            metadata: template.metadata,
            functionSpecs: template.functionSpecs,
            programMap: template.programMap,
            precomputedState: template.precomputedState,
            checklist: template.checklist || [],
            mermaidDiagram: template.mermaidDiagram,
            testCode: (template as any).testCode || existing.testCode,
          };

          set((state) => ({
            programs: {
              ...state.programs,
              [existing.id]: updatedSession,
            },
            activeProgramId: existing.id,
          }));
          return updatedSession;
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
          checklist: template.checklist || [],
          mermaidDiagram: template.mermaidDiagram,
          testCode: (template as any).testCode,
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
      openUserProgram: (userCode) => {
        const id = `user-${userCode.id}`;
        // Check if already open
        const existing = get().programs[id];
        if (existing) {
           set({ activeProgramId: id });
           return existing;
        }

        const session: ProgramSession = {
          id,
          savedId: userCode.id,
          name: userCode.title,
          source: "custom", // User code is custom, but based on a template
          typeId: userCode.templateId as ProgramTypeId,
          templateId: userCode.templateId,
          code: userCode.code,
          metadata: userCode.template.metadata,
          functionSpecs: userCode.template.functionSpecs,
          programMap: userCode.template.programMap,
          precomputedState: userCode.template.precomputedState,
          checklist: userCode.template.checklist,
          testCode: userCode.template.testCode,
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
      removeProgramBySavedId: (savedId) =>
        set((state) => {
          const targetProgram = Object.values(state.programs).find(
            (program) => program.savedId === savedId
          );

          if (!targetProgram) {
            return state;
          }

          const { [targetProgram.id]: _, ...remaining } = state.programs;
          const nextActive =
            state.activeProgramId === targetProgram.id ? null : state.activeProgramId;

          return {
            programs: remaining,
            activeProgramId: nextActive,
          };
        }),
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
                isDirty: true, // Always dirty if edited
              },
            },
          };
        }),
      updateProgramSavedId: (id, savedId) =>
        set((state) => {
          const program = state.programs[id];
          if (!program) return state;
          return {
            programs: {
              ...state.programs,
              [id]: {
                ...program,
                savedId,
                isDirty: false, // Clean after save? Or keep dirty if logic differs
              },
            },
          };
        }),
      updateProgramTestCode: (id, testCode) =>
        set((state) => {
          const program = state.programs[id];
          if (!program) return state;
          return {
            programs: {
              ...state.programs,
              [id]: {
                ...program,
                testCode,
                updatedAt: nowIso(),
              },
            },
          };
        }),
      setProgramTestResult: (id, result) =>
        set((state) => {
          const program = state.programs[id];
          if (!program) return state;
          return {
            programs: {
              ...state.programs,
              [id]: {
                ...program,
                lastTestResult: result,
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
