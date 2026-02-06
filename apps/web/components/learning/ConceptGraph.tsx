"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface Concept {
  id: string;
  name: string;
  description: string;
  category: "solana" | "rust" | "anchor" | "general";
  mastered: boolean;
  relatedConcepts: string[];
  templates: string[];
}

export interface ConceptNode {
  id: string;
  concept: Concept;
  x: number;
  y: number;
}

interface ConceptGraphProps {
  concepts: Concept[];
  selectedConceptId?: string;
  onConceptClick?: (concept: Concept) => void;
}

export function ConceptGraph({
  concepts,
  selectedConceptId,
  onConceptClick,
}: ConceptGraphProps) {
  const nodes = useMemo(() => {
    // Simple circular layout
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    const angleStep = (2 * Math.PI) / concepts.length;

    return concepts.map((concept, index) => {
      const angle = index * angleStep;
      return {
        id: concept.id,
        concept,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [concepts]);

  const getCategoryColor = (category: Concept["category"]) => {
    switch (category) {
      case "solana":
        return "bg-primary text-primary-foreground";
      case "rust":
        return "bg-warning text-warning-foreground";
      case "anchor":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div className="relative w-full h-full overflow-auto bg-muted/20 p-8">
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw edges between related concepts */}
        {concepts.map((concept) => {
          return concept.relatedConcepts.map((relatedId) => {
            const fromNode = nodes.find((n) => n.id === concept.id);
            const toNode = nodes.find((n) => n.id === relatedId);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={`${concept.id}-${relatedId}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity={0.3}
              />
            );
          });
        })}
      </svg>

      {/* Render concept nodes */}
      {nodes.map((node) => {
        const isSelected = selectedConceptId === node.id;
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: nodes.indexOf(node) * 0.1 }}
            onClick={() => onConceptClick?.(node.concept)}
            className={`absolute cursor-pointer transition-all duration-fast ${
              isSelected
                ? "ring-2 ring-primary ring-offset-2 scale-110"
                : "hover:scale-105"
            }`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`p-3 rounded-lg border-2 shadow-lg ${getCategoryColor(
                node.concept.category
              )} ${isSelected ? "border-primary" : "border-transparent"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {node.concept.name}
                </span>
                {node.concept.mastered && (
                  <Badge variant="success" size="sm">Mastered</Badge>
                )}
              </div>
              <div className="text-xs opacity-90 max-w-[150px] truncate">
                {node.concept.description}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

