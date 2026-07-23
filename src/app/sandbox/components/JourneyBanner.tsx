import { JOURNEY_ORDER } from "../data/scenarios";
import type { SandboxApi } from "../hooks/useHitlSandbox";

interface JourneyBannerProps {
  api: SandboxApi;
}

export default function JourneyBanner({ api }: JourneyBannerProps) {
  const { scenario, journeyIndex, journeyName } = api;

  return (
    <div className="journey">
      <div className="journey-card">
        <div className="journey-badge">{scenario.avatar}</div>
        <div className="journey-copy">
          <div>
            Workflow <b>{journeyIndex + 1} of {JOURNEY_ORDER.length}</b> — <b>{journeyName}</b> is live and already
            raising HITLs in production.
          </div>
          <div className="journey-progress">
            {JOURNEY_ORDER.map((type, i) => (
              <div key={type} className={`journey-dot${i < journeyIndex ? " done" : ""}${i === journeyIndex ? " active" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
