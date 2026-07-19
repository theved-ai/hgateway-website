"use client";

import { useState } from "react";
import type { CaseMode, Persona } from "./data";

interface PainChipsProps {
  mode: CaseMode;
  builder: [string, string][];
  responder: [string, string][];
}

function ChipRow({
  mode,
  persona,
  items,
  activePersona,
  activeIdx,
  onSelect,
}: {
  mode: CaseMode;
  persona: Persona;
  items: [string, string][];
  activePersona: Persona | null;
  activeIdx: number | null;
  onSelect: (persona: Persona, idx: number) => void;
}) {
  const ic = mode === "hgateway" ? "✓" : "✕";
  return (
    <div className="chip-row">
      {items.map((pair, i) => {
        const isActive = activePersona === persona && activeIdx === i;
        return (
          <button
            key={i}
            type="button"
            className={`pain-chip${isActive ? " active" : ""}`}
            style={{ animationDelay: `${i * 65}ms` }}
            onClick={() => onSelect(persona, i)}
          >
            <span className="ic">{ic}</span>
            {pair[0]}
          </button>
        );
      })}
    </div>
  );
}

export default function PainChips({ mode, builder, responder }: PainChipsProps) {
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleSelect = (persona: Persona, idx: number) => {
    const wasActive = activePersona === persona && activeIdx === idx;
    if (wasActive) {
      setActivePersona(null);
      setActiveIdx(null);
      return;
    }
    setActivePersona(persona);
    setActiveIdx(idx);
  };

  const detailText =
    activePersona !== null && activeIdx !== null
      ? (activePersona === "builder" ? builder : responder)[activeIdx][1]
      : null;

  return (
    <>
      <div className="pain-block">
        <div className="pain-block-title">
          <span className="persona-avatar">S</span> Shubham <span className="role">builder</span>
        </div>
        <ChipRow
          mode={mode}
          persona="builder"
          items={builder}
          activePersona={activePersona}
          activeIdx={activeIdx}
          onSelect={handleSelect}
        />
      </div>
      <div className="pain-block">
        <div className="pain-block-title">
          <span className="persona-avatar">R</span> Rishabh <span className="role">responder</span>
        </div>
        <ChipRow
          mode={mode}
          persona="responder"
          items={responder}
          activePersona={activePersona}
          activeIdx={activeIdx}
          onSelect={handleSelect}
        />
      </div>
      <div className={`pain-detail${detailText ? " show" : ""}`}>
        {detailText ? (
          <>
            <span className="detail-arrow" />
            {detailText}
          </>
        ) : null}
      </div>
    </>
  );
}
