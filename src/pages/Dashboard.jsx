import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FolderOpen, TrendingUp, Clock, CheckCircle2, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  complete: "bg-green-100 text-green-700",
  submitted: "bg-orange-100 text-orange-700"
};

const statusIcons = {
  draft: Clock,
  in_progress: TrendingUp,
  complete: CheckCircle2,
  submitted: FileText
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list("-created_date", 50).then(data => {
      setProjects(data || []);
      setLoading(false);
    });
  }, []);

  const statusCounts = {
    draft: projects.filter(p => p.status === "draft").length,
    in_progress: projects.filter(p => p.status === "in_progress").length,
    complete: projects.filter(p => p.status === "complete").length,
    submitted: projects.filter(p => p.status === "submitted").length,
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Project Estimates</h1>
            <p className="text-muted-foreground mt-1">Beacon Fire Protection — Estimating Platform</p>
          </div>
          <div className="flex gap-2">
            <Link to="/price-list">
              <Button variant="outline" className="gap-2 font-medium">
                <Package className="w-4 h-4" />
                Price List
              </Button>
            </Link>
            <Link to="/project/new">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                New Estimate
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => {
            const Icon = statusIcons[status];
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{status.replace("_", " ")}</span>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">{count}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Project List */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">All Projects</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No projects yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first estimate to get started</p>
              <Link to="/project/new" className="mt-4 inline-block">
                <Button variant="outline" className="gap-2 mt-3">
                  <Plus className="w-4 h-4" /> New Estimate
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((project, i) => {
                const Icon = statusIcons[project.status] || Clock;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={`/project/${project.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {project.project_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {project.street_address && `${project.street_address} • `}
                            {project.sales_rep && `${project.sales_rep}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusColors[project.status]} text-xs font-medium border-0`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {(project.status || "draft").replace("_", " ")}
                        </Badge>
                        {project.date && (
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {format(new Date(project.date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}