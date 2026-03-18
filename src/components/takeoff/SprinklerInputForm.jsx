import React from "react";
import { Input } from "@/components/ui/input";

const Row = ({ label, field, inputs, onChange, suffix = "ea" }) => (
  <div className="flex items-center justify-between gap-3 py-1 border-b border-border/30 last:border-0">
    <label className="text-xs text-foreground flex-1">{label}</label>
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min="0"
        value={inputs[field] || ""}
        onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
        className="h-7 text-xs text-right w-20"
        placeholder="0"
      />
      <span className="text-xs text-muted-foreground w-7 text-right">{suffix}</span>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <div className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/20 rounded px-2 py-1 mb-2">
      {title}
    </div>
    <div className="pl-1">
      {children}
    </div>
  </div>
);

const SubSection = ({ title, children }) => (
  <div className="mb-3">
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-2">{title}</div>
    {children}
  </div>
);

export default function SprinklerInputForm({ inputs, onChange }) {
  return (
    <div className="max-w-lg">
      <Section title="Sprinkler Heads">
        <Row label="Concealed Heads"  field="heads_concealed"  inputs={inputs} onChange={onChange} />
        <Row label="Pendant Heads"    field="heads_pendant"    inputs={inputs} onChange={onChange} />
        <Row label="Upright Heads"    field="heads_upright"    inputs={inputs} onChange={onChange} />
        <Row label="Sidewall Heads"   field="heads_sidewall"   inputs={inputs} onChange={onChange} />
      </Section>

      <Section title="Pipe">
        <Row label='1" Pipe'   field="pipe_1in_lf"    inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='1¼" Pipe'  field="pipe_1_25in_lf" inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='1½" Pipe'  field="pipe_1_5in_lf"  inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='2" Pipe'   field="pipe_2in_lf"    inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='2½" Pipe'  field="pipe_2_5in_lf"  inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='3" Pipe'   field="pipe_3in_lf"    inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='4" Pipe'   field="pipe_4in_lf"    inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label='6" Pipe'   field="pipe_6in_lf"    inputs={inputs} onChange={onChange} suffix="LF" />
      </Section>

      <Section title='Threaded Fittings (1" - 2")'>
        <SubSection title="Elbows">
          <Row label='Elbow 1" Threaded'   field="thr_elbow_1in"    inputs={inputs} onChange={onChange} />
          <Row label='Elbow 1¼" Threaded'  field="thr_elbow_1_25in" inputs={inputs} onChange={onChange} />
          <Row label='Elbow 1½" Threaded'  field="thr_elbow_1_5in"  inputs={inputs} onChange={onChange} />
          <Row label='Elbow 2" Threaded'   field="thr_elbow_2in"    inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Tees">
          <Row label='Tee 1" Threaded'     field="thr_tee_1in"      inputs={inputs} onChange={onChange} />
          <Row label='Tee 1¼" Threaded'    field="thr_tee_1_25in"   inputs={inputs} onChange={onChange} />
          <Row label='Tee 1½" Threaded'    field="thr_tee_1_5in"    inputs={inputs} onChange={onChange} />
          <Row label='Tee 2" Threaded'     field="thr_tee_2in"      inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Reducers">
          <Row label='Reducer 1" Threaded'   field="thr_reducer_1in"    inputs={inputs} onChange={onChange} />
          <Row label='Reducer 1¼" Threaded'  field="thr_reducer_1_25in" inputs={inputs} onChange={onChange} />
          <Row label='Reducer 1½" Threaded'  field="thr_reducer_1_5in"  inputs={inputs} onChange={onChange} />
          <Row label='Reducer 2" Threaded'   field="thr_reducer_2in"    inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Couplings">
          <Row label='Coupling 1" Threaded'   field="thr_coupling_1in"    inputs={inputs} onChange={onChange} />
          <Row label='Coupling 1¼" Threaded'  field="thr_coupling_1_25in" inputs={inputs} onChange={onChange} />
          <Row label='Coupling 1½" Threaded'  field="thr_coupling_1_5in"  inputs={inputs} onChange={onChange} />
          <Row label='Coupling 2" Threaded'   field="thr_coupling_2in"    inputs={inputs} onChange={onChange} />
        </SubSection>
      </Section>

      <Section title='Grooved Fittings (2½" - 6")'>
        <SubSection title="Couplings">
          <Row label='Coupling 2½" Grooved' field="grv_coupling_2_5in" inputs={inputs} onChange={onChange} />
          <Row label='Coupling 3" Grooved'  field="grv_coupling_3in"   inputs={inputs} onChange={onChange} />
          <Row label='Coupling 4" Grooved'  field="grv_coupling_4in"   inputs={inputs} onChange={onChange} />
          <Row label='Coupling 6" Grooved'  field="grv_coupling_6in"   inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Elbows">
          <Row label='Elbow 2½" Grooved' field="grv_elbow_2_5in" inputs={inputs} onChange={onChange} />
          <Row label='Elbow 3" Grooved'  field="grv_elbow_3in"   inputs={inputs} onChange={onChange} />
          <Row label='Elbow 4" Grooved'  field="grv_elbow_4in"   inputs={inputs} onChange={onChange} />
          <Row label='Elbow 6" Grooved'  field="grv_elbow_6in"   inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Tees">
          <Row label='Tee 2½" Grooved' field="grv_tee_2_5in" inputs={inputs} onChange={onChange} />
          <Row label='Tee 3" Grooved'  field="grv_tee_3in"   inputs={inputs} onChange={onChange} />
          <Row label='Tee 4" Grooved'  field="grv_tee_4in"   inputs={inputs} onChange={onChange} />
          <Row label='Tee 6" Grooved'  field="grv_tee_6in"   inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Reducers">
          <Row label='Reducer 2½" Grooved' field="grv_reducer_2_5in" inputs={inputs} onChange={onChange} />
          <Row label='Reducer 3" Grooved'  field="grv_reducer_3in"   inputs={inputs} onChange={onChange} />
          <Row label='Reducer 4" Grooved'  field="grv_reducer_4in"   inputs={inputs} onChange={onChange} />
          <Row label='Reducer 6" Grooved'  field="grv_reducer_6in"   inputs={inputs} onChange={onChange} />
        </SubSection>
      </Section>

      <Section title='Welded Fittings (4" - 6")'>
        <SubSection title="Elbows">
          <Row label='Elbow 4" Welded' field="wld_elbow_4in" inputs={inputs} onChange={onChange} />
          <Row label='Elbow 6" Welded' field="wld_elbow_6in" inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Tees">
          <Row label='Tee 4" Welded' field="wld_tee_4in" inputs={inputs} onChange={onChange} />
          <Row label='Tee 6" Welded' field="wld_tee_6in" inputs={inputs} onChange={onChange} />
        </SubSection>
        <SubSection title="Reducers">
          <Row label='Reducer 4" Welded' field="wld_reducer_4in" inputs={inputs} onChange={onChange} />
          <Row label='Reducer 6" Welded' field="wld_reducer_6in" inputs={inputs} onChange={onChange} />
        </SubSection>
      </Section>

      <Section title="Hangers & Bracing">
        <Row label='Hangers 1" – 2"'     field="hangers_1in_2in"    inputs={inputs} onChange={onChange} />
        <Row label='Hangers 2½" – 4"'    field="hangers_2_5in_4in"  inputs={inputs} onChange={onChange} />
        <Row label="Seismic Brace Assy"  field="seismic_braces"     inputs={inputs} onChange={onChange} />
      </Section>

      <Section title="Valves & Controls">
        <Row label='OS&Y Valve 4"'          field="osy_valves_4in"          inputs={inputs} onChange={onChange} />
        <Row label='OS&Y Valve 6"'          field="osy_valves_6in"          inputs={inputs} onChange={onChange} />
        <Row label='Butterfly Valve 4"'     field="butterfly_valves_4in"    inputs={inputs} onChange={onChange} />
        <Row label='Check Valve 4"'         field="check_valves_4in"        inputs={inputs} onChange={onChange} />
        <Row label='Alarm Check Valve 4"'   field="alarm_check_valves_4in"  inputs={inputs} onChange={onChange} />
        <Row label='Backflow Preventer 4"'  field="backflow_preventers_4in" inputs={inputs} onChange={onChange} />
        <Row label='Backflow Preventer 6"'  field="backflow_preventers_6in" inputs={inputs} onChange={onChange} />
        <Row label="Flow Switches"          field="flow_switches"           inputs={inputs} onChange={onChange} />
        <Row label="Tamper Switches"        field="tamper_switches"         inputs={inputs} onChange={onChange} />
        <Row label="Pressure Gauges"        field="pressure_gauges"         inputs={inputs} onChange={onChange} />
        <Row label="Inspector Test Conn"    field="inspector_test_conns"    inputs={inputs} onChange={onChange} />
        <Row label='Drain Valves 2"'        field="drain_valves"            inputs={inputs} onChange={onChange} />
        <Row label="Riser Assemblies"       field="riser_assemblies"        inputs={inputs} onChange={onChange} />
      </Section>

      <Section title="Misc">
        <Row label="Vertical Riser Pipe"   field="vertical_riser_lf"  inputs={inputs} onChange={onChange} suffix="LF" />
        <Row label="Hoisting / Floors"     field="hoisting_floors"     inputs={inputs} onChange={onChange} suffix="flrs" />
      </Section>

      <Section title="Rates">
        <Row label="Labor Rate"  field="labor_rate"    inputs={inputs} onChange={onChange} suffix="$/hr" />
        <Row label="Design ($)"  field="total_design"  inputs={inputs} onChange={onChange} suffix="$" />
      </Section>
    </div>
  );
}