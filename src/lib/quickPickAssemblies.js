/**
 * Quick Pick Assembly Definitions
 * 
 * Each assembly defines a name, category, description, and a list of components.
 * Components reference the same field names used in formula_inputs / sprinklerFormulas.
 * 
 * "quantity" in each component means: per 1 unit of this assembly.
 * Fractional values are fine (e.g. 0.333 = 1 per 3 assemblies, rounded when applied).
 */

export const QUICK_PICK_CATEGORIES = [
  "Quick Pick: Heads",
  "Quick Pick: Risers",
  "Quick Pick: Mains",
  "Quick Pick: Branchline (Threaded)",
  "Quick Pick: Branchline (Grooved)",
  "Quick Pick: Valves & Trim",
];

export const QUICK_PICK_ASSEMBLIES = [
  // ─────────────────────────────────────────────────────────────
  // HEADS
  // ─────────────────────────────────────────────────────────────
  {
    id: "qp_concealed_head",
    name: "Concealed Pendant Head",
    category: "Quick Pick: Heads",
    description: "1 concealed head with escutcheon, drop nipple, sprig, and arm-over elbow",
    unit: "head",
    components: [
      { field: "heads_concealed",   quantity: 1,    label: "Concealed Head",      unit: "ea" },
      { field: "thr_elbow_1in",     quantity: 2,    label: '1" Elbow Threaded',   unit: "ea" },
      { field: "thr_reducer_1in",   quantity: 1,    label: '1" Reducer Threaded', unit: "ea" },
      { field: "pipe_1in_lf",       quantity: 3,    label: '1" Sch 40 Pipe',      unit: "LF" },
    ],
  },
  {
    id: "qp_pendant_head",
    name: "Standard Pendant Head",
    category: "Quick Pick: Heads",
    description: "1 pendant head, drop nipple and 1\" arm-over",
    unit: "head",
    components: [
      { field: "heads_pendant",     quantity: 1,    label: "Pendant Head",        unit: "ea" },
      { field: "thr_elbow_1in",     quantity: 1,    label: '1" Elbow Threaded',   unit: "ea" },
      { field: "pipe_1in_lf",       quantity: 2,    label: '1" Sch 40 Pipe',      unit: "LF" },
    ],
  },
  {
    id: "qp_upright_head",
    name: "Standard Upright Head",
    category: "Quick Pick: Heads",
    description: "1 upright head on a 1\" riser nipple off a tee",
    unit: "head",
    components: [
      { field: "heads_upright",     quantity: 1,    label: "Upright Head",        unit: "ea" },
      { field: "pipe_1in_lf",       quantity: 1.5,  label: '1" Sch 40 Pipe',      unit: "LF" },
    ],
  },
  {
    id: "qp_sidewall_head",
    name: "Sidewall Head",
    category: "Quick Pick: Heads",
    description: "1 sidewall head with a 1\" street elbow and short nipple",
    unit: "head",
    components: [
      { field: "heads_sidewall",    quantity: 1,    label: "Sidewall Head",       unit: "ea" },
      { field: "thr_elbow_1in",     quantity: 1,    label: '1" Elbow Threaded',   unit: "ea" },
      { field: "pipe_1in_lf",       quantity: 1,    label: '1" Sch 40 Pipe',      unit: "LF" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // RISERS
  // ─────────────────────────────────────────────────────────────
  {
    id: "qp_wet_riser_4in",
    name: "Wet System Riser Assembly (4\")",
    category: "Quick Pick: Risers",
    description: "4\" wet system riser: alarm check valve, OS&Y, drain, gauges, flow switch, tamper, ITC",
    unit: "riser",
    components: [
      { field: "riser_assemblies",        quantity: 1,  label: "Riser Assembly",         unit: "ea" },
      { field: "alarm_check_valves_4in",  quantity: 1,  label: 'Alarm Check Valve 4"',   unit: "ea" },
      { field: "butterfly_valves_4in",    quantity: 1,  label: 'Butterfly Valve 4"',      unit: "ea" },
      { field: "flow_switches",           quantity: 1,  label: "Flow Switch",             unit: "ea" },
      { field: "tamper_switches",         quantity: 1,  label: "Tamper Switch",           unit: "ea" },
      { field: "pressure_gauges",         quantity: 2,  label: "Pressure Gauge",          unit: "ea" },
      { field: "drain_valves",            quantity: 2,  label: 'Drain Valve 2"',          unit: "ea" },
      { field: "inspector_test_conns",    quantity: 1,  label: "Inspector Test Conn",     unit: "ea" },
      { field: "grv_coupling_4in",        quantity: 4,  label: '4" Grooved Coupling',     unit: "ea" },
      { field: "grv_elbow_4in",           quantity: 2,  label: '4" Grooved Elbow',        unit: "ea" },
      { field: "pipe_4in_lf",             quantity: 12, label: '4" Sch 40 Pipe',          unit: "LF" },
      { field: "hangers_2_5in_4in",       quantity: 3,  label: 'Hanger 2.5"-4"',          unit: "ea" },
    ],
  },
  {
    id: "qp_backflow_4in",
    name: "Backflow Preventer Assembly (4\")",
    category: "Quick Pick: Risers",
    description: "4\" DCDA backflow preventer with OS&Y valves, strainer, drain and gauges",
    unit: "assembly",
    components: [
      { field: "backflow_preventers_4in", quantity: 1,  label: 'Backflow Preventer 4"',  unit: "ea" },
      { field: "butterfly_valves_4in",    quantity: 2,  label: 'Butterfly Valve 4"',      unit: "ea" },
      { field: "pressure_gauges",         quantity: 2,  label: "Pressure Gauge",          unit: "ea" },
      { field: "drain_valves",            quantity: 1,  label: 'Drain Valve 2"',          unit: "ea" },
      { field: "grv_coupling_4in",        quantity: 6,  label: '4" Grooved Coupling',     unit: "ea" },
      { field: "pipe_4in_lf",             quantity: 8,  label: '4" Sch 40 Pipe',          unit: "LF" },
      { field: "hangers_2_5in_4in",       quantity: 2,  label: 'Hanger 2.5"-4"',          unit: "ea" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // MAINS (per 10 LF of grooved main)
  // ─────────────────────────────────────────────────────────────
  {
    id: "qp_main_2_5in",
    name: '2½" Grooved Main (per 10 LF)',
    category: "Quick Pick: Mains",
    description: '10 LF of 2½" grooved main with couplings and hanger',
    unit: "10 LF",
    components: [
      { field: "pipe_2_5in_lf",        quantity: 10,   label: '2½" Sch 40 Pipe',       unit: "LF" },
      { field: "grv_coupling_2_5in",   quantity: 2,    label: '2½" Grooved Coupling',   unit: "ea" },
      { field: "hangers_2_5in_4in",    quantity: 1,    label: 'Hanger 2.5"-4"',          unit: "ea" },
    ],
  },
  {
    id: "qp_main_3in",
    name: '3" Grooved Main (per 10 LF)',
    category: "Quick Pick: Mains",
    description: '10 LF of 3" grooved main with couplings and hanger',
    unit: "10 LF",
    components: [
      { field: "pipe_3in_lf",          quantity: 10,   label: '3" Sch 40 Pipe',         unit: "LF" },
      { field: "grv_coupling_3in",     quantity: 2,    label: '3" Grooved Coupling',     unit: "ea" },
      { field: "hangers_2_5in_4in",    quantity: 1,    label: 'Hanger 2.5"-4"',          unit: "ea" },
    ],
  },
  {
    id: "qp_main_4in",
    name: '4" Grooved Main (per 10 LF)',
    category: "Quick Pick: Mains",
    description: '10 LF of 4" grooved main with couplings and hanger',
    unit: "10 LF",
    components: [
      { field: "pipe_4in_lf",          quantity: 10,   label: '4" Sch 40 Pipe',         unit: "LF" },
      { field: "grv_coupling_4in",     quantity: 2,    label: '4" Grooved Coupling',     unit: "ea" },
      { field: "hangers_2_5in_4in",    quantity: 1,    label: 'Hanger 2.5"-4"',          unit: "ea" },
    ],
  },
  {
    id: "qp_main_elbow_3in",
    name: '3" Grooved 90° Turn',
    category: "Quick Pick: Mains",
    description: '3" grooved elbow + 2 couplings for a direction change',
    unit: "turn",
    components: [
      { field: "grv_elbow_3in",        quantity: 1,    label: '3" Grooved Elbow',        unit: "ea" },
      { field: "grv_coupling_3in",     quantity: 2,    label: '3" Grooved Coupling',     unit: "ea" },
    ],
  },
  {
    id: "qp_main_tee_3in",
    name: '3" Grooved Tee Branch',
    category: "Quick Pick: Mains",
    description: '3" grooved tee with couplings, reduces to 2½" branchline',
    unit: "branch",
    components: [
      { field: "grv_tee_3in",          quantity: 1,    label: '3" Grooved Tee',          unit: "ea" },
      { field: "grv_coupling_3in",     quantity: 2,    label: '3" Grooved Coupling',     unit: "ea" },
      { field: "grv_reducer_2_5in",    quantity: 1,    label: '2½" Grooved Reducer',     unit: "ea" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // THREADED BRANCHLINES
  // ─────────────────────────────────────────────────────────────
  {
    id: "qp_branch_upright_1in",
    name: '1" Threaded Upright Branchline (per head)',
    category: "Quick Pick: Branchline (Threaded)",
    description: '1" threaded branchline for 1 upright head: pipe, tee, reducer, hanger',
    unit: "head",
    components: [
      { field: "heads_upright",        quantity: 1,    label: "Upright Head",            unit: "ea" },
      { field: "pipe_1in_lf",          quantity: 8,    label: '1" Sch 40 Pipe',          unit: "LF" },
      { field: "thr_tee_1in",          quantity: 1,    label: '1" Tee Threaded',         unit: "ea" },
      { field: "thr_elbow_1in",        quantity: 2,    label: '1" Elbow Threaded',       unit: "ea" },
      { field: "hangers_1in_2in",      quantity: 1,    label: 'Hanger 1"-2"',            unit: "ea" },
    ],
  },
  {
    id: "qp_branch_concealed_1in",
    name: '1" Threaded Concealed Branchline (per head)',
    category: "Quick Pick: Branchline (Threaded)",
    description: '1" threaded branchline for 1 concealed head: pipe, tee, elbows, reducer, hanger',
    unit: "head",
    components: [
      { field: "heads_concealed",      quantity: 1,    label: "Concealed Head",          unit: "ea" },
      { field: "pipe_1in_lf",          quantity: 8,    label: '1" Sch 40 Pipe',          unit: "LF" },
      { field: "thr_tee_1in",          quantity: 1,    label: '1" Tee Threaded',         unit: "ea" },
      { field: "thr_elbow_1in",        quantity: 3,    label: '1" Elbow Threaded',       unit: "ea" },
      { field: "thr_reducer_1in",      quantity: 1,    label: '1" Reducer Threaded',     unit: "ea" },
      { field: "hangers_1in_2in",      quantity: 1,    label: 'Hanger 1"-2"',            unit: "ea" },
    ],
  },
  {
    id: "qp_branch_1_25in_feed",
    name: '1¼" Threaded Cross-Main Feed (per 10 LF)',
    category: "Quick Pick: Branchline (Threaded)",
    description: '1¼" threaded cross-main feed pipe with couplings and hanger',
    unit: "10 LF",
    components: [
      { field: "pipe_1_25in_lf",       quantity: 10,   label: '1¼" Sch 40 Pipe',        unit: "LF" },
      { field: "thr_coupling_1_25in",  quantity: 1,    label: '1¼" Coupling Threaded',  unit: "ea" },
      { field: "hangers_1in_2in",      quantity: 1,    label: 'Hanger 1"-2"',            unit: "ea" },
    ],
  },
  {
    id: "qp_branch_end_cap_1in",
    name: '1" Threaded End-of-Line',
    category: "Quick Pick: Branchline (Threaded)",
    description: '1" threaded end-of-line elbow and short nipple',
    unit: "end",
    components: [
      { field: "thr_elbow_1in",        quantity: 1,    label: '1" Elbow Threaded',       unit: "ea" },
      { field: "pipe_1in_lf",          quantity: 1,    label: '1" Sch 40 Pipe',          unit: "LF" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // GROOVED BRANCHLINES
  // ─────────────────────────────────────────────────────────────
  {
    id: "qp_grv_branch_2in",
    name: '2" Grooved Branchline (per 10 LF)',
    category: "Quick Pick: Branchline (Grooved)",
    description: '2" grooved branchline with couplings and hanger — transitions from main to threaded zone',
    unit: "10 LF",
    components: [
      { field: "pipe_2in_lf",          quantity: 10,   label: '2" Sch 40 Pipe',          unit: "LF" },
      { field: "grv_coupling_2_5in",   quantity: 2,    label: '2½" Grooved Coupling',   unit: "ea" },
      { field: "hangers_1in_2in",      quantity: 1,    label: 'Hanger 1"-2"',            unit: "ea" },
    ],
  },
  {
    id: "qp_grv_branch_tee_2_5in",
    name: '2½" to 1¼" Grooved Tee Drop',
    category: "Quick Pick: Branchline (Grooved)",
    description: 'Grooved tee on 2½" main reducing to 1¼" threaded branchline',
    unit: "drop",
    components: [
      { field: "grv_tee_2_5in",        quantity: 1,    label: '2½" Grooved Tee',        unit: "ea" },
      { field: "grv_coupling_2_5in",   quantity: 2,    label: '2½" Grooved Coupling',   unit: "ea" },
      { field: "grv_reducer_2_5in",    quantity: 1,    label: '2½" Grooved Reducer',    unit: "ea" },
      { field: "thr_reducer_1_25in",   quantity: 1,    label: '1¼" Reducer Threaded',   unit: "ea" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // VALVES & TRIM
  // ─────────────────────────────────────────────────────────────
  {
    id: "qp_zone_control_4in",
    name: '4" Zone Control Valve Package',
    category: "Quick Pick: Valves & Trim",
    description: '4" butterfly valve, flow switch, tamper switch, drain, and gauge',
    unit: "zone",
    components: [
      { field: "butterfly_valves_4in", quantity: 1,    label: 'Butterfly Valve 4"',      unit: "ea" },
      { field: "flow_switches",        quantity: 1,    label: "Flow Switch",             unit: "ea" },
      { field: "tamper_switches",      quantity: 1,    label: "Tamper Switch",           unit: "ea" },
      { field: "pressure_gauges",      quantity: 1,    label: "Pressure Gauge",          unit: "ea" },
      { field: "drain_valves",         quantity: 1,    label: 'Drain Valve 2"',          unit: "ea" },
      { field: "grv_coupling_4in",     quantity: 2,    label: '4" Grooved Coupling',     unit: "ea" },
    ],
  },
  {
    id: "qp_itc",
    name: "Inspector Test Connection",
    category: "Quick Pick: Valves & Trim",
    description: "Inspector test connection with drain",
    unit: "ea",
    components: [
      { field: "inspector_test_conns", quantity: 1,    label: "Inspector Test Conn",     unit: "ea" },
      { field: "drain_valves",         quantity: 1,    label: 'Drain Valve 2"',          unit: "ea" },
      { field: "thr_elbow_1in",        quantity: 1,    label: '1" Elbow Threaded',       unit: "ea" },
      { field: "pipe_1in_lf",          quantity: 2,    label: '1" Sch 40 Pipe',          unit: "LF" },
    ],
  },
  {
    id: "qp_seismic_brace",
    name: "Seismic Brace Assembly",
    category: "Quick Pick: Valves & Trim",
    description: "4-way seismic sway brace for mains",
    unit: "ea",
    components: [
      { field: "seismic_braces",       quantity: 1,    label: "Seismic Brace Assy",      unit: "ea" },
    ],
  },
];