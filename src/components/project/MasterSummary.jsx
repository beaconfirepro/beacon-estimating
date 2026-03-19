import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Store, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

const fmt = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pctFmt = (n) => `${(n || 0).toFixed(1)}%`;

function MarginSlider({ label, value, onChange, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <input
        type="range"
        min={0}
        max={60}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-primary h-1.5"
      />
      <span className="text-xs font-semibold text-foreground w-10 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}

function FallbackAccordion({ fallbackItems, vendorName }) {
  const [open, setOpen] = useState(false);
  if (!fallbackItems || fallbackItems.length === 0) return null;

  return (
    <div className="border border-destructive/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left"
      >
        <span className="text-xs font-medium text-destructive">
          ⚠ {fallbackItems.length} item{fallbackItems.length !== 1 ? "s" : ""} using default price (no {vendorName} price available)
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-destructive" /> : <ChevronDown className="w-3.5 h-3.5 text-destructive" />}
      </button>
      {open && (
        <div className="divide-y divide-border">
          {fallbackItems.map((fi, i) => (
            <div key={i} className="px-4 py-2 flex items-center justify-between bg-destructive/3">
              <span className="text-xs text-foreground">{fi.item}</span>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Fallback price: </span>
                <span className="text-xs font-semibold text-destructive">{fmt(fi.price)}/ea</span>
                <span className="text-xs text-muted-foreground ml-2">× {fi.quantity} = </span>
                <span className="text-xs font-semibold text-destructive">{fmt(fi.price * fi.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MasterSummary({ project, sprinklerTakeoffs, standpipeTakeoffs, onExport }) {
  const [allPrices, setAllPrices] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("__default__");

  // Margin state
  const [overallMargin, setOverallMargin] = useState(15);
  const [expandMargins, setExpandMargins] = useState(false);
  const [laborMargin, setLaborMargin] = useState(15);
  const [materialMargin, setMaterialMargin] = useState(15);
  const [designMargin, setDesignMargin] = useState(15);

  // Sync individual sliders when overall changes (only if not expanded)
  const handleOverallChange = (v) => {
    setOverallMargin(v);
    if (!expandMargins) {
      setLaborMargin(v);
      setMaterialMargin(v);
      setDesignMargin(v);
    }
  };

  const handleExpandToggle = () => {
    if (!expandMargins) {
      // Expanding — seed individual sliders from overall
      setLaborMargin(overallMargin);
      setMaterialMargin(overallMargin);
      setDesignMargin(overallMargin);
    }
    setExpandMargins(!expandMargins);
  };

  useEffect(() => {
    base44.entities.MaterialPrice.list("-updated_date", 500).then(data => setAllPrices(data || []));
  }, []);

  const vendors = Array.from(
    new Set(allPrices.map(p => p.supplier_name).filter(Boolean))
  ).sort();

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

  const calcMaterial = (takeoff) => {
    if (selectedVendor === "__default__") {
      return { total: takeoff.total_material || 0, hasFallback: false, fallbackItems: [] };
    }
    const items = takeoff.material_items || [];
    if (items.length === 0) return { total: takeoff.total_material || 0, hasFallback: false, fallbackItems: [] };
    let total = 0;
    let hasFallback = false;
    const fallbackItems = [];
    items.forEach(item => {
      if (priceMap[item.item] !== undefined && !fallbackSet.has(item.item)) {
        total += priceMap[item.item] * (item.quantity || 0);
      } else {
        // Fallback to saved unit price
        const usedPrice = item.price || 0;
        total += usedPrice * (item.quantity || 0);
        if (fallbackSet.has(item.item)) {
          hasFallback = true;
          fallbackItems.push({ item: item.item, price: usedPrice, quantity: item.quantity || 0 });
        }
      }
    });
    return { total, hasFallback, fallbackItems };
  };

  const allTakeoffs = [
    ...sprinklerTakeoffs.map(t => ({ ...t, _category: "Fire Sprinkler" })),
    ...standpipeTakeoffs.map(t => ({ ...t, _category: t.type === "vertical" ? "Vertical Standpipe" : "Horizontal Bulk" }))
  ];

  const grandLaborCost = allTakeoffs.reduce((s, t) => s + (t.total_labor || 0), 0);
  const grandDesignCost = allTakeoffs.reduce((s, t) => s + (t.total_design || 0), 0);
  const grandMaterialCost = allTakeoffs.reduce((s, t) => s + calcMaterial(t).total, 0);
  const grandCost = grandLaborCost + grandMaterialCost + grandDesignCost;

  const markup = (cost, margin) => cost / (1 - margin / 100);
  const grandLaborSell = markup(grandLaborCost, expandMargins ? laborMargin : overallMargin);
  const grandMaterialSell = markup(grandMaterialCost, expandMargins ? materialMargin : overallMargin);
  const grandDesignSell = markup(grandDesignCost, expandMargins ? designMargin : overallMargin);
  const grandSell = grandLaborSell + grandMaterialSell + grandDesignSell;

  const usingVendor = selectedVendor !== "__default__";

  // Aggregate fallback items across all takeoffs for the accordion
  const allFallbackItems = [];
  const fallbackSeen = new Set();
  allTakeoffs.forEach(t => {
    const { fallbackItems } = calcMaterial(t);
    fallbackItems.forEach(fi => {
      const key = fi.item;
      if (!fallbackSeen.has(key)) {
        fallbackSeen.add(key);
        allFallbackItems.push(fi);
      } else {
        // Merge quantities
        const existing = allFallbackItems.find(x => x.item === fi.item);
        if (existing) existing.quantity += fi.quantity;
      }
    });
  });

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
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
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
          </div>

          {/* Fallback accordion */}
          {usingVendor && allFallbackItems.length > 0 && (
            <FallbackAccordion fallbackItems={allFallbackItems} vendorName={selectedVendor} />
          )}
        </div>
      )}

      {/* Profit Margin Slider */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            Profit Margin
          </div>
          <button
            onClick={handleExpandToggle}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {expandMargins ? "Use single margin" : "Control by category"}
            {expandMargins ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {!expandMargins ? (
          <MarginSlider label="All" value={overallMargin} onChange={handleOverallChange} color="bg-primary" />
        ) : (
          <div className="space-y-2 pt-1">
            <MarginSlider label="Labor" value={laborMargin} onChange={setLaborMargin} color="bg-blue-500" />
            <MarginSlider label="Material" value={materialMargin} onChange={setMaterialMargin} color="bg-green-500" />
            <MarginSlider label="Design" value={designMargin} onChange={setDesignMargin} color="bg-orange-500" />
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border text-xs text-muted-foreground">
          <span>Cost → Sell price (margin on sell)</span>
          <span className="font-semibold text-foreground text-sm">
            {fmt(grandCost)} → {fmt(grandSell)}
          </span>
        </div>
      </div>

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
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Sell Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allTakeoffs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">No takeoff sections added yet</td>
                </tr>
              ) : allTakeoffs.map((t, i) => {
                const { total: matCost, hasFallback } = calcMaterial(t);
                const lm = expandMargins ? laborMargin : overallMargin;
                const mm = expandMargins ? materialMargin : overallMargin;
                const dm = expandMargins ? designMargin : overallMargin;
                const laborSell = markup(t.total_labor || 0, lm);
                const matSell = markup(matCost, mm);
                const desSell = markup(t.total_design || 0, dm);
                const rowSell = laborSell + matSell + desSell;
                return (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-foreground">{t._category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.area_name || `Section ${t.section_number}`}</td>
                    <td className="px-5 py-3 text-right">{fmt(laborSell)}</td>
                    <td className={`px-5 py-3 text-right font-medium ${hasFallback ? "text-destructive" : ""}`}>
                      {fmt(matSell)}
                      {hasFallback && <span className="ml-1 text-xs">*</span>}
                    </td>
                    <td className="px-5 py-3 text-right">{fmt(desSell)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{fmt(rowSell)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-primary text-primary-foreground font-bold">
                <td colSpan={2} className="px-5 py-3">GRAND TOTAL (Sell)</td>
                <td className="px-5 py-3 text-right">{fmt(grandLaborSell)}</td>
                <td className="px-5 py-3 text-right">{fmt(grandMaterialSell)}</td>
                <td className="px-5 py-3 text-right">{fmt(grandDesignSell)}</td>
                <td className="px-5 py-3 text-right text-accent text-base">{fmt(grandSell)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Cards */}
      {grandCost > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Labor",    cost: grandLaborCost,    sell: grandLaborSell,    color: "bg-blue-500",   margin: expandMargins ? laborMargin   : overallMargin },
            { label: "Material", cost: grandMaterialCost, sell: grandMaterialSell, color: "bg-green-500",  margin: expandMargins ? materialMargin : overallMargin },
            { label: "Design",   cost: grandDesignCost,   sell: grandDesignSell,   color: "bg-orange-500", margin: expandMargins ? designMargin   : overallMargin },
          ].map(({ label, cost, sell, color, margin }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
              <div className="text-lg font-bold text-foreground mt-1">{fmt(sell)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Cost: {fmt(cost)}</div>
              <div className="text-xs text-muted-foreground">{pctFmt(margin)} margin</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}