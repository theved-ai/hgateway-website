"use client";

import { useMemo, useState } from "react";

interface CodeAccordionProps {
  code: string;
}

// Strips HTML tags to count the rendered lines, mirroring the prototype's
// `codeEl.textContent.split('\n').length` gutter line-count logic.
function countLines(html: string): number {
  const text = html.replace(/<[^>]+>/g, "");
  return text.split("\n").length;
}

export default function CodeAccordion({ code }: CodeAccordionProps) {
  const [open, setOpen] = useState(false);
  const lineCount = useMemo(() => countLines(code), [code]);

  return (
    <>
      <button
        type="button"
        className={`code-toggle${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="chev">▸</span> View the LangGraph node
      </button>
      <div className={`code-embed${open ? " open" : ""}`}>
        <div className="mini-ide">
          <div className="mini-ide-head">🐍 hitl_node.py</div>
          <div className="mini-code-area">
            <div className="mini-gutter">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="mini-code" dangerouslySetInnerHTML={{ __html: code }} />
          </div>
        </div>
      </div>
    </>
  );
}
