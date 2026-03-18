import React from "react";
import { Flame, Droplets, Package, Wrench, ChevronRight } from "lucide-react";

const fmt = (n) =>
  (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function SectionCard({ title, badge, badgeColor = "bg-primary/10 text-primary", icon: Icon, children, footer }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {badge && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-border bg-muted/20 flex justify-end gap-6 text-sm font-semibold">
          {footer}
        </div>
      )}
    </div>
  );
}

function ItemTable({ items, columns }) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-muted-foreground italic py-2">No items recorded.</p>;
  }
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground border-b border-border">
          {columns.map((c) => (
            <th key={c.key} className={`py-1.5 font-semibold ${c.right ? "text-right" : "text-left"} ${c.width || ""}`}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {items.map((item, idx) => (
          <tr key={idx} className="hover:bg-muted/20">
            {columns.map((c) => (
              <td key={c.key} className={`py-1.5 ${c.right ? "text-right" : ""} ${c.mono ? "font-mono" : ""}`}>
                {c.format ? c.format(item[c.key], item) : item[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SprinklerAreaCard({ takeoff, index }) {
  const inputs = takeoff.formula_inputs || {};
  const laborItems = takeoff.labor_items || [];
  const materialItems = takeoff.material_items || [];

  const totalHeads =
    (inputs.heads_concealed || 0) +
    (inputs.heads_pendant || 0) +
    (inputs.heads_upright || 0) +
    (inputs.heads_sidewall || 0);

  const totalPipeLF =
    (inputs.pipe_1in_lf || 0) +
    (inputs.pipe_1_25in_lf || 0) +
    (inputs.pipe_1_5in_lf || 0) +
    (inputs.pipe_2in_lf || 0) +
    (inputs.pipe_2_5in_lf || 0) +
    (inputs.pipe_3in_lf || 0) +
    (inputs.pipe_4in_lf || 0) +
    (inputs.pipe_6in_lf || 0);

  const sectionTotal = (takeoff.total_labor || 0) + (takeoff.total_material || 0) + (takeoff.total_design || 0);

  const laborCols = [
    { key: "item", label: "Item" },
    { key: "quantity", label: "Qty", right: true, width: "w-16" },
    { key: "factor", label: "Factor", right: true, width: "w-16", format: (v) => v?.toFixed(3) },
    { key: "total", label: "Cost", right: true, width: "w-24", format: (v) => `$${fmt(v)}` },
  ];

  const materialCols = [
    { key: "item", label: "Item" },
    { key: "quantity", label: "Qty", right: true, width: "w-16" },
    { key: "price", label: "Unit $", right: true, width: "w-20", format: (v) => `$${fmt(v)}` },
    { key: "total", label: "Total", right: true, width: "w-24", format: (v) => `$${fmt(v)}` },
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Area Header */}
      <div className="bg-primary/5 border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
            {takeoff.section_number || index + 1}
          </div>
          <div>
            <div className="font-bold text-foreground">{takeoff.area_name || "Unnamed Area"}</div>
            <div className="text-xs text-muted-foreground flex gap-3 mt-0.5">
              {totalHeads > 0 && <span>{totalHeads} heads</span>}
              {totalPipeLF > 0 && <span>{totalPipeLF.toLocaleString()} LF pipe</span>}
              {inputs.system_type && <span className="capitalize">{inputs.system_type} system</span>}
              {inputs.labor_class && <span>Class {inputs.labor_class} labor</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Section Total</div>
          <div className="font-bold text-accent">${fmt(sectionTotal)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Labor */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Wrench className="w-3 h-3" /> Labor
            </div>
            <span className="text-xs font-bold text-foreground">${fmt(takeoff.total_labor)}</span>
          </div>
          <ItemTable items={laborItems} columns={laborCols} />
        </div>

        {/* Material */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Package className="w-3 h-3" /> Material
            </div>
            <span className="text-xs font-bold text-foreground">${fmt(takeoff.total_material)}</span>
          </div>
          <ItemTable items={materialItems} columns={materialCols} />
        </div>
      </div>
    </div>
  );
}

function StandpipeCard({ takeoff, index }) {
  const laborItems = takeoff.labor_items || [];
  const materialItems = takeoff.material_items || [];
  const sectionTotal = (takeoff.total_labor || 0) + (takeoff.total_material || 0) + (takeoff.total_design || 0);
  const typeLabel = takeoff.type === "vertical" ? "Vertical Standpipe" : "Horizontal Bulk";

  const laborCols = [
    { key: "item", label: "Item" },
    { key: "quantity", label: "Qty", right: true, width: "w-16" },
    { key: "factor", label: "Factor", right: true, width: "w-16", format: (v) => v?.toFixed(3) },
    { key: "total", label: "Cost", right: true, width: "w-24", format: (v) => `$${fmt(v)}` },
  ];

  const materialCols = [
    { key: "item", label: "Item" },
    { key: "quantity", label: "Qty", right: true, width: "w-16" },
    { key: "price", label: "Unit $", right: true, width: "w-20", format: (v) => `$${fmt(v)}` },
    { key: "total", label: "Total", right: true, width: "w-24", format: (v) => `$${fmt(v)}` },
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-accent/5 border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center text-xs font-bold text-accent">
            {index + 1}
          </div>
          <div>
            <div className="font-bold text-foreground">{takeoff.area_name || "Unnamed Area"}</div>
            <div className="text-xs text-muted-foreground">{typeLabel}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Section Total</div>
          <div className="font-bold text-accent">${fmt(sectionTotal)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Wrench className="w-3 h-3" /> Labor
            </div>
            <span className="text-xs font-bold text-foreground">${fmt(takeoff.total_labor)}</span>
          </div>
          <ItemTable items={laborItems} columns={laborCols} />
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Package className="w-3 h-3" /> Material
            </div>
            <span className="text-xs font-bold text-foreground">${fmt(takeoff.total_material)}</span>
          </div>
          <ItemTable items={materialItems} columns={materialCols} />
        </div>
      </div>
    </div>
  );
}

export default function HeadLayout({ sprinklerTakeoffs = [], standpipeTakeoffs = [] }) {
  const hasAnything = sprinklerTakeoffs.length > 0 || standpipeTakeoffs.length > 0;

  if (!hasAnything) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <Flame className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No takeoff data yet.</p>
        <p className="text-sm mt-1">Add areas in the Fire Sprinkler and Standpipe tabs, then save them to see the layout here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Fire Sprinkler Areas */}
      {sprinklerTakeoffs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Flame className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">Fire Sprinkler Areas</h2>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {sprinklerTakeoffs.length} section{sprinklerTakeoffs.length !== 1 ? "s" : ""}
            </span>
          </div>
          {sprinklerTakeoffs.map((t, i) => (
            <SprinklerAreaCard key={t.id} takeoff={t} index={i} />
          ))}
        </div>
      )}

      {/* Standpipe / Bulk Areas */}
      {standpipeTakeoffs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Droplets className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Standpipe / Bulk Areas</h2>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {standpipeTakeoffs.length} section{standpipeTakeoffs.length !== 1 ? "s" : ""}
            </span>
          </div>
          {standpipeTakeoffs.map((t, i) => (
            <StandpipeCard key={t.id} takeoff={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}