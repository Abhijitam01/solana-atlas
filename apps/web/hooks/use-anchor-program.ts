import { useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { useProgramStore } from "@/stores/programs";
import { PublicKey } from "@solana/web3.js";

export function useAnchorProgram() {
  const { connection } = useConnection(); // Or use from playground store
  const wallet = useWallet();
  const activeProgram = useProgramStore((state) => 
    state.activeProgramId ? state.programs[state.activeProgramId] : null
  );

  const provider = useMemo(() => {
    if (!wallet || !connection) return null;
    
    // Create a read-only wallet if not connected, or use the adapter
    const anchorWallet = {
      publicKey: wallet.publicKey || new PublicKey("11111111111111111111111111111111"),
      signTransaction: wallet.signTransaction || (async (tx) => tx),
      signAllTransactions: wallet.signAllTransactions || (async (txs) => txs),
    };

    return new AnchorProvider(connection, anchorWallet as any, {
      preflightCommitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider || !activeProgram) return null;

    // Use a generic IDL or try to find it from metadata
    // For now, we will use a placeholder IDL or fetch it if available
    // In a real implementation, we would fetch the IDL from the backend or on-chain
    
    // Constructing a dummy IDL for now to allow instantiation
    // The user's test code (which uses `program.methods...`) relies on the IDL structure.
    // If we don't have the specific IDL, this might fail at runtime if not careful.
    // BUT, often tests use `program` mainly for `provider` and `programId`.
    
    const programId = new PublicKey("11111111111111111111111111111111"); // Default/Placeholder
    
    // TODO: Fetch real IDL and Program ID from template metadata
    const idl: Idl = {
        version: "0.1.0",
        name: "basic",
        instructions: [],
        address: programId.toString(), 
        metadata: {
            name: "basic",
            version: "0.1.0",
            spec: "0.1.0"
        }
    } as any;

    return new Program(idl, provider);
  }, [provider, activeProgram]);

  return {
    program,
    provider,
    connection,
    wallet
  };
}
