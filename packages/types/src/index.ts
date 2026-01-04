export * from "./template";
export * from "./explanation";
export * from "./execution";
export * from "./program-map";

// Combined template type
import type { TemplateMetadata } from "./template";
import type { LineExplanation } from "./explanation";
import type { ProgramMap } from "./program-map";
import type { PrecomputedState } from "./execution";

export interface Template {
  id: string;
  code: string;
  metadata: TemplateMetadata;
  explanations: LineExplanation[];
  programMap: ProgramMap;
  precomputedState: PrecomputedState;
}

