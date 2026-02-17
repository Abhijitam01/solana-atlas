import { Program, AnchorProvider } from "@coral-xyz/anchor";
import * as chai from "chai";
import "mocha";

// Helper type for test results
export interface TestResult {
  title: string;
  fullTitle: string;
  duration: number;
  currentRetry: number;
  err?: {
    message: string;
    stack?: string;
    expected?: any;
    actual?: any;
  };
}

export interface TestSuiteResult {
  stats: {
    suites: number;
    tests: number;
    passes: number;
    pending: number;
    failures: number;
    start: string;
    end: string;
    duration: number;
  };
  tests: TestResult[];
  failures: TestResult[];
  passes: TestResult[];
}

export class BrowserTestRunner {
  constructor() {
    // Mocha is usually attached to global window in browser environments
    // or we might need to initialize it manually if imported as module
  }

  async run(
    code: string,
    program: Program,
    provider: AnchorProvider
  ): Promise<TestSuiteResult> {
    // 1. Reset Mocha state (if it was used before)
    // In a real browser implementation, we might need to reload or clear the suite
    // For now, let's assume we can create a new runner instance or clear cache
    const mochaDiv = document.getElementById("mocha");
    if (mochaDiv) {
      mochaDiv.innerHTML = "";
    }

    // We need to load Mocha from the window/global scope if it was added via script
    // Or initialize it if we can import it.
    // Since we are in a Next.js app, dynamic import of 'mocha' might be tricky for browser
    // Let's rely on a basic implementation for now or try to use the imported one.

    // A simple shim to make `describe`, `it`, etc. available globally for the eval
    // This is a naive implementation. A robust one uses the real Mocha.
    
    // Let's try to use the real Mocha.
    // If installed via npm, 'mocha' export might assume Node.js
    // We might need 'mocha/mocha.js' for browser.
    
    // Check if mocha is globally available or we need to setup
    if (typeof window !== 'undefined' && !(window as any).mocha) {
        // Fallback: If mocha is not valid, we might need a workaround.
        // For the purpose of this implementation plan, let's assume we can use a light shim
        // or effectively load mocha.
    }
    
    if (typeof window !== 'undefined' && !(window as any).mocha) {
       (window as any).mocha = { setup: () => {}, run: () => {}, suite: { emit: () => {} } }; // Dummy for compilability
       // In reality we need the real library.
       // Let's try importing it dynamically.
       await import("mocha");
    }

    const mocha = (window as any).mocha;
    mocha.setup({ ui: "bdd", reporter: "json" });

    // 2. Prepare Context
    // We expect `describe`, `it`, etc. to be on window now
    
    // 3. Inject globals for the user script
    (window as any).program = program;
    (window as any).provider = provider;
    (window as any).expect = chai.expect;
    (window as any).assert = chai.assert;
    (window as any).anchor = {
        web3: {
             // ... minimal web3 shim if needed, or use solid one
        },
        BN: (window as any).BN // if needed
    };

    // 4. Eval the user code
    // This adds the tests to the mocha suite
    try {
      // Capture unexpected errors during definition
      await new Promise<void>((resolve, reject) => {
         try {
             // We wrap in an async IIFE to allow top-level await if needed (though mocha tests typically use it() callbacks)
             const userScript = new Function(`
                return (async () => {
                   ${code}
                })();
             `);
             userScript().then(resolve).catch(reject);
         } catch (e) {
             reject(e);
         }
      });
    } catch (err: any) {
        return {
            stats: { 
                suites: 0, tests: 0, passes: 0, pending: 0, failures: 1, 
                start: new Date().toISOString(), end: new Date().toISOString(), duration: 0 
            },
            tests: [],
            passes: [],
            failures: [{ 
                title: "Test Definition Error", 
                fullTitle: "Test Definition Error",
                duration: 0, 
                currentRetry: 0, 
                err: { message: err.message || String(err) } 
            }]
        };
    }

    // 5. Run Mocha
    return new Promise((resolve) => {
      const runner = mocha.run();
      const tests: TestResult[] = [];
      const failures: TestResult[] = [];
      const passes: TestResult[] = [];

      runner.on("test end", (test: any) => {
        const result: TestResult = {
            title: test.title,
            fullTitle: test.fullTitle(),
            duration: test.duration,
            currentRetry: test.currentRetry(),
            err: test.err ? { 
                message: test.err.message, 
                stack: test.err.stack,
                expected: test.err.expected,
                actual: test.err.actual
            } : undefined
        };
        tests.push(result);
        if (test.state === 'passed') passes.push(result);
        if (test.state === 'failed') failures.push(result);
      });

      runner.on("end", () => {
        resolve({
            stats: runner.stats,
            tests,
            passes,
            failures
        });
      });
    });
  }
}
