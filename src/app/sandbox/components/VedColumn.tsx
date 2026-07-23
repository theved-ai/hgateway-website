"use client";

import type { CSSProperties } from "react";
import CodeAccordion from "../CodeAccordion";
import PainChips from "../PainChips";
import VedDmCard from "./VedDmCard";
import type { SandboxApi } from "../hooks/useHitlSandbox";

interface VedColumnProps {
  api: SandboxApi;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function VedColumn({ api, cardRef }: VedColumnProps) {
  const { scenario, hgatewayRevealed, flashHgateway, dmTabs, activeDm, switchDm, forwardedTargets, responderNames } = api;
  const activeTarget = forwardedTargets.find((t) => t.scope === activeDm);

  return (
    <div
      ref={cardRef}
      className={`case-col hgateway${flashHgateway ? " flash" : ""}`}
      style={flashHgateway ? ({ "--flash-color": "rgba(12,143,68,.4)" } as CSSProperties) : undefined}
    >
      <div className="stamp stamp-green">HGateway</div>
      <div className="col-caption">
        One decorator, one typed call — routing, TTL/escalation, and audit trail come from the SDK.
      </div>

      <CodeAccordion code={scenario.code.hgateway} />

      <div className="explainer">
        Just wrap your interrupt inside <code>hg.raise_interrupt</code> and add <code>@hg.hitl_node</code> to your node
        — voilà, a decoupled HITL with native routing, TTL/escalation, and audit trail.
      </div>

      {dmTabs.length > 1 && (
        <div className="dm-tabs show">
          {dmTabs.map((tab) => (
            <button key={tab.scope} className={`dm-tab${tab.scope === activeDm ? " active" : ""}`} onClick={() => switchDm(tab.scope)}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="slack-embed">
        <div className="slack-embed-head">
          <span># Slack — DM</span>
          <span>{activeDm === "orig" ? "hgateway-managed" : `forwarded · ${activeTarget?.name.toLowerCase()}`}</span>
        </div>
        <div className="slack-embed-body">
          {hgatewayRevealed ? (
            <VedDmCard api={api} scope={activeDm} forwardedFromName={activeTarget?.name} />
          ) : (
            <div className="slack-empty">Nothing posted yet.</div>
          )}
        </div>
      </div>

      <div className={`pains-embed${hgatewayRevealed ? " show" : ""}`}>
        {hgatewayRevealed && (
          <PainChips
            mode="hgateway"
            builder={scenario.pains.hgateway.builder}
            responder={scenario.pains.hgateway.responder}
            responderLabel={responderNames}
          />
        )}
      </div>
    </div>
  );
}
