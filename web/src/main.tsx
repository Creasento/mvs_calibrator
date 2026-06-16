import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Download, Eye, RotateCcw, Settings2 } from "lucide-react";
import presetsJson from "./data/printer_presets.json";
import {
  computeBands,
  defaultPlacement,
  FirmwareMode,
  fmt,
  GeneratorConfig,
  getPreviewData,
  inferFirmwareMode,
  makeGcode,
  PrinterPreset,
} from "./generator/mvsGenerator";
import "./styles.css";

const presets = presetsJson as Record<string, PrinterPreset>;
const presetNames = Object.keys(presets).sort();

type Draft = {
  output: string;
  printer_preset: string;
  firmware_mode: FirmwareMode;
  filament_name: string;
  start_temp: number;
  end_temp: number;
  temp_step: number;
  layers_per_band: number;
  bed_temp: number;
  temp_wait_tolerance: number;
  bed_x: string;
  bed_y: string;
  layer_height: number;
  line_width: number;
  mvs_min: number;
  mvs_max: number;
  arc_segments: number;
  square_x: string;
  square_y: string;
  circle_diameter: string;
  label: boolean;
  label_layout: "three-line" | "one-line";
  label_height: string;
  label_x_scale: number;
  label_stroke_width: number;
  label_connector_width: number;
  label_speed: number;
  travel_speed: number;
  z_travel_speed: number;
  min_xy_speed: number;
  max_xy_speed: number;
  retract: number;
  extrusion_multiplier: number;
  motion_accel: number;
  motion_velocity: number;
  motion_minimum_cruise_ratio: number;
  motion_square_corner_velocity: number;
  motion_jerk: number;
};

const initialDraft: Draft = {
  output: "U1_v21_web.gcode",
  printer_preset: presetNames.includes("SNAPMAKER_U1") ? "SNAPMAKER_U1" : presetNames[0],
  firmware_mode: "klipper",
  filament_name: "Unknown_pla",
  start_temp: 230,
  end_temp: 176,
  temp_step: 1,
  layers_per_band: 10,
  bed_temp: 60,
  temp_wait_tolerance: 0.5,
  bed_x: "",
  bed_y: "",
  layer_height: 0.24,
  line_width: 0.45,
  mvs_min: 0.1,
  mvs_max: 20,
  arc_segments: 360,
  square_x: "",
  square_y: "",
  circle_diameter: "",
  label: true,
  label_layout: "three-line",
  label_height: "",
  label_x_scale: 0.55,
  label_stroke_width: 0.6,
  label_connector_width: 0.2,
  label_speed: 20,
  travel_speed: 180,
  z_travel_speed: 10,
  min_xy_speed: 0.2,
  max_xy_speed: 0,
  retract: 0,
  extrusion_multiplier: 1,
  motion_accel: 8000,
  motion_velocity: 300,
  motion_minimum_cruise_ratio: 0,
  motion_square_corner_velocity: 10,
  motion_jerk: 10,
};

