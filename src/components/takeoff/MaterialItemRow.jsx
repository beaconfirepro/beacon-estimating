import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function MaterialItemRow({ item, idx, materialPrices, onUpdate, onRemove, fmt }) {
  const [search, setSearch] = useState(item.item || "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(item.item || "");
  }, [item.item]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = search.trim()
    ? materialPrices.filter(p =>
        p.generic_part_name?.toLowerCase().includes(search.toLowerCase())
      )
    : materialPrices;

  const handleSelect = (mp) => {
    setSearch(mp.generic_part_name);
    setOpen(false);
    onUpdate(idx, "item", mp.generic_part_name);
    // Auto-fill price from master list, then recalc total
    const newPrice = mp.price || 0;
    const qty = parseFloat(item.quantity) || 0;
    onUpdate(idx, "_batch", { item: mp.generic_part_name, price: newPrice, total: qty * newPrice });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    onUpdate(idx, "item", e.target.value);
    setOpen(true);
  };

  return (
    <tr className="hover:bg-muted/20">
      <td className="py-1.5 pr-3">
        <div ref={wrapperRef} className="relative">
          <Input
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setOpen(true)}
            className="h-7 text-xs"
            placeholder="Search or type item..."
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filtered.slice(0, 20).map((mp) => (
                <div
                  key={mp.id}
                  className="px-3 py-2 text-xs hover:bg-muted cursor-pointer flex items-center justify-between gap-2"
                  onMouseDown={() => handleSelect(mp)}
                >
                  <span className="truncate">{mp.generic_part_name}</span>
                  <span className="text-muted-foreground shrink-0">${(mp.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="py-1.5 px-2">
        <Input
          type="number"
          value={item.quantity || ""}
          onChange={(e) => onUpdate(idx, "quantity", e.target.value)}
          className="h-7 text-xs text-right w-24"
        />
      </td>
      <td className="py-1.5 px-2">
        <Input
          type="number"
          value={item.price || ""}
          onChange={(e) => onUpdate(idx, "price", e.target.value)}
          className="h-7 text-xs text-right w-28"
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
          onClick={() => onRemove(idx)}
        >
          <X className="w-3 h-3" />
        </Button>
      </td>
    </tr>
  );
}