import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
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
  output: "U1_v17_ui.gcode",
  printer_preset: presetNames.includes("SOVOL_SV06") ? "SOVOL_SV06" : presetNames[0],
  firmware_mode: presetNames.includes("SOVOL_SV06") ? inferFirmwareMode("SOVOL_SV06") : "unknown",
  filament_name: "Unknown_pla",
  start_temp: 210,
  end_temp: 160,
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
  label_stroke_width: 0.8,
  label_connector_width: 0.4,
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
  const [logs, setLogs] = useState<string[]>(["Ready. Press Preview or Generate G-code."]);
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

  function generate() {
    if (!cfg || error) return;
    const blob = new Blob([gcode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cfg.output.endsWith(".gcode") ? cfg.output : `${cfg.output}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
    setLogs((prev) => [...prev, `Generated G-code: ${a.download}`]);
  }

  function preview() {
    if (!cfg || error) return;
    setShowGcode(false);
    setLogs((prev) => [...prev, `Preview: computed bands = ${cfg.bands}`, "Preview updated in browser."]);
  }

  function chooseOutput() {
    const next = window.prompt("Output G-code file name", draft.output);
    if (!next?.trim()) return;
    update("output", next.trim());
    setLogs((prev) => [...prev, `Output file name set: ${next.trim()}`]);
  }

  function openFolder() {
    setLogs((prev) => [...prev, "Open folder is handled by the browser download shelf in the web version."]);
  }

  return (
    <main className="app">
      <header className="appHeader">
        <h1>Melt / MVS Calibrator UI v17</h1>
        <p>왼쪽: 변수 입력 · 오른쪽: 베드/출력물/바닥글씨 프리뷰 · always standalone · G28 first</p>
        {draft.firmware_mode === "unknown" && <div className="warning">가속/속도제한이 해제되지 않았을 수 있습니다.</div>}
      </header>

      <div className="shell">
        <section className="controls">
          <Fieldset title="Output">
            <TextField label="output" description="생성할 G-code 파일 이름. 상대경로면 다운로드 파일명으로 사용됨." value={draft.output} onChange={(v) => update("output", v)} />
          </Fieldset>

          <Fieldset title="Printer">
            <Select label="printer_preset" description="printer_presets.json에 있는 프린터 프리셋 이름." value={draft.printer_preset} options={presetNames} onChange={selectPreset} />
            <Select label="firmware_mode" description="펌웨어 종류. 프리셋 선택 시 자동 추정됨." value={draft.firmware_mode} options={["klipper", "marlin", "bambu", "unknown"]} onChange={(v) => update("firmware_mode", v as FirmwareMode)} />
            <TextField label="filament_name" description="바닥 라벨에 들어갈 필라멘트 이름." value={draft.filament_name} onChange={(v) => update("filament_name", v)} />
          </Fieldset>

          <Fieldset title="Temperature">
            <NumberField label="start_temp" description="시작 온도. 기본 210°C." value={draft.start_temp} onChange={(v) => update("start_temp", v)} />
            <NumberField label="end_temp" description="끝 온도. bands는 시작/끝/step으로 자동 계산." value={draft.end_temp} onChange={(v) => update("end_temp", v)} />
            <NumberField label="temp_step" description="밴드마다 낮출 온도. 1이면 -1°C씩 감소." value={draft.temp_step} onChange={(v) => update("temp_step", v)} />
            <NumberField label="layers_per_band" description="온도 하나당 레이어 수." value={draft.layers_per_band} onChange={(v) => update("layers_per_band", Math.max(1, Math.round(v)))} />
            <NumberField label="bed_temp" description="standalone 출력 때 베드 온도." value={draft.bed_temp} onChange={(v) => update("bed_temp", v)} />
          </Fieldset>

          <Fieldset title="MVS / Geometry">
            <NumberField label="layer_height" description="레이어 높이." value={draft.layer_height} onChange={(v) => update("layer_height", v)} />
            <NumberField label="line_width" description="캘리브레이션 원형벽 라인 폭." value={draft.line_width} onChange={(v) => update("line_width", v)} />
            <NumberField label="mvs_min" description="시작 MVS 값 mm³/s." value={draft.mvs_min} onChange={(v) => update("mvs_min", v)} />
            <NumberField label="mvs_max" description="최대 MVS 값 mm³/s." value={draft.mvs_max} onChange={(v) => update("mvs_max", v)} />
            <NumberField label="arc_segments" description="원 1바퀴를 나누는 세그먼트 수." value={draft.arc_segments} onChange={(v) => update("arc_segments", Math.max(12, Math.round(v)))} />
          </Fieldset>

          <Fieldset title="Build Volume Override">
            <TextField label="bed_x" description="비우면 프리셋값 사용." value={draft.bed_x} onChange={(v) => update("bed_x", v)} placeholder="preset" />
            <TextField label="bed_y" description="비우면 프리셋값 사용." value={draft.bed_y} onChange={(v) => update("bed_y", v)} placeholder="preset" />
          </Fieldset>

          <Fieldset title="Placement Override">
            <TextField label="square_x" description="비우면 빌드볼륨 기준 자동값 사용." value={draft.square_x} onChange={(v) => update("square_x", v)} placeholder="auto" />
            <TextField label="square_y" description="비우면 빌드볼륨 기준 자동값 사용." value={draft.square_y} onChange={(v) => update("square_y", v)} placeholder="auto" />
            <TextField label="circle_diameter" description="비우면 빌드볼륨 기준 자동값 사용." value={draft.circle_diameter} onChange={(v) => update("circle_diameter", v)} placeholder="auto" />
          </Fieldset>

          <Fieldset title="Label">
            <label className="check"><input type="checkbox" checked={draft.label} onChange={(e) => update("label", e.target.checked)} /> label</label>
            <Select label="label_layout" description="라벨 줄 구성. 기본 3줄." value={draft.label_layout} options={["three-line", "one-line"]} onChange={(v) => update("label_layout", v as Draft["label_layout"])} />
            <TextField label="label_height" description="비우면 자동. 목표 글자 높이." value={draft.label_height} onChange={(v) => update("label_height", v)} placeholder="auto" />
            <NumberField label="label_stroke_width" description="실제 글자 stroke 압출 폭." value={draft.label_stroke_width} onChange={(v) => update("label_stroke_width", v)} />
            <NumberField label="label_connector_width" description="글자/줄 연결선 압출 폭." value={draft.label_connector_width} onChange={(v) => update("label_connector_width", v)} />
          </Fieldset>

          <Fieldset title="Firmware Motion">
            <NumberField label="motion_accel" description="요청 가속도." value={draft.motion_accel} onChange={(v) => update("motion_accel", v)} />
            <NumberField label="motion_velocity" description="요청 XY 최대속도." value={draft.motion_velocity} onChange={(v) => update("motion_velocity", v)} />
            <NumberField label="motion_jerk" description="Marlin/Bambu classic jerk 힌트." value={draft.motion_jerk} onChange={(v) => update("motion_jerk", v)} />
          </Fieldset>
        </section>

        <section className="workspace">
          <div className="toolbar">
            <button type="button" className="generate" onClick={generate} disabled={!cfg || !!error}>Generate G-code</button>
            <button type="button" className="previewButton" onClick={preview}>Preview</button>
            <button type="button" onClick={chooseOutput}>Choose output</button>
            <button type="button" onClick={openFolder}>Open folder</button>
          </div>

          {error && <div className="error">{error}</div>}
          {cfg && <Preview cfg={cfg} />}
          <pre className="log">{logs.slice(-7).join("\n")}</pre>
          {showGcode && <textarea className="gcode" readOnly value={gcode} />}
        </section>
      </div>
    </main>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset><legend>{title}</legend>{children}</fieldset>;
}

function TextField({ label, description, value, onChange, placeholder }: { label: string; description?: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="field"><span>{label}</span>{description && <small>{description}</small>}<input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

function NumberField({ label, description, value, onChange }: { label: string; description?: string; value: number; onChange: (value: number) => void }) {
  return <label className="field"><span>{label}</span>{description && <small>{description}</small>}<input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}

function Select({ label, description, value, options, onChange }: { label: string; description?: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span>{description && <small>{description}</small>}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>;
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
      <div className="previewTitle">Preview: bed / circle / bottom label path</div>
      <div className="previewStage">
        <svg viewBox={vb} role="img" aria-label="MVS calibration preview">
          <rect x={0} y={0} width={data.bed.x} height={data.bed.y} className="bed" />
          <rect x={data.square.x} y={data.square.y} width={data.square.d} height={data.square.d} className="square" />
          <path d={circlePath} className="circle" />
          <g>{labelPaths}</g>
          <circle cx={data.seam[0]} cy={data.seam[1]} r={2.2} className="seam" />
          <text x={4} y={12} className="previewText">Bed {fmt(cfg.bed_x)}x{fmt(cfg.bed_y)}</text>
          <text x={data.square.x + data.square.d / 2 - 10} y={data.square.y - 6} className="previewText">Ø{fmt(cfg.circle_diameter)}</text>
          <text x={data.square.x} y={data.square.y + data.square.d + 6} className="previewText muted">X{fmt(cfg.square_x)} Y{fmt(cfg.square_y)}</text>
          <text x={data.bed.x - 76} y={10} className="previewText">stroke {fmt(cfg.label_stroke_width, 1)} / connector {fmt(cfg.label_connector_width, 1)}</text>
          {tooLarge && <text x={4} y={data.bed.y - 6} className="previewText danger">bounding square exceeds bed</text>}
        </svg>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
