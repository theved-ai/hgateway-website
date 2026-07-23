// Presentational building blocks for inline thread messages. The hook that
// owns sandbox state builds these into ReactNode thread entries at the moment
// each interaction happens (mirrors the prototype's addThread(html) calls).

import type { ReactNode } from "react";

const VED_LOGO_SRC = "/sandbox/theved-logo.png";

export function VedAvatar() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={VED_LOGO_SRC} alt="Ved" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
}

export function YouAvatar() {
  return (
    <div className="t-avatar" style={{ background: "#3a3f63" }}>
      R
    </div>
  );
}

export function VedMessage({ time, children }: { time: string; children: ReactNode }) {
  return (
    <div className="tmsg">
      <div className="t-avatar">
        <VedAvatar />
      </div>
      <div className="t-body">
        <div className="t-head">
          <span className="t-name">Ved</span>
          <span className="t-time">{time}</span>
        </div>
        <div className="t-text">{children}</div>
      </div>
    </div>
  );
}

export function YouMessage({ name, time, children }: { name: string; time: string; children: ReactNode }) {
  return (
    <div className="tmsg">
      <div className="t-avatar">
        <YouAvatar />
      </div>
      <div className="t-body">
        <div className="t-head">
          <span className="t-name">{name}</span>
          <span className="t-time">{time}</span>
        </div>
        <div className="t-text">{children}</div>
      </div>
    </div>
  );
}

export function ResLine({ children }: { children: ReactNode }) {
  return <div className="res-line">{children}</div>;
}

export function ResChoice({ name, label }: { name: string; label: string }) {
  return (
    <div className="res-choice">
      <span className="mention">@{name}</span> {label}
    </div>
  );
}

export function ResLockNote({ name, confidence }: { name: string; confidence: number }) {
  return (
    <div className="res-lock-note">
      Recorded <span className="mention">@{name}</span>&apos;s response and <b>resumed the agent</b> — resolved with{" "}
      <b>{confidence}%</b> confidence, built up as {name} used Explain impact, Recommend, and Forward. This request is
      now closed to other responders.
    </div>
  );
}

export function ReconfirmLine({ name, label }: { name: string; label: string }) {
  return (
    <div className="res-line">
      <span className="lock">🔒</span>
      <span className="mention">@{name}</span> reconfirmed the irreversible action <b>{label}</b>.
    </div>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return <div className="quote">{children}</div>;
}

export function FwdHighlight({ children }: { children: ReactNode }) {
  return <div className="fwd-highlight">{children}</div>;
}

export function FwdCrossNote({ name, whereText }: { name: string; whereText: string }) {
  return (
    <div className="fwd-cross-note">
      Resolved by <b>@{name}</b> in {whereText} — this DM is now closed too, nothing further can happen here.
    </div>
  );
}

export function SnapshotDivider({ name }: { name: string }) {
  return <div className="thread-snapshot-divider">forwarded here — replies below are only visible in {name}&apos;s DM</div>;
}

export function ImpactThreadBlock({
  heading,
  items,
  onAskAbout,
}: {
  heading: string;
  items: string[];
  onAskAbout: () => void;
}) {
  return (
    <div className="impact-block">
      <b>{heading}</b>
      <br />
      {items.map((it, i) => (
        <span key={i}>
          • {it}
          <br />
        </span>
      ))}
      <button className="ask-about" onClick={onAskAbout}>
        💬 Ask about this
      </button>
    </div>
  );
}

export function ImpactThreadMessage({
  groups,
  onAskAbout,
}: {
  groups: { heading: string; items: string[] }[];
  onAskAbout: (groupIndex: number) => void;
}) {
  return (
    <>
      Impact of each choice:
      {groups.map((g, gi) => (
        <ImpactThreadBlock key={gi} heading={g.heading} items={g.items} onAskAbout={() => onAskAbout(gi)} />
      ))}
      <div className="tlog-added">⚠ Inferred from the agent&apos;s trajectory + records — verify before acting.</div>
    </>
  );
}

export function RecCard({
  recommend,
  confidence,
  onApply,
  resolved,
}: {
  recommend: string;
  confidence: string;
  onApply: () => void;
  resolved?: boolean;
}) {
  return (
    <>
      <div className="reccard">
        <div className="rl">💡 Recommendation</div>
        {recommend}
        <div className="conf">
          <span className="conf-dot" />
          Confidence: {confidence}
        </div>
        <button className="btn-apply" onClick={onApply} disabled={resolved}>
          ✅ Apply recommendation
        </button>
      </div>
      <div className="tlog-added">Added by Ved</div>
    </>
  );
}
