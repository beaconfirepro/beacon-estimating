import React from "react";
import { Input } from "@/components/ui/input";

const Row = ({ label, field, inputs, onChange, suffix = "" }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
    <label className="text-sm text-foreground flex-1">{label}</label>
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min="0"
        value={inputs[field] || ""}
        onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
        className="h-7 text-sm text-right w-24"
        placeholder="0"
      />
      {suffix && <span className="text-xs text-muted-foreground w-8">{suffix}</span>}
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-4">
    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-4">{title}</div>
    {children}
  </div>
);

export default function SprinklerInputForm({ inputs, onChange }) {
  return (
    <div className="max-w-xl">
      <Section title="Sprinkler Heads">
        <Row label="Concealed Heads" field="heads_concealed" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Pendant Heads" field="heads_pendant" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Upright Heads" field="heads_upright" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Sidewall Heads" field="heads_sidewall" inputs={inputs} onChange={onChange} suffix="ea" />
      </Section>

      <Section title="Branch / Distribution Pipe">
        <Row label='1" Branch Pipe' field="pipe_1in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='1¼" Branch Pipe' field="pipe_1_25in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='1½" Branch Pipe' field="pipe_1_5in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='2" Pipe' field="pipe_2in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='2½" Pipe' field="pipe_2_5in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='3" Pipe' field="pipe_3in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='4" Pipe' field="pipe_4in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='6" Pipe' field="pipe_6in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
      </Section>

      <Section title="Fittings">
        <Row label="Threaded Fittings" field="threaded_fittings" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Grooved Fittings" field="grooved_fittings" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Welded Fittings" field="welded_fittings" inputs={inputs} onChange={onChange} suffix="ea" />
      </Section>

      <Section title="Hangers & Bracing">
        <Row label="Hangers" field="hangers" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Seismic Braces" field="seismic_braces" inputs={inputs} onChange={onChange} suffix="ea" />
      </Section>

      <Section title="Valves & Controls">
        <Row label='OS&Y Valve 4"' field="osy_valves_4in" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label='OS&Y Valve 6"' field="osy_valves_6in" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label='Butterfly Valve 4"' field="butterfly_valves_4in" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label='Check Valve 4"' field="check_valves_4in" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label='Alarm Check Valve 4"' field="alarm_check_valves_4in" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label='Backflow Preventer 4"' field="backflow_preventers_4in" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label='Backflow Preventer 6"' field="backflow_preventers_6in" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Flow Switches" field="flow_switches" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Tamper Switches" field="tamper_switches" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Pressure Gauges" field="pressure_gauges" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Inspector Test Conn" field="inspector_test_conns" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label='Drain Valves 2"' field="drain_valves" inputs={inputs} onChange={onChange} suffix="ea" />
        <Row label="Riser Assemblies" field="riser_assemblies" inputs={inputs} onChange={onChange} suffix="ea" />
      </Section>

      <Section title="Misc">
        <Row label="Vertical Riser Pipe" field="vertical_riser_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label="Hoisting / Floors" field="hoisting_floors" inputs={inputs} onChange={onChange} suffix="flrs" />
      </Section>

      <Section title="Rates">
        <Row label="Labor Rate ($/hr)" field="labor_rate" inputs={inputs} onChange={onChange} suffix="$/hr" />
        <Row label="Design ($)" field="total_design" inputs={inputs} onChange={onChange} suffix="$" />
      </Section>
    </div>
  );
}