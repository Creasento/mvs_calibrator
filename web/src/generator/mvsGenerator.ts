export type FirmwareMode = "klipper" | "marlin" | "bambu" | "unknown";
export type LabelLayout = "three-line" | "one-line";
export type Point = [number, number];
export type SegmentKind = "stroke" | "connector";
export type TypedSegment = [Point, Point, SegmentKind];

export type PrinterPreset = {
  manufacturer?: string;
  printer_name?: string;
  source?: string;
  bed_x?: number;
  bed_y?: number;
  bed_z?: number;
  nozzle_size?: number;
  filament_diameter?: number;
  heater?: string;
  zero_angle_deg?: number;
  square_x?: number;
  square_y?: number;
  circle_diameter?: number;
};

export type GeneratorConfig = {
  output: string;
  printer_preset: string;
  printer_name: string;
  source: string;
  filament_name: string;
  nozzle_size: number;
  bed_x: number;
  bed_y: number;
  bed_z: number;
  square_x: number;
  square_y: number;
  circle_diameter: number;
  heater: string;
  zero_angle_deg: number;
  clockwise: boolean;
  standalone: boolean;
  start_temp: number;
  end_temp: number;
  temp_step: number;
  bands: number;
  layers_per_band: number;
  layer_height: number;
  mvs_min: number;
  mvs_max: number;
  arc_segments: number;
  line_width: number;
  filament_diameter: number;
  label: boolean;
  label_layout: LabelLayout;
  label_height?: number;
  label_margin: number;
  label_speed: number;
  label_x_scale: number;
  label_stroke_width: number;
  label_connector_width: number;
  bed_temp: number;
  temp_wait_tolerance: number;
  travel_speed: number;
  z_travel_speed: number;
  min_xy_speed: number;
  max_xy_speed: number;
  retract: number;
  retract_speed: number;
  extrusion_multiplier: number;
  firmware_mode: FirmwareMode;
  motion_accel: number;
  motion_velocity: number;
  motion_minimum_cruise_ratio: number;
  motion_square_corner_velocity: number;
  motion_jerk: number;
};

export type PreviewData = {
  bed: { x: number; y: number };
  square: { x: number; y: number; d: number };
  circle: Point[];
  labelSegments: TypedSegment[];
  seam: Point;
  totalLayers: number;
  totalHeight: number;
};

