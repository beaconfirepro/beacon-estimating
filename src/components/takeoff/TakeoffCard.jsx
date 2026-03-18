import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Trash2, Save, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import SprinklerInputForm from "./SprinklerInputForm";
import { calculateSprinklerTakeoff, DEFAULT_SPRINKLER_INPUTS } from "@/lib/sprinklerFormulas";

export default function TakeoffCard({ takeoff, type, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("inputs");
  const [saving, setSaving] = useState(false);
  const [materialPrices, setMaterialPrices] = useState([]);

  // inputs drive the formula engine
  const [inputs, setInputs] = useState({
    ...DEFAULT_SPRINKLER_INPUTS,
    ...(takeoff.formula_inputs || {}),
    area_name: takeoff.area_name || "",
  });

  // computed result (labor_items, material_items, totals)
  const [result, setResult] = useState({
    labor_items: takeoff.labor_items || [],
    material_items: takeoff.material_items || [],
    total_labor: takeoff.total_labor || 0,
    total_material: takeoff.total_material || 0,
    total_design: takeoff.total_design || 0,
  });

  useEffect(() => {
    base44.entities.MaterialPrice.list().then(prices => {
      setMaterialPrices(prices || []);
    }).catch(() => {});
  }, []);

  // Re-run formula whenever inputs or prices change
  useEffect(() => {
    if (materialPrices.length === 0) return;
    const priceMap = {};
    materialPrices.forEach(p => { priceMap[p.generic_part_name] = p.price; });
    const calc = calculateSprinklerTakeoff(inputs, priceMap);
    setResult(calc);
  }, [inputs, materialPrices]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = {
      ...takeoff,
      area_name: inputs.area_name,
      formula_inputs: inputs,
      labor_items: result.labor_items,
      material_items: result.material_items,
      total_labor: result.total_labor,
      total_material: result.total_material,
      total_design: inputs.total_design || 0,
    };
    await onUpdate(updated);
    setSaving(false);
    toast.success("Section saved!");
  };

  const fmt = (n) => (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalSection = result.total_labor + result.total_material + (inputs.total_design || 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {takeoff.section_number || "?"}
          </div>
          <div>
            <div className="font-semibold text-foreground">{inputs.area_name || "Unnamed Area"}</div>
            <div className="text-xs text-muted-foreground">
              Labor: ${fmt(result.total_labor)} | Material: ${fmt(result.total_material)} | Total: ${fmt(totalSection)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 py-4 space-y-4">
              {/* Area name */}
              <div className="flex items-center gap-3">
                <div className="w-48">
                  <label className="text-xs text-muted-foreground font-medium">Area Name</label>
                  <Input
                    value={inputs.area_name || ""}
                    onChange={(e) => handleInputChange("area_name", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                {[
                  { key: "inputs", label: "Takeoff Inputs" },
                  { key: "labor", label: `Labor (${result.labor_items.length})` },
                  { key: "material", label: `Material (${result.material_items.length})` },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Inputs Tab */}
              {activeTab === "inputs" && (
                <SprinklerInputForm inputs={inputs} onChange={handleInputChange} />
              )}

              {/* Labor Results Tab */}
              {activeTab === "labor" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Eye className="w-3 h-3" />
                    Auto-calculated from your inputs. Save to persist.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b border-border">
                          <th className="text-left py-2 pr-3 font-semibold">Item</th>
                          <th className="text-right py-2 px-2 font-semibold w-20">Qty</th>
                          <th className="text-right py-2 px-2 font-semibold w-20">Factor</th>
                          <th className="text-right py-2 px-2 font-semibold w-20">Hrs</th>
                          <th className="text-right py-2 px-2 font-semibold w-28">Total ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.labor_items.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-6 text-muted-foreground text-xs">Enter quantities in the Inputs tab</td></tr>
                        ) : result.labor_items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-1.5 pr-3 text-xs">{item.item}</td>
                            <td className="py-1.5 px-2 text-right text-xs">{item.quantity}</td>
                            <td className="py-1.5 px-2 text-right text-xs">{item.factor}</td>
                            <td className="py-1.5 px-2 text-right text-xs">{(item.quantity * item.factor).toFixed(2)}</td>
                            <td className="py-1.5 px-2 text-right font-medium text-xs">${fmt(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pt-1">
                    <div className="text-sm font-semibold">
                      Total Labor: <span className="text-accent">${fmt(result.total_labor)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Material Results Tab */}
              {activeTab === "material" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Eye className="w-3 h-3" />
                    Prices pulled from master inventory. Save to persist.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b border-border">
                          <th className="text-left py-2 pr-3 font-semibold">Item</th>
                          <th className="text-right py-2 px-2 font-semibold w-20">Qty</th>
                          <th className="text-right py-2 px-2 font-semibold w-24">Unit Price</th>
                          <th className="text-right py-2 px-2 font-semibold w-28">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.material_items.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-6 text-muted-foreground text-xs">Enter quantities in the Inputs tab</td></tr>
                        ) : result.material_items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-1.5 pr-3 text-xs">{item.item}</td>
                            <td className="py-1.5 px-2 text-right text-xs">{item.quantity}</td>
                            <td className="py-1.5 px-2 text-right text-xs">${fmt(item.price)}</td>
                            <td className="py-1.5 px-2 text-right font-medium text-xs">${fmt(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pt-1">
                    <div className="text-sm font-semibold">
                      Total Material: <span className="text-accent">${fmt(result.total_material)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-sm font-bold text-foreground">
                  Section Total: <span className="text-accent">${fmt(totalSection)}</span>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Save className="w-3 h-3" />
                  {saving ? "Saving..." : "Save Section"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}