"use client";

import type { CSSProperties } from "react";
import CodeAccordion from "./CodeAccordion";
import PainChips from "./PainChips";
import type { CaseMode, Scenario } from "./data";

interface CaseColumnProps {
  mode: CaseMode;
  scenario: Scenario;
  slackHtml: string | null;
  painsShown: boolean;
  flash: boolean;
  resetKey: number;
}

const COPY = {
  existing: {
    stampClass: "stamp-red",
    stampLabel: "Legacy Process",
    caption: (
      <>
        Raw <code className="mono">interrupt()</code>, hand-rolled Slack message, whatever your own code does
        with the reply.
      </>
    ),
    channelLabel: "unmanaged",
    flashColor: "rgba(168,64,42,.35)",
  },
  hgateway: {
    stampClass: "stamp-green",
    stampLabel: "HGateway",
    caption: (
      <>
        One decorator, one typed call — routing, TTL/escalation, and audit trail come from the SDK.
      </>
    ),
    channelLabel: "hgateway-managed",
    flashColor: "rgba(12,143,68,.4)",
  },
};

export default function CaseColumn({ mode, scenario, slackHtml, painsShown, flash, resetKey }: CaseColumnProps) {
  const copy = COPY[mode];

  return (
    <div
      className={`case-col ${mode}${flash ? " flash" : ""}`}
      style={flash ? ({ "--flash-color": copy.flashColor } as CSSProperties) : undefined}
    >
      <div className={`stamp ${copy.stampClass}`}>{copy.stampLabel}</div>
      <div className="col-caption">{copy.caption}</div>

      <CodeAccordion code={scenario.code[mode]} />

      {mode === "hgateway" && (
        <div className="explainer">
          Just wrap your interrupt inside <code>hg.raise_interrupt</code> and add{" "}
          <code>@hg.hitl_node</code> to your node — voilà, a decoupled HITL with native routing,
          TTL/escalation, and audit trail.
        </div>
      )}

      <div className="slack-embed">
        <div className="slack-embed-head">
          <span># Slack — DM</span>
          <span>{copy.channelLabel}</span>
        </div>
        <div className="slack-embed-body">
          {slackHtml ? (
            <div dangerouslySetInnerHTML={{ __html: slackHtml }} />
          ) : (
            <div className="slack-empty">Nothing posted yet.</div>
          )}
        </div>
      </div>

      <div className={`pains-embed${painsShown ? " show" : ""}`}>
        {painsShown && (
          <PainChips
            key={resetKey}
            mode={mode}
            builder={scenario.pains[mode].builder}
            responder={scenario.pains[mode].responder}
          />
        )}
      </div>
    </div>
  );
}
