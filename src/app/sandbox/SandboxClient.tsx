"use client";

import { useRef } from "react";
import "./sandbox.css";
import SiteNav from "../_shared/SiteNav";
import JourneyBanner from "./components/JourneyBanner";
import CaseSelectorRow from "./components/CaseSelectorRow";
import HitlMetaPanel from "./components/HitlMetaPanel";
import HitlCard from "./components/HitlCard";
import HitlModal from "./components/HitlModal";
import { useHitlSandbox } from "./hooks/useHitlSandbox";

export default function SandboxClient() {
  const api = useHitlSandbox();
  const vedCardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sandbox-page">
      <SiteNav />

      <div className="hero">
        <div className="hero-kicker">Acme Corp — going agentic</div>
        <h1 className="serif">
          Four workflows in.
          <br />
          <em>Same HITL problem, every time.</em>
        </h1>
        <p>
          Acme picked 4 recurring internal ops and is automating them one at a time. Every agent hits the same wall: a
          human has to weigh in mid-run. Pick a workflow below, hit Run, and watch that moment play out two ways at
          once — hand-rolled with a raw <code className="mono">interrupt()</code> on the left, handed to <b>Ved</b> on
          the right.
        </p>
      </div>

      <JourneyBanner api={api} />
      <CaseSelectorRow api={api} />

      <div className="page-shell">
        <aside className={`page-side${api.hasRun ? "" : " hidden"}`}>
          <HitlMetaPanel
            scenario={api.scenario}
            confidence={api.confidence}
            pulseTick={api.pulseTick}
            reasoningTick={api.reasoningTick}
          />
        </aside>

        <div className="page-main">
          <HitlCard api={api} hidden={!api.hasRun} vedCardRef={vedCardRef} />
        </div>
      </div>

      <HitlModal api={api} cardRef={vedCardRef} />
    </div>
  );
}