const FONT: Record<string, Point[][]> = {
  "0": [[ [0, 0], [0, 7], [5, 7], [5, 0], [0, 0] ]],
  "1": [[ [2.5, 0], [2.5, 7] ], [[1.2, 5.8], [2.5, 7]], [[1, 0], [4, 0]]],
  "2": [[ [0, 5.5], [1, 7], [5, 7], [5, 4.8], [0, 0], [5, 0] ]],
  "3": [[ [0, 7], [5, 7], [3, 3.5], [5, 3.5], [5, 0], [0, 0] ]],
  "4": [[ [5, 0], [5, 7] ], [[0, 2.5], [5, 2.5]], [[0, 2.5], [4.8, 7]]],
  "5": [[ [5, 7], [0, 7], [0, 3.5], [5, 3.5], [5, 0], [0, 0] ]],
  "6": [[ [5, 7], [0, 3.5], [0, 0], [5, 0], [5, 3.5], [0, 3.5] ]],
  "7": [[ [0, 7], [5, 7], [1.5, 0] ]],
  "8": [[ [0, 0], [0, 7], [5, 7], [5, 0], [0, 0] ], [[0, 3.5], [5, 3.5]]],
  "9": [[ [5, 3.5], [0, 3.5], [0, 7], [5, 7], [5, 0], [0, 0] ]],
  A: [[[0, 0], [2.5, 7], [5, 0]], [[1.2, 3], [3.8, 3]]],
  B: [[[0, 0], [0, 7], [4, 7], [5, 6], [5, 4.3], [4, 3.5], [0, 3.5]], [[0, 3.5], [4, 3.5], [5, 2.7], [5, 1], [4, 0], [0, 0]]],
  C: [[[5, 7], [0, 7], [0, 0], [5, 0]]],
  D: [[[0, 0], [0, 7], [3.5, 7], [5, 5.5], [5, 1.5], [3.5, 0], [0, 0]]],
  E: [[[5, 7], [0, 7], [0, 0], [5, 0]], [[0, 3.5], [3.8, 3.5]]],
  F: [[[0, 0], [0, 7], [5, 7]], [[0, 3.5], [3.8, 3.5]]],
  G: [[[5, 7], [0, 7], [0, 0], [5, 0], [5, 3], [3, 3]]],
  H: [[[0, 0], [0, 7]], [[5, 0], [5, 7]], [[0, 3.5], [5, 3.5]]],
  I: [[[0, 7], [5, 7]], [[2.5, 7], [2.5, 0]], [[0, 0], [5, 0]]],
  J: [[[5, 7], [5, 0], [2, 0], [0, 2]]],
  K: [[[0, 0], [0, 7]], [[5, 7], [0, 3.5], [5, 0]]],
  L: [[[0, 7], [0, 0], [5, 0]]],
  M: [[[0, 0], [0, 7], [2.5, 3], [5, 7], [5, 0]]],
  N: [[[0, 0], [0, 7], [5, 0], [5, 7]]],
  O: [[[0, 0], [0, 7], [5, 7], [5, 0], [0, 0]]],
  P: [[[0, 0], [0, 7], [5, 7], [5, 3.5], [0, 3.5]]],
  Q: [[[0, 0], [0, 7], [5, 7], [5, 0], [0, 0]], [[3, 1.5], [5, 0]]],
  R: [[[0, 0], [0, 7], [5, 7], [5, 3.5], [0, 3.5]], [[0, 3.5], [5, 0]]],
  S: [[[5, 7], [0, 7], [0, 3.5], [5, 3.5], [5, 0], [0, 0]]],
  T: [[[0, 7], [5, 7]], [[2.5, 7], [2.5, 0]]],
  U: [[[0, 7], [0, 0], [5, 0], [5, 7]]],
  V: [[[0, 7], [2.5, 0], [5, 7]]],
  W: [[[0, 7], [1, 0], [2.5, 4], [4, 0], [5, 7]]],
  X: [[[0, 7], [5, 0]], [[5, 7], [0, 0]]],
  Y: [[[0, 7], [2.5, 3.5], [5, 7]], [[2.5, 3.5], [2.5, 0]]],
  Z: [[[0, 7], [5, 7], [0, 0], [5, 0]]],
  "/": [[[0, 0], [5, 7]]],
  "_": [[[0, 0], [5, 0]]],
  "-": [[[0, 3.5], [5, 3.5]]],
  ":": [[[2.5, 5.4], [2.5, 5]], [[2.5, 2], [2.5, 1.6]]],
  ".": [[[2.35, 0], [2.65, 0]]],
  "°": [[[2, 5], [2, 7], [4, 7], [4, 5], [2, 5]]],
  "³": [[[1.2, 7], [4.2, 7], [3, 5.6], [4.2, 5.6], [4.2, 4.2], [1.2, 4.2]]],
  "^": [[[0, 0], [2.5, 7], [5, 0]]],
  " ": [],
};

export function fmt(v: number | string, digits = 4): string {
  if (typeof v === "string") return v;
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v - Math.round(v)) < 10 ** -digits) return String(Math.round(v));
  return v.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
}

export function computeBands(start: number, end: number, step: number) {
  if (step <= 0) throw new Error("temp_step must be greater than 0.");
  if (start < end) throw new Error("start_temp must be greater than or equal to end_temp.");
  const exact = (start - end) / step;
  const nearest = Math.round(exact);
  return Math.max(1, (Math.abs(exact - nearest) < 1e-9 ? nearest : Math.ceil(exact)) + 1);
}

