import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Check } from "lucide-react";

export default function ProjectInfoForm({ project, onSave, saving }) {
  const [form, setForm] = useState(project || {});
  const [autoSaved, setAutoSaved] = useState(false);
  const isNew = !project?.id;
  const debounceRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (project) setForm(project);
  }, [project]);

  // Auto-save for existing projects only
  useEffect(() => {
    if (isNew || isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!form.project_name) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await onSave(form);
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    }, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [form]);

  const field = (key) => ({
    value: form[key] || "",
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Project Information</h2>
        <p className="text-sm text-muted-foreground">General project details and contact info</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Project Details</h3>

        <div className="space-y-2">
          <Label htmlFor="project_name">Project Name *</Label>
          <Input id="project_name" placeholder="Enter project name" {...field("project_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="street_address">Street Address</Label>
          <Input id="street_address" placeholder="123 Main St" {...field("street_address")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city_state_zip">City, State, ZIP</Label>
          <Input id="city_state_zip" placeholder="Houston, TX 77001" {...field("city_state_zip")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gc_owner">GC / Owner</Label>
            <Input id="gc_owner" placeholder="General Contractor" {...field("gc_owner")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wsfp_project_number">WSFP Project #</Label>
            <Input id="wsfp_project_number" placeholder="Project number" {...field("wsfp_project_number")} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Sales Info</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sales_rep">Sales Rep</Label>
            <Input id="sales_rep" placeholder="Rep name" {...field("sales_rep")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...field("date")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status || "draft"} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Notes</h3>
        <Textarea
          placeholder="Additional notes about this project..."
          className="min-h-24"
          value={form.notes || ""}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
        />
      </div>

      {isNew ? (
        <Button
          onClick={() => onSave(form)}
          disabled={!form.project_name || saving}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Project"}
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground flex items-center gap-1.5 h-9">
          {saving ? "Saving..." : autoSaved ? <><Check className="w-4 h-4 text-green-500" /> Saved</> : "Changes auto-save"}
        </div>
      )}
    </div>
  );
}