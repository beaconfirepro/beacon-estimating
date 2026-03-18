import jsPDF from "jspdf";

const fmt = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function generatePDF(project, sprinklerTakeoffs = [], standpipeTakeoffs = []) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageW = 215.9;
  const margin = 15;
  let y = 20;

  const drawLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  const checkPage = (needed = 15) => {
    if (y + needed > 260) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFillColor(28, 48, 90); // Navy
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 165, 0); // Orange
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BEACON FIRE PROTECTION", margin, 13);
  doc.setFontSize(10);
  doc.setTextColor(200, 210, 230);
  doc.setFont("helvetica", "normal");
  doc.text("MASTER ESTIMATE SUMMARY", margin, 21);

  // Date
  doc.setTextColor(200, 210, 230);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW - margin - 40, 21);

  y = 38;
  doc.setTextColor(30, 40, 60);

  // Project Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 48, 90);
  doc.text("PROJECT INFORMATION", margin, y);
  y += 6;
  drawLine();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  const infoItems = [
    ["Project Name:", project?.project_name || "—"],
    ["Address:", project?.street_address || "—"],
    ["City/State/ZIP:", project?.city_state_zip || "—"],
    ["GC / Owner:", project?.gc_owner || "—"],
    ["Sales Rep:", project?.sales_rep || "—"],
    ["WSFP Project #:", project?.wsfp_project_number || "—"],
    ["Date:", project?.date || "—"],
  ];

  infoItems.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 38, y);
    y += 6;
  });

  y += 4;

  // All takeoff sections
  const allTakeoffs = [
    ...sprinklerTakeoffs.map(t => ({ ...t, category: "FIRE SPRINKLER" })),
    ...standpipeTakeoffs.map(t => ({ ...t, category: t.type === "vertical" ? "VERTICAL STANDPIPE" : "HORIZONTAL BULK" }))
  ];

  allTakeoffs.forEach((takeoff) => {
    checkPage(50);

    // Section header
    doc.setFillColor(235, 240, 250);
    doc.rect(margin, y - 4, pageW - 2 * margin, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(28, 48, 90);
    doc.text(`${takeoff.category} — ${takeoff.area_name || `Section ${takeoff.section_number}`}`, margin + 2, y + 2);
    y += 10;

    // Labor items
    if ((takeoff.labor_items || []).length > 0) {
      checkPage(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("LABOR ITEMS", margin, y);
      y += 5;

      // Table headers
      doc.setFillColor(240, 242, 246);
      doc.rect(margin, y - 3, pageW - 2 * margin, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);
      doc.text("Item", margin + 2, y + 1);
      doc.text("Qty", pageW - margin - 54, y + 1, { align: "right" });
      doc.text("Factor", pageW - margin - 30, y + 1, { align: "right" });
      doc.text("Total", pageW - margin - 2, y + 1, { align: "right" });
      y += 7;

      takeoff.labor_items.filter(item => item.item && (item.quantity > 0 || item.total > 0)).forEach(item => {
        checkPage(7);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(String(item.item || ""), margin + 2, y);
        doc.text(String(item.quantity || 0), pageW - margin - 54, y, { align: "right" });
        doc.text(String(item.factor || 0), pageW - margin - 30, y, { align: "right" });
        doc.text(fmt(item.total), pageW - margin - 2, y, { align: "right" });
        y += 5.5;
      });

      // Labor subtotal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(28, 48, 90);
      doc.text(`Total Labor: ${fmt(takeoff.total_labor)}`, pageW - margin - 2, y, { align: "right" });
      y += 7;
    }

    // Material items
    if ((takeoff.material_items || []).length > 0) {
      checkPage(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("MATERIAL ITEMS", margin, y);
      y += 5;

      doc.setFillColor(240, 242, 246);
      doc.rect(margin, y - 3, pageW - 2 * margin, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);
      doc.text("Item", margin + 2, y + 1);
      doc.text("Qty", pageW - margin - 54, y + 1, { align: "right" });
      doc.text("Price", pageW - margin - 30, y + 1, { align: "right" });
      doc.text("Total", pageW - margin - 2, y + 1, { align: "right" });
      y += 7;

      takeoff.material_items.filter(item => item.item && (item.quantity > 0 || item.total > 0)).forEach(item => {
        checkPage(7);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(String(item.item || ""), margin + 2, y);
        doc.text(String(item.quantity || 0), pageW - margin - 54, y, { align: "right" });
        doc.text(fmt(item.price), pageW - margin - 30, y, { align: "right" });
        doc.text(fmt(item.total), pageW - margin - 2, y, { align: "right" });
        y += 5.5;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(28, 48, 90);
      doc.text(`Total Material: ${fmt(takeoff.total_material)}`, pageW - margin - 2, y, { align: "right" });
      y += 10;
    }
  });

  // Grand Total
  checkPage(30);
  y += 5;
  doc.setFillColor(28, 48, 90);
  doc.rect(margin, y - 4, pageW - 2 * margin, 20, "F");

  const grandLabor = allTakeoffs.reduce((s, t) => s + (t.total_labor || 0), 0);
  const grandMaterial = allTakeoffs.reduce((s, t) => s + (t.total_material || 0), 0);
  const grandDesign = allTakeoffs.reduce((s, t) => s + (t.total_design || 0), 0);
  const grandTotal = grandLabor + grandMaterial + grandDesign;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(200, 210, 230);
  doc.text("GRAND TOTAL ESTIMATE", margin + 2, y + 4);
  doc.text(`Labor: ${fmt(grandLabor)}`, margin + 60, y + 4);
  doc.text(`Material: ${fmt(grandMaterial)}`, margin + 105, y + 4);

  doc.setTextColor(255, 165, 0);
  doc.setFontSize(13);
  doc.text(`TOTAL: ${fmt(grandTotal)}`, pageW - margin - 2, y + 4, { align: "right" });

  doc.setTextColor(200, 210, 230);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Design: ${fmt(grandDesign)}`, margin + 2, y + 12);

  doc.save(`${project?.project_name || "estimate"}_${new Date().toISOString().split("T")[0]}.pdf`);
}