export function inferFirmwareMode(presetName: string): FirmwareMode {
  const key = presetName.toUpperCase();
  if (key.includes("BAMBU")) return "bambu";
  if (["SNAPMAKER_U1", "VORON", "CREALITY_K1", "CREALITY_K2", "SOVOL_SV08", "QIDI_Q1", "QIDI_PLUS4", "QIDI_X_PLUS_3", "QIDI_X_MAX_3"].some((t) => key.includes(t))) return "klipper";
  if (["PRUSA", "ENDER", "SOVOL_SV06", "ANYCUBIC", "ELEGOO", "FLASHFORGE", "ANKER", "SNAPMAKER_J1"].some((t) => key.includes(t))) return "marlin";
  return "unknown";
}

export function defaultPlacement(bedX: number, bedY: number) {
  if (bedX >= 220 && bedY >= 220) return { square_x: 10, square_y: 10, circle_diameter: 200 };
  return { square_x: 5, square_y: 5, circle_diameter: Math.max(1, Math.min(bedX, bedY) - 10) };
}

export function pointOnCircle(cx: number, cy: number, r: number, deg: number): Point {
  const th = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(th), cy + r * Math.sin(th)];
}

export function arcPoints(cx: number, cy: number, r: number, segments: number, zeroDeg: number, clockwise: boolean): Point[] {
  const sign = clockwise ? -1 : 1;
  return Array.from({ length: segments + 1 }, (_, i) => pointOnCircle(cx, cy, r, zeroDeg + sign * 360 * i / segments));
}

function dist(a: Point, b: Point) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function filamentArea(diameter: number) {
  return Math.PI * (diameter / 2) ** 2;
}

function lineWidthUnits(text: string) {
  return Math.max(0, text.length * 6 - 1);
}

function transform(p: Point, x0: number, y0: number, cell: number, xScale: number): Point {
  return [x0 + p[0] * cell * xScale, y0 + p[1] * cell];
}

function appendSegment(out: TypedSegment[], p0: Point | undefined, p1: Point | undefined, kind: SegmentKind) {
  if (!p0 || !p1 || dist(p0, p1) <= 0) return;
  out.push([p0, p1, kind]);
}

function buildGlyph(ch: string, x0: number, y0: number, cell: number, xScale: number) {
  const strokes = FONT[ch.toUpperCase()] ?? FONT[" "];
  const segs: TypedSegment[] = [];
  let pos: Point | undefined;
  let start: Point | undefined;
  for (const stroke of strokes) {
    const pts = stroke.map((p) => transform(p, x0, y0, cell, xScale));
    if (!pts.length) continue;
    start ??= pts[0];
    if (pos) appendSegment(segs, pos, pts[0], "connector");
    for (let i = 0; i < pts.length - 1; i++) appendSegment(segs, pts[i], pts[i + 1], "stroke");
    pos = pts[pts.length - 1];
  }
  return { segs, start, end: pos };
}

function reverseSegments(segs: TypedSegment[]): TypedSegment[] {
  return [...segs].reverse().map(([p0, p1, kind]) => [p1, p0, kind]);
}

function labelHeight(cfg: GeneratorConfig, lines: string[]) {
  if (cfg.label_height && cfg.label_height > 0) return cfg.label_height;
  const cellScale = cfg.label_x_scale;
  const maxUnits = Math.max(...lines.map(lineWidthUnits), 1);
  const maxWidth = cfg.circle_diameter - 2 * cfg.label_margin;
  const hByWidth = (maxWidth * 7) / (maxUnits * cellScale);
  const hByHeight = (cfg.circle_diameter * 0.38) / (lines.length + Math.max(0, lines.length - 1) * 0.65);
  return Math.max(1, Math.min(hByWidth, hByHeight));
}

export function makeLabelLines(cfg: GeneratorConfig) {
  const bandH = cfg.layers_per_band * cfg.layer_height;
  if (cfg.label_layout === "one-line") {
    return [
      `${cfg.printer_name}/${cfg.filament_name}/ND ${fmt(cfg.nozzle_size, 2)}mm start:${fmt(cfg.start_temp)}°C/dec:-${fmt(cfg.temp_step)}°C x ${cfg.layers_per_band} x ${fmt(bandH)}mm MAX MVS:${fmt(cfg.mvs_max)}mm³/s`,
    ];
  }
  return [
    `${cfg.printer_name}/${cfg.filament_name}/ND ${fmt(cfg.nozzle_size, 2)}mm`,
    `start:${fmt(cfg.start_temp)}°C/dec:-${fmt(cfg.temp_step)}°C x ${cfg.layers_per_band} x ${fmt(bandH)}mm`,
    `MAX MVS:${fmt(cfg.mvs_max)}mm³/s`,
  ];
}

