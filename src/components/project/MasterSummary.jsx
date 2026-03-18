import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Store } from "lucide-react";

const fmt = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function MasterSummary({ project, sprinklerTakeoffs, standpipeTakeoffs, onExport }) {
  const [allPrices, setAllPrices] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("__default__");

  useEffect(() => {
    base44.entities.MaterialPrice.list("-updated_date", 500).then(data => setAllPrices(data || []));
  }, []);

  // Build list of distinct vendors
  const vendors = Array.from(
    new Set(allPrices.map(p => p.supplier_name).filter(Boolean))
  ).sort();

  // Build price map for the selected vendor.
  // For each generic_part_name: use selected vendor's price if available, else fall back to first record (default).
  // Also track which items had to fall back.
  const buildPriceMap = (vendor) => {
    const byPart = allPrices.reduce((acc, p) => {
      if (!acc[p.generic_part_name]) acc[p.generic_part_name] = [];
      acc[p.generic_part_name].push(p);
      return acc;
    }, {});

    const priceMap = {};
    const fallbackSet = new Set();

    Object.entries(byPart).forEach(([partName, records]) => {
      if (vendor === "__default__") {
        priceMap[partName] = records[0]?.price || 0;
      } else {
        const vendorRecord = records.find(r => r.supplier_name === vendor);
        if (vendorRecord) {
          priceMap[partName] = vendorRecord.price;
        } else {
          priceMap[partName] = records[0]?.price || 0;
          fallbackSet.add(partName);
        }
      }
    });

    return { priceMap, fallbackSet };
  };

  const { priceMap, fallbackSet } = buildPriceMap(selectedVendor);

  // Recalculate material for a takeoff using the selected vendor prices
  const calcMaterial = (takeoff) => {
    // On default, just use the saved total — no recalculation needed
    if (selectedVendor === "__default__") {
      return { total: takeoff.total_material || 0, hasFallback: false };
    }
    const items = takeoff.material_items || [];
    if (items.length === 0) return { total: takeoff.total_material || 0, hasFallback: false };
    let total = 0;
    let hasFallback = false;
    items.forEach(item => {
      if (priceMap[item.item] !== undefined) {
        total += priceMap[item.item] * (item.quantity || 0);
      } else if (fallbackSet.has(item.item)) {
        // Use saved unit price as fallback
        total += (item.price || 0) * (item.quantity || 0);
        hasFallback = true;
      } else {
        total += (item.price || 0) * (item.quantity || 0);
      }
    });
    return { total, hasFallback };
  };

  const allTakeoffs = [
    ...sprinklerTakeoffs.map(t => ({ ...t, _category: "Fire Sprinkler" })),
    ...standpipeTakeoffs.map(t => ({ ...t, _category: t.type === "vertical" ? "Vertical Standpipe" : "Horizontal Bulk" }))
  ];

  const grandLabor = allTakeoffs.reduce((s, t) => s + (t.total_labor || 0), 0);
  const grandDesign = allTakeoffs.reduce((s, t) => s + (t.total_design || 0), 0);
  const grandMaterial = allTakeoffs.reduce((s, t) => s + calcMaterial(t).total, 0);
  const grandTotal = grandLabor + grandMaterial + grandDesign;

  const usingVendor = selectedVendor !== "__default__";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Master Estimate Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">{project?.project_name}</p>
        </div>
        <Button onClick={onExport} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Download className="w-4 h-4" /> Export PDF
        </Button>
      </div>

      {/* Vendor Toggle */}
      {vendors.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Store className="w-4 h-4 text-muted-foreground" />
            Vendor Comparison:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedVendor("__default__")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedVendor === "__default__"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              Default (Active)
            </button>
            {vendors.map(v => (
              <button
                key={v}
                onClick={() => setSelectedVendor(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedVendor === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {usingVendor && fallbackSet.size > 0 && (
            <span className="text-xs text-destructive ml-auto">
              ⚠ {fallbackSet.size} item{fallbackSet.size !== 1 ? "s" : ""} using default price (no {selectedVendor} price)
            </span>
          )}
        </div>
      )}

      {/* Project Info */}
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
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Estimate Breakdown</h3>
          {usingVendor && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              Pricing: {selectedVendor}
            </span>
          )}
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
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">No takeoff sections added yet</td>
                </tr>
              ) : allTakeoffs.map((t, i) => {
                const { total: matTotal, hasFallback } = calcMaterial(t);
                const rowTotal = (t.total_labor || 0) + matTotal + (t.total_design || 0);
                return (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-foreground">{t._category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.area_name || `Section ${t.section_number}`}</td>
                    <td className="px-5 py-3 text-right">{fmt(t.total_labor)}</td>
                    <td className={`px-5 py-3 text-right font-medium ${hasFallback ? "text-destructive" : ""}`}>
                      {fmt(matTotal)}
                      {hasFallback && <span className="ml-1 text-xs">*</span>}
                    </td>
                    <td className="px-5 py-3 text-right">{fmt(t.total_design)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{fmt(rowTotal)}</td>
                  </tr>
                );
              })}
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
        {usingVendor && fallbackSet.size > 0 && (
          <div className="px-5 py-2 border-t border-border bg-destructive/5 text-xs text-destructive">
            * Material shown in red used default pricing — no {selectedVendor} price found for: {Array.from(fallbackSet).join(", ")}
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      {grandTotal > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Labor",    value: grandLabor,    pct: (grandLabor    / grandTotal * 100).toFixed(1), color: "bg-blue-500" },
            { label: "Material", value: grandMaterial, pct: (grandMaterial / grandTotal * 100).toFixed(1), color: "bg-green-500" },
            { label: "Design",   value: grandDesign,   pct: (grandDesign   / grandTotal * 100).toFixed(1), color: "bg-orange-500" },
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