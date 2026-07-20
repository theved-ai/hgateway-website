"use client";

import { useEffect, useRef, useState } from "react";
import "./landing.css";
import SiteNav from "../_shared/SiteNav";
import { DOCS_URL, DASHBOARD_URL } from "../_shared/externalLinks";
import MiniCodePanel from "./MiniCodePanel";
import InviteModal from "./InviteModal";
import { INTEGRATION_DIFF_HTML } from "./data";

// Generic scroll-reveal: observes every element registered via `register`
// (keyed by a stable string id, not the DOM node itself, so membership can
// be read during render without touching ref.current) and marks each key
// "in" once its element enters the viewport — mirroring the prototype's
// single shared IntersectionObserver over `.reveal` elements.
function useScrollReveal() {
  const [inKeys, setInKeys] = useState<Set<string>>(new Set());
  const elements = useRef<Map<string, HTMLElement>>(new Map());

  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) elements.current.set(key, el);
  };

  useEffect(() => {
    const keyByElement = new Map<HTMLElement, string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = keyByElement.get(entry.target as HTMLElement);
            if (key) {
              setInKeys((prev) => new Set(prev).add(key));
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.current.forEach((el, key) => {
      keyByElement.set(el, key);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const isIn = (key: string) => inKeys.has(key);

  return { register, isIn };
}

export default function LandingPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { register, isIn } = useScrollReveal();

  return (
    <div className="landing-page">
      <SiteNav />

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-kicker">
            <span className="dot" /> ARM for Agents
          </div>
          <h1 className="serif">
            Ved makes your agent <span className="rq-arrow">↔</span> human
            <br />
            interaction, <em>Agentic.</em>
          </h1>
          <p className="lede">
            Ved is an HGateway (HITL gateway) agent — it owns and resolves every HITL your agents raise. Register the
            interrupt, hand it to Ved, and your agent goes back to doing the one thing it&apos;s actually coded for:{" "}
            <b>its business logic</b>, not babysitting a raised HITL through to resolution.
          </p>

          <div className="hero-ctas">
            <button
              type="button"
              className="btn btn-highlight invite-trigger"
              onClick={() => setIsInviteOpen(true)}
            >
              <span className="shine" />
              Request invite<span className="seal">✓</span>
            </button>
            <a className="btn btn-ghost" href="#axiom">
              See the argument ↓
            </a>
          </div>

          <div className="lifecycle-block">
            <div className="lifecycle-example">
              A HITL like <span className="lx-quote">&quot;approve this $10k refund&quot;</span> has its own
              lifecycle.
            </div>
            <div className="lifecycle-track">
              <div className="lc-flow-dot" />
              <div className="lc-step owned">
                <div className="lc-connector" />
                <div className="lc-num">1</div>
                <div className="lc-label">Raised</div>
                <div className="lc-sub">the agent flags: &quot;refund is $10k, over my limit&quot;</div>
              </div>
              <div className="lc-step owned">
                <div className="lc-connector" />
                <div className="lc-num">2</div>
                <div className="lc-label">Delivered</div>
                <div className="lc-sub">the finance approver on call gets it, with context</div>
              </div>
              <div className="lc-step owned">
                <div className="lc-connector" />
                <div className="lc-num">3</div>
                <div className="lc-label">Interaction</div>
                <div className="lc-sub">approver asks for the refund history before deciding</div>
              </div>
              <div className="lc-step owned">
                <div className="lc-connector" />
                <div className="lc-num">4</div>
                <div className="lc-label">Resolved</div>
                <div className="lc-sub">approver signs off — refund approved</div>
              </div>
              <div className="lc-step owned">
                <div className="lc-num">5</div>
                <div className="lc-label">Resumed</div>
                <div className="lc-sub">agent processes the refund, decision in hand</div>
              </div>
            </div>
            <div className="lifecycle-branch-row">
              <div className="lifecycle-branch-connector" />
              <div className="lifecycle-branch">
                <div className="lb-num">6</div>
                <div className="lb-text">
                  <b>Post-Resolution</b> — runs in parallel, independent of the main flow: the responder shares the
                  reasoning behind its response, feeding Ved&apos;s reasoning-capture stack and sharpening every
                  future HITL.
                </div>
              </div>
            </div>
            <div className="lifecycle-owner">
              <span className="led on" /> Ved owns this lifecycle end to end —{" "}
              <b>your agent just resumes with its resolution.</b>
            </div>
          </div>
        </div>
      </section>

      <section ref={register("problems")} className={`problems wrap reveal${isIn("problems") ? " in" : ""}`}>
        <div className="sec-head">
          <div className="sec-kicker">The problem today</div>
          <h2>
            Every HITL runs into <em>the same six walls.</em>
          </h2>
          <p className="problems-intro">None of this shows up in a demo. It shows up the first time a real one goes wrong.</p>
        </div>
        <div className="problem-list">
          <div className="problem-item">
            <span className="pi-ic">✕</span>
            <div>
              <h4>No interactive UX</h4>
              <p>
                The responder isn&apos;t given anything to work with — just a prompt and two buttons. They guess, or
                pick whatever feels most right, never sure it&apos;s actually right.
              </p>
            </div>
          </div>
          <div className="problem-item">
            <span className="pi-ic">✕</span>
            <div>
              <h4>No staleness handling</h4>
              <p>
                Nobody&apos;s watching what happens if the responder doesn&apos;t answer. The HITL just waits —
                indefinitely, if it has to.
              </p>
            </div>
          </div>
          <div className="problem-item">
            <span className="pi-ic">✕</span>
            <div>
              <h4>No on-the-fly re-routing</h4>
              <p>Wrong person got the ask? Re-routing to someone else means a code change and a deployment, not a click.</p>
            </div>
          </div>
          <div className="problem-item">
            <span className="pi-ic">✕</span>
            <div>
              <h4>No reasoning capture</h4>
              <p>
                Even when a human explains why they decided something, there&apos;s nowhere for that reasoning to
                live. It&apos;s gone once the thread goes quiet.
              </p>
            </div>
          </div>
          <div className="problem-item">
            <span className="pi-ic">✕</span>
            <div>
              <h4>No learning from history</h4>
              <p>
                Every HITL is treated like the first time it&apos;s ever happened. Nothing gets quieter or smarter
                over time — it&apos;s just noise, every time.
              </p>
            </div>
          </div>
          <div className="problem-item">
            <span className="pi-ic">✕</span>
            <div>
              <h4>No governance controls</h4>
              <p>
                You can&apos;t apply a rule to a specific HITL type, or to a whole team of agents. There&apos;s no
                lever to pull, only code to ship.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={register("axiom")} className={`axiom wrap reveal${isIn("axiom") ? " in" : ""}`} id="axiom">
        <div className="axiom-plaque">
          <div className="axiom-tag">
            <span className="led on" /> The permanent constraint
          </div>
          <h2 className="serif">
            No matter how mature agentic automation gets, <em>a human gate stays in place</em> — to govern its work,
            to surveil its decisions, to intervene when it matters.
          </h2>
          <p>
            That&apos;s not a gap left to close as agents get smarter. <b>It&apos;s a constraint to design for.</b>{" "}
            Ved doesn&apos;t remove that gate — it owns how it&apos;s executed, so the question stops being
            &quot;how do we remove the human&quot; and becomes &quot;who&apos;s actually running this checkpoint.&quot;
          </p>
        </div>
      </section>

      <section
        ref={register("architecture")}
        className={`architecture wrap reveal${isIn("architecture") ? " in" : ""}`}
      >
        <div className="sec-head">
          <div className="sec-kicker">How the gate is executed today</div>
          <h2>
            Welded into the agent. <em>That&apos;s the whole problem.</em>
          </h2>
          <p>
            Today&apos;s gate is a raw <code className="mono">interrupt()</code> and a one-off, hand-written message,
            coded once inside a single agent. It works — until it needs an on-the-fly change, has to survive a stale
            response, or needs to be more than a dead-end prompt with no way to interact back.
          </p>
        </div>

        <div className="arch-grid">
          <div className="arch-panel coupled">
            <div className="arch-panel-label">
              <span className="ap-tag bad">Welded in</span>
            </div>
            <h3>Coupled</h3>
            <div className="arch-diagram">
              <svg className="arch-svg" viewBox="0 0 300 200">
                <path
                  d="M84,26 C140,26 160,60 206,88"
                  fill="none"
                  stroke="#a8402a"
                  strokeWidth="1.6"
                  strokeDasharray="5 4"
                  opacity=".7"
                />
                <path
                  d="M84,100 C140,100 160,100 206,100"
                  fill="none"
                  stroke="#a8402a"
                  strokeWidth="1.6"
                  strokeDasharray="5 4"
                  opacity=".7"
                />
                <path
                  d="M84,174 C140,174 160,140 206,112"
                  fill="none"
                  stroke="#a8402a"
                  strokeWidth="1.6"
                  strokeDasharray="5 4"
                  opacity=".7"
                />
              </svg>
              <div className="arch-node agent" style={{ left: 0, top: 8 }}>
                Agent A
              </div>
              <div className="arch-node agent" style={{ left: 0, top: 82 }}>
                Agent B
              </div>
              <div className="arch-node agent" style={{ left: 0, top: 156 }}>
                Agent C
              </div>
              <div className="arch-node bot-tag" style={{ left: 90, top: 30 }}>
                HITL A
              </div>
              <div className="arch-node bot-tag" style={{ left: 90, top: 88 }}>
                HITL B
              </div>
              <div className="arch-node bot-tag" style={{ left: 90, top: 138 }}>
                HITL C
              </div>
              <div className="arch-node hub human" style={{ left: 210, top: 78 }}>
                Human
              </div>
            </div>
            <div className="arch-caption">
              <b>Every agent executes its own HITL, its own way.</b> No shared lifecycle, no shared owner — so
              nothing about it can be governed or improved.
            </div>
          </div>

          <div className="arch-panel decoupled">
            <div className="arch-panel-label">
              <span className="ap-tag good">HGateway</span>
            </div>
            <h3>
              <em>Decoupled</em>
            </h3>
            <div className="arch-diagram">
              <svg className="arch-svg" viewBox="0 0 300 200">
                <path d="M84,26 C120,26 122,92 112,100" fill="none" stroke="#0c8f44" strokeWidth="1.8" />
                <path d="M84,100 L112,100" fill="none" stroke="#0c8f44" strokeWidth="1.8" />
                <path d="M84,174 C120,174 122,108 112,100" fill="none" stroke="#0c8f44" strokeWidth="1.8" />
                <path d="M202,100 L224,100" fill="none" stroke="#0c8f44" strokeWidth="1.8" />
              </svg>
              <div className="arch-node agent" style={{ left: 0, top: 8 }}>
                Agent A
              </div>
              <div className="arch-node agent" style={{ left: 0, top: 82 }}>
                Agent B
              </div>
              <div className="arch-node agent" style={{ left: 0, top: 156 }}>
                Agent C
              </div>
              <div className="arch-node hub gateway" style={{ left: 112, top: 74 }}>
                Ved
              </div>
              <div className="arch-node hub human" style={{ left: 224, top: 78 }}>
                Human
              </div>
            </div>
            <div className="arch-caption">
              <b>Every agent hands its HITL to Ved.</b> One lifecycle, one owner — governed, learned from, and
              trusted across every agent you run.
            </div>
          </div>
        </div>
      </section>

      <section
        ref={register("revealProduct")}
        className={`reveal-product wrap reveal${isIn("revealProduct") ? " in" : ""}`}
      >
        <div className="reveal-product-card">
          <div className="sec-kicker" style={{ color: "var(--green-br)" }}>
            This is the shift
          </div>
          <h2 className="serif">
            Pull the gate out of the agent.
            <br />
            <em>Give Ved the lifecycle.</em>
          </h2>
          <p className="reveal-quote">
            A CRM is infrastructure for company <span className="rq-arrow">↔</span> customer interaction.
            <br />
            HGateway is an <b>ARM — an Agent Relationship Manager — for agent{" "}
            <span className="rq-arrow">↔</span> human interaction</b> — and Ved is the agent that runs it.
          </p>
          <p className="reveal-lede">
            This is the shift being sold: the entire HITL lifecycle, handed to an agent built to own it — which is
            what makes everything that follows possible in the first place.
          </p>
          <p className="reveal-close">
            One decorator. One typed call. The gate moves out of your repo — and into Ved.
          </p>
        </div>
      </section>

      <section ref={register("unlocks")} className={`unlocks wrap reveal${isIn("unlocks") ? " in" : ""}`}>
        <div className="unlocks-head">
          <div className="unlocks-growing">
            <span className="led on" /> This list keeps growing
          </div>
          <div className="sec-kicker">What decoupling opens up</div>
          <h2>
            Capabilities the lifecycle <em>now makes possible.</em>
          </h2>
          <p>
            Once Ved owns the full lifecycle — not just the moment of raising it — every stage becomes something
            that can be worked on, without you touching a line of agent code.
          </p>
        </div>

        <div className="unlocks-grid">
          <div className="unlock-card">
            <span className="unlock-becomes">Becomes possible</span>
            <div className="unlock-stage">Delivered → Interaction</div>
            <h3>Continuity, not staleness</h3>
            <p>
              A HITL that&apos;s just been delivered doesn&apos;t go stale sitting with no interaction on it — Ved
              moves it forward proactively, so business operations never stall on a thread nobody&apos;s watching.
            </p>
          </div>
          <div className="unlock-card">
            <span className="unlock-becomes">Becomes possible</span>
            <div className="unlock-stage">Interaction → Resolved</div>
            <h3>Interactive engagement, not a guess</h3>
            <p>
              The responder can ask for impact analysis, request a recommendation, forward it to a peer, or
              interrogate the HITL directly — every exchange feeding a reasoning stack that makes the next HITL
              sharper than the last.
            </p>
          </div>
          <div className="unlock-card">
            <span className="unlock-becomes">Becomes possible</span>
            <div className="unlock-stage">Across the lifecycle</div>
            <h3>Org-level governance</h3>
            <p>
              One place to see why every human intervened, across every agent, every team — not because each one
              logged it, but because Ved was the one running it.
            </p>
          </div>
        </div>

        <p className="unlocks-note">
          None of this ships because it&apos;s a listed feature. It ships because Ved now owns a lifecycle that{" "}
          <b>can hold it</b> — and that&apos;s exactly why the list keeps growing.
        </p>
      </section>

      <section ref={register("solution")} className={`solution wrap reveal${isIn("solution") ? " in" : ""}`}>
        <div className="sec-head">
          <div className="sec-kicker">The integration</div>
          <h2>
            What handing it to Ved looks like in <em>your code.</em>
          </h2>
          <p>Two lines of your own logic. Everything after the interrupt belongs to Ved now.</p>
        </div>

        <div className="steps">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Decorate your HITL node</h3>
            <p>
              <code className="mono">@hg.hitl_node</code> binds the current LangGraph state and config so the SDK
              can build context automatically.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>Raise the interrupt</h3>
            <p>
              <code className="mono">hg.raise_interrupt()</code> hands the HITL to Ved and suspends the graph — the
              typed response comes back on resume.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Ved owns the rest</h3>
            <p>
              Delivery, interaction, and resolution — over Slack today, more channels next — none of that is your
              agent&apos;s problem anymore.
            </p>
          </div>
        </div>

        <div className="solution-code">
          <MiniCodePanel title="review_node.py — before / after" codeHtml={INTEGRATION_DIFF_HTML} />
        </div>
      </section>

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      <section className="docs-band" id="docs">
        <div className="wrap docs-inner">
          <div className="docs-text">
            <h2>
              Read the <em>API reference.</em>
            </h2>
            <p>
              Generated straight from the SDK&apos;s own docstrings — <code>@hg.hitl_node</code>,{" "}
              <code>hg.raise_interrupt</code>, and every content/response schema.
            </p>
          </div>
          <a className="btn-docs" href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            docs.hgateway.theved.ai →
          </a>
        </div>
      </section>

      <section ref={register("finalCta")} className={`final-cta wrap reveal${isIn("finalCta") ? " in" : ""}`}>
        <h2>
          Stop welding the gate <em>into your agents.</em>
        </h2>
        <p>Early access is invite-only — every workspace is set up directly with us, not through self-serve signup.</p>
        <div className="hero-ctas">
          <button
            type="button"
            className="btn btn-highlight invite-trigger"
            onClick={() => setIsInviteOpen(true)}
          >
            <span className="shine" />
            Request invite<span className="seal">✓</span>
          </button>
          <a className="btn btn-ghost" href={`${DASHBOARD_URL}/login`}>
            Sign in to the dashboard
          </a>
        </div>
      </section>

    </div>
  );
}
