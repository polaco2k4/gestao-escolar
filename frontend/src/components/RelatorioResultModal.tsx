import React from 'react';
import { X, Download, FileText, Clock, Hash } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../contexts/AuthContext';
import academicYearsService from '../services/academicYears.service';

interface RelatorioResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportInfo: {
    name: string;
    report_type: string;
  };
  data: any[];
  metadata: {
    row_count: number;
    execution_time_ms: number;
    executed_at: string;
  };
}

const RelatorioResultModal: React.FC<RelatorioResultModalProps> = ({
  isOpen,
  onClose,
  reportInfo,
  data,
  metadata
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportInfo.name}_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (data.length === 0) return;

    let currentAcademicYear = 'N/D';
    try {
      const years = await academicYearsService.list();
      const current = years.find(y => y.is_current);
      if (current) currentAcademicYear = current.name;
    } catch {
      // continua sem o ano lectivo
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = formatDate(metadata.executed_at);
    const schoolName = user?.school_name || 'Escola';
    const userName = user ? `${user.first_name} ${user.last_name}` : 'Utilizador';

    // Cabeçalho — fundo azul
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(reportInfo.name, 14, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Escola: ${schoolName}`, 14, 22);
    doc.text(`Ano Lectivo: ${currentAcademicYear}`, 14, 28);
    doc.text(`Exportado por: ${userName}   |   Data: ${now}`, 14, 34);

    // Estatísticas rápidas no canto direito
    doc.setFontSize(9);
    doc.text(`${metadata.row_count} registos  |  ${metadata.execution_time_ms}ms`, pageW - 14, 22, { align: 'right' });

    // Linha separadora
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(14, 37, pageW - 14, 37);

    // Tabela de dados
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const v = row[h];
        return v !== null && v !== undefined ? String(v) : '-';
      })
    );

    autoTable(doc, {
      head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
      body: rows,
      startY: 42,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: (hookData) => {
        // Rodapé em cada página
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(
          `${schoolName} — ${reportInfo.name}   |   Página ${hookData.pageNumber} de ${pageCount}`,
          14,
          doc.internal.pageSize.getHeight() - 6
        );
      },
    });

    doc.save(`${reportInfo.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify({ reportInfo, data, metadata }, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportInfo.name}_${new Date().toISOString()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{reportInfo.name}</h2>
              <p className="text-sm text-gray-600">Resultados do Relatório</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">Registros</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{metadata.row_count}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Tempo de Execução</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{metadata.execution_time_ms}ms</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Executado em</span>
              </div>
              <p className="text-sm font-bold text-purple-900">{formatDate(metadata.executed_at)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
              <p className="text-gray-600">Os filtros aplicados não retornaram resultados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value !== null && value !== undefined ? String(value) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Mostrando {data.length} {data.length === 1 ? 'registro' : 'registros'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              disabled={data.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={exportToCSV}
              disabled={data.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={exportToJSON}
              disabled={data.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioResultModal;
