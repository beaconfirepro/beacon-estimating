import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Save, Trash2, RefreshCw, Package, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["pipe", "fittings", "hangers", "sprinkler_heads", "valves", "misc"];

const fmt = (n) =>
  (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Inline-editable row ──────────────────────────────────────────────────
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
        {editing ? (
          <Input value={draft.supplier_name || ""} onChange={e => f("supplier_name", e.target.value)} className="h-7 text-xs w-32" />
        ) : (
          <span className="text-xs font-medium">{item.supplier_name || <span className="text-muted-foreground italic">—</span>}</span>
        )}
      </td>
      <td className="px-3 py-2">
        {editing ? (
          <Input value={draft.supplier_part_name || ""} onChange={e => f("supplier_part_name", e.target.value)} className="h-7 text-xs w-36" />
        ) : (
          <span className="text-xs">{item.supplier_part_name || <span className="text-muted-foreground italic">—</span>}</span>
        )}
      </td>
      <td className="px-3 py-2">
        {editing ? (
          <Input value={draft.supplier_part_number || ""} onChange={e => f("supplier_part_number", e.target.value)} className="h-7 text-xs w-28" />
        ) : (
          <span className="text-xs font-mono">{item.supplier_part_number || "—"}</span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        {editing ? (
          <Input type="number" value={draft.price || ""} onChange={e => f("price", parseFloat(e.target.value) || 0)} className="h-7 text-xs w-20 text-right" />
        ) : (
          <span className="text-xs font-semibold">${fmt(item.price)}</span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        {editing ? (
          <Input type="number" value={draft.list_price || ""} onChange={e => f("list_price", parseFloat(e.target.value) || 0)} className="h-7 text-xs w-20 text-right" />
        ) : (
          <span className="text-xs text-muted-foreground">${fmt(item.list_price)}</span>
        )}
      </td>
      <td className="px-3 py-2 text-center">
        <button
          onClick={() => onSetActive(item.id)}
          title={isActive ? "Active price" : "Set as active price"}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${
            isActive ? "border-primary bg-primary" : "border-border hover:border-primary"
          }`}
        >
          {isActive && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
        </button>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1 justify-end">
          {editing ? (
            <>
              <Button size="sm" className="h-6 px-2 text-xs" onClick={handleSave} disabled={saving}>
                {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => { setDraft(item); setEditing(false); }}>
                ✕
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditing(true)}>
                Edit
              </Button>
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

// ── Part group (all vendors for one generic part) ────────────────────────
function PartGroup({ partName, items, activeIds, onSave, onDelete, onAddVendor, onSetActive }) {
  const [open, setOpen] = useState(false);
  const activeItem = items.find(i => activeIds[partName] === i.id) || items[0];
  const category = items[0]?.category || "misc";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-card hover:bg-muted/30 transition-colors text-left"
      >
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
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <PriceRow
                  key={item.id}
                  item={item}
                  isActive={activeIds[partName] === item.id || (!activeIds[partName] && item === items[0])}
                  onSetActive={(id) => onSetActive(partName, id)}
                  onSave={onSave}
                  onDelete={onDelete}
                />
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

// ── New part dialog (inline) ─────────────────────────────────────────────
function NewPartForm({ onSave, onCancel }) {
  const [data, setData] = useState({ generic_part_name: "", supplier_name: "", price: "", list_price: "", category: "misc", supplier_part_name: "", supplier_part_number: "" });
  const f = (k, v) => setData(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.generic_part_name) return toast.error("Part name is required");
    onSave({ ...data, price: parseFloat(data.price) || 0, list_price: parseFloat(data.list_price) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-primary/30 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-sm text-foreground">New Part</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium">Generic Part Name *</label>
          <Input value={data.generic_part_name} onChange={e => f("generic_part_name", e.target.value)} className="mt-1 h-8 text-xs" placeholder="e.g. 1&quot; Elbow" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Category</label>
          <select value={data.category} onChange={e => f("category", e.target.value)} className="mt-1 h-8 text-xs w-full border border-input rounded-md px-2 bg-transparent">
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
        <Button type="submit" size="sm" className="h-8 text-xs">Save Part</Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function PriceList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);
  // activeIds: { [generic_part_name]: item_id }
  const [activeIds, setActiveIds] = useState({});
  // pending new vendor form
  const [addVendorFor, setAddVendorFor] = useState(null); // { partName, category }

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.MaterialPrice.list("-updated_date", 500);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group by generic_part_name
  const grouped = items.reduce((acc, item) => {
    const key = item.generic_part_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const filteredKeys = Object.keys(grouped).filter(key => {
    const matchSearch = !search || key.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || grouped[key][0]?.category === filterCat;
    return matchSearch && matchCat;
  }).sort();

  const handleSave = async (draft) => {
    if (draft.id) {
      const updated = await base44.entities.MaterialPrice.update(draft.id, draft);
      setItems(prev => prev.map(i => i.id === draft.id ? { ...i, ...draft } : i));
      toast.success("Price updated");
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.MaterialPrice.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Entry removed");
  };

  const handleCreate = async (data) => {
    const created = await base44.entities.MaterialPrice.create(data);
    setItems(prev => [...prev, created]);
    setShowNewForm(false);
    setAddVendorFor(null);
    toast.success("Part added");
  };

  const handleAddVendor = (partName, category) => {
    setAddVendorFor({ partName, category });
    setShowNewForm(false);
  };

  const handleSetActive = (partName, id) => {
    setActiveIds(prev => ({ ...prev, [partName]: id }));
    toast.success("Active vendor updated");
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
          <Button
            size="sm"
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => { setShowNewForm(true); setAddVendorFor(null); }}
          >
            <Plus className="w-4 h-4" /> Add Part
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* New part form */}
        {showNewForm && (
          <NewPartForm onSave={handleCreate} onCancel={() => setShowNewForm(false)} />
        )}

        {/* Add vendor form */}
        {addVendorFor && (
          <NewPartForm
            onSave={(data) => handleCreate({ ...data, generic_part_name: addVendorFor.partName, category: addVendorFor.category })}
            onCancel={() => setAddVendorFor(null)}
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search parts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-sm w-56"
          />
          <div className="flex gap-1 flex-wrap">
            {["all", ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  filterCat === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{filteredKeys.length} parts</span>
        </div>

        {/* Parts list */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No parts found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredKeys.map(partName => (
              <PartGroup
                key={partName}
                partName={partName}
                items={grouped[partName]}
                activeIds={activeIds}
                onSave={handleSave}
                onDelete={handleDelete}
                onAddVendor={handleAddVendor}
                onSetActive={handleSetActive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}