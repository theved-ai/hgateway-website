import LegacyColumn from "./LegacyColumn";
import VedColumn from "./VedColumn";
import type { SandboxApi } from "../hooks/useHitlSandbox";

interface HitlCardProps {
  api: SandboxApi;
  hidden: boolean;
  vedCardRef: React.RefObject<HTMLDivElement | null>;
}

export default function HitlCard({ api, hidden, vedCardRef }: HitlCardProps) {
  return (
    <div className={`hitl-card${hidden ? " hidden" : ""}`}>
      <div className="hitl-card-label">HITL raised — two ways to resolve it</div>
      <div className="case-files">
        <LegacyColumn api={api} />
        <div className="case-seam">
          <div className="seam-line" />
          <div className="vs-badge">vs</div>
          <div className="seam-line" />
        </div>
        <VedColumn api={api} cardRef={vedCardRef} />
      </div>
    </div>
  );
}
