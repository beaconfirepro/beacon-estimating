import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Trash2, Save, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import MaterialItemRow from "./MaterialItemRow";

export default function TakeoffCard({ takeoff, type, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [data, setData] = useState(takeoff);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("labor");
  const [materialPrices, setMaterialPrices] = useState([]);

  useEffect(() => {
    base44.entities.MaterialPrice.list().then(setMaterialPrices).catch(() => {});
  }, []);

  const recalcTotals = (d) => {
    const totalLabor = (d.labor_items || []).reduce((s, item) => s + (item.total || 0), 0);
    const totalMaterial = (d.material_items || []).reduce((s, item) => s + (item.total || 0), 0);
    return { ...d, total_labor: totalLabor, total_material: totalMaterial };
  };

  const updateLaborItem = (idx, field, value) => {
    const items = [...(data.labor_items || [])];
    items[idx] = { ...items[idx], [field]: value };
    if (field === "quantity" || field === "factor") {
      const q = field === "quantity" ? parseFloat(value) || 0 : parseFloat(items[idx].quantity) || 0;
      const f = field === "factor" ? parseFloat(value) || 0 : parseFloat(items[idx].factor) || 0;
      items[idx].total = q * f;
    }
    setData(recalcTotals({ ...data, labor_items: items }));
  };

  const updateMaterialItem = (idx, field, value) => {
    const items = [...(data.material_items || [])];
    if (field === "_batch") {
      items[idx] = { ...items[idx], ...value };
    } else {
      items[idx] = { ...items[idx], [field]: value };
      if (field === "quantity" || field === "price") {
        const q = field === "quantity" ? parseFloat(value) || 0 : parseFloat(items[idx].quantity) || 0;
        const p = field === "price" ? parseFloat(value) || 0 : parseFloat(items[idx].price) || 0;
        items[idx].total = q * p;
      }
    }
    setData(recalcTotals({ ...data, material_items: items }));
  };

  const addLaborItem = () => {
    const items = [...(data.labor_items || []), { item: "", quantity: 0, factor: 0, total: 0, is_manual: true }];
    setData({ ...data, labor_items: items });
  };

  const addMaterialItem = () => {
    const items = [...(data.material_items || []), { item: "", quantity: 0, price: 0, total: 0 }];
    setData({ ...data, material_items: items });
  };

  const removeLaborItem = (idx) => {
    const items = data.labor_items.filter((_, i) => i !== idx);
    setData(recalcTotals({ ...data, labor_items: items }));
  };

  const removeMaterialItem = (idx) => {
    const items = data.material_items.filter((_, i) => i !== idx);
    setData(recalcTotals({ ...data, material_items: items }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(data);
    setSaving(false);
    toast.success("Section saved!");
  };

  const fmt = (n) => (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalSection = (data.total_labor || 0) + (data.total_material || 0) + (data.total_design || 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {data.section_number || "?"}
          </div>
          <div>
            <div className="font-semibold text-foreground">{data.area_name || "Unnamed Area"}</div>
            <div className="text-xs text-muted-foreground">
              Labor: ${fmt(data.total_labor)} | Material: ${fmt(data.total_material)} | Total: ${fmt(totalSection)}
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
              {/* Area name input */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground font-medium">Area Name</label>
                  <Input
                    value={data.area_name || ""}
                    onChange={(e) => setData({ ...data, area_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                {type === "sprinkler" && (
                  <>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground font-medium">Labor Classification</label>
                      <Input
                        value={data.labor_classification || ""}
                        onChange={(e) => setData({ ...data, labor_classification: e.target.value })}
                        className="mt-1"
                        placeholder="e.g. Journeyman"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">Design Hours</label>
                      <Input
                        type="number"
                        value={data.total_design || ""}
                        onChange={(e) => setData({ ...data, total_design: parseFloat(e.target.value) || 0 })}
                        className="mt-1 w-28"
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                {["labor", "material"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "labor" ? `Labor Items (${(data.labor_items || []).length})` : `Material Items (${(data.material_items || []).length})`}
                  </button>
                ))}
              </div>

              {/* Labor Table */}
              {activeTab === "labor" && (
                <div className="space-y-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b border-border">
                          <th className="text-left py-2 pr-3 font-semibold">Item</th>
                          <th className="text-right py-2 px-2 font-semibold w-24">Quantity</th>
                          <th className="text-right py-2 px-2 font-semibold w-24">Factor</th>
                          <th className="text-right py-2 px-2 font-semibold w-28">Total</th>
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {(data.labor_items || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-1.5 pr-3">
                              <Input
                                value={item.item || ""}
                                onChange={(e) => updateLaborItem(idx, "item", e.target.value)}
                                className="h-7 text-xs"
                              />
                            </td>
                            <td className="py-1.5 px-2">
                              <Input
                                type="number"
                                value={item.quantity || ""}
                                onChange={(e) => updateLaborItem(idx, "quantity", e.target.value)}
                                className="h-7 text-xs text-right w-24"
                              />
                            </td>
                            <td className="py-1.5 px-2">
                              <Input
                                type="number"
                                value={item.factor || ""}
                                onChange={(e) => updateLaborItem(idx, "factor", e.target.value)}
                                className="h-7 text-xs text-right w-24"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-right font-medium text-foreground whitespace-nowrap">
                              ${fmt(item.total)}
                            </td>
                            <td className="py-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => removeLaborItem(idx)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="outline" size="sm" onClick={addLaborItem} className="gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Add Labor Item
                  </Button>
                  <div className="flex justify-end pt-1">
                    <div className="text-sm font-semibold text-foreground">
                      Total Labor: <span className="text-accent">${fmt(data.total_labor)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Material Table */}
              {activeTab === "material" && (
                <div className="space-y-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b border-border">
                          <th className="text-left py-2 pr-3 font-semibold">Item</th>
                          <th className="text-right py-2 px-2 font-semibold w-24">Qty</th>
                          <th className="text-right py-2 px-2 font-semibold w-28">Price</th>
                          <th className="text-right py-2 px-2 font-semibold w-28">Total</th>
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {(data.material_items || []).map((item, idx) => (
                          <MaterialItemRow
                            key={idx}
                            item={item}
                            idx={idx}
                            materialPrices={materialPrices}
                            onUpdate={updateMaterialItem}
                            onRemove={removeMaterialItem}
                            fmt={fmt}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="outline" size="sm" onClick={addMaterialItem} className="gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Add Material Item
                  </Button>
                  <div className="flex justify-end pt-1">
                    <div className="text-sm font-semibold text-foreground">
                      Total Material: <span className="text-accent">${fmt(data.total_material)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-2 border-t border-border">
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