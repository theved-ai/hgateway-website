// Ported verbatim from ux-prototypes/landing-page-v4.html's
// review_node.py — before / after <pre class="mini-code"> block.

export const INTEGRATION_DIFF_HTML = `<span class="tok-kw">from</span> typing <span class="tok-kw">import</span> TypedDict
<span class="tok-kw">from</span> langgraph.graph <span class="tok-kw">import</span> StateGraph
<span class="tok-kw">from</span> langgraph.types <span class="tok-kw">import</span> interrupt
<span class="hl-block diff-add"><span class="tok-kw">import</span> hgateway_sdk <span class="tok-kw">as</span> hg</span><span class="hl-block diff-add"><span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> BinaryApprovalContent</span>
<span class="tok-kw">class</span> <span class="tok-cls">RefundState</span>(TypedDict):
    amount: <span class="tok-cls">float</span>
    decision: <span class="tok-cls">str</span>

<span class="hl-block diff-add"><span class="tok-dec">@hg.hitl_node</span></span><span class="tok-kw">def</span> <span class="tok-fn">review_node</span>(state: RefundState):
<span class="hl-block diff-remove">    reply = interrupt({<span class="tok-str">"question"</span>: f<span class="tok-str">"Approve refund of \${state['amount']}?"</span>})</span><span class="hl-block diff-remove">    <span class="tok-kw">return</span> {<span class="tok-str">"decision"</span>: reply[<span class="tok-str">"decision"</span>]}</span><span class="hl-block diff-add">    resp = hg.raise_interrupt(</span><span class="hl-block diff-add">        <span class="tok-str">"approve-refund"</span>,</span><span class="hl-block diff-add">        BinaryApprovalContent(prompt=f<span class="tok-str">"Approve refund of \${state['amount']}?"</span>),</span><span class="hl-block diff-add">    )</span><span class="hl-block diff-add">    <span class="tok-kw">return</span> {<span class="tok-str">"decision"</span>: resp[<span class="tok-str">"decision"</span>]}</span>
graph = <span class="tok-cls">StateGraph</span>(RefundState)
graph.add_node(<span class="tok-str">"review"</span>, review_node)`;
