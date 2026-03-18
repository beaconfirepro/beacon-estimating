/**
 * Sprinkler Takeoff Formula Engine
 */

// ── Criteria multiplier tables ────────────────────────────────────────────

// Labor classification: adjusts the base labor factor (1 = easiest, 5 = hardest)
const LABOR_CLASS_MULTIPLIER = { 1: 0.85, 2: 0.92, 3: 1.00, 4: 1.10, 5: 1.20 };

// Hoisting / vertical distribution: adds to pipe & head labor
const HOISTING_ADDER = { none: 0, "20ft": 0.05, "40ft": 0.10, "60ft+": 0.15 };

// Project size: small jobs are less efficient
const PROJECT_SIZE_MULTIPLIER = { small: 1.15, medium: 1.00, large: 0.92 };

// System type: dry/preaction adds labor due to complexity
const SYSTEM_TYPE_MULTIPLIER = { wet: 1.00, dry: 1.12, preaction: 1.18 };

// Seismic: adds a factor to all pipe labor when active
const SEISMIC_MAINS_ADDER = 0.03;   // added to per-LF factors on 2.5"+ mains
const SEISMIC_LINES_ADDER = 0.02;   // added to per-LF factors on 1"-2" branch

export function calculateSprinklerTakeoff(inputs, materialPriceMap = {}) {
  const {
    // ── Heads ──
    heads_concealed = 0,
    heads_pendant = 0,
    heads_upright = 0,
    heads_sidewall = 0,

    // ── Pipe (LF) ──
    pipe_1in_lf = 0,
    pipe_1_25in_lf = 0,
    pipe_1_5in_lf = 0,
    pipe_2in_lf = 0,
    pipe_2_5in_lf = 0,
    pipe_3in_lf = 0,
    pipe_4in_lf = 0,
    pipe_6in_lf = 0,

    // ── Threaded Fittings (ea) ──
    thr_elbow_1in = 0,
    thr_elbow_1_25in = 0,
    thr_elbow_1_5in = 0,
    thr_elbow_2in = 0,
    thr_tee_1in = 0,
    thr_tee_1_25in = 0,
    thr_tee_1_5in = 0,
    thr_tee_2in = 0,
    thr_reducer_1in = 0,
    thr_reducer_1_25in = 0,
    thr_reducer_1_5in = 0,
    thr_reducer_2in = 0,
    thr_coupling_1in = 0,
    thr_coupling_1_25in = 0,
    thr_coupling_1_5in = 0,
    thr_coupling_2in = 0,

    // ── Grooved Fittings (ea) ──
    grv_coupling_2_5in = 0,
    grv_coupling_3in = 0,
    grv_coupling_4in = 0,
    grv_coupling_6in = 0,
    grv_elbow_2_5in = 0,
    grv_elbow_3in = 0,
    grv_elbow_4in = 0,
    grv_elbow_6in = 0,
    grv_tee_2_5in = 0,
    grv_tee_3in = 0,
    grv_tee_4in = 0,
    grv_tee_6in = 0,
    grv_reducer_2_5in = 0,
    grv_reducer_3in = 0,
    grv_reducer_4in = 0,
    grv_reducer_6in = 0,

    // ── Welded Fittings (ea) ──
    wld_elbow_4in = 0,
    wld_elbow_6in = 0,
    wld_tee_4in = 0,
    wld_tee_6in = 0,
    wld_reducer_4in = 0,
    wld_reducer_6in = 0,

    // ── Hangers & Bracing ──
    hangers_1in_2in = 0,
    hangers_2_5in_4in = 0,
    seismic_braces = 0,

    // ── Valves & Controls ──
    osy_valves_4in = 0,
    osy_valves_6in = 0,
    butterfly_valves_4in = 0,
    check_valves_4in = 0,
    alarm_check_valves_4in = 0,
    backflow_preventers_4in = 0,
    backflow_preventers_6in = 0,
    flow_switches = 0,
    tamper_switches = 0,
    pressure_gauges = 0,
    inspector_test_conns = 0,
    drain_valves = 0,
    riser_assemblies = 0,

    // ── Misc ──
    vertical_riser_lf = 0,
    hoisting_floors = 0,

    // ── Criteria selectors ──
    labor_class = 1,
    hoisting_type = "none",
    project_size = "medium",
    system_type = "wet",
    seismic_mains = "no",
    seismic_lines = "no",

    // ── Rates ──
    labor_rate = 85,
    total_design = 0,
  } = inputs;

  const totalHeads = heads_concealed + heads_pendant + heads_upright + heads_sidewall;

  // Build composite multipliers from criteria
  const classM   = LABOR_CLASS_MULTIPLIER[labor_class]   ?? 1.00;
  const sizeM    = PROJECT_SIZE_MULTIPLIER[project_size]  ?? 1.00;
  const sysM     = SYSTEM_TYPE_MULTIPLIER[system_type]    ?? 1.00;
  const hoistAdd = HOISTING_ADDER[hoisting_type]          ?? 0;
  const seisMain = seismic_mains === "yes" ? SEISMIC_MAINS_ADDER : 0;
  const seisLine = seismic_lines === "yes" ? SEISMIC_LINES_ADDER : 0;

  // Overall multiplier for most items
  const M = classM * sizeM * sysM;

  // Factor helpers
  const lf = (base, seisAdder = 0) => (base + seisAdder + hoistAdd) * M;
  const ea = (base) => base * M;
  const totalHandlers = hangers_1in_2in + hangers_2_5in_4in;

  // Aggregate fitting totals for labor
  const totalThreadedFittings =
    thr_elbow_1in + thr_elbow_1_25in + thr_elbow_1_5in + thr_elbow_2in +
    thr_tee_1in + thr_tee_1_25in + thr_tee_1_5in + thr_tee_2in +
    thr_reducer_1in + thr_reducer_1_25in + thr_reducer_1_5in + thr_reducer_2in +
    thr_coupling_1in + thr_coupling_1_25in + thr_coupling_1_5in + thr_coupling_2in;

  const totalGroovedFittings =
    grv_coupling_2_5in + grv_coupling_3in + grv_coupling_4in + grv_coupling_6in +
    grv_elbow_2_5in + grv_elbow_3in + grv_elbow_4in + grv_elbow_6in +
    grv_tee_2_5in + grv_tee_3in + grv_tee_4in + grv_tee_6in +
    grv_reducer_2_5in + grv_reducer_3in + grv_reducer_4in + grv_reducer_6in;

  const totalWeldedFittings =
    wld_elbow_4in + wld_elbow_6in +
    wld_tee_4in + wld_tee_6in +
    wld_reducer_4in + wld_reducer_6in;

  const totalGateValves = osy_valves_4in + osy_valves_6in + butterfly_valves_4in + check_valves_4in;

  // ── LABOR (factors adjusted by criteria multipliers) ─────────────────────
  const laborLines = [
    { item: "SPRINKLER HEADS",           quantity: totalHeads,              factor: ea(0.50) },
    { item: "1\" PIPE (LF)",             quantity: pipe_1in_lf,             factor: lf(0.05, seisLine) },
    { item: "1¼\" PIPE (LF)",            quantity: pipe_1_25in_lf,          factor: lf(0.06, seisLine) },
    { item: "1½\" PIPE (LF)",            quantity: pipe_1_5in_lf,           factor: lf(0.07, seisLine) },
    { item: "2\" PIPE (LF)",             quantity: pipe_2in_lf,             factor: lf(0.08, seisLine) },
    { item: "2½\" PIPE (LF)",            quantity: pipe_2_5in_lf,           factor: lf(0.10, seisMain) },
    { item: "3\" PIPE (LF)",             quantity: pipe_3in_lf,             factor: lf(0.12, seisMain) },
    { item: "4\" PIPE (LF)",             quantity: pipe_4in_lf,             factor: lf(0.15, seisMain) },
    { item: "6\" PIPE (LF)",             quantity: pipe_6in_lf,             factor: lf(0.20, seisMain) },
    { item: "HANGERS",                   quantity: totalHandlers,           factor: ea(0.25) },
    { item: "SEISMIC BRACING",           quantity: seismic_braces,          factor: ea(0.75) },
    { item: "THREADED FITTINGS",         quantity: totalThreadedFittings,   factor: ea(0.20) },
    { item: "GROOVED FITTINGS",          quantity: totalGroovedFittings,    factor: ea(0.35) },
    { item: "WELDED FITTINGS",           quantity: totalWeldedFittings,     factor: ea(0.50) },
    { item: "VALVES",                    quantity: totalGateValves,         factor: ea(0.75) },
    { item: "ALARM CHECK VALVE",         quantity: alarm_check_valves_4in,  factor: ea(6.00) },
    { item: "BACKFLOW PREVENTER",        quantity: backflow_preventers_4in + backflow_preventers_6in, factor: ea(8.00) },
    { item: "RISER ASSEMBLY",            quantity: riser_assemblies,        factor: ea(4.00) },
    { item: "INSPECTOR TEST CONNECTION", quantity: inspector_test_conns,    factor: ea(2.00) },
    { item: "FLOW SWITCH",               quantity: flow_switches,           factor: ea(1.50) },
    { item: "TAMPER SWITCH",             quantity: tamper_switches,         factor: ea(1.00) },
    { item: "GAUGE",                     quantity: pressure_gauges,         factor: ea(0.50) },
    { item: "DRAIN",                     quantity: drain_valves,            factor: ea(0.75) },
    { item: "VERTICAL RISER PIPE (LF)",  quantity: vertical_riser_lf,       factor: lf(0.20) },
    { item: "HOISTING / VERTICAL DIST",  quantity: hoisting_floors,         factor: ea(1.00) },
  ].filter(l => l.quantity > 0).map(l => ({
    ...l,
    total: l.quantity * l.factor * labor_rate,
    is_manual: false,
  }));

  // ── MATERIAL ─────────────────────────────────────────────────────────────
  const price = (name, fallback = 0) => materialPriceMap[name] ?? fallback;

  const rawMaterial = [
    // Pipe
    { item: "PIPE SCH 40 1\"",             quantity: pipe_1in_lf,          price: price("PIPE SCH 40 1\"") },
    { item: "PIPE SCH 40 1¼\"",            quantity: pipe_1_25in_lf,       price: price("PIPE SCH 40 1¼\"") },
    { item: "PIPE SCH 40 1½\"",            quantity: pipe_1_5in_lf,        price: price("PIPE SCH 40 1½\"") },
    { item: "PIPE SCH 40 2\"",             quantity: pipe_2in_lf,          price: price("PIPE SCH 40 2\"") },
    { item: "PIPE SCH 40 2½\"",            quantity: pipe_2_5in_lf,        price: price("PIPE SCH 40 2½\"") },
    { item: "PIPE SCH 40 3\"",             quantity: pipe_3in_lf,          price: price("PIPE SCH 40 3\"") },
    { item: "PIPE SCH 40 4\"",             quantity: pipe_4in_lf,          price: price("PIPE SCH 40 4\"") },
    { item: "PIPE SCH 40 6\"",             quantity: pipe_6in_lf,          price: price("PIPE SCH 40 6\"") },
    // Heads
    { item: "SPRINKLER HEAD - CONCEALED",  quantity: heads_concealed,      price: price("SPRINKLER HEAD - CONCEALED") },
    { item: "SPRINKLER HEAD - PENDANT",    quantity: heads_pendant,        price: price("SPRINKLER HEAD - PENDANT") },
    { item: "SPRINKLER HEAD - UPRIGHT",    quantity: heads_upright,        price: price("SPRINKLER HEAD - UPRIGHT") },
    { item: "SPRINKLER HEAD - SIDEWALL",   quantity: heads_sidewall,       price: price("SPRINKLER HEAD - SIDEWALL") },
    // Hangers
    { item: "HANGER W/TBC 1\"-2\"",        quantity: hangers_1in_2in,      price: price("HANGER W/TBC 1\"-2\"") },
    { item: "HANGER W/TBC 2½\"-4\"",       quantity: hangers_2_5in_4in,    price: price("HANGER W/TBC 2½\"-4\"") },
    { item: "SEISMIC BRACE ASSEMBLY",      quantity: seismic_braces,       price: price("SEISMIC BRACE ASSEMBLY") },
    // Threaded Fittings
    { item: "ELBOW 1\" THREADED",          quantity: thr_elbow_1in,        price: price("ELBOW 1\" THREADED", 0.75) },
    { item: "ELBOW 1¼\" THREADED",         quantity: thr_elbow_1_25in,     price: price("ELBOW 1¼\" THREADED", 0.90) },
    { item: "ELBOW 1½\" THREADED",         quantity: thr_elbow_1_5in,      price: price("ELBOW 1½\" THREADED", 1.10) },
    { item: "ELBOW 2\" THREADED",          quantity: thr_elbow_2in,        price: price("ELBOW 2\" THREADED", 1.50) },
    { item: "TEE 1\" THREADED",            quantity: thr_tee_1in,          price: price("TEE 1\" THREADED", 1.00) },
    { item: "TEE 1¼\" THREADED",           quantity: thr_tee_1_25in,       price: price("TEE 1¼\" THREADED", 1.20) },
    { item: "TEE 1½\" THREADED",           quantity: thr_tee_1_5in,        price: price("TEE 1½\" THREADED", 1.50) },
    { item: "TEE 2\" THREADED",            quantity: thr_tee_2in,          price: price("TEE 2\" THREADED", 2.00) },
    { item: "REDUCER 1\" THREADED",        quantity: thr_reducer_1in,      price: price("REDUCER 1\" THREADED", 0.60) },
    { item: "REDUCER 1¼\" THREADED",       quantity: thr_reducer_1_25in,   price: price("REDUCER 1¼\" THREADED", 0.75) },
    { item: "REDUCER 1½\" THREADED",       quantity: thr_reducer_1_5in,    price: price("REDUCER 1½\" THREADED", 0.90) },
    { item: "REDUCER 2\" THREADED",        quantity: thr_reducer_2in,      price: price("REDUCER 2\" THREADED", 1.25) },
    { item: "COUPLING 1\" THREADED",       quantity: thr_coupling_1in,     price: price("COUPLING 1\" THREADED", 0.50) },
    { item: "COUPLING 1¼\" THREADED",      quantity: thr_coupling_1_25in,  price: price("COUPLING 1¼\" THREADED", 0.65) },
    { item: "COUPLING 1½\" THREADED",      quantity: thr_coupling_1_5in,   price: price("COUPLING 1½\" THREADED", 0.80) },
    { item: "COUPLING 2\" THREADED",       quantity: thr_coupling_2in,     price: price("COUPLING 2\" THREADED", 1.10) },
    // Grooved Fittings
    { item: "COUPLING 2½\" GROOVED",       quantity: grv_coupling_2_5in,   price: price("COUPLING 2½\" GROOVED", 9.50) },
    { item: "COUPLING 3\" GROOVED",        quantity: grv_coupling_3in,     price: price("COUPLING 3\" GROOVED", 11.00) },
    { item: "COUPLING 4\" GROOVED",        quantity: grv_coupling_4in,     price: price("COUPLING 4\" GROOVED", 16.00) },
    { item: "COUPLING 6\" GROOVED",        quantity: grv_coupling_6in,     price: price("COUPLING 6\" GROOVED", 28.00) },
    { item: "ELBOW 2½\" GROOVED",          quantity: grv_elbow_2_5in,      price: price("ELBOW 2½\" GROOVED", 11.00) },
    { item: "ELBOW 3\" GROOVED",           quantity: grv_elbow_3in,        price: price("ELBOW 3\" GROOVED", 14.00) },
    { item: "ELBOW 4\" GROOVED",           quantity: grv_elbow_4in,        price: price("ELBOW 4\" GROOVED", 21.00) },
    { item: "ELBOW 6\" GROOVED",           quantity: grv_elbow_6in,        price: price("ELBOW 6\" GROOVED", 38.00) },
    { item: "TEE 2½\" GROOVED",            quantity: grv_tee_2_5in,        price: price("TEE 2½\" GROOVED", 14.00) },
    { item: "TEE 3\" GROOVED",             quantity: grv_tee_3in,          price: price("TEE 3\" GROOVED", 18.00) },
    { item: "TEE 4\" GROOVED",             quantity: grv_tee_4in,          price: price("TEE 4\" GROOVED", 28.00) },
    { item: "TEE 6\" GROOVED",             quantity: grv_tee_6in,          price: price("TEE 6\" GROOVED", 52.00) },
    { item: "REDUCER 2½\" GROOVED",        quantity: grv_reducer_2_5in,    price: price("REDUCER 2½\" GROOVED", 12.00) },
    { item: "REDUCER 3\" GROOVED",         quantity: grv_reducer_3in,      price: price("REDUCER 3\" GROOVED", 15.00) },
    { item: "REDUCER 4\" GROOVED",         quantity: grv_reducer_4in,      price: price("REDUCER 4\" GROOVED", 22.00) },
    { item: "REDUCER 6\" GROOVED",         quantity: grv_reducer_6in,      price: price("REDUCER 6\" GROOVED", 40.00) },
    // Welded Fittings
    { item: "ELBOW 4\" WELDED",            quantity: wld_elbow_4in,        price: price("ELBOW 4\" WELDED", 18.00) },
    { item: "ELBOW 6\" WELDED",            quantity: wld_elbow_6in,        price: price("ELBOW 6\" WELDED", 35.00) },
    { item: "TEE 4\" WELDED",              quantity: wld_tee_4in,          price: price("TEE 4\" WELDED", 22.00) },
    { item: "TEE 6\" WELDED",              quantity: wld_tee_6in,          price: price("TEE 6\" WELDED", 45.00) },
    { item: "REDUCER 4\" WELDED",          quantity: wld_reducer_4in,      price: price("REDUCER 4\" WELDED", 14.00) },
    { item: "REDUCER 6\" WELDED",          quantity: wld_reducer_6in,      price: price("REDUCER 6\" WELDED", 28.00) },
    // Valves
    { item: "OS&Y VALVE 4\"",              quantity: osy_valves_4in,       price: price("OS&Y VALVE 4\"") },
    { item: "OS&Y VALVE 6\"",              quantity: osy_valves_6in,       price: price("OS&Y VALVE 6\"") },
    { item: "BUTTERFLY VALVE 4\"",         quantity: butterfly_valves_4in, price: price("BUTTERFLY VALVE 4\"") },
    { item: "CHECK VALVE 4\"",             quantity: check_valves_4in,     price: price("CHECK VALVE 4\"") },
    { item: "ALARM CHECK VALVE 4\"",       quantity: alarm_check_valves_4in, price: price("ALARM CHECK VALVE 4\"") },
    { item: "BACKFLOW PREVENTER 4\"",      quantity: backflow_preventers_4in, price: price("BACKFLOW PREVENTER 4\"") },
    { item: "BACKFLOW PREVENTER 6\"",      quantity: backflow_preventers_6in, price: price("BACKFLOW PREVENTER 6\"") },
    // Controls / Trim
    { item: "FLOW SWITCH",                 quantity: flow_switches,        price: price("FLOW SWITCH") },
    { item: "TAMPER SWITCH",               quantity: tamper_switches,      price: price("TAMPER SWITCH") },
    { item: "PRESSURE GAUGE",              quantity: pressure_gauges,      price: price("PRESSURE GAUGE") },
    { item: "INSPECTOR TEST CONN",         quantity: inspector_test_conns, price: price("INSPECTOR TEST CONN") },
    { item: "DRAIN VALVE 2\"",             quantity: drain_valves,         price: price("DRAIN VALVE 2\"") },
  ].filter(m => m.quantity > 0 && m.price > 0).map(m => ({
    ...m,
    total: m.quantity * m.price,
  }));

  const total_labor = laborLines.reduce((s, l) => s + l.total, 0);
  const total_material = rawMaterial.reduce((s, m) => s + m.total, 0);

  return { labor_items: laborLines, material_items: rawMaterial, total_labor, total_material, total_design };
}

