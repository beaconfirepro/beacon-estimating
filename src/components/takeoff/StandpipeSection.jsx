import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TakeoffCard from "./TakeoffCard";
import { toast } from "sonner";
import { DEFAULT_STANDPIPE_LABOR_ITEMS, DEFAULT_STANDPIPE_MATERIAL_ITEMS } from "@/lib/defaultItems";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StandpipeSection({ projectId, takeoffs, onUpdate }) {
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState("horizontal_bulk");

  const handleAddSection = async () => {
    setCreating(true);
    const newTakeoff = await base44.entities.StandpipeTakeoff.create({
      project_id: projectId,
      type: newType,
      area_name: `Area ${takeoffs.length + 1}`,
      section_number: takeoffs.length + 1,
      labor_items: DEFAULT_STANDPIPE_LABOR_ITEMS.map(item => ({ ...item, quantity: 0, total: 0 })),
      material_items: DEFAULT_STANDPIPE_MATERIAL_ITEMS.map(item => ({ ...item, quantity: 0, total: 0 })),
      total_labor: 0,
      total_material: 0,
      total_design: 0
    });
    onUpdate([...takeoffs, newTakeoff]);
    setCreating(false);
    toast.success("Section added!");
  };

  const handleDelete = async (takeoffId) => {
    await base44.entities.StandpipeTakeoff.delete(takeoffId);
    onUpdate(takeoffs.filter(t => t.id !== takeoffId));
  };

  const handleUpdate = async (updated) => {
    await base44.entities.StandpipeTakeoff.update(updated.id, updated);
    onUpdate(takeoffs.map(t => t.id === updated.id ? updated : t));
  };

  const horizontalTakeoffs = takeoffs.filter(t => t.type === "horizontal_bulk");
  const verticalTakeoffs = takeoffs.filter(t => t.type === "vertical");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Standpipe & Horizontal Bulk Takeoff</h2>
          <p className="text-sm text-muted-foreground mt-1">Horizontal bulk and vertical standpipe sections</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal_bulk">Horizontal Bulk</SelectItem>
              <SelectItem value="vertical">Vertical Standpipe</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddSection}
            disabled={creating}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      {horizontalTakeoffs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Horizontal Bulk</h3>
          {horizontalTakeoffs.map((takeoff) => (
            <TakeoffCard
              key={takeoff.id}
              takeoff={takeoff}
              type="standpipe"
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(takeoff.id)}
            />
          ))}
        </div>
      )}

      {verticalTakeoffs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Vertical Standpipe</h3>
          {verticalTakeoffs.map((takeoff) => (
            <TakeoffCard
              key={takeoff.id}
              takeoff={takeoff}
              type="standpipe"
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(takeoff.id)}
            />
          ))}
        </div>
      )}

      {takeoffs.length === 0 && (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No standpipe sections yet</p>
          <p className="text-sm text-muted-foreground mt-1">Select a type and click "Add" to start</p>
        </div>
      )}
    </div>
  );
}