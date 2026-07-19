"use client";

import { useEffect, useRef, useState } from "react";

interface PainChipPanelProps {
  who: string;
  avatarLetter: string;
  role: string;
  items: [string, string][];
}

export default function PainChipPanel({ who, avatarLetter, role, items }: PainChipPanelProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [popped, setPopped] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // One-time chip pop-in animation, triggered when this panel scrolls into view.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPopped(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleSelect = (idx: number) => {
    setActiveIdx((prev) => (prev === idx ? null : idx));
  };

  const detailText = activeIdx !== null ? items[activeIdx][1] : null;

  return (
    <div ref={panelRef} className={`pain-panel ${who === "Shubham" ? "builder" : "responder"}`}>
      <div className="panel-label">
        <span className="panel-avatar">{avatarLetter}</span> <span className="who">{who}</span>
        <span className="role">{role}</span>
      </div>
      <div className="chip-row">
        {items.map((pair, i) => (
          <button
            key={i}
            type="button"
            className={`pain-chip${popped ? " pop" : ""}${activeIdx === i ? " active" : ""}`}
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => handleSelect(i)}
          >
            <span className="ic">✕</span>
            {pair[0]}
          </button>
        ))}
      </div>
      <div className={`pain-detail${detailText ? " show" : ""}`}>
        {detailText ? (
          <>
            <span className="detail-arrow" />
            {detailText}
          </>
        ) : null}
      </div>
    </div>
  );
}
