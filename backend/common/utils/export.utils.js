const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");
const fs = require("fs").promises;

class ExportUtils {
  // Exports data to CSV
  exportToCSV(data, options = {}) {
    if (!data || data.length === 0) {
      return null;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map((item) => {
      return headers.map((header) => {
        const value = item[header];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value || "";
      });
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    return csv;
  }

  // Exports data to Excel
  exportToExcel(data, options = {}) {
    if (!data || data.length === 0) {
      return null;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      options.sheetName || "Sheet1"
    );

    // Convert to buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return buffer;
  }

  // Exports data to PDF
  exportToPDF(data, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        // Add title
        doc.fontSize(20).text(options.title || "Report", { align: "center" });
        doc.moveDown();

        // Add date
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, {
          align: "right",
        });
        doc.moveDown();

        // Add data as table
        if (data && data.length > 0) {
          const headers = Object.keys(data[0]);
          const columnWidths = headers.map(() => 100);

          // Headers
          doc.fontSize(12).font("Helvetica-Bold");
          headers.forEach((header, index) => {
            const x = 50 + index * 100;
            doc.text(header, x, doc.y, { width: 90, align: "left" });
          });
          doc.moveDown();

          // Data rows
          doc.fontSize(10).font("Helvetica");
          data.forEach((item) => {
            headers.forEach((header, index) => {
              const x = 50 + index * 100;
              const value = item[header] || "";
              doc.text(String(value), x, doc.y, { width: 90, align: "left" });
            });
            doc.moveDown();
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generates report in format
  async generateReport(data, format = "csv", options = {}) {
    switch (format.toLowerCase()) {
      case "csv":
        return this.exportToCSV(data, options);
      case "excel":
      case "xlsx":
        return this.exportToExcel(data, options);
      case "pdf":
        return this.exportToPDF(data, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // Saves exported data to file
  async saveExport(data, format = "csv", filename) {
    const content = await this.generateReport(data, format);
    if (!content) {
      throw new Error("No data to export");
    }

    const filePath = path.join(
      __dirname,
      "../../exports",
      filename || `export.${format}`
    );
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    return filePath;
  }
}

module.exports = new ExportUtils();
const stringUtils = new StringUtils();

module.exports = stringUtils;
module.exports.stringUtils = stringUtils;
