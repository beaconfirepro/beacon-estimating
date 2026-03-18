import React, { useState } from "react";
import { Flame, Droplets, Package, Wrench, Hash, DollarSign, LayoutList } from "lucide-react";

const fmt = (n) =>
  (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Toggle ───────────────────────────────────────────────────────────────
function ViewToggle({ value, onChange }) {
  const opts = [
    { key: "count", icon: Hash, label: "Count" },
    { key: "cost",  icon: DollarSign, label: "Cost" },
    { key: "both",  icon: LayoutList, label: "Both" },
  ];
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
      {opts.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            value === key
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Compact table ────────────────────────────────────────────────────────
function CompactTable({ items, showCount, showCost, emptyMsg }) {
  if (!items || items.length === 0)
    return <p className="text-xs text-muted-foreground italic py-1">{emptyMsg}</p>;

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground border-b border-border/60">
          <th className="text-left py-1 font-medium">Item</th>
          {showCount && <th className="text-right py-1 font-medium w-14">Qty</th>}
          {showCost  && <th className="text-right py-1 font-medium w-20">Cost</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={idx} className="border-b border-border/30 last:border-0">
            <td className="py-1 pr-2 leading-tight">{item.item}</td>
            {showCount && <td className="py-1 text-right tabular-nums">{item.quantity}</td>}
            {showCost  && <td className="py-1 text-right tabular-nums font-medium">${fmt(item.total)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Sprinkler area card ──────────────────────────────────────────────────
function SprinklerAreaCard({ takeoff, index, view }) {
  const inputs       = takeoff.formula_inputs || {};
  const laborItems   = (takeoff.labor_items   || []).filter(i => i.quantity > 0);
  const materialItems= (takeoff.material_items|| []).filter(i => i.quantity > 0);

  const totalHeads =
    (inputs.heads_concealed||0)+(inputs.heads_pendant||0)+
    (inputs.heads_upright  ||0)+(inputs.heads_sidewall||0);
  const totalPipeLF =
    (inputs.pipe_1in_lf||0)+(inputs.pipe_1_25in_lf||0)+(inputs.pipe_1_5in_lf||0)+
    (inputs.pipe_2in_lf||0)+(inputs.pipe_2_5in_lf||0)+(inputs.pipe_3in_lf   ||0)+
    (inputs.pipe_4in_lf||0)+(inputs.pipe_6in_lf  ||0);
  const sectionTotal = (takeoff.total_labor||0)+(takeoff.total_material||0)+(takeoff.total_design||0);

  const showCount = view === "count" || view === "both";
  const showCost  = view === "cost"  || view === "both";

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm text-sm">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
            {takeoff.section_number || index + 1}
          </span>
          <span className="font-semibold text-foreground">{takeoff.area_name || "Unnamed Area"}</span>
          <span className="text-xs text-muted-foreground hidden sm:flex gap-2 ml-1">
            {totalHeads > 0   && <span>{totalHeads} heads</span>}
            {totalPipeLF > 0  && <span>{totalPipeLF.toLocaleString()} LF</span>}
            {inputs.system_type && <span className="capitalize">{inputs.system_type}</span>}
          </span>
        </div>
        <span className="font-bold text-accent text-xs">${fmt(sectionTotal)}</span>
      </div>

      {/* Body: side-by-side labor + material */}
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold uppercase mb-1">
            <Wrench className="w-3 h-3" /> Labor
            <span className="ml-auto font-bold text-foreground normal-case">${fmt(takeoff.total_labor)}</span>
          </div>
          <CompactTable items={laborItems} showCount={showCount} showCost={showCost} emptyMsg="No labor items" />
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold uppercase mb-1">
            <Package className="w-3 h-3" /> Material
            <span className="ml-auto font-bold text-foreground normal-case">${fmt(takeoff.total_material)}</span>
          </div>
          <CompactTable items={materialItems} showCount={showCount} showCost={showCost} emptyMsg="No material items" />
        </div>
      </div>
    </div>
  );
}

// ── Standpipe card ───────────────────────────────────────────────────────
function StandpipeCard({ takeoff, index, view }) {
  const laborItems    = (takeoff.labor_items   || []).filter(i => i.quantity > 0);
  const materialItems = (takeoff.material_items|| []).filter(i => i.quantity > 0);
  const sectionTotal  = (takeoff.total_labor||0)+(takeoff.total_material||0)+(takeoff.total_design||0);
  const typeLabel     = takeoff.type === "vertical" ? "Vertical Standpipe" : "Horizontal Bulk";
  const showCount = view === "count" || view === "both";
  const showCost  = view === "cost"  || view === "both";

  return (
    <div className="border border-border rounded-lg overflow-hidden shadow-sm text-sm">
      <div className="bg-accent/5 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-accent/15 flex items-center justify-center text-xs font-bold text-accent">
            {index + 1}
          </span>
          <span className="font-semibold text-foreground">{takeoff.area_name || "Unnamed Area"}</span>
          <span className="text-xs text-muted-foreground ml-1">{typeLabel}</span>
        </div>
        <span className="font-bold text-accent text-xs">${fmt(sectionTotal)}</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold uppercase mb-1">
            <Wrench className="w-3 h-3" /> Labor
            <span className="ml-auto font-bold text-foreground normal-case">${fmt(takeoff.total_labor)}</span>
          </div>
          <CompactTable items={laborItems} showCount={showCount} showCost={showCost} emptyMsg="No labor items" />
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold uppercase mb-1">
            <Package className="w-3 h-3" /> Material
            <span className="ml-auto font-bold text-foreground normal-case">${fmt(takeoff.total_material)}</span>
          </div>
          <CompactTable items={materialItems} showCount={showCount} showCost={showCost} emptyMsg="No material items" />
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────
export default function HeadLayout({ sprinklerTakeoffs = [], standpipeTakeoffs = [] }) {
  const [view, setView] = useState("both");
  const hasAnything = sprinklerTakeoffs.length > 0 || standpipeTakeoffs.length > 0;

  if (!hasAnything) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <Flame className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No takeoff data yet.</p>
        <p className="text-sm mt-1">Add and save areas in the Fire Sprinkler and Standpipe tabs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sprinklerTakeoffs.length + standpipeTakeoffs.length} section{sprinklerTakeoffs.length + standpipeTakeoffs.length !== 1 ? "s" : ""}
        </p>
        <ViewToggle value={view} onChange={setView} />
      </div>

      {sprinklerTakeoffs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-1">
            <Flame className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-bold text-foreground">Fire Sprinkler Areas</h2>
          </div>
          {sprinklerTakeoffs.map((t, i) => (
            <SprinklerAreaCard key={t.id} takeoff={t} index={i} view={view} />
          ))}
        </div>
      )}

      {standpipeTakeoffs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-1">
            <Droplets className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Standpipe / Bulk Areas</h2>
          </div>
          {standpipeTakeoffs.map((t, i) => (
            <StandpipeCard key={t.id} takeoff={t} index={i} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}