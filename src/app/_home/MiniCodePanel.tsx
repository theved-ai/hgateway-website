import { useMemo } from "react";

interface MiniCodePanelProps {
  title: string;
  codeHtml: string;
}

// Strips HTML tags to count the rendered lines, mirroring the sandbox's
// CodeAccordion `countLines` gutter line-count logic.
function countLines(html: string): number {
  const text = html.replace(/<[^>]+>/g, "");
  return text.split("\n").length;
}

export default function MiniCodePanel({ title, codeHtml }: MiniCodePanelProps) {
  const lineCount = useMemo(() => countLines(codeHtml), [codeHtml]);

  return (
    <div className="mini-ide">
      <div className="mini-ide-head">
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
        {title}
      </div>
      <div className="mini-code-area">
        <div className="mini-gutter">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="mini-code" dangerouslySetInnerHTML={{ __html: codeHtml }} />
      </div>
    </div>
  );
}
