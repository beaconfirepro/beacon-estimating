import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronUp, Zap, CheckCircle2 } from "lucide-react";
import { QUICK_PICK_ASSEMBLIES, QUICK_PICK_CATEGORIES } from "@/lib/quickPickAssemblies";
import { toast } from "sonner";

const fmt = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
        : "bg-muted/30 border-border"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">{assembly.name}</div>
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
  // Build price map from materialPrices: keyed by generic_part_name
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        <div>
          <div className="text-sm font-semibold text-foreground">Quick Pick Assemblies</div>
          <div className="text-xs text-muted-foreground">Click "Add" to apply component quantities to this section's takeoff</div>
        </div>
      </div>

      <div className="space-y-2">
        {QUICK_PICK_CATEGORIES.map(cat => {
          const assemblies = QUICK_PICK_ASSEMBLIES.filter(a => a.category === cat);
          if (assemblies.length === 0) return null;
          return (
            <CategorySection
              key={cat}
              category={cat}
              assemblies={assemblies}
              priceMap={priceMap}
              onApply={handleApply}
            />
          );
        })}
      </div>
    </div>
  );
}