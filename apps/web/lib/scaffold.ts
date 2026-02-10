export function scaffoldProgram(code: string): string {
  const lines = code.split("\n");
  const outputLines: string[] = [];
  
  let insideFunction = false;
  let braceCount = 0;
  let functionIndent = "";
  let pendingFunctionSignature = false;

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
      // If still inside function, we skip the line (it's the body we are removing)
    } else {
      if (pendingFunctionSignature) {
        outputLines.push(line);
        if (line.includes("{")) {
          pendingFunctionSignature = false;
          const openBraces = (line.match(/{/g) || []).length;
          const closeBraces = (line.match(/}/g) || []).length;
          braceCount = openBraces - closeBraces;
          if (braceCount > 0) {
            insideFunction = true;
          }
        }
      } else if (trimmed.startsWith("pub fn ") && !trimmed.includes("pub mod")) {
        const match = line.match(/^(\s*)pub fn/);
        functionIndent = match ? match[1] || "" : "";
        outputLines.push(line);

        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        const currentBraceCount = openBraces - closeBraces;

        if (line.includes("{")) {
          if (currentBraceCount > 0) {
            insideFunction = true;
            braceCount = currentBraceCount;
          }
        } else {
          pendingFunctionSignature = true;
        }
      } else {
        outputLines.push(line);
      }
    }
  }

  return outputLines.join("\n");
}
