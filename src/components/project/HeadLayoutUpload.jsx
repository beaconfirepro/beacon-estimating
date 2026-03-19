import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function HeadLayoutUpload({ project, onSave }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pdfUrl = project?.head_layout_pdf_url;

  const handleFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await onSave({ ...project, head_layout_pdf_url: file_url });
    setUploading(false);
    toast.success("Head layout PDF uploaded and saved.");
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    await onSave({ ...project, head_layout_pdf_url: "" });
    toast.success("Head layout removed.");
  };

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${
        pdfUrl
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
      }`}>
        {pdfUrl
          ? <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Head layout uploaded — estimate is complete.</>
          : <><AlertCircle className="w-4 h-4 flex-shrink-0" /> No head layout uploaded. A PDF is required for a complete estimate.</>
        }
      </div>

      {/* Upload zone */}
      {!pdfUrl && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-14 cursor-pointer transition-colors ${
            dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"
          }`}
        >
          <input type="file" accept="application/pdf" className="hidden" onChange={handleInputChange} disabled={uploading} />
          {uploading
            ? <RefreshCw className="w-8 h-8 text-accent animate-spin" />
            : <Upload className="w-8 h-8 text-muted-foreground" />
          }
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {uploading ? "Uploading..." : "Drop PDF here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
          </div>
        </label>
      )}

      {/* PDF viewer */}
      {pdfUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="w-4 h-4 text-accent" />
              Head Layout PDF
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input type="file" accept="application/pdf" className="hidden" onChange={handleInputChange} disabled={uploading} />
                <Button variant="outline" size="sm" className="gap-1.5 pointer-events-none" asChild>
                  <span>{uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Replace</span>
                </Button>
              </label>
              <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleRemove}>
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </Button>
            </div>
          </div>
          <div className="border border-border rounded-xl overflow-hidden bg-muted/20">
            <iframe
              src={pdfUrl}
              title="Head Layout PDF"
              className="w-full"
              style={{ height: "75vh" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}