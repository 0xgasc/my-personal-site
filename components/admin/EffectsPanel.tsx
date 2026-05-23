"use client";

import { MODE_SPECS, FX_MODES, type FxMode, type FxParams } from "@/lib/fx/effects";
import type { HoverSettings, HoverEffect } from "@/lib/types";

const HOVER_EFFECTS: HoverEffect[] = ["invert", "pixelate", "recolor", "sharpen"];

interface Props {
  mode: FxMode;
  params: FxParams;
  wet: number;
  hover: HoverSettings;
  onModeChange: (m: FxMode) => void;
  onParamChange: (mode: FxMode, effectType: string, key: string, value: number | string) => void;
  onWetChange: (w: number) => void;
  onHoverChange: (h: HoverSettings) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function EffectsPanel({
  mode,
  params,
  wet,
  hover,
  onModeChange,
  onParamChange,
  onWetChange,
  onHoverChange,
  onReset,
  onClose,
}: Props) {
  const spec = MODE_SPECS[mode];
  return (
    <aside className="fx-panel">
      <header>
        <span>EFFECTS — {spec.label}</span>
        <div className="fx-header-btns">
          <button onClick={onReset} title="Reset effect params to defaults">RESET</button>
          <button onClick={onClose} title="Close panel">×</button>
        </div>
      </header>

      <section className="fx-modes">
        <h4>MODE</h4>
        <div className="fx-mode-grid">
          {FX_MODES.map((m) => (
            <button
              key={m}
              className={`fx-mode-pill${m === mode ? " active" : ""}`}
              onClick={() => onModeChange(m)}
            >
              {MODE_SPECS[m].label}
            </button>
          ))}
        </div>
      </section>

      <section className="fx-global">
        <h4>WET / DRY</h4>
        <label className="fx-row">
          <span>FX Mix</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={wet}
            onChange={(e) => onWetChange(parseFloat(e.target.value))}
          />
          <em>{wet.toFixed(2)}</em>
        </label>
        <p className="fx-empty">0 = raw video · 1 = full FX</p>
      </section>

      <section className="fx-global">
        <h4>MOUSE HOVER (universal)</h4>
        <label className="fx-row">
          <span>Enabled</span>
          <input
            type="range"
            min={0}
            max={1}
            step={1}
            value={hover.enabled ? 1 : 0}
            onChange={(e) =>
              onHoverChange({ ...hover, enabled: parseFloat(e.target.value) > 0.5 })
            }
          />
          <em>{hover.enabled ? "on" : "off"}</em>
        </label>
        <label className="fx-row">
          <span>Effect</span>
          <select
            value={hover.effect}
            onChange={(e) =>
              onHoverChange({ ...hover, effect: e.target.value as HoverEffect })
            }
          >
            {HOVER_EFFECTS.map((he) => (
              <option key={he} value={he}>
                {he}
              </option>
            ))}
          </select>
        </label>
        <label className="fx-row">
          <span>Radius</span>
          <input
            type="range"
            min={0.05}
            max={0.6}
            step={0.01}
            value={hover.radius}
            onChange={(e) =>
              onHoverChange({ ...hover, radius: parseFloat(e.target.value) })
            }
          />
          <em>{hover.radius.toFixed(2)}</em>
        </label>
        <label className="fx-row">
          <span>Strength</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={hover.intensity}
            onChange={(e) =>
              onHoverChange({ ...hover, intensity: parseFloat(e.target.value) })
            }
          />
          <em>{hover.intensity.toFixed(2)}</em>
        </label>
        <p className="fx-empty">
          invert · pixelate · recolor · sharpen — applies on top of any mode
        </p>
      </section>

      {spec.effects.length === 0 && (
        <p className="fx-empty">No effects in OFF mode. Pick CRT / VHS / DREAM / ASCII / PIXEL / DITHER above.</p>
      )}

      {spec.effects.map((eff) => (
        <section key={eff.type}>
          <h4>{eff.type}</h4>
          {eff.params.length === 0 && <p className="fx-empty">preset — no adjustable params</p>}
          {eff.params.map((p) => {
            const cur = params?.[mode]?.[eff.type]?.[p.key] ?? p.default;
            if (p.type === "select") {
              return (
                <label key={p.key} className="fx-row">
                  <span>{p.label}</span>
                  <select
                    value={String(cur)}
                    onChange={(e) => onParamChange(mode, eff.type, p.key, e.target.value)}
                  >
                    {p.options!.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }
            if (p.type === "color") {
              return (
                <label key={p.key} className="fx-row">
                  <span>{p.label}</span>
                  <input
                    type="color"
                    value={String(cur)}
                    onChange={(e) => onParamChange(mode, eff.type, p.key, e.target.value)}
                    style={{ width: "100%", height: 24, border: "1px solid #333", background: "#1a1a1a", borderRadius: 3, padding: 0 }}
                  />
                  <em style={{ fontSize: 9 }}>{String(cur)}</em>
                </label>
              );
            }
            return (
              <label key={p.key} className="fx-row">
                <span>{p.label}</span>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={Number(cur)}
                  onChange={(e) => onParamChange(mode, eff.type, p.key, parseFloat(e.target.value))}
                />
                <em>{Number(cur).toFixed(2)}</em>
              </label>
            );
          })}
        </section>
      ))}
    </aside>
  );
}