export function buildLabelSegments(cfg: GeneratorConfig): TypedSegment[] {
  if (!cfg.label) return [];
  const lines = makeLabelLines(cfg);
  let charH = labelHeight(cfg, lines);
  charH = Math.min(charH, cfg.circle_diameter >= 200 ? 10 : 5);
  const cell = charH / 7;
  const lineGap = charH * 0.65;
  const centerX = cfg.square_x + cfg.circle_diameter / 2;
  const centerY = cfg.square_y + cfg.circle_diameter / 2;
  const widths = lines.map((s) => lineWidthUnits(s) * cell * cfg.label_x_scale);
  const blockH = lines.length * charH + Math.max(0, lines.length - 1) * lineGap;
  const topY = centerY + blockH / 2 - charH;
  const all: TypedSegment[] = [];
  let pos: Point | undefined;

  lines.forEach((text, li) => {
    const y0 = topY - li * (charH + lineGap);
    const xLeft = centerX - widths[li] / 2;
    const rtl = li % 2 === 1;
    const order = rtl ? [...text].map((_, i) => text.length - 1 - i) : [...text].map((_, i) => i);
    order.forEach((ci) => {
      const built = buildGlyph(text[ci], xLeft + ci * 6 * cell * cfg.label_x_scale, y0, cell, cfg.label_x_scale);
      let segs = built.segs;
      let start = built.start;
      let end = built.end;
      if (rtl) {
        segs = reverseSegments(segs);
        start = built.end;
        end = built.start;
      }
      if (pos && start) appendSegment(all, pos, start, "connector");
      all.push(...segs);
      pos = end;
    });
  });

  return all;
}

function emitFirmwareMotionBlock(lines: string[], cfg: GeneratorConfig) {
  lines.push("", "; ---------- firmware motion hint ----------", `; firmware_mode=${cfg.firmware_mode}`);
  if (cfg.firmware_mode === "klipper") {
    lines.push(`SET_VELOCITY_LIMIT VELOCITY=${fmt(cfg.motion_velocity)} ACCEL=${fmt(cfg.motion_accel)} MINIMUM_CRUISE_RATIO=${fmt(cfg.motion_minimum_cruise_ratio)} SQUARE_CORNER_VELOCITY=${fmt(cfg.motion_square_corner_velocity)}`);
    lines.push(`M204 S${fmt(cfg.motion_accel)}`, "M220 S100");
  } else if (cfg.firmware_mode === "marlin") {
    lines.push(`M203 X${fmt(cfg.motion_velocity)} Y${fmt(cfg.motion_velocity)} Z20 E80`);
    lines.push(`M201 X${fmt(cfg.motion_accel)} Y${fmt(cfg.motion_accel)} Z300 E5000`);
    lines.push(`M204 S${fmt(cfg.motion_accel)}`, `M204 P${fmt(cfg.motion_accel)} T${fmt(cfg.motion_accel)}`);
    lines.push(`M205 X${fmt(cfg.motion_jerk)} Y${fmt(cfg.motion_jerk)} Z0.4 E5`, "M220 S100");
  } else if (cfg.firmware_mode === "bambu") {
    lines.push("; Bambu stock firmware is not Klipper. Keep this conservative.");
    lines.push(`M204 S${fmt(cfg.motion_accel)}`, `M204 P${fmt(cfg.motion_accel)} T${fmt(cfg.motion_accel)}`, "M220 S100");
  } else {
    lines.push("; firmware_mode=unknown: no acceleration/speed unlock code inserted", "; WARNING: acceleration/speed limits may not be unlocked");
  }
  lines.push("; ---------- end firmware motion hint ----------");
}

