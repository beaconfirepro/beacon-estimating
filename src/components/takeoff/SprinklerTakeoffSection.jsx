import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TakeoffCard from "./TakeoffCard";
import { toast } from "sonner";
import { DEFAULT_SPRINKLER_INPUTS } from "@/lib/sprinklerFormulas";

export default function SprinklerTakeoffSection({ projectId, takeoffs, onUpdate }) {
  const [creating, setCreating] = useState(false);

  const handleAddSection = async () => {
    setCreating(true);
    const newTakeoff = await base44.entities.SprinklerTakeoff.create({
      project_id: projectId,
      area_name: `Area ${takeoffs.length + 1}`,
      section_number: takeoffs.length + 1,
      labor_items: DEFAULT_SPRINKLER_LABOR_ITEMS.map(item => ({ ...item, quantity: 0, total: 0 })),
      material_items: DEFAULT_SPRINKLER_MATERIAL_ITEMS.map(item => ({ ...item, quantity: 0, total: 0 })),
      total_labor: 0,
      total_material: 0,
      total_design: 0
    });
    onUpdate([...takeoffs, newTakeoff]);
    setCreating(false);
    toast.success("Section added!");
  };

  const handleDelete = async (takeoffId) => {
    await base44.entities.SprinklerTakeoff.delete(takeoffId);
    onUpdate(takeoffs.filter(t => t.id !== takeoffId));
    toast.success("Section removed");
  };

  const handleUpdate = async (updated) => {
    await base44.entities.SprinklerTakeoff.update(updated.id, updated);
    onUpdate(takeoffs.map(t => t.id === updated.id ? updated : t));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fire Sprinkler Takeoff</h2>
          <p className="text-sm text-muted-foreground mt-1">Add sections for each area of the project</p>
        </div>
        <Button
          onClick={handleAddSection}
          disabled={creating}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>

      {takeoffs.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No sprinkler sections yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Add Section" to start a takeoff</p>
        </div>
      ) : (
        <div className="space-y-4">
          {takeoffs.map((takeoff) => (
            <TakeoffCard
              key={takeoff.id}
              takeoff={takeoff}
              type="sprinkler"
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(takeoff.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}