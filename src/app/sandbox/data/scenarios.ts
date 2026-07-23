// Data for the Acme "going agentic" HITL sandbox, ported from
// ux-prototypes/acme-hitl-flow.html. Code snippets are stored as pre-formatted
// HTML strings (rendered via dangerouslySetInnerHTML) because the prototype's
// syntax-highlighted code is itself the content, not something to re-derive.

export type CaseMode = "existing" | "hgateway";
export type Persona = "builder" | "responder";
export type CaseType = "approval" | "decision" | "context" | "edit";

/** Drives which action UI both the Legacy and Ved cards render for a scenario. */
export type InteractionKind =
  | { kind: "binary"; approveLabel: string; rejectLabel: string }
  | { kind: "options"; options: { label: string; desc: string }[] }
  | { kind: "form"; fieldLabel: string; placeholder: string; submitLabel: string }
  | { kind: "edit"; draftText: string; primaryLabel: string; secondaryLabel: string };

export interface ForwardTarget {
  id: string;
  name: string;
  role: string;
  why: string;
}

export interface ImpactGroup {
  heading: string;
  items: { text: string; bad: boolean }[];
}

export interface Scenario {
  avatar: string;
  title: string;
  desc: string;
  code: Record<CaseMode, string>;
  pains: Record<CaseMode, Record<Persona, [string, string][]>>;

  // Slack message chrome
  agentName: string;
  time: string;
  runId: string;
  typeLabel: string;
  tagValue: string;
  titleRowText: string;
  dotColorVar: string;
  contextWhy: string;
  autoForwardChannel: string;
  interaction: InteractionKind;
  promptText: string;

  // Confidence / narrative interaction data
  scenarioLine: string;
  impactGroups: ImpactGroup[];
  recommend: string;
  confidence: "low" | "medium" | "high";
  forwardTo: ForwardTarget[];
  qnaAnswer: string;
  irreversible: string[];
  recommendedChoice: string;
  reasoningDraft: (choice: string) => string;
}

const IMPORTS = {
  existing: `<span class="tok-kw">from</span> langgraph.graph <span class="tok-kw">import</span> StateGraph
<span class="tok-kw">from</span> langgraph.types <span class="tok-kw">import</span> interrupt

`,
  hgateway: `<span class="tok-kw">from</span> langgraph.graph <span class="tok-kw">import</span> StateGraph
<span class="tok-kw">import</span> hgateway_sdk <span class="tok-kw">as</span> hg
`,
};