export function getPreviewData(cfg: GeneratorConfig): PreviewData {
  const radius = cfg.circle_diameter / 2;
  const cx = cfg.square_x + radius;
  const cy = cfg.square_y + radius;
  const circle = arcPoints(cx, cy, radius, Math.max(12, cfg.arc_segments), cfg.zero_angle_deg, cfg.clockwise);
  return {
    bed: { x: cfg.bed_x, y: cfg.bed_y },
    square: { x: cfg.square_x, y: cfg.square_y, d: cfg.circle_diameter },
    circle,
    labelSegments: buildLabelSegments(cfg),
    seam: circle[0],
    totalLayers: cfg.bands * cfg.layers_per_band,
    totalHeight: cfg.bands * cfg.layers_per_band * cfg.layer_height,
  };
}

export function makeGcode(cfg: GeneratorConfig) {
  const fa = filamentArea(cfg.filament_diameter);
  const crossSection = cfg.line_width * cfg.layer_height;
  const radius = cfg.circle_diameter / 2;
  const centerX = cfg.square_x + radius;
  const centerY = cfg.square_y + radius;
  const totalLayers = cfg.bands * cfg.layers_per_band;
  const totalHeight = totalLayers * cfg.layer_height;
  const pts = arcPoints(centerX, centerY, radius, cfg.arc_segments, cfg.zero_angle_deg, cfg.clockwise);
  const labelLines = makeLabelLines(cfg);
  const lines: string[] = [
    "; generated by mvs_calibrator web",
    "; purpose: melt-limit + in-layer continuous MVS ramp + printer presets + bounding-square placement + centered bottom label",
    `; printer_preset=${cfg.printer_preset}`,
    `; printer_name=${cfg.printer_name}`,
    `; preset_source=${cfg.source}`,
    `; filament_name=${cfg.filament_name}`,
    `; nozzle_size=${fmt(cfg.nozzle_size)}`,
    `; bed_x=${fmt(cfg.bed_x)}`,
    `; bed_y=${fmt(cfg.bed_y)}`,
    `; bed_z=${fmt(cfg.bed_z)}`,
    `; circle_diameter=${fmt(cfg.circle_diameter)}`,
    `; square_x=${fmt(cfg.square_x)}`,
    `; square_y=${fmt(cfg.square_y)}`,
    `; computed_center_x=${fmt(centerX)}`,
    `; computed_center_y=${fmt(centerY)}`,
    `; layer_height=${fmt(cfg.layer_height)}`,
    `; line_width=${fmt(cfg.line_width)}`,
    `; filament_diameter=${fmt(cfg.filament_diameter)}`,
    `; bands=${cfg.bands}`,
    `; layers_per_band=${cfg.layers_per_band}`,
    `; band_height=${fmt(cfg.layers_per_band * cfg.layer_height)}`,
    `; start_temp=${fmt(cfg.start_temp)}`,
    `; temp_step=${fmt(cfg.temp_step)}`,
    `; final_temp=${fmt(cfg.start_temp - cfg.temp_step * (cfg.bands - 1))}`,
    `; mvs_min=${fmt(cfg.mvs_min)}`,
    `; mvs_max=${fmt(cfg.mvs_max)}`,
    `; arc_segments=${cfg.arc_segments}`,
    `; total_height=${fmt(totalHeight)}`,
    `; zero_angle_deg=${fmt(cfg.zero_angle_deg)}`,
    `; clockwise=${cfg.clockwise ? 1 : 0}`,
    "; mvs_angle_map:",
    ";   0%=start/seam, 25%=quarter circle, 50%=half circle, 75%=three-quarter circle, 100%=end",
  ];

  [0, 25, 50, 75, 100].forEach((pct) => {
    const mvs = cfg.mvs_min + ((cfg.mvs_max - cfg.mvs_min) * pct) / 100;
    const speed = mvs > 0 ? mvs / crossSection : 0;
    const angle = cfg.zero_angle_deg + (cfg.clockwise ? -1 : 1) * 360 * pct / 100;
    lines.push(`;   ${String(pct).padStart(3)}% angle=${fmt(angle, 2)}deg MVS=${fmt(mvs, 3)}mm3/s XY_speed=${fmt(speed, 3)}mm/s F=${fmt(speed * 60, 1)}`);
  });

  lines.push("", "; ---------- USER SAFETY CHECK ----------", "; MVS=0 exactly means no movement/no extrusion. Use mvs-min 0.1 or higher for real measurement.", "; This build always generates standalone output.", "; Standalone start runs G28 before heating/waiting, then heat/prime/end G-code.", "; ---------------------------------------", "", "G90 ; absolute XYZ", "M83 ; relative extrusion", "M220 S100 ; speed factor", "M221 S100 ; flow factor");
  lines.push("", "; ---------- minimal standalone start ----------", "G28 ; home all axes first");
  emitFirmwareMotionBlock(lines, cfg);
  lines.push(`M140 S${fmt(cfg.bed_temp)}`, `M104 S${fmt(cfg.start_temp)}`, `M190 S${fmt(cfg.bed_temp)}`, `M109 S${fmt(cfg.start_temp)}`, "G92 E0", `G1 Z${fmt(cfg.layer_height)} F600`, `G1 X${fmt(Math.max(0, cfg.square_x - 8))} Y${fmt(cfg.square_y)} F6000`, `G1 X${fmt(Math.max(0, cfg.square_x - 8))} Y${fmt(cfg.square_y + cfg.circle_diameter)} E6 F600`, "G92 E0", "; ---------- end minimal standalone start ----------");

  let labelEnd: Point | undefined;
  if (cfg.label) {
    lines.push(`SET_HEATER_TEMPERATURE HEATER=${cfg.heater} TARGET=${fmt(cfg.start_temp)}`);
    lines.push(`TEMPERATURE_WAIT SENSOR=${cfg.heater} MINIMUM=${fmt(cfg.start_temp - cfg.temp_wait_tolerance)}`);
    const typed = buildLabelSegments(cfg);
    lines.push("", "; ---------- bottom inner label ----------", "; label_toolpath=txt_shx_multistroke_width_split_boustrophedon_connected", "; label_visual_layout=three_line_default", "; label_path_order=line1_LTR_line2_RTL_line3_LTR", "; label_width_mode=stroke_vs_connector", `; label_stroke_width=${fmt(cfg.label_stroke_width)}`, `; label_connector_width=${fmt(cfg.label_connector_width)}`, `; label_layout=${cfg.label_layout}`, `; label_lines=${labelLines.join(" | ")}`, `; label_segments_total=${typed.length}`, `; label_segments_stroke=${typed.filter((s) => s[2] === "stroke").length}`, `; label_segments_connector=${typed.filter((s) => s[2] === "connector").length}`);
    if (typed.length) {
      const start = typed[0][0];
      lines.push(`G0 Z${fmt(cfg.layer_height)} F${fmt(cfg.z_travel_speed * 60, 1)}`);
      lines.push(`G0 X${fmt(start[0])} Y${fmt(start[1])} F${fmt(cfg.travel_speed * 60, 1)} ; label start, only travel move`);
      let eTotal = 0;
      typed.forEach(([p0, p1, kind]) => {
        const width = kind === "stroke" ? cfg.label_stroke_width : cfg.label_connector_width;
        const e = (dist(p0, p1) * width * cfg.layer_height / fa) * cfg.extrusion_multiplier;
        eTotal += e;
        labelEnd = p1;
        lines.push(`G1 X${fmt(p1[0])} Y${fmt(p1[1])} E${fmt(e, 5)} F${fmt(cfg.label_speed * 60, 1)} ; label_${kind} width=${fmt(width)}`);
      });
      lines.push(`; label_estimated_E_mm=${fmt(eTotal, 3)}`);
    } else {
      lines.push("; label skipped: no typed segments");
    }
    lines.push("; ---------- end bottom inner label ----------");
  }

  let currentTemp: number | undefined;
  let estimatedE = 0;
  for (let layer = 1; layer <= totalLayers; layer++) {
    const z = layer * cfg.layer_height;
    const band = Math.floor((layer - 1) / cfg.layers_per_band);
    const layerInBand = ((layer - 1) % cfg.layers_per_band) + 1;
    const targetTemp = cfg.start_temp - cfg.temp_step * band;
    lines.push("", `;LAYER:${layer}`, `;Z:${fmt(z)}`, `;TEMP_BAND:${band + 1}`, `;LAYER_IN_TEMP_BAND:${layerInBand}/${cfg.layers_per_band}`, `;TARGET_TEMP:${fmt(targetTemp)}`);
    if (currentTemp !== targetTemp) {
      lines.push(`; temp change: ${currentTemp === undefined ? "initial" : fmt(currentTemp)} -> ${fmt(targetTemp)}`);
      lines.push(`SET_HEATER_TEMPERATURE HEATER=${cfg.heater} TARGET=${fmt(targetTemp)}`);
      lines.push(`TEMPERATURE_WAIT SENSOR=${cfg.heater} ${currentTemp === undefined || targetTemp > currentTemp ? "MINIMUM" : "MAXIMUM"}=${fmt(targetTemp + (currentTemp === undefined || targetTemp > currentTemp ? -cfg.temp_wait_tolerance : cfg.temp_wait_tolerance))}`);
      currentTemp = targetTemp;
    }

    const start = pts[0];
    if (layer === 1 && labelEnd) {
      const e = dist(labelEnd, start) * cfg.label_connector_width * cfg.layer_height / fa * cfg.extrusion_multiplier;
      estimatedE += e;
      lines.push("; label end -> seam connector: continue extrusion, no G0 travel");
      lines.push(`G1 X${fmt(start[0])} Y${fmt(start[1])} E${fmt(e, 5)} F${fmt(cfg.label_speed * 60, 1)} ; label_connector_to_seam width=${fmt(cfg.label_connector_width)}`);
    } else {
      lines.push(`G0 Z${fmt(z)} F${fmt(cfg.z_travel_speed * 60, 1)}`);
      lines.push(`G0 X${fmt(start[0])} Y${fmt(start[1])} F${fmt(cfg.travel_speed * 60, 1)} ; seam / 0% MVS point on bounding square edge`);
    }
    if (cfg.retract > 0) {
      lines.push(`G1 E-${fmt(cfg.retract)} F${fmt(cfg.retract_speed * 60, 1)} ; retract`, `G1 E${fmt(cfg.retract)} F${fmt(cfg.retract_speed * 60, 1)} ; unretract`);
    }
    for (let i = 0; i < cfg.arc_segments; i++) {
      const progressMid = (i + 0.5) / cfg.arc_segments;
      const requestedMvs = cfg.mvs_min + (cfg.mvs_max - cfg.mvs_min) * progressMid;
      let xySpeed = requestedMvs > 0 ? requestedMvs / crossSection : cfg.min_xy_speed;
      let actualMvs = xySpeed * crossSection;
      if (cfg.max_xy_speed > 0 && xySpeed > cfg.max_xy_speed) {
        xySpeed = cfg.max_xy_speed;
        actualMvs = xySpeed * crossSection;
      }
      const b = pts[i + 1];
      const e = dist(pts[i], b) * crossSection / fa * cfg.extrusion_multiplier;
      estimatedE += e;
      lines.push(`G1 X${fmt(b[0])} Y${fmt(b[1])} E${fmt(e, 5)} F${fmt(xySpeed * 60, 1)} ; pct=${fmt(progressMid * 100, 2)} req_MVS=${fmt(requestedMvs, 3)} actual_MVS=${fmt(actualMvs, 3)}`);
    }
  }

  lines.push("", "; ---------- end of calibration body ----------", `; estimated_total_filament_E_mm=${fmt(estimatedE, 3)}`, "", "; ---------- minimal standalone end ----------", "G92 E0", "G1 E-2 F1800", `G0 Z${fmt(totalHeight + 10)} F1200`, "M104 S0", "M140 S0", "M106 S0", "G90", "; ---------- end minimal standalone end ----------");
  return `${lines.join("\n")}\n`;
}
