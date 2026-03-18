/**
 * Sprinkler Takeoff Formula Engine
 * 
 * The user enters high-level "head inputs" (head count, pipe per head, 
 * fittings per head, etc.) and this engine expands them into the full
 * labor and material line-item lists — matching the SPK spreadsheet logic.
 */

/**
 * @param {object} inputs - The user-facing inputs for a sprinkler area
 * @param {object} materialPriceMap - { "PIPE SCH 40 1\"": 1.92, ... } keyed by generic_part_name
 * @returns {{ labor_items: [], material_items: [], total_labor: number, total_material: number }}
 */
export function calculateSprinklerTakeoff(inputs, materialPriceMap = {}) {
  const {
    // Heads
    heads_concealed = 0,
    heads_pendant = 0,
    heads_upright = 0,
    heads_sidewall = 0,

    // Branch pipe per head (LF)
    pipe_1in_lf = 0,
    pipe_1_25in_lf = 0,
    pipe_1_5in_lf = 0,
    pipe_2in_lf = 0,

    // Mains / cross mains (LF)
    pipe_2_5in_lf = 0,
    pipe_3in_lf = 0,
    pipe_4in_lf = 0,
    pipe_6in_lf = 0,

    // Fittings (counts)
    threaded_fittings = 0,
    grooved_fittings = 0,
    welded_fittings = 0,

    // Valves / trim
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

    // Hangers / bracing
    hangers = 0,
    seismic_braces = 0,

    // Misc
    vertical_riser_lf = 0,
    hoisting_floors = 0,

    // Labor rate ($/hr) — used to convert labor hours to $
    labor_rate = 85,

    // Design
    total_design = 0,
  } = inputs;

  const totalHeads = heads_concealed + heads_pendant + heads_upright + heads_sidewall;

  // ── LABOR (hours × labor_rate = $) ──────────────────────────────────────
  const laborLines = [
    { item: "SPRINKLER HEADS",           quantity: totalHeads,             factor: 0.50 },
    { item: "1\" PIPE (LF)",             quantity: pipe_1in_lf,            factor: 0.05 },
    { item: "1¼\" PIPE (LF)",            quantity: pipe_1_25in_lf,         factor: 0.06 },
    { item: "1½\" PIPE (LF)",            quantity: pipe_1_5in_lf,          factor: 0.07 },
    { item: "2\" PIPE (LF)",             quantity: pipe_2in_lf,            factor: 0.08 },
    { item: "2½\" PIPE (LF)",            quantity: pipe_2_5in_lf,          factor: 0.10 },
    { item: "3\" PIPE (LF)",             quantity: pipe_3in_lf,            factor: 0.12 },
    { item: "4\" PIPE (LF)",             quantity: pipe_4in_lf,            factor: 0.15 },
    { item: "6\" PIPE (LF)",             quantity: pipe_6in_lf,            factor: 0.20 },
    { item: "HANGERS",                   quantity: hangers,                factor: 0.25 },
    { item: "SEISMIC BRACING",           quantity: seismic_braces,         factor: 0.75 },
    { item: "THREADED FITTINGS",         quantity: threaded_fittings,      factor: 0.20 },
    { item: "GROOVED FITTINGS",          quantity: grooved_fittings,       factor: 0.35 },
    { item: "WELDED FITTINGS",           quantity: welded_fittings,        factor: 0.50 },
    { item: "VALVES",                    quantity: osy_valves_4in + osy_valves_6in + butterfly_valves_4in + check_valves_4in, factor: 0.75 },
    { item: "ALARM CHECK VALVE",         quantity: alarm_check_valves_4in, factor: 6.00 },
    { item: "BACKFLOW PREVENTER",        quantity: backflow_preventers_4in + backflow_preventers_6in, factor: 8.00 },
    { item: "RISER ASSEMBLY",            quantity: riser_assemblies,       factor: 4.00 },
    { item: "INSPECTOR TEST CONNECTION", quantity: inspector_test_conns,   factor: 2.00 },
    { item: "FLOW SWITCH",              quantity: flow_switches,           factor: 1.50 },
    { item: "TAMPER SWITCH",            quantity: tamper_switches,         factor: 1.00 },
    { item: "GAUGE",                    quantity: pressure_gauges,         factor: 0.50 },
    { item: "DRAIN",                    quantity: drain_valves,            factor: 0.75 },
    { item: "VERTICAL RISER PIPE (LF)", quantity: vertical_riser_lf,      factor: 0.20 },
    { item: "HOISTING / VERTICAL DIST", quantity: hoisting_floors,        factor: 1.00 },
  ].filter(l => l.quantity > 0).map(l => ({
    ...l,
    total: l.quantity * l.factor * labor_rate,
    is_manual: false,
  }));

  // ── MATERIAL ─────────────────────────────────────────────────────────────
  const price = (name) => materialPriceMap[name] ?? 0;

  const materialLines = [
    { item: "PIPE SCH 40 1\"",            quantity: pipe_1in_lf,            price: price("PIPE SCH 40 1\"") },
    { item: "PIPE SCH 40 1¼\"",           quantity: pipe_1_25in_lf,         price: price("PIPE SCH 40 1¼\"") },
    { item: "PIPE SCH 40 1½\"",           quantity: pipe_1_5in_lf,          price: price("PIPE SCH 40 1½\"") },
    { item: "PIPE SCH 40 2\"",            quantity: pipe_2in_lf,            price: price("PIPE SCH 40 2\"") },
    { item: "PIPE SCH 40 2½\"",           quantity: pipe_2_5in_lf,          price: price("PIPE SCH 40 2½\"") },
    { item: "PIPE SCH 40 3\"",            quantity: pipe_3in_lf,            price: price("PIPE SCH 40 3\"") },
    { item: "PIPE SCH 40 4\"",            quantity: pipe_4in_lf,            price: price("PIPE SCH 40 4\"") },
    { item: "PIPE SCH 40 6\"",            quantity: pipe_6in_lf,            price: price("PIPE SCH 40 6\"") },
    { item: "SPRINKLER HEAD - CONCEALED", quantity: heads_concealed,        price: price("SPRINKLER HEAD - CONCEALED") },
    { item: "SPRINKLER HEAD - PENDANT",   quantity: heads_pendant,          price: price("SPRINKLER HEAD - PENDANT") },
    { item: "SPRINKLER HEAD - UPRIGHT",   quantity: heads_upright,          price: price("SPRINKLER HEAD - UPRIGHT") },
    { item: "SPRINKLER HEAD - SIDEWALL",  quantity: heads_sidewall,         price: price("SPRINKLER HEAD - SIDEWALL") },
    { item: "HANGER W/TBC 1\"-2\"",       quantity: hangers,                price: price("HANGER W/TBC 1\"-2\"") },
    { item: "SEISMIC BRACE ASSEMBLY",     quantity: seismic_braces,         price: price("SEISMIC BRACE ASSEMBLY") },
    { item: "THREADED FITTINGS (ea)",     quantity: threaded_fittings,      price: price("ELBOW 1\" THREADED") || 0.75 },
    { item: "GROOVED FITTINGS (ea)",      quantity: grooved_fittings,       price: price("COUPLING 2\" GROOVED") || 6.50 },
    { item: "OS&Y VALVE 4\"",             quantity: osy_valves_4in,         price: price("OS&Y VALVE 4\"") },
    { item: "OS&Y VALVE 6\"",             quantity: osy_valves_6in,         price: price("OS&Y VALVE 6\"") },
    { item: "BUTTERFLY VALVE 4\"",        quantity: butterfly_valves_4in,   price: price("BUTTERFLY VALVE 4\"") },
    { item: "CHECK VALVE 4\"",            quantity: check_valves_4in,       price: price("CHECK VALVE 4\"") },
    { item: "ALARM CHECK VALVE 4\"",      quantity: alarm_check_valves_4in, price: price("ALARM CHECK VALVE 4\"") },
    { item: "BACKFLOW PREVENTER 4\"",     quantity: backflow_preventers_4in,price: price("BACKFLOW PREVENTER 4\"") },
    { item: "BACKFLOW PREVENTER 6\"",     quantity: backflow_preventers_6in,price: price("BACKFLOW PREVENTER 6\"") },
    { item: "FLOW SWITCH",               quantity: flow_switches,           price: price("FLOW SWITCH") },
    { item: "TAMPER SWITCH",             quantity: tamper_switches,         price: price("TAMPER SWITCH") },
    { item: "PRESSURE GAUGE",            quantity: pressure_gauges,         price: price("PRESSURE GAUGE") },
    { item: "INSPECTOR TEST CONN",       quantity: inspector_test_conns,    price: price("INSPECTOR TEST CONN") },
    { item: "DRAIN VALVE 2\"",           quantity: drain_valves,            price: price("DRAIN VALVE 2\"") },
  ].filter(m => m.quantity > 0 && m.price > 0).map(m => ({
    ...m,
    total: m.quantity * m.price,
  }));

  const total_labor = laborLines.reduce((s, l) => s + l.total, 0);
  const total_material = materialLines.reduce((s, m) => s + m.total, 0);

  return { labor_items: laborLines, material_items: materialLines, total_labor, total_material, total_design };
}

// Default inputs shape (all zeros) — used to init a new section
export const DEFAULT_SPRINKLER_INPUTS = {
  heads_concealed: 0,
  heads_pendant: 0,
  heads_upright: 0,
  heads_sidewall: 0,
  pipe_1in_lf: 0,
  pipe_1_25in_lf: 0,
  pipe_1_5in_lf: 0,
  pipe_2in_lf: 0,
  pipe_2_5in_lf: 0,
  pipe_3in_lf: 0,
  pipe_4in_lf: 0,
  pipe_6in_lf: 0,
  threaded_fittings: 0,
  grooved_fittings: 0,
  welded_fittings: 0,
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
  hangers: 0,
  seismic_braces: 0,
  vertical_riser_lf: 0,
  hoisting_floors: 0,
  labor_rate: 85,
  total_design: 0,
};