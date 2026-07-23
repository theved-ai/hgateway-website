import { confColor } from "../lib/confColor";
import type { ConfidenceEntry, Scope } from "../hooks/types";
import type { Scenario } from "../data/scenarios";

interface HitlMetaPanelProps {
  scenario: Scenario;
  confidence: Record<Scope, ConfidenceEntry>;
  pulseTick: Record<Scope, number>;
  reasoningTick: Record<Scope, boolean>;
}

function ConfidenceBar({ value, pulseKey }: { value: number; pulseKey?: number }) {
  return (
    <div className="status-bar">
      <div
        key={pulseKey}
        className={`status-fill${pulseKey ? " pulse" : ""}`}
        style={{ width: `${value}%`, background: confColor(value) }}
      />
    </div>
  );
}

export default function HitlMetaPanel({ scenario, confidence, pulseTick, reasoningTick }: HitlMetaPanelProps) {
  // Rishabh ('orig') first, then every forwarded human in the order they were added.
  const orderedScopes = ["orig", ...Object.keys(confidence).filter((s) => s !== "orig")];

  return (
    <div className="hitl-meta" id="hitlMeta">
      <div className="meta-agent">
        <div className="meta-agent-top">
          <div className="case-avatar">{scenario.avatar}</div>
          <div>
            <div className="case-title">{scenario.title}</div>
            <div className="case-desc">{scenario.desc}</div>
          </div>
        </div>
        <div className="agent-live-badge">
          <span className="live-dot" />
          Active — raising HITL
        </div>
      </div>

      <div className="cast-strip">
        <div className="cast-chip">
          <span className="cast-avatar builder">S</span>
          <div>
            <b>Shubham</b>
            <span className="cast-role">Builder — wrote this agent, wired the HITL</span>
          </div>
        </div>
        <div className="cast-chip">
          <span className="cast-avatar responder">R</span>
          <div>
            <b>Rishabh</b>
            <span className="cast-role">Responder — the human who resolves it</span>
          </div>
        </div>
        <div className="cast-scenario">{scenario.scenarioLine}</div>
      </div>

      <div className="status-panel">
        <div className="status-card legacy">
          <div className="status-card-head">
            <span className="status-icon">📁</span>
            Legacy Process <span className="status-sub">— Rishabh&apos;s confidence resolving it</span>
          </div>
          <ConfidenceBar value={50} />
          <div className="status-foot">
            <b>50%</b>
            <span className="status-caption">no context, no impact analysis — never moves off a guess</span>
          </div>
        </div>

        <div className="status-card ved">
          <div className="status-card-head">
            <span className="status-icon">✦</span>
            Ved (HGateway) <span className="status-sub">— confidence per responder, tracked independently</span>
          </div>
          <div className="status-responders">
            {orderedScopes
              .filter((scope) => confidence[scope])
              .map((scope) => {
                const entry = confidence[scope];
                return (
                  <div className="status-resp-row" key={scope}>
                    <div className="status-resp-top">
                      <span className="status-resp-name">{entry.name}</span>
                      <span className={`reasoning-tick${reasoningTick[scope] ? " show" : ""}`}>
                        {reasoningTick[scope] ? "✓ Reasoning captured" : ""}
                      </span>
                    </div>
                    <ConfidenceBar value={entry.value} pulseKey={pulseTick[scope] ?? 0} />
                    <b key={`v-${pulseTick[scope] ?? 0}`} className={pulseTick[scope] ? "pulse" : undefined}>
                      {entry.value}%
                    </b>
                    {!!pulseTick[scope] && (
                      <span key={`arrow-${pulseTick[scope]}`} className="conf-rise-arrow show">
                        ▲
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
