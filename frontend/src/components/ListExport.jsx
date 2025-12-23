import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

const ExcelExport = ({ 
  excelData, 
  selectedSheet, 
  checkmarkColumns, 
  excelCheckmarks, 
  fileName = 'export',
  filteredRows = null
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getCheckmarkSymbol = (type) => {
    const symbols = {
      'checkbox': '☑',
      'check': '✓',
      'circle': '●',
      'star': '★',
      'heart': '♥'
    };
    return symbols[type] || '☑';
  };

  const prepareDataForExport = () => {
    if (!excelData || !selectedSheet) return null;

    const sheetData = excelData.data[selectedSheet];
    if (!sheetData || sheetData.length === 0) return null;

    const headers = Object.keys(sheetData[0]);
    const dataToExport = filteredRows || sheetData;

    // Add checkmark column headers
    const allHeaders = [...headers, ...checkmarkColumns.map(col => col.fieldName)];

    // Prepare rows with checkmarks
    const rows = dataToExport.map((row) => {
      const originalRowIndex = sheetData.findIndex(r => r === row);
      const rowData = headers.map(header => row[header] || '');
      
      // Add checkmark values
      checkmarkColumns.forEach(field => {
        const isChecked = excelCheckmarks[originalRowIndex]?.[field.fieldId] || false;
        rowData.push(isChecked ? getCheckmarkSymbol(field.checkmarkType) : '○');
      });

      return rowData;
    });

    return { headers: allHeaders, rows, originalData: sheetData };
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const data = prepareDataForExport();
      if (!data) {
        alert('No data to export');
        return;
      }

      // Dynamically import xlsx
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);

      // Set column widths
      const colWidths = data.headers.map(header => ({
        wch: Math.max(header.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, selectedSheet || 'Sheet1');

      // Generate file
      XLSX.writeFile(wb, `${fileName}_${selectedSheet || 'export'}.xlsx`);
      setShowMenu(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const data = prepareDataForExport();
      if (!data) {
        alert('No data to export');
        return;
      }

      // Dynamically import jsPDF
      const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      // Load autoTable plugin
      await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');

      const doc = new jsPDF('l', 'mm', 'a4');
      
      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${fileName} - ${selectedSheet || 'Sheet'}`, 14, 15);

      // Add timestamp
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

      // Prepare table data
      const tableColumn = data.headers;
      const tableRows = data.rows;

      // Generate table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          ...checkmarkColumns.reduce((acc, field, index) => {
            acc[data.headers.length - checkmarkColumns.length + index] = { 
              halign: 'center',
              cellWidth: 15
            };
            return acc;
          }, {})
        },
        margin: { top: 28, right: 14, bottom: 14, left: 14 },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });

      doc.save(`${fileName}_${selectedSheet || 'export'}.pdf`);
      setShowMenu(false);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="excel-export-container">
      <button
        className="export-button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        title="Export options"
      >
        <Download size={18} />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        <ChevronDown size={16} className={`dropdown-icon ${showMenu ? 'rotated' : ''}`} />
      </button>

      {showMenu && (
        <>
          <div className="export-backdrop" onClick={() => setShowMenu(false)} />
          <div className="export-menu">
            <button
              className="export-option"
              onClick={exportToExcel}
              disabled={isExporting}
            >
              <FileSpreadsheet size={18} />
              <div className="export-option-text">
                <span className="export-option-title">Export as Excel</span>
                <span className="export-option-desc">Download .xlsx file</span>
              </div>
            </button>
            
            <div className="export-divider" />
            
            <button
              className="export-option"
              onClick={exportToPDF}
              disabled={isExporting}
            >
              <FileText size={18} />
              <div className="export-option-text">
                <span className="export-option-title">Export as PDF</span>
                <span className="export-option-desc">Download .pdf file</span>
              </div>
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .excel-export-container {
          position: relative;
          display: inline-block;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .export-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-button:not(:disabled):hover {
          background: #1e293b;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .export-button:not(:disabled):active {
          transform: translateY(0);
        }

        .dropdown-icon {
          transition: transform 0.2s ease;
        }

        .dropdown-icon.rotated {
          transform: rotate(180deg);
        }

        .export-backdrop {
          position: fixed;
          inset: 0;
          z-index: 998;
        }

        .export-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 999;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .export-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }

        .export-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-option:not(:disabled):hover {
          background: #f8fafc;
        }

        .export-option svg {
          color: #0f172a;
          flex-shrink: 0;
        }

        .export-option-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .export-option-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .export-option-desc {
          font-size: 12px;
          color: #64748b;
        }

        .export-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 4px 0;
        }

        @media (max-width: 768px) {
          .export-menu {
            right: auto;
            left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ExcelExport;