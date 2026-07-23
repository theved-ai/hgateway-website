"use client";

import { useState } from "react";
import type { SandboxApi } from "../hooks/useHitlSandbox";
import ReasonCard from "./ReasonCard";
import { ImpactThreadMessage, RecCard, VedMessage } from "./ThreadPieces";

interface ThreadPanelProps {
  api: SandboxApi;
  scope: string;
}

export default function ThreadPanel({ api, scope }: ThreadPanelProps) {
  const {
    threads,
    threadOpen,
    replyCounts,
    toggleThread,
    askQuestion,
    reasonCards,
    confirmReason,
    openAdjustReasoning,
    recCards,
    applyRecommendation,
    impactCards,
    askAboutImpact,
    resolvedVed,
  } = api;
  const [draft, setDraft] = useState("");
  const entries = threads[scope] ?? [];
  const open = !!threadOpen[scope];
  const count = replyCounts[scope] ?? 0;

  const submit = () => {
    if (!draft.trim()) return;
    askQuestion(scope, draft);
    setDraft("");
  };

  return (
    <>
      <div className="s-thread s-thread-link" onClick={() => toggleThread(scope)}>
        💬{" "}
        <span className="s-thread-count">
          {count === 0 ? "View thread" : `${count} ${count === 1 ? "reply" : "replies"}`}
        </span>
      </div>
      <div className={`v-thread${open ? " open" : ""}`}>
        <div className="v-thread-messages">
          {entries.map((entry) => {
            if (entry.kind === "reason") {
              const data = reasonCards[entry.reasonId];
              if (!data) return null;
              return (
                <div className="tmsg-wrap" key={entry.id}>
                  <ReasonCard reasonId={entry.reasonId} data={data} onConfirm={confirmReason} onAdjust={openAdjustReasoning} />
                </div>
              );
            }
            if (entry.kind === "recommend") {
              const data = recCards[entry.recId];
              if (!data) return null;
              return (
                <div className="tmsg-wrap" key={entry.id}>
                  <VedMessage time={data.time}>
                    <RecCard
                      recommend={data.recommend}
                      confidence={data.confidence}
                      onApply={() => applyRecommendation(scope)}
                      resolved={resolvedVed}
                    />
                  </VedMessage>
                </div>
              );
            }
            if (entry.kind === "impact") {
              const data = impactCards[entry.impactId];
              if (!data) return null;
              return (
                <div className="tmsg-wrap" key={entry.id}>
                  <VedMessage time={data.time}>
                    <ImpactThreadMessage groups={data.groups} onAskAbout={(gi) => askAboutImpact(gi, scope)} />
                  </VedMessage>
                </div>
              );
            }
            return (
              <div className="tmsg-wrap" key={entry.id}>
                {entry.node}
              </div>
            );
          })}
        </div>
        <div className="v-thread-composer">
          <input
            type="text"
            placeholder="Ask Ved anything about this request…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <button onClick={submit}>Send</button>
        </div>
      </div>
    </>
  );
}
