import { redirect } from "next/navigation";

export default function PlaygroundRoot() {
  // Default playground entry should always open the hello-solana template
  redirect("/playground/hello-solana");
}
