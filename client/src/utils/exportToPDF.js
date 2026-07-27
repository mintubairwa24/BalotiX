/**
 * FILE: src/utils/exportToPDF.js
 *
 * ============================================================================
 * exportToPDF — Phase 18H (Analytics & Reports)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A reusable utility that captures any React element ref (e.g. a dashboard
 * section, chart, or full page) as a PDF export using client-side libraries
 * (html2canvas + jspdf). This avoids server-side PDF generation complexity
 * while giving admins a professional downloadable report.
 *
 * USAGE:
 *   import { exportToPDF } from "../../../utils/exportToPDF";
 *   const ref = useRef();
 *   <div ref={ref}><!-- content to export --></div>
 *   <button onClick={() => exportToPDF(ref, "Sales-Report")}>Export PDF</button>
 *
 * PRODUCTION-READY BECAUSE:
 * - Generates A4-optimized PDF with proper margins
 * - Filename includes a timestamp for uniqueness
 * - Gracefully handles errors with console warning
 */

/**
 * Captures a DOM element and downloads it as a PDF.
 * @param {React.RefObject} ref - React ref pointing to the container element
 * @param {string} filename - Base filename (without extension)
 * @param {string} title - Optional title to display at top of PDF
 */
export const exportToPDF = async (ref, filename = "report", title = "") => {
  if (!ref?.current) {
    console.warn("exportToPDF: ref is empty — nothing to export.");
    return;
  }

  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const element = ref.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 190; // A4 width in mm with margins
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF("p", "mm", "a4");
    let yOffset = 10;

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, 105, yOffset, { align: "center" });
      yOffset += 10;

      // Add date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Generated: ${new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        105,
        yOffset,
        { align: "center" }
      );
      yOffset += 8;
    }

    // Add the captured image (may span multiple pages)
    let heightLeft = imgHeight;
    let position = yOffset;
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position);

    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, -(pageHeight - position), imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}-${Date.now()}.pdf`);
  } catch (error) {
    console.warn("exportToPDF: failed to generate PDF —", error.message);
  }
};

export default exportToPDF;

