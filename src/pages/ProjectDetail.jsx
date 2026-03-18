import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Download, Save, Flame } from "lucide-react";
import ProjectInfoForm from "@/components/project/ProjectInfoForm";
import SprinklerTakeoffSection from "@/components/takeoff/SprinklerTakeoffSection";
import StandpipeSection from "@/components/takeoff/StandpipeSection";
import MasterSummary from "@/components/project/MasterSummary";
import HeadLayout from "@/components/project/HeadLayout";
import { toast } from "sonner";
import { generatePDF } from "@/lib/pdfExport";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [project, setProject] = useState(isNew ? {
    project_name: "",
    street_address: "",
    city_state_zip: "",
    sales_rep: "",
    wsfp_project_number: "",
    gc_owner: "",
    date: new Date().toISOString().split("T")[0],
    status: "draft",
    notes: ""
  } : null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [sprinklerTakeoffs, setSprinklerTakeoffs] = useState([]);
  const [standpipeTakeoffs, setStandpipeTakeoffs] = useState([]);

  useEffect(() => {
    if (!isNew && id) {
      base44.entities.Project.filter({ id }).then(data => {
        if (data && data.length > 0) setProject(data[0]);
      });
      base44.entities.SprinklerTakeoff.filter({ project_id: id }, "-section_number", 20).then(data => {
        setSprinklerTakeoffs(data || []);
      });
      base44.entities.StandpipeTakeoff.filter({ project_id: id }, "-section_number", 20).then(data => {
        setStandpipeTakeoffs(data || []);
      });
    }
  }, [id, isNew]);

  const handleSaveProject = async (data) => {
    setSaving(true);
    if (isNew) {
      const created = await base44.entities.Project.create(data);
      navigate(`/project/${created.id}`, { replace: true });
      toast.success("Project created!");
    } else {
      await base44.entities.Project.update(id, data);
      setProject(data);
      toast.success("Project saved!");
    }
    setSaving(false);
  };

  const handleExportPDF = () => {
    generatePDF(project, sprinklerTakeoffs, standpipeTakeoffs);
    toast.success("PDF exported!");
  };

  const totalLabor = [...sprinklerTakeoffs, ...standpipeTakeoffs].reduce((s, t) => s + (t.total_labor || 0), 0);
  const totalMaterial = [...sprinklerTakeoffs, ...standpipeTakeoffs].reduce((s, t) => s + (t.total_material || 0), 0);
  const totalDesign = [...sprinklerTakeoffs, ...standpipeTakeoffs].reduce((s, t) => s + (t.total_design || 0), 0);
  const grandTotal = totalLabor + totalMaterial + totalDesign;

  if (!project && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" /> Projects
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" />
              <span className="font-semibold text-sm truncate max-w-48">
                {project?.project_name || "New Project"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2 hidden sm:flex">
                <Download className="w-4 h-4" /> Export PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grand Total Bar */}
      {!isNew && grandTotal > 0 && (
        <div className="bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap gap-4 text-sm">
            <span>Labor: <strong>${totalLabor.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
            <span>Material: <strong>${totalMaterial.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
            <span>Design: <strong>${totalDesign.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
            <span className="ml-auto font-bold text-accent text-base">
              Total: ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="info">Project Info</TabsTrigger>
            <TabsTrigger value="headlayout" disabled={isNew}>Head Layout</TabsTrigger>
            <TabsTrigger value="sprinkler" disabled={isNew}>Fire Sprinkler</TabsTrigger>
            <TabsTrigger value="standpipe" disabled={isNew}>Standpipe / Bulk</TabsTrigger>
            <TabsTrigger value="summary" disabled={isNew}>Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ProjectInfoForm
              project={project}
              onSave={handleSaveProject}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="headlayout">
            <HeadLayout
              sprinklerTakeoffs={sprinklerTakeoffs}
              standpipeTakeoffs={standpipeTakeoffs}
            />
          </TabsContent>

          <TabsContent value="sprinkler">
            <SprinklerTakeoffSection
              projectId={id}
              takeoffs={sprinklerTakeoffs}
              onUpdate={setSprinklerTakeoffs}
            />
          </TabsContent>

          <TabsContent value="standpipe">
            <StandpipeSection
              projectId={id}
              takeoffs={standpipeTakeoffs}
              onUpdate={setStandpipeTakeoffs}
            />
          </TabsContent>

          <TabsContent value="summary">
            <MasterSummary
              project={project}
              sprinklerTakeoffs={sprinklerTakeoffs}
              standpipeTakeoffs={standpipeTakeoffs}
              onExport={handleExportPDF}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}