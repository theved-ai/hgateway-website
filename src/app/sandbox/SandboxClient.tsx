"use client";

import { useEffect, useRef, useState } from "react";
import "./sandbox.css";
import SiteNav from "../_shared/SiteNav";
import CaseColumn from "./CaseColumn";
import { CASE_TABS, SCENARIOS, type CaseType } from "./data";

export default function SandboxClient() {
  const [currentType, setCurrentType] = useState<CaseType>("approval");
  const scenario = SCENARIOS[currentType];

  // Slack content per column: null = "Nothing posted yet."
  const [slackExisting, setSlackExisting] = useState<string | null>(null);
  const [slackHgateway, setSlackHgateway] = useState<string | null>(null);

  const [painsExistingShown, setPainsExistingShown] = useState(false);
  const [painsHgatewayShown, setPainsHgatewayShown] = useState(false);

  const [flashExisting, setFlashExisting] = useState(false);
  const [flashHgateway, setFlashHgateway] = useState(false);

  const [filed, setFiled] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Bumped on every run/case-change; also used as a React `key` on the ink
  // mark and pain chips so remounting the DOM node restarts the CSS
  // animation / resets chip state, standing in for the prototype's
  // `void el.offsetWidth` forced-reflow retrigger trick.
  const [runId, setRunId] = useState(0);
  const [inkActive, setInkActive] = useState(false);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  useEffect(() => clearTimeouts, []);

  const resetCase = () => {
    clearTimeouts();
    setSlackExisting(null);
    setSlackHgateway(null);
    setPainsExistingShown(false);
    setPainsHgatewayShown(false);
    setFlashExisting(false);
    setFlashHgateway(false);
    setFiled(false);
    setPressed(false);
    setInkActive(false);
  };

  const handleSelectCase = (type: CaseType) => {
    setCurrentType(type);
    setRunId((id) => id + 1);
    resetCase();
  };

  const runCase = () => {
    clearTimeouts();
    setPressed(true);
    setInkActive(false);
    setRunId((id) => id + 1); // remount ink-mark to restart the impact animation
    setInkActive(true);

    timeouts.current.push(
      setTimeout(() => setPressed(false), 200)
    );

    setSlackExisting(scenario.slack.existing);
    setPainsExistingShown(true);
    setFlashExisting(true);

    timeouts.current.push(
      setTimeout(() => {
        setSlackHgateway(scenario.slack.hgateway);
        setPainsHgatewayShown(true);
        setFlashHgateway(true);
        setFiled(true);
      }, 260)
    );

    timeouts.current.push(
      setTimeout(() => {
        setFlashExisting(false);
        setFlashHgateway(false);
      }, 1200)
    );
  };

  return (
    <div className="sandbox-page">
      <SiteNav />

      <div className="hero">
        <div className="hero-kicker">Human-in-the-loop, compared</div>
        <h1 className="serif">
          Watch the same HITL,
          <br />
          <em>handled two ways.</em>
        </h1>
        <p>
          Pick a real agent scenario below, hit Run, and watch the same human-in-the-loop request play out two
          ways at once — hand-rolled with a raw <code className="mono">interrupt()</code> on the left, handed to{" "}
          <b>Ved</b>, the HGateway agent, on the right.
        </p>
      </div>

      <div className="case-selector">
        {CASE_TABS.map((tab) => (
          <button
            key={tab.type}
            className={`case-tab${tab.type === currentType ? " active" : ""}`}
            onClick={() => handleSelectCase(tab.type)}
          >
            <span className="ic">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="case-file-strip">
        <div className="case-avatar">{scenario.avatar}</div>
        <div>
          <div className="case-title">{scenario.title}</div>
          <div className="case-desc">{scenario.desc}</div>
        </div>
      </div>

      <div className="run-zone">
        <div className="stamp-rig">
          <div className="stamp-shadow" />
          <button className={`stamp-btn${pressed ? " pressed" : ""}`} onClick={runCase}>
            <span className="stamp-face">
              RUN
              <small>this case</small>
            </span>
          </button>
          <div key={runId} className={`ink-mark${inkActive ? " stamped" : ""}`} />
        </div>
        <div className="run-hint">
          {filed ? (
            <>
              <b>filed</b> both ways — pick another case above to press again
            </>
          ) : (
            <>
              press the stamp to <b>file this HITL</b>
            </>
          )}
        </div>
      </div>

      <div className="case-files">
        <CaseColumn
          mode="existing"
          scenario={scenario}
          slackHtml={slackExisting}
          painsShown={painsExistingShown}
          flash={flashExisting}
          resetKey={runId}
        />

        <div className="case-seam">
          <div className="seam-line" />
          <div className="vs-badge">vs</div>
          <div className="seam-line" />
        </div>

        <CaseColumn
          mode="hgateway"
          scenario={scenario}
          slackHtml={slackHgateway}
          painsShown={painsHgatewayShown}
          flash={flashHgateway}
          resetKey={runId}
        />
      </div>
    </div>
  );
}
