import { useQuery } from "@tanstack/react-query";

const normalizeApiUrl = (raw: string) => {
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/templates") ? trimmed.slice(0, -"/templates".length) : trimmed;
};

const API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
);

export interface TemplateListItem {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate";
}

export function useTemplates() {
  return useQuery<TemplateListItem[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/templates`);
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/templates/${id}`);
      if (!res.ok) throw new Error("Failed to fetch template");
      return res.json();
    },
    enabled: !!id,
  });
}
