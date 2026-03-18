import React from "react";

const ToggleGroup = ({ label, options, value, onChange }) => (
  <div className="mb-3">
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default function SprinklerCriteriaSelectors({ inputs, onChange }) {
  return (
    <div className="bg-muted/40 border border-border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
      <ToggleGroup
        label="Labor Classification"
        value={inputs.labor_class ?? 1}
        onChange={(v) => onChange("labor_class", v)}
        options={[
          { value: 1, label: "Class 1" },
          { value: 2, label: "Class 2" },
          { value: 3, label: "Class 3" },
          { value: 4, label: "Class 4" },
          { value: 5, label: "Class 5" },
        ]}
      />
      <ToggleGroup
        label="Hoisting / Vertical Distribution"
        value={inputs.hoisting_type ?? "none"}
        onChange={(v) => onChange("hoisting_type", v)}
        options={[
          { value: "none",  label: "None" },
          { value: "20ft",  label: "20'" },
          { value: "40ft",  label: "40'" },
          { value: "60ft+", label: "60'+" },
        ]}
      />
      <ToggleGroup
        label="Project Size"
        value={inputs.project_size ?? "medium"}
        onChange={(v) => onChange("project_size", v)}
        options={[
          { value: "small",  label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large",  label: "Large" },
        ]}
      />
      <ToggleGroup
        label="System Type"
        value={inputs.system_type ?? "wet"}
        onChange={(v) => onChange("system_type", v)}
        options={[
          { value: "wet",        label: "Wet" },
          { value: "dry",        label: "Dry" },
          { value: "preaction",  label: "Preaction" },
        ]}
      />
      <ToggleGroup
        label="Seismic @ Mains"
        value={inputs.seismic_mains ?? "no"}
        onChange={(v) => onChange("seismic_mains", v)}
        options={[
          { value: "no",  label: "No" },
          { value: "yes", label: "Yes" },
        ]}
      />
      <ToggleGroup
        label="Seismic @ Lines"
        value={inputs.seismic_lines ?? "no"}
        onChange={(v) => onChange("seismic_lines", v)}
        options={[
          { value: "no",  label: "No" },
          { value: "yes", label: "Yes" },
        ]}
      />
    </div>
  );
}