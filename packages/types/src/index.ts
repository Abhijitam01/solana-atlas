export * from "./template";
export * from "./explanation";
export * from "./execution";
export * from "./program-map";
export * from "./function-spec";

// Combined template type
import type { TemplateMetadata } from "./template";
import type { LineExplanation } from "./explanation";
import type { ProgramMap } from "./program-map";
import type { PrecomputedState } from "./execution";
import type { FunctionSpec } from "./function-spec";

export interface Template {
  id: string;
  code: string;
  metadata: TemplateMetadata;
  explanations: LineExplanation[];
  programMap: ProgramMap;
  functionSpecs: FunctionSpec[];
  precomputedState: PrecomputedState;
  checklist?: string[];
  mermaidDiagram?: string;
  testCode?: string;
}
