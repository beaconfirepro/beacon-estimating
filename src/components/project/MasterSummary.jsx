import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function MasterSummary({ project, sprinklerTakeoffs, standpipeTakeoffs, onExport }) {
  const allTakeoffs = [
    ...sprinklerTakeoffs.map(t => ({ ...t, category: "Fire Sprinkler" })),
    ...standpipeTakeoffs.map(t => ({ ...t, category: t.type === "vertical" ? "Vertical Standpipe" : "Horizontal Bulk" }))
  ];

  const grandLabor = allTakeoffs.reduce((s, t) => s + (t.total_labor || 0), 0);
  const grandMaterial = allTakeoffs.reduce((s, t) => s + (t.total_material || 0), 0);
  const grandDesign = allTakeoffs.reduce((s, t) => s + (t.total_design || 0), 0);
  const grandTotal = grandLabor + grandMaterial + grandDesign;

  const fmt = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Master Estimate Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">{project?.project_name}</p>
        </div>
        <Button onClick={onExport} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Download className="w-4 h-4" /> Export PDF
        </Button>
      </div>

      {/* Project Info Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Project Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ["Project Name", project?.project_name],
            ["Address", project?.street_address],
            ["City/State/ZIP", project?.city_state_zip],
            ["GC / Owner", project?.gc_owner],
            ["Sales Rep", project?.sales_rep],
            ["WSFP Project #", project?.wsfp_project_number],
            ["Date", project?.date],
          ].map(([label, value]) => value ? (
            <div key={label}>
              <div className="text-muted-foreground text-xs">{label}</div>
              <div className="font-medium text-foreground">{value}</div>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Estimate Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Section</th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Area</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Labor</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Material</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Design</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allTakeoffs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No takeoff sections added yet
                  </td>
                </tr>
              ) : allTakeoffs.map((t, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">{t.category}</td>
                  <td className="px-5 py-3 text-muted-foreground">{t.area_name || `Section ${t.section_number}`}</td>
                  <td className="px-5 py-3 text-right">{fmt(t.total_labor)}</td>
                  <td className="px-5 py-3 text-right">{fmt(t.total_material)}</td>
                  <td className="px-5 py-3 text-right">{fmt(t.total_design)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{fmt((t.total_labor || 0) + (t.total_material || 0) + (t.total_design || 0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary text-primary-foreground font-bold">
                <td colSpan={2} className="px-5 py-3">GRAND TOTAL</td>
                <td className="px-5 py-3 text-right">{fmt(grandLabor)}</td>
                <td className="px-5 py-3 text-right">{fmt(grandMaterial)}</td>
                <td className="px-5 py-3 text-right">{fmt(grandDesign)}</td>
                <td className="px-5 py-3 text-right text-accent text-base">{fmt(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Pie-like summary */}
      {grandTotal > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Labor", value: grandLabor, pct: grandTotal > 0 ? (grandLabor / grandTotal * 100).toFixed(1) : 0, color: "bg-blue-500" },
            { label: "Material", value: grandMaterial, pct: grandTotal > 0 ? (grandMaterial / grandTotal * 100).toFixed(1) : 0, color: "bg-green-500" },
            { label: "Design", value: grandDesign, pct: grandTotal > 0 ? (grandDesign / grandTotal * 100).toFixed(1) : 0, color: "bg-orange-500" },
          ].map(({ label, value, pct, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
              <div className="text-xl font-bold text-foreground mt-1">{fmt(value)}</div>
              <div className="text-sm text-muted-foreground">{pct}% of total</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}