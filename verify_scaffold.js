
const fs = require('fs');
const path = require('path');

// Read the scaffold.ts file content since we can't easily import it without setup
// We will extract the function body and run it.
const scaffoldPath = path.join(process.cwd(), 'apps/web/lib/scaffold.ts');
const scaffoldContent = fs.readFileSync(scaffoldPath, 'utf8');

// Quick and dirty extraction of the function
// Remove "export " and annotations if possible, or just eval it
// Actually, let's just copy the logic here for verification as a standalone script
// or use ts-node if possible. simpler to just copy the function logic to verifying correctness of the algorithm.

function scaffoldProgram(code) {
  const lines = code.split("\n");
  const outputLines = [];
  
  let insideFunction = false;
  let braceCount = 0;
  let functionIndent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (typeof line !== "string") continue;
    
    const trimmed = line.trim();

    if (insideFunction) {
      // Count braces in this line
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;

      if (braceCount <= 0) {
        // Function ended
        outputLines.push(`${functionIndent}    // TODO: Implement this logic`);
        outputLines.push(`${functionIndent}    Ok(())`);
        outputLines.push(`${functionIndent}}`); // Closing brace
        insideFunction = false;
        braceCount = 0;
      }
      // If still inside function, we skip the line
    } else {
      // Check for start of a public function
      if (trimmed.startsWith("pub fn ") && line.includes("{") && !trimmed.includes("pub mod")) {
        const match = line.match(/^(\s*)pub fn/);
        functionIndent = match ? match[1] : "";
        
        outputLines.push(line);

        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        const currentBraceCount = openBraces - closeBraces;

        if (currentBraceCount > 0) {
          insideFunction = true;
          braceCount = currentBraceCount;
        }
      } else {
        outputLines.push(line);
      }
    }
  }

  return outputLines.join("\n");
}

const inputCode = `use anchor_lang::prelude::*;

#[program]
pub mod hello_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let account = &mut ctx.accounts.my_account;
        account.data = 10;
        msg!("Initialized!");
        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        msg!("Updating data to {}", data);
        if data > 100 {
            return err!(MyError::DataTooLarge);
        }
        Ok(())
    }
}

pub fn external_func() {
  println!("External");
}
`;

console.log("--- Input Code ---");
console.log(inputCode);
console.log("\n--- Scaffolded Output ---");
const output = scaffoldProgram(inputCode);
console.log(output);

// Validation
if (output.includes("account.data = 10;")) {
    console.error("FAIL: Logic was not removed.");
    process.exit(1);
}
if (!output.includes("// TODO: Implement this logic")) {
    console.error("FAIL: TODO comment not added.");
    process.exit(1);
}
if (!output.includes("Ok(())")) {
    console.error("FAIL: Ok(()) not added.");
    process.exit(1);
}
if (output.includes("msg!(\"Updating data")) {
    console.error("FAIL: Update logic not removed.");
    process.exit(1);
}

console.log("\nPASS: Verification successful.");
