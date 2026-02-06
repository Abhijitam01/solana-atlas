"use client";

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (moduleId: string, label: string) => Worker;
    };
  }
}

const globalScope = globalThis as typeof globalThis & {
  MonacoEnvironment?: {
    getWorker: (moduleId: string, label: string) => Worker;
  };
};

if (typeof window !== "undefined" && !globalScope.MonacoEnvironment) {
  globalScope.MonacoEnvironment = {
    getWorker: (_moduleId, label) => {
      switch (label) {
        case "json":
          return new Worker(
            new URL("monaco-editor/esm/vs/language/json/json.worker", import.meta.url),
            { type: "module" }
          );
        case "css":
        case "scss":
        case "less":
          return new Worker(
            new URL("monaco-editor/esm/vs/language/css/css.worker", import.meta.url),
            { type: "module" }
          );
        case "html":
        case "handlebars":
        case "razor":
          return new Worker(
            new URL("monaco-editor/esm/vs/language/html/html.worker", import.meta.url),
            { type: "module" }
          );
        case "typescript":
        case "javascript":
          return new Worker(
            new URL("monaco-editor/esm/vs/language/typescript/ts.worker", import.meta.url),
            { type: "module" }
          );
        case "rust":
        default:
          return new Worker(
            new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url),
            { type: "module" }
          );
      }
    },
  };
}

export {};
