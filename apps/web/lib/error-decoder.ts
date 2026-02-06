export type DecodedExecutionError = {
  title: string;
  summary: string;
  fixes: string[];
  raw?: string;
};

const COMMON_FIXES = {
  airdrop: "Request an airdrop for the payer wallet before retrying.",
  checkAccounts: "Verify the expected accounts are initialized and passed in.",
  checkSigner: "Ensure the required signer is included and has authority.",
  checkPdaSeeds: "Re-derive the PDA with the exact same seeds and bump.",
  resetValidator: "Reset the local validator or run in a clean workspace.",
};

export function decodeExecutionError(raw?: string | null): DecodedExecutionError | null {
  if (!raw) return null;
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (lower.includes("insufficient funds") || lower.includes("insufficient lamports")) {
    return {
      title: "Insufficient Funds",
      summary: "The payer does not have enough lamports to cover the transaction.",
      fixes: [COMMON_FIXES.airdrop],
      raw: text,
    };
  }

  if (lower.includes("signature verification failed") || lower.includes("signature failed")) {
    return {
      title: "Signature Verification Failed",
      summary: "The transaction is missing a required signature or used the wrong signer.",
      fixes: [COMMON_FIXES.checkSigner, COMMON_FIXES.checkAccounts],
      raw: text,
    };
  }

  if (lower.includes("account not initialized") || lower.includes("uninitialized account")) {
    return {
      title: "Account Not Initialized",
      summary: "One of the expected accounts has not been created yet.",
      fixes: [COMMON_FIXES.checkAccounts, COMMON_FIXES.resetValidator],
      raw: text,
    };
  }

  if (lower.includes("custom program error")) {
    return {
      title: "Program Error",
      summary:
        "The program returned a custom error. Inspect logs and ensure the instruction preconditions are met.",
      fixes: [COMMON_FIXES.checkAccounts, COMMON_FIXES.checkSigner],
      raw: text,
    };
  }

  const anchorMatch =
    /Error Code:\s*([^\.\n]+)\.\s*Error Number:\s*([0-9]+)\.\s*Error Message:\s*([^\n]+)/i.exec(
      text
    );
  if (anchorMatch) {
    const [, code, number] = anchorMatch;
    const message = anchorMatch[3] ?? "Anchor error";
    return {
      title: `Anchor Error: ${code} (${number})`,
      summary: message.trim(),
      fixes: [COMMON_FIXES.checkAccounts, COMMON_FIXES.checkSigner, COMMON_FIXES.checkPdaSeeds],
      raw: text,
    };
  }

  return {
    title: "Execution Failed",
    summary: "The transaction failed. Review logs and retry after fixing the inputs.",
    fixes: [COMMON_FIXES.checkAccounts, COMMON_FIXES.checkSigner],
    raw: text,
  };
}
