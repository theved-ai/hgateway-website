"use client";

import SlackActionArea from "./SlackActionArea";
import ThreadPanel from "./ThreadPanel";
import type { SandboxApi } from "../hooks/useHitlSandbox";

const VED_LOGO_SRC = "/sandbox/theved-logo.png";

interface VedDmCardProps {
  api: SandboxApi;
  scope: string;
  forwardedFromName?: string;
}

export default function VedDmCard({ api, scope, forwardedFromName }: VedDmCardProps) {
  const { scenario, resolvedVed, handleVedClick, openImpact, recommend, openForward } = api;
  const isOriginal = scope === "orig";
  const forName = isOriginal ? "Rishabh" : forwardedFromName ?? "Rishabh";

  return (
    <div className="slack-msg">
      <div className="s-avatar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VED_LOGO_SRC} alt="Ved" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
      </div>
      <div className="s-body">
        <div className="s-head">
          <span className="s-name">Ved</span>
          <span className="s-bot-tag">APP</span>
          <span className="s-time">{scenario.time}</span>
        </div>

        {!isOriginal && (
          <div className="s-context-block" style={{ color: "#e0a458" }}>
            ↪ <span>Forwarded from Rishabh&apos;s DM — a separate thread; nothing here is shared back with the original.</span>
          </div>
        )}

        <div className="s-title-row">
          <span className="s-dot" style={{ background: scenario.dotColorVar }} />
          <span className="s-title">{scenario.titleRowText}</span>
        </div>
        <div className="s-meta">
          From: <b>{scenario.agentName}</b> · run <b>{scenario.runId}</b> · For: <b>@{forName}</b> · Type: {scenario.typeLabel}
        </div>
        <div className="s-context-block">
          💭{" "}
          <span>
            <b>CONTEXT</b> &nbsp;<b>Why:</b> {scenario.contextWhy}
          </span>
        </div>
        <hr className="s-divider" />
        <div className="s-tagline">
          # HITL CONTENT · <span className="s-tag">{scenario.tagValue}</span>
        </div>
        <div className="s-prompt">{scenario.promptText}</div>

        <SlackActionArea interaction={scenario.interaction} resolved={resolvedVed} onResolve={(label) => handleVedClick(label, scope)} />

        {!resolvedVed && (
          <>
            <hr className="s-divider" />
            <div className="s-footer-actions">
              <div className="s-footer-btn" onClick={() => openImpact(scope)}>
                🔍 Explain impact
              </div>
              <div className="s-footer-btn" onClick={() => recommend(scope)}>
                💡 Recommend
              </div>
              {isOriginal && (
                <div className="s-footer-btn" onClick={openForward}>
                  ↪ Forward
                </div>
              )}
            </div>
            {isOriginal && (
              <div className="s-autoforward">
                ⏳ Auto-forwards to <span className="s-mention">{scenario.autoForwardChannel}</span> in 1h if no response
              </div>
            )}
          </>
        )}

        <ThreadPanel api={api} scope={scope} />
      </div>
    </div>
  );
}
