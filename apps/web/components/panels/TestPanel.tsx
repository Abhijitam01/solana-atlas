"use client";

import { useState, useCallback } from "react";
import { useProgramStore } from "@/stores/programs";
import { BrowserTestRunner } from "@/lib/test-runner";
import { motion } from "framer-motion";
import { Beaker, Play, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useAnchorProgram } from "@/hooks/use-anchor-program";
import { Badge } from "@/components/ui/Badge"; 
import { HelpIcon } from "@/components/ui/HelpIcon";

export function TestPanel() {
  const { activeProgram, updateProgramTestCode, setProgramTestResult } = useProgramStore(
    (state) => ({
      activeProgram: state.activeProgramId ? state.programs[state.activeProgramId] : null,
      updateProgramTestCode: state.updateProgramTestCode,
      setProgramTestResult: state.setProgramTestResult,
    })
  );

  const { program, provider } = useAnchorProgram();

  const [isRunning, setIsRunning] = useState(false);
  const [testRunner] = useState(() => new BrowserTestRunner());

  // Default test code if none exists
  const defaultTestCode = `
describe('${activeProgram?.name || "My Program"}', () => {
  it('Is customized', async () => {
    // Add your test logic here.
    // Use 'program', 'provider', 'expect', 'assert'
    // Example:
    // await program.methods.initialize().rpc();
  });
});
`;

  const handleRunTests = useCallback(async () => {
    if (!activeProgram?.testCode || !program || !provider) return;
    
    setIsRunning(true);
    try {
      const result = await testRunner.run(activeProgram.testCode, program, provider);
      setProgramTestResult(activeProgram.id, result);
    } catch (err) {
      console.error("Test execution failed:", err);
    } finally {
      setIsRunning(false);
    }
  }, [activeProgram, program, provider, testRunner, setProgramTestResult]);

  const stats = activeProgram?.lastTestResult?.stats;

  if (!activeProgram) {
     return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
           No program selected
        </div>
     );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Tests</h2>
          {stats && (
             <div className="flex gap-2 ml-2">
                <Badge variant={stats.failures > 0 ? "destructive" : "success"} size="sm">
                   {stats.passes} passing
                </Badge>
                {stats.failures > 0 && (
                    <Badge variant="destructive" size="sm">
                       {stats.failures} failing
                    </Badge>
                )}
             </div>
          )}
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={handleRunTests}
                disabled={isRunning || !program}
                className={`btn-primary text-xs flex items-center gap-2 ${isRunning || !program ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isRunning ? <Loader2 className="w-3 h-3 animate-spin"/> : <Play className="w-3 h-3" />}
                Run Tests
            </button>
            <HelpIcon content="Write and run Mocha/Chai tests against your devnet program." />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
         {/* Editor Section */}
         <div className="h-1/2 border-b border-border relative">
            <Editor
                height="100%"
                defaultLanguage="typescript"
                theme="vs-dark" // We should use a custom theme ideally
                value={activeProgram.testCode || defaultTestCode}
                onChange={(val) => val !== undefined && updateProgramTestCode(activeProgram.id, val)}
                options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
         </div>

         {/* Results Section */}
         <div className="flex-1 overflow-auto p-4 space-y-2 bg-background">
             {!activeProgram.lastTestResult && (
                 <div className="text-center text-muted-foreground text-sm py-4">
                     Run tests to see results here.
                 </div>
             )}
             
             {activeProgram.lastTestResult?.tests.map((test, i) => (
                 <div key={i} className={`p-2 rounded border flex items-start gap-2 text-sm ${
                     test.err ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"
                 }`}>
                     {test.err ? (
                         <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                     ) : (
                         <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                     )}
                     <div className="flex-1 min-w-0">
                         <div className={`font-medium ${test.err ? "text-red-400" : "text-green-400"}`}>
                             {test.fullTitle}
                         </div>
                         {test.err && (
                             <div className="text-red-300 text-xs mt-1 font-mono break-all whitespace-pre-wrap">
                                 {test.err.message}
                             </div>
                         )}
                     </div>
                     <div className="text-xs text-muted-foreground whitespace-nowrap">
                         {test.duration}ms
                     </div>
                 </div>
             ))}

             {activeProgram.lastTestResult?.failures.some(f => f.title === "Test Definition Error") && (
                 <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                     <div className="font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4"/>
                        Test Definition Error
                     </div>
                     <div className="mt-1 font-mono text-xs">
                        {activeProgram.lastTestResult?.failures.find((f) => f.title === "Test Definition Error")?.err?.message}
                     </div>
                 </div>
             )}
         </div>
      </div>
    </motion.div>
  );
}