function numberOr(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildConfig(draft: Draft): GeneratorConfig {
  const preset = presets[draft.printer_preset] ?? {};
  const bedX = draft.bed_x.trim() === "" ? preset.bed_x ?? 220 : numberOr(draft.bed_x, preset.bed_x ?? 220);
  const bedY = draft.bed_y.trim() === "" ? preset.bed_y ?? 220 : numberOr(draft.bed_y, preset.bed_y ?? 220);
  const placement = defaultPlacement(bedX, bedY);
  const squareX = draft.square_x.trim() === "" ? preset.square_x ?? placement.square_x : numberOr(draft.square_x, placement.square_x);
  const squareY = draft.square_y.trim() === "" ? preset.square_y ?? placement.square_y : numberOr(draft.square_y, placement.square_y);
  const circleD = draft.circle_diameter.trim() === "" ? preset.circle_diameter ?? placement.circle_diameter : numberOr(draft.circle_diameter, placement.circle_diameter);
  const bands = computeBands(draft.start_temp, draft.end_temp, draft.temp_step);

  return {
    ...draft,
    output: draft.output || "mvs_calibrator.gcode",
    printer_name: preset.printer_name ?? draft.printer_preset,
    source: preset.source ?? "",
    nozzle_size: preset.nozzle_size ?? 0.4,
    bed_x: bedX,
    bed_y: bedY,
    bed_z: preset.bed_z ?? 0,
    square_x: squareX,
    square_y: squareY,
    circle_diameter: circleD,
    heater: preset.heater ?? "extruder",
    zero_angle_deg: preset.zero_angle_deg ?? -90,
    clockwise: true,
    standalone: true,
    bands,
    filament_diameter: preset.filament_diameter ?? 1.75,
    label_height: draft.label_height.trim() === "" ? undefined : numberOr(draft.label_height, 0),
    label_margin: 6,
    retract_speed: 30,
  };
}

function App() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [showGcode, setShowGcode] = useState(false);
  const { cfg, gcode, error } = useMemo(() => {
    try {
      const cfg = buildConfig(draft);
      return { cfg, gcode: makeGcode(cfg), error: "" };
    } catch (err) {
      return { cfg: null, gcode: "", error: err instanceof Error ? err.message : String(err) };
    }
  }, [draft]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function selectPreset(name: string) {
    setDraft((prev) => ({
      ...prev,
      printer_preset: name,
      firmware_mode: inferFirmwareMode(name),
    }));
  }

  function download() {
    if (!cfg || error) return;
    const blob = new Blob([gcode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cfg.output.endsWith(".gcode") ? cfg.output : `${cfg.output}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app">
      <section className="controls">
        <div className="titlebar">
          <Settings2 size={24} />
          <div>
            <h1>Melt / MVS Calibrator</h1>
            <p>PLA melt-limit + in-layer MVS ramp G-code generator</p>
          </div>
        </div>

        {draft.firmware_mode === "unknown" && <div className="warning">가속/속도제한이 해제되지 않았을 수 있습니다.</div>}

        <Fieldset title="Output">
          <TextField label="output" value={draft.output} onChange={(v) => update("output", v)} />
        </Fieldset>

        <Fieldset title="Printer">
          <Select label="printer_preset" value={draft.printer_preset} options={presetNames} onChange={selectPreset} />
          <Select label="firmware_mode" value={draft.firmware_mode} options={["klipper", "marlin", "bambu", "unknown"]} onChange={(v) => update("firmware_mode", v as FirmwareMode)} />
          <TextField label="filament_name" value={draft.filament_name} onChange={(v) => update("filament_name", v)} />
        </Fieldset>

        <Fieldset title="Temperature">
          <NumberField label="start_temp" value={draft.start_temp} onChange={(v) => update("start_temp", v)} />
          <NumberField label="end_temp" value={draft.end_temp} onChange={(v) => update("end_temp", v)} />
          <NumberField label="temp_step" value={draft.temp_step} onChange={(v) => update("temp_step", v)} />
          <NumberField label="layers_per_band" value={draft.layers_per_band} onChange={(v) => update("layers_per_band", Math.max(1, Math.round(v)))} />
          <NumberField label="bed_temp" value={draft.bed_temp} onChange={(v) => update("bed_temp", v)} />
        </Fieldset>

        <Fieldset title="MVS / Geometry">
          <NumberField label="layer_height" value={draft.layer_height} onChange={(v) => update("layer_height", v)} />
          <NumberField label="line_width" value={draft.line_width} onChange={(v) => update("line_width", v)} />
          <NumberField label="mvs_min" value={draft.mvs_min} onChange={(v) => update("mvs_min", v)} />
          <NumberField label="mvs_max" value={draft.mvs_max} onChange={(v) => update("mvs_max", v)} />
          <NumberField label="arc_segments" value={draft.arc_segments} onChange={(v) => update("arc_segments", Math.max(12, Math.round(v)))} />
        </Fieldset>

        <Fieldset title="Build / Placement Override">
          <TextField label="bed_x" value={draft.bed_x} onChange={(v) => update("bed_x", v)} placeholder="preset" />
          <TextField label="bed_y" value={draft.bed_y} onChange={(v) => update("bed_y", v)} placeholder="preset" />
          <TextField label="square_x" value={draft.square_x} onChange={(v) => update("square_x", v)} placeholder="auto" />
          <TextField label="square_y" value={draft.square_y} onChange={(v) => update("square_y", v)} placeholder="auto" />
          <TextField label="circle_diameter" value={draft.circle_diameter} onChange={(v) => update("circle_diameter", v)} placeholder="auto" />
        </Fieldset>

        <Fieldset title="Label">
          <label className="check"><input type="checkbox" checked={draft.label} onChange={(e) => update("label", e.target.checked)} /> label</label>
          <Select label="label_layout" value={draft.label_layout} options={["three-line", "one-line"]} onChange={(v) => update("label_layout", v as Draft["label_layout"])} />
          <TextField label="label_height" value={draft.label_height} onChange={(v) => update("label_height", v)} placeholder="auto" />
          <NumberField label="label_stroke_width" value={draft.label_stroke_width} onChange={(v) => update("label_stroke_width", v)} />
          <NumberField label="label_connector_width" value={draft.label_connector_width} onChange={(v) => update("label_connector_width", v)} />
        </Fieldset>

        <Fieldset title="Firmware Motion">
          <NumberField label="motion_accel" value={draft.motion_accel} onChange={(v) => update("motion_accel", v)} />
          <NumberField label="motion_velocity" value={draft.motion_velocity} onChange={(v) => update("motion_velocity", v)} />
          <NumberField label="motion_jerk" value={draft.motion_jerk} onChange={(v) => update("motion_jerk", v)} />
        </Fieldset>
      </section>

      <section className="workspace">
        <div className="toolbar">
          <button type="button" onClick={() => setShowGcode((v) => !v)}><Eye size={18} /> {showGcode ? "Preview" : "G-code"}</button>
          <button type="button" onClick={() => setDraft(initialDraft)}><RotateCcw size={18} /> Reset</button>
          <button type="button" className="primary" onClick={download} disabled={!cfg || !!error}><Download size={18} /> Download</button>
        </div>

        {error && <div className="error">{error}</div>}
        {cfg && !showGcode && <Preview cfg={cfg} />}
        {cfg && showGcode && <textarea className="gcode" readOnly value={gcode} />}
      </section>
    </main>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset><legend>{title}</legend>{children}</fieldset>;
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="field"><span>{label}</span><input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>;
}

function Preview({ cfg }: { cfg: GeneratorConfig }) {
  const data = useMemo(() => getPreviewData(cfg), [cfg]);
  const pad = 18;
  const vb = `${-pad} ${-pad} ${data.bed.x + pad * 2} ${data.bed.y + pad * 2}`;
  const circlePath = data.circle.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const labelPaths = data.labelSegments.map(([a, b, kind], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={kind} />);
  const tooLarge = data.square.x < 0 || data.square.y < 0 || data.square.x + data.square.d > data.bed.x || data.square.y + data.square.d > data.bed.y;

  return (
    <div className="previewPane">
      <svg viewBox={vb} role="img" aria-label="MVS calibration preview">
        <rect x={0} y={0} width={data.bed.x} height={data.bed.y} className="bed" />
        <rect x={data.square.x} y={data.square.y} width={data.square.d} height={data.square.d} className="square" />
        <path d={circlePath} className="circle" />
        <g>{labelPaths}</g>
        <circle cx={data.seam[0]} cy={data.seam[1]} r={2.4} className="seam" />
      </svg>
      <div className="stats">
        <Stat label="preset" value={cfg.printer_preset} />
        <Stat label="firmware" value={cfg.firmware_mode} />
        <Stat label="bed" value={`${fmt(cfg.bed_x)} x ${fmt(cfg.bed_y)} mm`} />
        <Stat label="circle" value={`${fmt(cfg.circle_diameter)} mm`} />
        <Stat label="bands" value={String(cfg.bands)} />
        <Stat label="height" value={`${fmt(data.totalHeight)} mm`} />
        <Stat label="layers" value={String(data.totalLayers)} />
        <Stat label="mvs" value={`${fmt(cfg.mvs_min)} → ${fmt(cfg.mvs_max)} mm³/s`} />
        {tooLarge && <div className="stat alert">bounding square exceeds bed</div>}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}

createRoot(document.getElementById("root")!).render(<App />);
