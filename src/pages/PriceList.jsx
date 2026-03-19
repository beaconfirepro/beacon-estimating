import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Plus, Save, Trash2, RefreshCw, Package, Layers,
  ChevronDown, ChevronUp, CheckCircle, Pencil, X
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["pipe", "fittings", "hangers", "sprinkler_heads", "valves", "misc"];

const fmt = (n) =>
  (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────────────────────────────────────────
// PARTS TAB
// ─────────────────────────────────────────────────────────────────────────────

function PriceRow({ item, onSave, onDelete, isActive, onSetActive }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  const f = (field, val) => setDraft(prev => ({ ...prev, [field]: val }));

  return (
    <tr className={`border-b border-border/50 hover:bg-muted/20 ${isActive ? "bg-primary/5" : ""}`}>
      <td className="px-3 py-2">
        {editing ? <Input value={draft.supplier_name || ""} onChange={e => f("supplier_name", e.target.value)} className="h-7 text-xs w-32" />
          : <span className="text-xs font-medium">{item.supplier_name || <span className="text-muted-foreground italic">—</span>}</span>}
      </td>
      <td className="px-3 py-2">
        {editing ? <Input value={draft.supplier_part_name || ""} onChange={e => f("supplier_part_name", e.target.value)} className="h-7 text-xs w-36" />
          : <span className="text-xs">{item.supplier_part_name || <span className="text-muted-foreground italic">—</span>}</span>}
      </td>
      <td className="px-3 py-2">
        {editing ? <Input value={draft.supplier_part_number || ""} onChange={e => f("supplier_part_number", e.target.value)} className="h-7 text-xs w-28" />
          : <span className="text-xs font-mono">{item.supplier_part_number || "—"}</span>}
      </td>
      <td className="px-3 py-2 text-right">
        {editing ? <Input type="number" value={draft.price || ""} onChange={e => f("price", parseFloat(e.target.value) || 0)} className="h-7 text-xs w-20 text-right" />
          : <span className="text-xs font-semibold">${fmt(item.price)}</span>}
      </td>
      <td className="px-3 py-2 text-right">
        {editing ? <Input type="number" value={draft.list_price || ""} onChange={e => f("list_price", parseFloat(e.target.value) || 0)} className="h-7 text-xs w-20 text-right" />
          : <span className="text-xs text-muted-foreground">${fmt(item.list_price)}</span>}
      </td>
      <td className="px-3 py-2 text-center">
        <button onClick={() => onSetActive(item.id)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${isActive ? "border-primary bg-primary" : "border-border hover:border-primary"}`}>
          {isActive && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
        </button>
      </td>
      <td className="px-3 py-2 text-right">
        {editing ? (
          <Input type="date" value={draft.last_updated || ""} onChange={e => f("last_updated", e.target.value)} className="h-7 text-xs w-28" />
        ) : (
          <span className="text-xs text-muted-foreground">{item.last_updated || <span className="italic">—</span>}</span>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1 justify-end">
          {editing ? (
            <>
              <Button size="sm" className="h-6 px-2 text-xs" onClick={handleSave} disabled={saving}>
                {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => { setDraft(item); setEditing(false); }}>✕</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditing(true)}>Edit</Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(item.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function PartGroup({ partName, items, activeIds, onSave, onDelete, onAddVendor, onSetActive }) {
  const [open, setOpen] = useState(false);
  const activeItem = items.find(i => activeIds[partName] === i.id) || items[0];
  const category = items[0]?.category || "misc";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-card hover:bg-muted/30 transition-colors text-left">
        <div className="flex items-center gap-3">
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          <span className="font-medium text-sm text-foreground">{partName}</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">{category}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">{items.length} vendor{items.length !== 1 ? "s" : ""}</span>
          {activeItem && (
            <span className="font-semibold text-foreground">
              Active: <span className="text-primary">${fmt(activeItem.price)}</span>
              {activeItem.supplier_name && <span className="text-muted-foreground ml-1">({activeItem.supplier_name})</span>}
            </span>
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left font-semibold">Vendor</th>
                <th className="px-3 py-2 text-left font-semibold">Part Name</th>
                <th className="px-3 py-2 text-left font-semibold">Part #</th>
                <th className="px-3 py-2 text-right font-semibold">Our Price</th>
                <th className="px-3 py-2 text-right font-semibold">List Price</th>
                <th className="px-3 py-2 text-center font-semibold w-16">Active</th>
                <th className="px-3 py-2 text-right font-semibold w-28">Last Updated</th>
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <PriceRow key={item.id} item={item}
                  isActive={activeIds[partName] === item.id || (!activeIds[partName] && item === items[0])}
                  onSetActive={(id) => onSetActive(partName, id)}
                  onSave={onSave} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-border/50 bg-muted/10">
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onAddVendor(partName, category)}>
              <Plus className="w-3 h-3" /> Add Vendor Price
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewPartForm({ onSave, onCancel, defaultPartName, defaultCategory }) {
  const [data, setData] = useState({
    generic_part_name: defaultPartName || "",
    supplier_name: "", price: "", list_price: "",
    category: defaultCategory || "misc",
    supplier_part_name: "", supplier_part_number: ""
  });
  const f = (k, v) => setData(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.generic_part_name) return toast.error("Part name is required");
    onSave({ ...data, price: parseFloat(data.price) || 0, list_price: parseFloat(data.list_price) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-primary/30 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-sm text-foreground">{defaultPartName ? `Add Vendor — ${defaultPartName}` : "New Part"}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {!defaultPartName && (
          <div>
            <label className="text-xs text-muted-foreground font-medium">Generic Part Name *</label>
            <Input value={data.generic_part_name} onChange={e => f("generic_part_name", e.target.value)} className="mt-1 h-8 text-xs" placeholder='e.g. 1" Elbow' />
          </div>
        )}
        <div>
          <label className="text-xs text-muted-foreground font-medium">Category</label>
          <select value={data.category} onChange={e => f("category", e.target.value)}
            className="mt-1 h-8 text-xs w-full border border-input rounded-md px-2 bg-transparent" disabled={!!defaultCategory}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Vendor</label>
          <Input value={data.supplier_name} onChange={e => f("supplier_name", e.target.value)} className="mt-1 h-8 text-xs" placeholder="e.g. Ferguson" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Vendor Part Name</label>
          <Input value={data.supplier_part_name} onChange={e => f("supplier_part_name", e.target.value)} className="mt-1 h-8 text-xs" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Part #</label>
          <Input value={data.supplier_part_number} onChange={e => f("supplier_part_number", e.target.value)} className="mt-1 h-8 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground font-medium">Our Price</label>
            <Input type="number" value={data.price} onChange={e => f("price", e.target.value)} className="mt-1 h-8 text-xs" placeholder="0.00" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">List Price</label>
            <Input type="number" value={data.list_price} onChange={e => f("list_price", e.target.value)} className="mt-1 h-8 text-xs" placeholder="0.00" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="h-8 text-xs">Save</Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLIES TAB
// ─────────────────────────────────────────────────────────────────────────────

const FORMULA_FIELDS = [
  { field: "heads_concealed",       label: "Concealed Head" },
  { field: "heads_pendant",         label: "Pendant Head" },
  { field: "heads_upright",         label: "Upright Head" },
  { field: "heads_sidewall",        label: "Sidewall Head" },
  { field: "pipe_1in_lf",           label: '1" Pipe (LF)' },
  { field: "pipe_1_25in_lf",        label: '1¼" Pipe (LF)' },
  { field: "pipe_1_5in_lf",         label: '1½" Pipe (LF)' },
  { field: "pipe_2in_lf",           label: '2" Pipe (LF)' },
  { field: "pipe_2_5in_lf",         label: '2½" Pipe (LF)' },
  { field: "pipe_3in_lf",           label: '3" Pipe (LF)' },
  { field: "pipe_4in_lf",           label: '4" Pipe (LF)' },
  { field: "thr_elbow_1in",         label: '1" Elbow (Thr)' },
  { field: "thr_tee_1in",           label: '1" Tee (Thr)' },
  { field: "thr_reducer_1in",       label: '1" Reducer (Thr)' },
  { field: "thr_coupling_1_25in",   label: '1¼" Coupling (Thr)' },
  { field: "thr_reducer_1_25in",    label: '1¼" Reducer (Thr)' },
  { field: "grv_coupling_2_5in",    label: '2½" Coupling (Grv)' },
  { field: "grv_elbow_2_5in",       label: '2½" Elbow (Grv)' },
  { field: "grv_tee_2_5in",         label: '2½" Tee (Grv)' },
  { field: "grv_reducer_2_5in",     label: '2½" Reducer (Grv)' },
  { field: "grv_coupling_3in",      label: '3" Coupling (Grv)' },
  { field: "grv_elbow_3in",         label: '3" Elbow (Grv)' },
  { field: "grv_tee_3in",           label: '3" Tee (Grv)' },
  { field: "grv_coupling_4in",      label: '4" Coupling (Grv)' },
  { field: "grv_elbow_4in",         label: '4" Elbow (Grv)' },
  { field: "grv_tee_4in",           label: '4" Tee (Grv)' },
  { field: "hangers_1in_2in",       label: 'Hanger 1"-2"' },
  { field: "hangers_2_5in_4in",     label: 'Hanger 2.5"-4"' },
  { field: "butterfly_valves_4in",  label: 'Butterfly Valve 4"' },
  { field: "butterfly_valves_6in",  label: 'Butterfly Valve 6"' },
  { field: "alarm_check_valves_4in",label: 'Alarm Check Valve 4"' },
  { field: "backflow_preventers_4in",label: 'Backflow Preventer 4"' },
  { field: "flow_switches",         label: "Flow Switch" },
  { field: "tamper_switches",       label: "Tamper Switch" },
  { field: "pressure_gauges",       label: "Pressure Gauge" },
  { field: "drain_valves",          label: 'Drain Valve 2"' },
  { field: "inspector_test_conns",  label: "Inspector Test Conn" },
  { field: "riser_assemblies",      label: "Riser Assembly" },
  { field: "seismic_braces",        label: "Seismic Brace" },
];

const QP_CATEGORIES = [
  "", "Quick Pick: Heads", "Quick Pick: Risers", "Quick Pick: Mains",
  "Quick Pick: Branchline (Threaded)", "Quick Pick: Branchline (Grooved)", "Quick Pick: Valves & Trim"
];

function AssemblyComponentRow({ comp, allPartNames, onChange, onRemove, isQuickPick }) {
  const hasOverride = !!(comp.formula_field);

  return (
    <div className="flex items-start gap-2 py-1">
      <div className="flex-1">
        <select
          value={comp.generic_part_name}
          onChange={e => onChange({ ...comp, generic_part_name: e.target.value })}
          className="w-full h-7 text-xs border border-input rounded-md px-2 bg-transparent"
        >
          <option value="">— select part —</option>
          {allPartNames.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="w-20">
        <Input
          type="number"
          value={comp.quantity}
          onChange={e => onChange({ ...comp, quantity: parseFloat(e.target.value) || 0 })}
          className="h-7 text-xs text-right"
          placeholder="Qty"
        />
      </div>
      {isQuickPick && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange({ ...comp, formula_field: hasOverride ? "" : (FORMULA_FIELDS[0]?.field || "") })}
            className={`h-7 px-2 text-xs rounded border transition-colors whitespace-nowrap ${
              hasOverride
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-accent/50"
            }`}
            title={hasOverride ? "Using per-component basis override" : "Click to override basis for this part"}
          >
            {hasOverride ? "Override ✓" : "Override"}
          </button>
          {hasOverride && (
            <select
              value={comp.formula_field || ""}
              onChange={e => onChange({ ...comp, formula_field: e.target.value })}
              className="w-44 h-7 text-xs border border-accent/40 rounded-md px-2 bg-transparent"
            >
              <option value="">— basis —</option>
              {FORMULA_FIELDS.map(f => <option key={f.field} value={f.field}>{f.label}</option>)}
            </select>
          )}
        </div>
      )}
      <div className="w-28">
        <Input
          value={comp.notes || ""}
          onChange={e => onChange({ ...comp, notes: e.target.value })}
          className="h-7 text-xs"
          placeholder="Notes (opt)"
        />
      </div>
      <button onClick={onRemove} className="text-destructive hover:text-destructive/80 mt-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function AssemblyCard({ assembly, allPartNames, priceMap, activeIds, onSave, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(assembly);
  const [saving, setSaving] = useState(false);

  const isQuickPick = !!(draft.quick_pick_category);

  const totalCost = (assembly.components || []).reduce((sum, comp) => {
    const unitPrice = priceMap[comp.generic_part_name] || 0;
    return sum + unitPrice * (comp.quantity || 0);
  }, 0);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  const addComponent = () => {
    setDraft(prev => ({
      ...prev,
      components: [...(prev.components || []), { generic_part_name: "", quantity: 1, formula_field: "", notes: "" }]
    }));
  };

  const updateComponent = (idx, comp) => {
    setDraft(prev => {
      const comps = [...(prev.components || [])];
      comps[idx] = comp;
      return { ...prev, components: comps };
    });
  };

  const removeComponent = (idx) => {
    setDraft(prev => ({
      ...prev,
      components: (prev.components || []).filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${assembly.quick_pick_category ? "border-accent/40" : "border-border"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card hover:bg-muted/20 transition-colors">
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 flex-1 text-left">
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          <div className={`w-6 h-6 rounded flex items-center justify-center ${assembly.quick_pick_category ? "bg-accent/20" : "bg-accent/10"}`}>
            <Layers className={`w-3.5 h-3.5 ${assembly.quick_pick_category ? "text-accent" : "text-accent"}`} />
          </div>
          <span className="font-medium text-sm text-foreground">{assembly.name}</span>
          {assembly.quick_pick_category && (
            <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">⚡ {assembly.quick_pick_category}</span>
          )}
          {assembly.category && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">{assembly.category}</span>
          )}
          <span className="text-xs text-muted-foreground">{(assembly.components || []).length} parts</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">
            Material: <span className="text-accent">${fmt(totalCost)}</span>
          </span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditing(true); setOpen(true); }}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(assembly.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/10">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Assembly Name *</label>
                  <Input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Category</label>
                  <select value={draft.category || "misc"} onChange={e => setDraft(p => ({ ...p, category: e.target.value }))}
                    className="mt-1 h-8 text-xs w-full border border-input rounded-md px-2 bg-transparent">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Labor Hours</label>
                  <Input type="number" value={draft.labor_hours || ""} onChange={e => setDraft(p => ({ ...p, labor_hours: parseFloat(e.target.value) || 0 }))} className="mt-1 h-8 text-xs" placeholder="0.00" />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <label className="text-xs text-muted-foreground font-medium">Description</label>
                  <Input value={draft.description || ""} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} className="mt-1 h-8 text-xs" />
                </div>
              </div>

              {/* Quick Pick settings */}
              <div className="border border-accent/30 rounded-lg p-3 bg-accent/5 space-y-2">
                <div className="text-xs font-semibold text-accent uppercase tracking-wide">⚡ Quick Pick Settings</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Quick Pick Category</label>
                    <select value={draft.quick_pick_category || ""} onChange={e => setDraft(p => ({ ...p, quick_pick_category: e.target.value }))}
                      className="mt-1 h-8 text-xs w-full border border-input rounded-md px-2 bg-transparent">
                      {QP_CATEGORIES.map(c => <option key={c} value={c}>{c || "— Not a Quick Pick —"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Unit Label</label>
                    <Input value={draft.quick_pick_unit || ""} onChange={e => setDraft(p => ({ ...p, quick_pick_unit: e.target.value }))}
                      className="mt-1 h-8 text-xs" placeholder="e.g. head, riser, 10 LF" />
                  </div>
                </div>
                {draft.quick_pick_category && (
                  <p className="text-xs text-muted-foreground">Set the <strong>Basis</strong> for each component below so quantities flow into the takeoff engine.</p>
                )}
              </div>

              {/* Component list */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Components</label>
                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={addComponent}>
                    <Plus className="w-3 h-3" /> Add Part
                  </Button>
                </div>
                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground font-medium">
                  <span className="flex-1">Part</span>
                  <span className="w-20 text-right">Qty</span>
                  {isQuickPick && <span className="w-44">Basis</span>}
                  <span className="w-28">Notes</span>
                  <span className="w-4"></span>
                </div>
                {(draft.components || []).length === 0
                  ? <p className="text-xs text-muted-foreground italic">No components yet. Click "Add Part".</p>
                  : (draft.components || []).map((comp, idx) => (
                    <AssemblyComponentRow key={idx} comp={comp} allPartNames={allPartNames}
                      isQuickPick={isQuickPick}
                      onChange={(c) => updateComponent(idx, c)} onRemove={() => removeComponent(idx)} />
                  ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" className="h-8 text-xs" onClick={handleSave} disabled={saving}>
                  {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" />Save Assembly</>}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setDraft(assembly); setEditing(false); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            /* Read-only view */
            <div>
              {assembly.description && <p className="text-xs text-muted-foreground mb-2">{assembly.description}</p>}
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-left py-1 font-semibold">Part</th>
                    <th className="text-right py-1 font-semibold w-14">Qty</th>
                    <th className="text-right py-1 font-semibold w-24">Unit Price</th>
                    <th className="text-right py-1 font-semibold w-24">Ext.</th>
                    <th className="text-left py-1 font-semibold w-32 pl-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(assembly.components || []).map((comp, idx) => {
                    const unitPrice = priceMap[comp.generic_part_name] || 0;
                    const ext = unitPrice * (comp.quantity || 0);
                    return (
                      <tr key={idx} className="border-b border-border/30 last:border-0">
                        <td className="py-1 pr-2">{comp.generic_part_name || <span className="italic text-muted-foreground">—</span>}</td>
                        <td className="py-1 text-right tabular-nums">{comp.quantity}</td>
                        <td className="py-1 text-right tabular-nums">${fmt(unitPrice)}</td>
                        <td className="py-1 text-right tabular-nums font-medium">${fmt(ext)}</td>
                        <td className="py-1 pl-3 text-muted-foreground">{comp.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-2 text-xs">
                {assembly.labor_hours > 0 && <span className="text-muted-foreground">Labor: <strong>{assembly.labor_hours} hrs</strong></span>}
                <span className="ml-auto font-semibold">Total Material: <span className="text-accent">${fmt(totalCost)}</span></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewAssemblyForm({ allPartNames, onSave, onCancel }) {
  const [data, setData] = useState({ name: "", description: "", category: "misc", labor_hours: "", quick_pick_category: "", quick_pick_unit: "", components: [] });

  const isQuickPick = !!data.quick_pick_category;
  const addComponent = () => setData(p => ({ ...p, components: [...p.components, { generic_part_name: "", quantity: 1, formula_field: "", notes: "" }] }));
  const updateComponent = (idx, comp) => setData(p => { const c = [...p.components]; c[idx] = comp; return { ...p, components: c }; });
  const removeComponent = (idx) => setData(p => ({ ...p, components: p.components.filter((_, i) => i !== idx) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.name) return toast.error("Assembly name is required");
    onSave({ ...data, labor_hours: parseFloat(data.labor_hours) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-primary/30 rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-sm text-foreground">New Assembly</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium">Assembly Name *</label>
          <Input value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="e.g. Riser Assembly" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Category</label>
          <select value={data.category} onChange={e => setData(p => ({ ...p, category: e.target.value }))}
            className="mt-1 h-8 text-xs w-full border border-input rounded-md px-2 bg-transparent">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Labor Hours</label>
          <Input type="number" value={data.labor_hours} onChange={e => setData(p => ({ ...p, labor_hours: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="0.00" />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="text-xs text-muted-foreground font-medium">Description</label>
          <Input value={data.description} onChange={e => setData(p => ({ ...p, description: e.target.value }))} className="mt-1 h-8 text-xs" />
        </div>
      </div>

      {/* Quick Pick settings */}
      <div className="border border-accent/30 rounded-lg p-3 bg-accent/5 space-y-2">
        <div className="text-xs font-semibold text-accent uppercase tracking-wide">⚡ Quick Pick Settings</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium">Quick Pick Category</label>
            <select value={data.quick_pick_category} onChange={e => setData(p => ({ ...p, quick_pick_category: e.target.value }))}
              className="mt-1 h-8 text-xs w-full border border-input rounded-md px-2 bg-transparent">
              {QP_CATEGORIES.map(c => <option key={c} value={c}>{c || "— Not a Quick Pick —"}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Unit Label</label>
            <Input value={data.quick_pick_unit} onChange={e => setData(p => ({ ...p, quick_pick_unit: e.target.value }))}
              className="mt-1 h-8 text-xs" placeholder="e.g. head, riser, 10 LF" />
          </div>
        </div>
        {isQuickPick && (
        <p className="text-xs text-muted-foreground">Set the <strong>Basis</strong> for each component so quantities flow into the takeoff engine.</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Components</label>
          <Button type="button" size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={addComponent}>
            <Plus className="w-3 h-3" /> Add Part
          </Button>
        </div>
        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground font-medium">
          <span className="flex-1">Part</span>
          <span className="w-20 text-right">Qty</span>
          {isQuickPick && <span className="w-44">Basis</span>}
          <span className="w-28">Notes</span>
          <span className="w-4"></span>
        </div>
        {data.components.length === 0
          ? <p className="text-xs text-muted-foreground italic">Add parts to this assembly.</p>
          : data.components.map((comp, idx) => (
            <AssemblyComponentRow key={idx} comp={comp} allPartNames={allPartNames}
              isQuickPick={isQuickPick}
              onChange={(c) => updateComponent(idx, c)} onRemove={() => removeComponent(idx)} />
          ))}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="h-8 text-xs">Save Assembly</Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PriceList() {
  const [tab, setTab] = useState("parts");
  const [items, setItems] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showNewPartForm, setShowNewPartForm] = useState(false);
  const [showNewAssemblyForm, setShowNewAssemblyForm] = useState(false);
  const [activeIds, setActiveIds] = useState({});
  const [addVendorFor, setAddVendorFor] = useState(null);

  const load = async () => {
    setLoading(true);
    const [parts, asms] = await Promise.all([
      base44.entities.MaterialPrice.list("-updated_date", 500),
      base44.entities.Assembly.list("-updated_date", 200),
    ]);
    setItems(parts || []);
    setAssemblies(asms || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group parts by generic_part_name
  const grouped = items.reduce((acc, item) => {
    const key = item.generic_part_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const allPartNames = Object.keys(grouped).sort();

  // Active price map: partName -> price
  const priceMap = allPartNames.reduce((acc, name) => {
    const vendorItems = grouped[name];
    const active = vendorItems.find(i => activeIds[name] === i.id) || vendorItems[0];
    acc[name] = active?.price || 0;
    return acc;
  }, {});

  const filteredPartKeys = allPartNames.filter(key => {
    const matchSearch = !search || key.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || grouped[key][0]?.category === filterCat;
    return matchSearch && matchCat;
  });

  const filteredAssemblies = assemblies.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || a.category === filterCat;
    return matchSearch && matchCat;
  });

  // Part handlers
  const handlePartSave = async (draft) => {
    const today = new Date().toISOString().split("T")[0];
    const withDate = { ...draft, last_updated: draft.last_updated || today };
    await base44.entities.MaterialPrice.update(withDate.id, withDate);
    setItems(prev => prev.map(i => i.id === withDate.id ? { ...i, ...withDate } : i));
    toast.success("Price updated");
  };

  const handlePartDelete = async (id) => {
    await base44.entities.MaterialPrice.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Entry removed");
  };

  const handlePartCreate = async (data) => {
    const today = new Date().toISOString().split("T")[0];
    const created = await base44.entities.MaterialPrice.create({ last_updated: today, ...data });
    setItems(prev => [...prev, created]);
    setShowNewPartForm(false);
    setAddVendorFor(null);
    toast.success("Part added");
  };

  const handleSetActive = (partName, id) => {
    setActiveIds(prev => ({ ...prev, [partName]: id }));
    toast.success("Active vendor updated");
  };

  // Assembly handlers
  const handleAssemblySave = async (draft) => {
    await base44.entities.Assembly.update(draft.id, draft);
    setAssemblies(prev => prev.map(a => a.id === draft.id ? { ...a, ...draft } : a));
    toast.success("Assembly saved");
  };

  const handleAssemblyDelete = async (id) => {
    await base44.entities.Assembly.delete(id);
    setAssemblies(prev => prev.filter(a => a.id !== id));
    toast.success("Assembly removed");
  };

  const handleAssemblyCreate = async (data) => {
    const created = await base44.entities.Assembly.create(data);
    setAssemblies(prev => [...prev, created]);
    setShowNewAssemblyForm(false);
    toast.success("Assembly created");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" /> Projects
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" />
              <span className="font-semibold text-sm">Price List & Vendors</span>
            </div>
          </div>
          {tab === "parts" && (
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => { setShowNewPartForm(true); setAddVendorFor(null); }}>
              <Plus className="w-4 h-4" /> Add Part
            </Button>
          )}
          {tab === "assemblies" && (
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setShowNewAssemblyForm(true)}>
              <Plus className="w-4 h-4" /> New Assembly
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 w-fit">
          {[
            { key: "parts", icon: Package, label: "Parts" },
            { key: "assemblies", icon: Layers, label: "Assemblies" },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => { setTab(key); setFilterCat("all"); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Inline forms */}
        {showNewPartForm && tab === "parts" && (
          <NewPartForm onSave={handlePartCreate} onCancel={() => setShowNewPartForm(false)} />
        )}
        {addVendorFor && (
          <NewPartForm defaultPartName={addVendorFor.partName} defaultCategory={addVendorFor.category}
            onSave={(data) => handlePartCreate({ ...data, generic_part_name: addVendorFor.partName, category: addVendorFor.category })}
            onCancel={() => setAddVendorFor(null)} />
        )}
        {showNewAssemblyForm && tab === "assemblies" && (
          <NewAssemblyForm allPartNames={allPartNames} onSave={handleAssemblyCreate} onCancel={() => setShowNewAssemblyForm(false)} />
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input placeholder={tab === "parts" ? "Search parts..." : "Search assemblies..."} value={search}
            onChange={e => setSearch(e.target.value)} className="h-8 text-sm w-56" />
          {tab === "parts" && (
            <div className="flex gap-1 flex-wrap">
              {["all", ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                    filterCat === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {tab === "parts" ? `${filteredPartKeys.length} parts` : `${filteredAssemblies.length} assemblies`}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : tab === "parts" ? (
          filteredPartKeys.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No parts found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPartKeys.map(partName => (
                <PartGroup key={partName} partName={partName} items={grouped[partName]}
                  activeIds={activeIds} onSave={handlePartSave} onDelete={handlePartDelete}
                  onAddVendor={(name, cat) => { setAddVendorFor({ partName: name, category: cat }); setShowNewPartForm(false); }}
                  onSetActive={handleSetActive} />
              ))}
            </div>
          )
        ) : (
          filteredAssemblies.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No assemblies yet.</p>
              <p className="text-sm mt-1">Create an assembly by combining parts from your price list.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssemblies.map(assembly => (
                <AssemblyCard key={assembly.id} assembly={assembly} allPartNames={allPartNames}
                  priceMap={priceMap} activeIds={activeIds}
                  onSave={handleAssemblySave} onDelete={handleAssemblyDelete} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}