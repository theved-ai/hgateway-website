"use client";

import type { CSSProperties } from "react";
import CodeAccordion from "../CodeAccordion";
import PainChips from "../PainChips";
import SlackActionArea from "./SlackActionArea";
import type { SandboxApi } from "../hooks/useHitlSandbox";

interface LegacyColumnProps {
  api: SandboxApi;
}

export default function LegacyColumn({ api }: LegacyColumnProps) {
  const { scenario, existingRevealed, flashExisting, resolvedLegacy, legacyResolution, resolveLegacyAction, simulateStale } = api;

  return (
    <div
      className={`case-col existing${flashExisting ? " flash" : ""}`}
      style={flashExisting ? ({ "--flash-color": "rgba(168,64,42,.35)" } as CSSProperties) : undefined}
    >
      <div className="stamp stamp-red">Legacy Process</div>
      <div className="col-caption">
        Raw <code className="mono">interrupt()</code>, hand-rolled Slack message, whatever your own code does with the
        reply.
      </div>

      <CodeAccordion code={scenario.code.existing} />

      <div className="slack-embed">
        <div className="slack-embed-head">
          <span># Slack — DM</span>
          <span>unmanaged</span>
        </div>
        <div className="slack-embed-body">
          {existingRevealed ? (
            <div className="slack-msg">
              <div className="s-avatar">{scenario.avatar}</div>
              <div className="s-body">
                <div className="s-head">
                  <span className="s-name">{scenario.agentName}</span>
                  <span className="s-time">{scenario.time}</span>
                </div>
                <div className="s-prompt">{scenario.promptText}</div>
                <SlackActionArea interaction={scenario.interaction} resolved={resolvedLegacy} onResolve={resolveLegacyAction} />
                {!resolvedLegacy && (
                  <div className="legacy-actions-row">
                    <button className="legacy-stale-btn" onClick={simulateStale}>
                      ⏱ Simulate: leave this stale
                    </button>
                  </div>
                )}
                {legacyResolution && legacyResolution.stale && (
                  <div className="legacy-resolved stale">
                    😶 <b>Still unresolved.</b> With only 50% confidence and no context to act on, Rishabh didn&apos;t
                    trust either button enough to click — so this HITL just sits. No auto-forward, no escalation, no
                    default.
                  </div>
                )}
                {legacyResolution && !legacyResolution.stale && (
                  <div className="legacy-resolved">
                    <b>{legacyResolution.label}</b> — Rishabh responded with <b>50% confidence</b>: he just went with
                    whatever choice felt most right. No impact analysis, no recommendation, no way to ask a question —
                    this was resolved on guesswork, not certainty.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="slack-empty">Nothing posted yet.</div>
          )}
        </div>
      </div>

      <div className={`pains-embed${existingRevealed ? " show" : ""}`}>
        {existingRevealed && (
          <PainChips mode="existing" builder={scenario.pains.existing.builder} responder={scenario.pains.existing.responder} />
        )}
      </div>
    </div>
  );
}
