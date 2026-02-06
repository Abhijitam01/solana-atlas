import { useMemo } from "react";
import { useProgramStore } from "@/stores/programs";
import { useTemplate } from "@/hooks/use-templates";
import type { Template } from "@solana-playground/types";
import { shallow } from "zustand/shallow";

export function useActiveProgram() {
  const { activeProgramId, programs } = useProgramStore(
    (state) => ({
      activeProgramId: state.activeProgramId,
      programs: state.programs,
    }),
    shallow
  );

  const activeProgram = activeProgramId ? programs[activeProgramId] : null;
  const templateId = activeProgram?.source === "template" ? activeProgram.templateId : null;

  const templateQuery = useTemplate(templateId ?? "");

  const resolvedTemplate: Template | null = useMemo(() => {
    if (!activeProgram) return null;
    if (activeProgram.source === "template") {
      return templateQuery.data ?? null;
    }
    return {
      id: activeProgram.id,
      code: activeProgram.code,
      metadata: activeProgram.metadata,
      explanations: [],
      programMap: activeProgram.programMap,
      functionSpecs: activeProgram.functionSpecs,
      precomputedState: activeProgram.precomputedState,
    };
  }, [activeProgram, templateQuery.data]);

  return {
    activeProgram,
    template: resolvedTemplate,
    isLoading: activeProgram?.source === "template" ? templateQuery.isLoading : false,
  };
}
