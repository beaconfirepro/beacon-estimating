import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronUp, Zap, CheckCircle2 } from "lucide-react";
import { QUICK_PICK_ASSEMBLIES, QUICK_PICK_CATEGORIES } from "@/lib/quickPickAssemblies";
import { toast } from "sonner";

const ALL_CATEGORIES = [
  "Quick Pick: Heads",
  "Quick Pick: Risers",
  "Quick Pick: Mains",
  "Quick Pick: Branchline (Threaded)",
  "Quick Pick: Branchline (Grooved)",
  "Quick Pick: Valves & Trim",
];

/**
 * Convert a DB Assembly record (with formula_field on components) into
 * the same shape that the hardcoded QUICK_PICK_ASSEMBLIES use.
 */
function dbAssemblyToQuickPick(asm) {
  const basis = asm.default_basis || "";
  return {
    id: asm.id,
    name: asm.name,
    category: asm.quick_pick_category,
    description: asm.description || "",
    unit: asm.quick_pick_unit || "ea",
    _isCustom: true,
    components: (asm.components || [])
      .filter(c => c.generic_part_name && basis)
      .map(c => ({
        field: basis,
        label: c.generic_part_name,
        quantity: c.quantity || 1,
        unit: "ea",
      })),
  };
}

function AssemblyCard({ assembly, priceMap, onApply }) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onApply(assembly, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className={`border rounded-lg p-3 flex flex-col gap-2 transition-all duration-300 ${
      justAdded
        ? "bg-green-50 border-green-400 shadow-md shadow-green-100"
        : assembly._isCustom
          ? "bg-accent/5 border-accent/30"
          : "bg-muted/30 border-border"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-xs font-semibold text-foreground truncate">{assembly.name}</div>
            {assembly._isCustom && (
              <span className="text-xs bg-accent/20 text-accent px-1 py-0.5 rounded font-medium flex-shrink-0">custom</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{assembly.description}</div>
        </div>
        {justAdded && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-semibold flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Added!
          </div>
        )}
      </div>

      {/* Components preview */}
      <div className="space-y-0.5">
        {assembly.components.map((comp, i) => (
          <div key={i} className={`flex items-center justify-between text-xs transition-colors ${justAdded ? "text-green-700" : "text-muted-foreground"}`}>
            <span className="truncate">{comp.quantity * qty} × {comp.label}</span>
            <span className="ml-2 text-xs opacity-70">{comp.unit}</span>
          </div>
        ))}
        {assembly.components.length === 0 && (
          <div className="text-xs text-destructive italic">No formula fields set — edit this assembly in Price List → Assemblies.</div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Qty:</span>
          <Input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-6 w-14 text-xs text-right px-1"
          />
          <span className="text-xs text-muted-foreground">{assembly.unit}</span>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={assembly.components.length === 0}
          className={`h-6 text-xs px-2 ml-auto gap-1 transition-all ${
            justAdded
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          }`}
        >
          {justAdded ? <><CheckCircle2 className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
        </Button>
      </div>
    </div>
  );
}

function CategorySection({ category, assemblies, priceMap, onApply }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
      >
        <span className="text-xs font-bold text-primary uppercase tracking-wider">{category}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{assemblies.length} assemblies</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-card">
          {assemblies.map(asm => (
            <AssemblyCard key={asm.id} assembly={asm} priceMap={priceMap} onApply={onApply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuickPickPanel({ inputs, onChange, materialPrices = [] }) {
  const [dbAssemblies, setDbAssemblies] = useState([]);

  useEffect(() => {
    base44.entities.Assembly.list("-updated_date", 200).then(data => {
      const qp = (data || []).filter(a => a.quick_pick_category);
      setDbAssemblies(qp.map(dbAssemblyToQuickPick));
    }).catch(() => {});
  }, []);

  const priceMap = materialPrices.reduce((acc, p) => {
    if (!acc[p.generic_part_name]) acc[p.generic_part_name] = p.price;
    return acc;
  }, {});

  const handleApply = (assembly, qty) => {
    assembly.components.forEach(comp => {
      const currentVal = inputs[comp.field] || 0;
      const addAmount = comp.quantity * qty;
      onChange(comp.field, Math.round((currentVal + addAmount) * 1000) / 1000);
    });
    toast.success(`Added ${qty} × ${assembly.name} to takeoff`, {
      description: `${assembly.components.length} items updated · check Takeoff Inputs tab`,
      duration: 3000,
    });
  };

  // Merge: DB custom assemblies shown first within each category, then hardcoded
  const allByCategory = ALL_CATEGORIES.map(cat => {
    const custom = dbAssemblies.filter(a => a.category === cat);
    const builtin = QUICK_PICK_ASSEMBLIES.filter(a => a.category === cat);
    return { cat, assemblies: [...custom, ...builtin] };
  }).filter(({ assemblies }) => assemblies.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <div>
            <div className="text-sm font-semibold text-foreground">Quick Pick Assemblies</div>
            <div className="text-xs text-muted-foreground">Click "Add" to apply component quantities to this section's takeoff</div>
          </div>
        </div>
        {dbAssemblies.length > 0 && (
          <span className="text-xs text-accent font-medium">{dbAssemblies.length} custom</span>
        )}
      </div>

      <div className="space-y-2">
        {allByCategory.map(({ cat, assemblies }) => (
          <CategorySection
            key={cat}
            category={cat}
            assemblies={assemblies}
            priceMap={priceMap}
            onApply={handleApply}
          />
        ))}
      </div>
    </div>
  );
}