// Default inputs shape (all zeros)
export const DEFAULT_SPRINKLER_INPUTS = {
  // Heads
  heads_concealed: 0,
  heads_pendant: 0,
  heads_upright: 0,
  heads_sidewall: 0,
  // Pipe
  pipe_1in_lf: 0,
  pipe_1_25in_lf: 0,
  pipe_1_5in_lf: 0,
  pipe_2in_lf: 0,
  pipe_2_5in_lf: 0,
  pipe_3in_lf: 0,
  pipe_4in_lf: 0,
  pipe_6in_lf: 0,
  // Threaded fittings
  thr_elbow_1in: 0,
  thr_elbow_1_25in: 0,
  thr_elbow_1_5in: 0,
  thr_elbow_2in: 0,
  thr_tee_1in: 0,
  thr_tee_1_25in: 0,
  thr_tee_1_5in: 0,
  thr_tee_2in: 0,
  thr_reducer_1in: 0,
  thr_reducer_1_25in: 0,
  thr_reducer_1_5in: 0,
  thr_reducer_2in: 0,
  thr_coupling_1in: 0,
  thr_coupling_1_25in: 0,
  thr_coupling_1_5in: 0,
  thr_coupling_2in: 0,
  // Grooved fittings
  grv_coupling_2_5in: 0,
  grv_coupling_3in: 0,
  grv_coupling_4in: 0,
  grv_coupling_6in: 0,
  grv_elbow_2_5in: 0,
  grv_elbow_3in: 0,
  grv_elbow_4in: 0,
  grv_elbow_6in: 0,
  grv_tee_2_5in: 0,
  grv_tee_3in: 0,
  grv_tee_4in: 0,
  grv_tee_6in: 0,
  grv_reducer_2_5in: 0,
  grv_reducer_3in: 0,
  grv_reducer_4in: 0,
  grv_reducer_6in: 0,
  // Welded fittings
  wld_elbow_4in: 0,
  wld_elbow_6in: 0,
  wld_tee_4in: 0,
  wld_tee_6in: 0,
  wld_reducer_4in: 0,
  wld_reducer_6in: 0,
  // Hangers & bracing
  hangers_1in_2in: 0,
  hangers_2_5in_4in: 0,
  seismic_braces: 0,
  // Valves & controls
  osy_valves_4in: 0,
  osy_valves_6in: 0,
  butterfly_valves_4in: 0,
  check_valves_4in: 0,
  alarm_check_valves_4in: 0,
  backflow_preventers_4in: 0,
  backflow_preventers_6in: 0,
  flow_switches: 0,
  tamper_switches: 0,
  pressure_gauges: 0,
  inspector_test_conns: 0,
  drain_valves: 0,
  riser_assemblies: 0,
  // Misc
  vertical_riser_lf: 0,
  hoisting_floors: 0,
  // Criteria selectors
  labor_class: 1,
  hoisting_type: "none",
  project_size: "medium",
  system_type: "wet",
  seismic_mains: "no",
  seismic_lines: "no",
  // Rates
  labor_rate: 85,
  total_design: 0,
};