export const SCENARIOS: Record<CaseType, Scenario> = {
  approval: {
    avatar: "💰",
    title: "Finance Ops Agent — Invoice Payment Approval",
    desc: "Autonomously processes vendor invoices; pauses for human sign-off above $10k.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("finance_approval_node", finance_approval_node)

<span class="tok-kw">def</span> <span class="tok-fn">finance_approval_node</span>(state):
    invoice = state["invoice"]

<span class="hl-block warn">    reply = interrupt({
        "question": f"Approve payment of \${invoice['amount']} to {invoice['vendor']}?",
        "options": ["approve", "reject"],
    })</span>

    if reply["choice"] == "approve":
        return {"status": "approved"}
    return {"status": "rejected"}`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> BinaryApprovalContent, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("finance_approval_node", finance_approval_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">finance_approval_node</span>(state):
    invoice = state["invoice"]

    <span class="tok-com"># choices default to Approve/Reject</span>
    content = BinaryApprovalContent(
        prompt=f"Approve payment of \${invoice['amount']} to {invoice['vendor']}?",
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "invoice-approval",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#finance-ops"])),
        ),
        fallback={"decision": "reject"},
    )</span>

    return {"status": resp["decision"]}`,
    },
    pains: {
      existing: {
        builder: [
          ["Stale HITL, no reply", "How do I handle a stale HITL if Rishabh doesn't respond in time?"],
          ["Rishabh = bottleneck", "Rishabh has become a bottleneck for every invoice approval."],
          ["Can't re-route on the fly", "I can't re-route this HITL to another responder on the fly."],
          ["No reasoning captured", "How do I capture the reasoning behind Rishabh's decision?"],
        ],
        responder: [
          ["No context to decide", "How can I approve/reject this without any context?"],
          ["Sneha should see this", "I think Sneha has better context here — how do I route this to her?"],
          ["Fear of breaking things", "What if I approve this and something breaks?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forwards on timeout", "TTL + auto-forward to #finance-ops handles stale HITLs automatically."],
          ["No single point of failure", "Rishabh isn't a single point of failure — it escalates if he's unavailable."],
          ["Forward to Sneha, no code", "Forward re-routes to Sneha on the fly, no graph changes needed."],
          ["Reasoning logged automatically", "Every decision is captured with reasoning in the audit trail."],
        ],
        responder: [
          ["Context shown upfront", "Context/reasoning is shown right alongside the ask."],
          ["One-click forward to Sneha", "One click to Forward to Sneha if she has better context."],
          ["See impact before deciding", "Explain impact before deciding — know what breaks if I approve."],
        ],
      },
    },
    agentName: "finance-ops-agent",
    time: "9:41 AM",
    runId: "run-fin-1",
    typeLabel: "Approval",
    promptText: "Approve payment of $12,400.00 to Acme Supplies?",
    tagValue: "VED.HITL(APPROVAL)",
    titleRowText: "Approval needed · finance-ops-agent",
    dotColorVar: "var(--sk-green)",
    contextWhy:
      "The agent matched the invoice to PO #A-2291 and flagged the $12,400 amount as above the $10k auto-approval threshold; sign-off is required before payment is released.",
    autoForwardChannel: "#finance-ops",
    interaction: { kind: "binary", approveLabel: "✓ Approve", rejectLabel: "✕ Reject" },

    scenarioLine:
      "Scenario — it's 9:41 AM. finance-ops-agent flags a $12,400 invoice above the $10k auto-approval line and needs Rishabh to sign off before it pays Acme Supplies.",
    impactGroups: [
      {
        heading: "✅ Approve",
        items: [
          { text: "Payment releases immediately to Acme Supplies", bad: false },
          { text: "Irreversible once issued — recovery needs a manual clawback", bad: true },
          { text: "Closes 3 more line items queued behind PO #A-2291", bad: false },
        ],
      },
      {
        heading: "❌ Reject",
        items: [
          { text: "No money moves", bad: false },
          { text: "Invoice re-enters the AP reconciliation queue, adding ~2 days", bad: true },
          { text: "Acme Supplies loses its early-payment discount window", bad: true },
        ],
      },
    ],
    recommend: "Approve. The amount matches PO #A-2291 exactly and the vendor has a clean 18-month payment history.",
    confidence: "high",
    forwardTo: [
      { id: "sneha", name: "Sneha", role: "AP Lead", why: "Owns vendor payment exceptions" },
      { id: "financeops", name: "#finance-ops", role: "Team channel", why: "Shared pool — first available approver picks it up" },
    ],
    qnaAnswer:
      "The $10k threshold is a standing finance-ops policy, not agent-specific — anything above it always needs sign-off, regardless of vendor history.",
    irreversible: ["✓ Approve"],
    recommendedChoice: "✓ Approve",
    reasoningDraft: (choice) =>
      choice.includes("Approve")
        ? "I approved because the $12,400 amount matches PO #A-2291 exactly, Acme Supplies has an 18-month clean payment history, and holding it would cost their early-payment discount window."
        : "I rejected because I couldn't confirm the PO match with enough confidence to release funds — escalating to AP reconciliation for manual verification first.",
  },

  decision: {
    avatar: "🎧",
    title: "Support Triage Agent — Escalation Routing",
    desc: "Classifies escalated tickets and hands off to the right specialist team.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("ticket_routing_node", ticket_routing_node)

<span class="tok-kw">def</span> <span class="tok-fn">ticket_routing_node</span>(state):
    ticket = state["ticket"]

<span class="hl-block warn">    reply = interrupt({
        "question": f'Route ticket #{ticket["id"]}: "{ticket["summary"]}"',
        "options": ["billing", "technical", "legal"],
    })

    team = reply["choice"]
    if team not in ("billing", "technical", "legal"):
        team = "technical"  # silent fallback</span>
    return {"routed_team": team}`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> SingleDecisionContent, Option, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("ticket_routing_node", ticket_routing_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">ticket_routing_node</span>(state):
    ticket = state["ticket"]

    content = SingleDecisionContent(
        prompt=f'Route ticket #{ticket["id"]}: "{ticket["summary"]}"',
        options=[
            Option("billing", "Billing"),
            Option("technical", "Technical"),
            Option("legal", "Legal"),
        ],
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "ticket-routing",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#support-escalations"])),
        ),
        fallback={"selected": "technical"},
    )</span>

    return {"routed_team": resp["selected"]}`,
    },
    pains: {
      existing: {
        builder: [
          ["Ticket sits unrouted", "Ticket sits unrouted if Rishabh misses the free-text reply."],
          ["Typos silently misroute", "One misspelled reply silently defaults to the wrong team."],
          ["Can't loop in Sneha", "No way to loop in Sneha if she's better placed to route this."],
          ["No routing rationale", "No record of why a ticket was routed a certain way."],
        ],
        responder: [
          ["Which team owns this?", "Which team actually owns this — billing or technical?"],
          ["Not sure it's mine", "I'm not sure this is mine — how do I hand it to Sneha?"],
          ["What if I ignore it?", "What happens to the ticket if I ignore this?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forward prevents drift", "TTL + auto-forward to #support-escalations prevents unrouted tickets."],
          ["Structured options, no typos", "Structured options mean routing can never silently misfire."],
          ["Forward to Sneha instantly", "Forward re-routes to Sneha without touching the graph."],
          ["Routing + reasoning logged", "Routing decision + reasoning is logged automatically."],
        ],
        responder: [
          ["Each option explains itself", "Each option shows why it might apply — no guessing."],
          ["One-click forward to Sneha", "Forward to Sneha in one click if she's the better owner."],
          ["Auto-forwards after 2h", "Auto-forwards after 2h if I don't act — nothing's dropped."],
        ],
      },
    },
    agentName: "support-triage-agent",
    time: "11:02 AM",
    runId: "run-sup-2",
    typeLabel: "Decision",
    promptText: 'Route ticket #9931: "Refund not reflecting after cancellation"',
    tagValue: "VED.HITL(DECISION)",
    titleRowText: "Decision needed · support-triage-agent",
    dotColorVar: "var(--sk-blue)",
    contextWhy:
      "The agent classified this as a billing-adjacent technical issue but confidence is split between Billing and Technical ownership; routing needs a human call.",
    autoForwardChannel: "#support-escalations",
    interaction: {
      kind: "options",
      options: [
        { label: "Billing", desc: "Invoicing, refunds & payment disputes" },
        { label: "Technical", desc: "Bugs, outages & product defects" },
        { label: "Legal", desc: "Compliance, contracts & disputes" },
      ],
    },

    scenarioLine:
      "Scenario — it's 11:02 AM. support-triage-agent can't confidently classify ticket #9931 as Billing or Technical, and a wrong route means the customer sees it bounce twice.",
    impactGroups: [
      {
        heading: "Route to Technical",
        items: [
          { text: "Traces to a webhook-sync bug seen twice this week", bad: false },
          { text: "6-ticket backlog, ~4h SLA", bad: true },
        ],
      },
      {
        heading: "Route to Billing",
        items: [
          { text: "Skips the technical backlog", bad: false },
          { text: "Billing can't action a refund without a root-cause note", bad: true },
          { text: "Likely bounces back for a second re-route", bad: true },
        ],
      },
    ],
    recommend: "Route to Technical first — the refund symptom traces back to a webhook-sync bug seen twice this week.",
    confidence: "medium",
    forwardTo: [
      { id: "sneha", name: "Sneha", role: "Support Ops", why: "Owns escalation routing calls" },
      { id: "supportesc", name: "#support-escalations", role: "Team channel", why: "Shared pool — first available specialist picks it up" },
    ],
    qnaAnswer:
      "Confidence is split 55/45 Technical vs. Billing — the agent flagged it instead of guessing because a wrong route costs a second escalation.",
    irreversible: [],
    recommendedChoice: "Technical",
    reasoningDraft: (choice) =>
      `I routed to ${choice} because it best matches the recurring webhook-sync issue seen this week, and a wrong route here means the customer sees the ticket bounce a second time.`,
  },

  context: {
    avatar: "📄",
    title: "Deal Desk Agent — Requesting More Context",
    desc: "Drafting a sales contract but is missing details it can't infer from the CRM.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("contract_context_node", contract_context_node)

<span class="tok-kw">def</span> <span class="tok-fn">contract_context_node</span>(state):
    customer = state["customer"]

<span class="hl-block warn">    reply = interrupt({
        "question": f"Missing details to finish {customer['name']}'s contract",
        "fields": ["billing_address", "payment_terms"],
    })</span>

    return {
        "billing_address": reply["billing_address"],
        "payment_terms": reply["payment_terms"],
    }`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> FormContextContent, FormField, FieldType, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("contract_context_node", contract_context_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">contract_context_node</span>(state):
    customer = state["customer"]

    content = FormContextContent(
        prompt=f"Missing details to finish {customer['name']}'s contract",
        fields=[
            FormField("billing_address", "Billing address", FieldType.TEXT),
            FormField("payment_terms", "Payment terms", FieldType.TEXT),
        ],
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "contract-context",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#sales-ops"])),
        ),
        fallback={"billing_address": "", "payment_terms": "net-30"},
    )</span>

    return resp`,
    },
    pains: {
      existing: {
        builder: [
          ["Contract stalls on silence", "Contract stalls indefinitely if Rishabh doesn't reply."],
          ["One typo corrupts data", "One missing '|' in the reply corrupts the parsed fields."],
          ["Can't redirect to Sneha", "No way to redirect this to Sneha if she owns this account."],
          ["No trail of who replied", "No trail of who supplied the missing terms."],
        ],
        responder: [
          ["Why ask me specifically?", "Why does the agent need this from me specifically?"],
          ["Sneha owns this account", "Sneha owns this account — how do I pass this to her?"],
          ["Did my reply even parse?", "Did my reply even get parsed correctly?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forward keeps deals moving", "TTL + auto-forward to #sales-ops keeps deals from stalling."],
          ["Validated fields, no corruption", "Structured fields are validated on submit — no corrupted data."],
          ["Forward to Sneha in one click", "Forward to Sneha in one click if she owns the account."],
          ["Every field logged with source", "Every submitted field is logged with who supplied it."],
        ],
        responder: [
          ["Reasoning explains the ask", "Reasoning tells me exactly why this info is needed."],
          ["One-click forward to Sneha", "Forward to Sneha in one click if she's the account owner."],
          ["Structured form, no guessing", "A structured form — no guessing the reply format."],
        ],
      },
    },
    agentName: "deal-desk-agent",
    time: "2:14 PM",
    runId: "run-deal-4",
    typeLabel: "Context",
    promptText: "Missing details to finish Nimbus Retail's contract.",
    tagValue: "VED.HITL(CONTEXT)",
    titleRowText: "Context needed · deal-desk-agent",
    dotColorVar: "var(--sk-purple)",
    contextWhy:
      "The agent has every deal term except billing address and payment terms, which aren't present in the CRM record and can't be safely inferred.",
    autoForwardChannel: "#sales-ops",
    interaction: {
      kind: "form",
      fieldLabel: "Billing address & payment terms",
      placeholder: "e.g. 123 Main St, Springfield — Net 30 terms",
      submitLabel: "Provide input",
    },

    scenarioLine:
      "Scenario — it's 2:14 PM. deal-desk-agent is drafting Nimbus Retail's renewal contract but the billing address and payment terms were never logged in the CRM.",
    impactGroups: [
      {
        heading: "Where this goes",
        items: [
          { text: "Used directly in the contract sent for countersignature", bad: false },
          { text: "Wrong value needs a contract amendment later, not just an edit", bad: true },
          { text: "Nimbus Retail's renewal window closes in 4 days", bad: true },
        ],
      },
    ],
    recommend: "Use Nimbus Retail's last known billing address on file and default to Net-30 — their standard renewal term.",
    confidence: "medium",
    forwardTo: [
      { id: "sneha", name: "Sneha", role: "Account Owner", why: "Owns the Nimbus Retail relationship" },
      { id: "salesops", name: "#sales-ops", role: "Team channel", why: "Shared pool — first available rep picks it up" },
    ],
    qnaAnswer:
      "The CRM record for Nimbus Retail was never fully filled in during onboarding — this is a data gap, not something the agent misread.",
    irreversible: [],
    recommendedChoice: "Provide input",
    reasoningDraft: () =>
      "I provided Net-30 and the address on file because Nimbus Retail has used the same terms on their last two renewals, and no new figure was logged this cycle.",
  },

  edit: {
    avatar: "📣",
    title: "Marketing Copy Agent — Social Post Review",
    desc: "Drafts launch announcements; a human edits or approves copy before it ships.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("social_copy_node", social_copy_node)

<span class="tok-kw">def</span> <span class="tok-fn">social_copy_node</span>(state):
    draft = state["draft_post"]

<span class="hl-block warn">    reply = interrupt({
        "question": "Review the draft post before it goes out",
        "original_content": draft,
    })</span>

    return {"final_copy": reply.get("edited_content", draft)}`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> ContentEditContent, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("social_copy_node", social_copy_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">social_copy_node</span>(state):
    draft = state["draft_post"]

    content = ContentEditContent(
        prompt="Review the draft post before it goes out",
        draft=draft,
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "social-copy-review",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#marketing"])),
        ),
        fallback={"edited_content": draft},
    )</span>

    return {"final_copy": resp["edited_content"]}`,
    },
    pains: {
      existing: {
        builder: [
          ["Draft sits unreviewed", "Draft sits unreviewed if Rishabh is heads-down."],
          ["Reply overwrites, no diff", "A free-text reply overwrites the draft — no diff, no history."],
          ["Can't loop in Sneha", "Can't loop in Sneha for a second pass on tone or legal."],
          ["No edit history", "No record of what was changed or why."],
        ],
        responder: [
          ["Legal sign-off needed?", "Is this ready to publish, or does legal need to see it first?"],
          ["Sneha should review pricing", "Sneha should really review the pricing language — how do I loop her in?"],
          ["Is original recoverable?", "If I edit this, is the original draft still recoverable?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forward if unavailable", "TTL + auto-forward to #marketing if Rishabh's unavailable."],
          ["Edits captured as a diff", "Edits are captured as a diff against the original draft."],
          ["Forward to Sneha, 2nd pass", "Forward to Sneha in one click for a second pass."],
          ["Full edit history logged", "Full history of every edit and who made it."],
        ],
        responder: [
          ["Context flags legal review", "Context shown upfront — know if legal sign-off is needed."],
          ["One-click forward to Sneha", "Forward to Sneha in one click if she should weigh in."],
          ["Inline edit, original kept", "Edit inline — the original draft stays recoverable."],
        ],
      },
    },
    agentName: "marketing-copy-agent",
    time: "4:30 PM",
    runId: "run-mkt-3",
    typeLabel: "Edit",
    promptText: "Review the draft post before it goes out.",
    tagValue: "VED.HITL(EDIT)",
    titleRowText: "Review needed · marketing-copy-agent",
    dotColorVar: "var(--sk-orange)",
    contextWhy:
      "The agent drafted the launch announcement but is unsure the tone matches brand style guide and whether pricing language needs legal sign-off before it's public.",
    autoForwardChannel: "#marketing",
    interaction: {
      kind: "edit",
      draftText: "We are shipping Nimbus 2.0 today — faster sync, smarter search, same price.",
      primaryLabel: "Send",
      secondaryLabel: "Send without edits",
    },

    scenarioLine:
      "Scenario — it's 4:30 PM. marketing-copy-agent drafted the Nimbus 2.0 launch post, but the pricing line ('same price') usually wants a Legal look before three channels go live.",
    impactGroups: [
      {
        heading: "On send",
        items: [
          { text: "Goes out across 3 coordinated launch channels immediately", bad: false },
          { text: "Pricing line ('same price') usually wants a Legal look first", bad: true },
          { text: "Delay here delays all 3 channels together", bad: true },
        ],
      },
    ],
    recommend: "Send after a quick Legal pass on the pricing line — the rest of the copy matches brand voice guidelines.",
    confidence: "high",
    forwardTo: [
      { id: "sneha", name: "Sneha", role: "Brand/Legal liaison", why: "Signs off on pricing-adjacent copy" },
      { id: "marketing", name: "#marketing", role: "Team channel", why: "Shared pool — first available reviewer picks it up" },
    ],
    qnaAnswer:
      "The draft was flagged mainly for the pricing sentence — 'same price' can read as a claim Legal usually wants phrased more carefully.",
    irreversible: ["Send"],
    recommendedChoice: "Send",
    reasoningDraft: () =>
      "I sent the draft as-is — the copy matches brand voice and the pricing line is accurate; flagging for Legal felt like caution, not a blocker.",
  },
};

export const JOURNEY_ORDER: CaseType[] = ["approval", "decision", "context", "edit"];

export const JOURNEY_NAMES: Record<CaseType, string> = {
  approval: "Finance Ops Agent",
  decision: "Support Triage Agent",
  context: "Deal Desk Agent",
  edit: "Marketing Copy Agent",
};

export const CASE_TABS: { type: CaseType; icon: string; label: string }[] = [
  { type: "approval", icon: "💰", label: "Approval" },
  { type: "decision", icon: "🎧", label: "Decision" },
  { type: "context", icon: "📄", label: "Context" },
  { type: "edit", icon: "📣", label: "Review / Edit" },
];

export const YOU_NAME = "Rishabh";
export const ALREADY_RESOLVED_REPLY =
  "This request has already been resolved 👍 The decision and reasoning are recorded above in this thread. I can no longer take any questions on this one.";
