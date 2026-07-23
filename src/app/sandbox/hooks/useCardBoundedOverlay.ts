import { useEffect, useState, type RefObject } from "react";

interface OverlayRect {
  left: number;
  width: number;
  top: number;
  height: number;
}

// Positions a fixed-position overlay so it always centers on whatever part of
// `cardRef` is CURRENTLY on-screen — not the vertical center of the card's
// full (often very tall, once a thread is expanded) scrollable height. Ported
// from the prototype's positionScrimToCard(), recalculated live on scroll/resize.
export function useCardBoundedOverlay(cardRef: RefObject<HTMLElement | null>, active: boolean): OverlayRect | null {
  const [rect, setRect] = useState<OverlayRect | null>(null);

  useEffect(() => {
    if (!active) return;
    const recompute = () => {
      const card = cardRef.current;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const visibleTop = Math.max(r.top, 0);
      const visibleBottom = Math.min(r.bottom, window.innerHeight);
      setRect({ left: r.left, width: r.width, top: visibleTop, height: Math.max(120, visibleBottom - visibleTop) });
    };
    recompute();
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    };
  }, [active, cardRef]);

  return rect;
}
