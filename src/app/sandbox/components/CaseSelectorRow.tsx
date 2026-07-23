import type { SandboxApi } from "../hooks/useHitlSandbox";

interface CaseSelectorRowProps {
  api: SandboxApi;
}

export default function CaseSelectorRow({ api }: CaseSelectorRowProps) {
  const { caseTabs, currentType, selectCase, runCase, runPressed } = api;

  return (
    <div className="case-selector-row">
      <div className="case-selector">
        {caseTabs.map((tab) => (
          <button
            key={tab.type}
            className={`case-tab${tab.type === currentType ? " active" : ""}`}
            onClick={() => selectCase(tab.type)}
          >
            <span className="ic">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>
      <button className={`run-inline-btn${runPressed ? " pressed" : ""}`} onClick={runCase}>
        <span className="ic">▶</span> Run this case
      </button>
    </div>
  );
}
