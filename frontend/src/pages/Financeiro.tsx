import { useState, useEffect, useRef } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock, Plus, Receipt, X, Settings, FileDown, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import financeiroService from '../services/financeiro.service';
import studentsService from '../services/students.service';
import type { FinancialSummary, Payment, StudentFee, FeeType } from '../services/financeiro.service';
import type { Student } from '../services/students.service';
import { useAuth } from '../contexts/AuthContext';
import classesService from '../services/classes.service';
import academicYearsService from '../services/academicYears.service';
import type { Class } from '../services/classes.service';
import type { AcademicYear } from '../services/academicYears.service';

export default function Financeiro() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [pendingFees, setPendingFees] = useState<StudentFee[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [studentSearchResults, setStudentSearchResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [feeTypeForm, setFeeTypeForm] = useState<{ name: string; description: string; amount: number; frequency: FeeType['frequency'] }>({ name: '', description: '', amount: 0, frequency: 'monthly' });
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  const [paymentForm, setPaymentForm] = useState({ student_fee_id: '', amount: 0, payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', notes: '' });
  const [feeForm, setFeeForm] = useState({ student_id: '', student_number: '', fee_type_id: '', amount: 0, due_date: new Date().toISOString().split('T')[0] });
  const [feeSearchQuery, setFeeSearchQuery] = useState('');
  const [feeSearchResults, setFeeSearchResults] = useState<StudentFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [allPendingFees, setAllPendingFees] = useState<StudentFee[]>([]);
  const studentSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showBulkFeeModal, setShowBulkFeeModal] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [bulkFeeForm, setBulkFeeForm] = useState({
    fee_type_id: '',
    academic_year_id: '',
    class_id: ''
  });
  const [exportingPDF, setExportingPDF] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, feesData, feeTypesData] = await Promise.all([
        financeiroService.listPayments({}),
        financeiroService.listStudentFees({ status: 'pending' }),
        financeiroService.listFeeTypes(),
      ]);
      
      // Only load summary for admin
      if (user?.role === 'admin' || user?.role === 'gestor') {
        const summaryData = await financeiroService.getFinancialSummary({});
        setSummary(summaryData);
      }
      
      setRecentPayments(Array.isArray(paymentsData) ? paymentsData.slice(0, 10) : []);
      setPendingFees(Array.isArray(feesData) ? feesData.slice(0, 10) : []);
      setFeeTypes(feeTypesData);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const handleOpenPaymentModal = async () => {
    setShowPaymentModal(true);
    try {
      const fees = await financeiroService.listStudentFees({ status: 'pending' });
      setAllPendingFees(fees);
    } catch (error) {
      console.error('Erro ao carregar propinas pendentes:', error);
    }
  };

  const handleFeeSearch = (query: string) => {
    setFeeSearchQuery(query);
    setSelectedFee(null);
    setPaymentForm(prev => ({ ...prev, student_fee_id: '' }));
    if (query.length < 2) {
      setFeeSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = allPendingFees.filter(fee =>
      fee.student_first_name?.toLowerCase().includes(q) ||
      fee.student_last_name?.toLowerCase().includes(q) ||
      `${fee.student_first_name} ${fee.student_last_name}`.toLowerCase().includes(q) ||
      fee.fee_type_name?.toLowerCase().includes(q)
    );
    setFeeSearchResults(results.slice(0, 8));
  };

  const handleFeeSelect = (fee: StudentFee) => {
    setSelectedFee(fee);
    setFeeSearchQuery(`${fee.student_first_name} ${fee.student_last_name} — ${fee.fee_type_name}`);
    setFeeSearchResults([]);
    setPaymentForm(prev => ({ ...prev, student_fee_id: fee.id, amount: fee.amount }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeiroService.createPayment(paymentForm);
      setShowPaymentModal(false);
      setPaymentForm({ student_fee_id: '', amount: 0, payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash', notes: '' });
      setFeeSearchQuery('');
      setSelectedFee(null);
      setFeeSearchResults([]);
      loadData();
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      alert('Erro ao criar pagamento');
    }
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeiroService.createStudentFee(feeForm);
      setShowFeeModal(false);
      setFeeForm({ student_id: '', student_number: '', fee_type_id: '', amount: 0, due_date: new Date().toISOString().split('T')[0] });
      setStudentSearchResults([]);
      loadData();
    } catch (error) {
      console.error('Erro ao criar propina:', error);
      alert('Erro ao criar propina');
    }
  };

  const resetFeeTypeForm = () => {
    setFeeTypeForm({ name: '', description: '', amount: 0, frequency: 'monthly' });
    setEditingFeeType(null);
  };

  const handleEditFeeType = (ft: FeeType) => {
    setEditingFeeType(ft);
    setFeeTypeForm({ name: ft.name, description: ft.description || '', amount: ft.amount, frequency: ft.frequency });
  };

  const handleDeleteFeeType = async (ft: FeeType) => {
    if (!window.confirm(`Eliminar o tipo "${ft.name}"? Esta acção não pode ser desfeita.`)) return;
    try {
      await financeiroService.deleteFeeType(ft.id);
      loadData();
    } catch (error) {
      console.error('Erro ao eliminar tipo de propina:', error);
      alert('Erro ao eliminar tipo de propina');
    }
  };

  const handleFeeTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeeType) {
        await financeiroService.updateFeeType(editingFeeType.id, feeTypeForm);
      } else {
        await financeiroService.createFeeType(feeTypeForm);
      }
      resetFeeTypeForm();
      loadData();
    } catch (error) {
      console.error('Erro ao guardar tipo de propina:', error);
      alert('Erro ao guardar tipo de propina');
    }
  };

  const handleStudentSearch = (query: string) => {
    if (studentSearchTimer.current) clearTimeout(studentSearchTimer.current);
    if (query.length < 2) {
      setStudentSearchResults([]);
      return;
    }
    studentSearchTimer.current = setTimeout(async () => {
      try {
        const response = await studentsService.list({ search: query, limit: 10 });
        setStudentSearchResults(response.students);
      } catch (error) {
        console.error('Erro ao buscar estudantes:', error);
      }
    }, 400);
  };

  const handleStudentSelect = (student: Student) => {
    setFeeForm({ 
      ...feeForm, 
      student_id: student.id,
      student_number: student.student_number
    });
    setStudentSearchResults([]);
  };

  const loadBulkFeeData = async () => {
    try {
      const [classesData, yearsData] = await Promise.all([
        classesService.list(),
        academicYearsService.list()
      ]);
      setClasses(classesData);
      setAcademicYears(yearsData);
      
      const currentYear = yearsData.find(y => y.is_current);
      if (currentYear) {
        setBulkFeeForm(prev => ({ ...prev, academic_year_id: currentYear.id }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleOpenBulkFeeModal = () => {
    setShowBulkFeeModal(true);
    loadBulkFeeData();
  };

  const handleBulkFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se o ano letivo selecionado está expirado
    const selectedYear = academicYears.find(y => y.id === bulkFeeForm.academic_year_id);
    if (selectedYear) {
      const today = new Date();
      const endDate = new Date(selectedYear.end_date);
      if (endDate < today) {
        const confirmCreate = confirm(
          `ATENÇÃO: O ano letivo "${selectedYear.name}" já terminou em ${endDate.toLocaleDateString('pt-PT')}.\n\n` +
          'Criar propinas em um ano expirado pode causar problemas.\n\n' +
          'Deseja continuar mesmo assim?'
        );
        if (!confirmCreate) {
          return;
        }
      }
    }
    
    try {
      const result = await financeiroService.bulkCreateStudentFees(bulkFeeForm);
      alert(`${result.length} propinas criadas com sucesso!`);
      setShowBulkFeeModal(false);
      setBulkFeeForm({ fee_type_id: '', academic_year_id: '', class_id: '' });
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar propinas em massa:', error);
      alert(error.response?.data?.message || 'Erro ao criar propinas em massa');
    }
  };

  const paymentMethodLabel: Record<string, string> = {
    cash: 'Numerário',
    bank_transfer: 'Transferência Bancária',
    multicaixa: 'Multicaixa',
    payway: 'PayWay',
    other: 'Outro',
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetailModal(true);
  };

  const exportPaymentPDF = (payment: Payment) => {
    const doc = new jsPDF({ orientation: 'portrait', format: 'a5' });
    const pageW = doc.internal.pageSize.getWidth();
    const schoolName = user?.school_name || 'Escola';
    const now = new Date().toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Header verde
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recibo de Pagamento', 14, 12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolName, 14, 20);
    doc.text(`Emitido: ${now}`, 14, 26);

    // Corpo
    doc.setTextColor(0, 0, 0);
    let y = 42;
    const labelX = 14;
    const valueX = 70;
    const lineH = 10;

    const row = (label: string, value: string) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(label.toUpperCase(), labelX, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(value, valueX, y);
      y += lineH;
    };

    row('Estudante', `${payment.student_first_name || ''} ${payment.student_last_name || ''}`.trim());
    row('Propina', payment.fee_name || '—');
    row('Data de Pagamento', formatDate(payment.payment_date));
    row('Método', paymentMethodLabel[payment.payment_method] || payment.payment_method);
    if (payment.reference) row('Referência', payment.reference);
    if (payment.notes) row('Notas', payment.notes);

    // Valor em destaque
    y += 4;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(labelX, y - 6, pageW - 28, 16, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text('VALOR PAGO', labelX + 4, y + 2);
    doc.setFontSize(14);
    doc.text(formatCurrency(payment.amount), pageW - labelX, y + 2, { align: 'right' });

    // Rodapé
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`${schoolName} — Documento gerado automaticamente`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });

    doc.save(`recibo_pagamento_${payment.id.slice(0, 8)}.pdf`);
  };

  const handlePayFee = async (fee: StudentFee) => {
    if (allPendingFees.length === 0) {
      try {
        const fees = await financeiroService.listStudentFees({ status: 'pending' });
        setAllPendingFees(fees);
      } catch {
        // continue with empty list
      }
    }
    setSelectedFee(fee);
    setFeeSearchQuery(`${fee.student_first_name} ${fee.student_last_name} — ${fee.fee_type_name}`);
    setFeeSearchResults([]);
    setPaymentForm(prev => ({ ...prev, student_fee_id: fee.id, amount: fee.amount }));
    setShowPaymentModal(true);
  };

  const statusLabel: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Em Atraso',
    cancelled: 'Cancelado',
  };

  const exportPropinas = async () => {
    setExportingPDF(true);
    try {
      const allFees = await financeiroService.listStudentFees({ limit: 9999 });

      const doc = new jsPDF({ orientation: 'portrait' });
      const pageW = doc.internal.pageSize.getWidth();
      const now = new Date().toLocaleString('pt-PT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      const schoolName = user?.school_name || 'Escola';
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Utilizador';

      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageW, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Propinas', 14, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Escola: ${schoolName}`, 14, 22);
      doc.text(`Exportado por: ${userName}   |   Data: ${now}`, 14, 28);
      doc.text(`Total de registos: ${allFees.length}`, pageW - 14, 22, { align: 'right' });

      const rows = allFees.map(fee => [
        `${fee.student_first_name || ''} ${fee.student_last_name || ''}`.trim(),
        fee.fee_type_name || '-',
        formatCurrency(fee.amount),
        formatDate(fee.due_date),
        statusLabel[fee.status] || fee.status,
      ]);

      const totalAmount = allFees.reduce((sum, f) => sum + Number(f.amount), 0);

      autoTable(doc, {
        head: [['Estudante', 'Tipo de Propina', 'Montante', 'Vencimento', 'Estado']],
        body: rows,
        foot: [['', 'TOTAL', formatCurrency(totalAmount), '', '']],
        startY: 42,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (hookData) => {
          if (hookData.section === 'body' && hookData.column.index === 4) {
            const status = allFees[hookData.row.index]?.status;
            if (status === 'paid') hookData.cell.styles.textColor = [22, 163, 74];
            else if (status === 'overdue') hookData.cell.styles.textColor = [220, 38, 38];
            else if (status === 'pending') hookData.cell.styles.textColor = [202, 138, 4];
            else hookData.cell.styles.textColor = [107, 114, 128];
          }
        },
        didDrawPage: (hookData) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.text(
            `${schoolName} — Relatório de Propinas   |   Página ${hookData.pageNumber} de ${pageCount}`,
            14,
            doc.internal.pageSize.getHeight() - 6
          );
        },
      });

      doc.save(`propinas_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar propinas:', error);
      alert('Erro ao exportar propinas em PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visão geral das finanças da escola
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'gestor') && (
          <div className="flex space-x-3">
            <button onClick={handleOpenPaymentModal} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <Receipt className="h-5 w-5 mr-2" />
              Registar Pagamento
            </button>
            <button onClick={() => setShowFeeModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-5 w-5 mr-2" />
              Nova Propina
            </button>
            <button onClick={handleOpenBulkFeeModal} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <Plus className="h-5 w-5 mr-2" />
              Propinas em Massa
            </button>
            <button
              onClick={exportPropinas}
              disabled={exportingPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="h-5 w-5 mr-2" />
              {exportingPDF ? 'A exportar...' : 'Exportar PDF'}
            </button>
            <button onClick={() => setShowFeeTypeModal(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Settings className="h-5 w-5 mr-2" />
              Tipos de Propina
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Esperado</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(summary.total_expected)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pago</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(summary.total_paid)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pendente</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(summary.total_pending)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total em Atraso</dt>
                    <dd className="text-lg font-semibold text-gray-900">{formatCurrency(summary.total_overdue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Rate */}
      {summary && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Taxa de Pagamento</h3>
            <span className="text-3xl font-bold text-blue-600">{summary.payment_rate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${summary.payment_rate}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pagamentos Recentes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudante</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acções</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                        Nenhum pagamento recente
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.student_first_name} {payment.student_last_name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewPayment(payment); }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                            title="Ver detalhes"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Fees */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Propinas Pendentes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudante</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    {(user?.role === 'admin' || user?.role === 'gestor') && (
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acções</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingFees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                        Nenhuma propina pendente
                      </td>
                    </tr>
                  ) : (
                    pendingFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.student_first_name} {fee.student_last_name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fee.fee_type_name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">
                          {formatCurrency(fee.amount)}
                        </td>
                        {(user?.role === 'admin' || user?.role === 'gestor') && (
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handlePayFee(fee)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                              title="Registar pagamento"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                              Pagar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhe de Pagamento */}
      {showPaymentDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-green-600 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-white" />
                <h3 className="text-lg font-medium text-white">Detalhe do Pagamento</h3>
              </div>
              <button onClick={() => setShowPaymentDetailModal(false)} className="text-white hover:text-green-100">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estudante</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {selectedPayment.student_first_name} {selectedPayment.student_last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Propina</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.fee_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Valor Pago</p>
                  <p className="mt-1 text-sm font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data de Pagamento</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.payment_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Método</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {paymentMethodLabel[selectedPayment.payment_method] || selectedPayment.payment_method}
                  </p>
                </div>
                {selectedPayment.reference && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Referência</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.reference}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registado em</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(selectedPayment.created_at).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {selectedPayment.notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notas</p>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={() => exportPaymentPDF(selectedPayment)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </button>
              <button
                onClick={() => setShowPaymentDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Registar Pagamento</h3>
              <button onClick={() => { setShowPaymentModal(false); setFeeSearchQuery(''); setSelectedFee(null); setFeeSearchResults([]); }} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="px-6 py-4 space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Propina</label>
                <input
                  type="text"
                  required
                  value={feeSearchQuery}
                  onChange={(e) => handleFeeSearch(e.target.value)}
                  placeholder="Digite o nome do estudante ou tipo de propina"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {feeSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {feeSearchResults.map((fee) => (
                      <button
                        key={fee.id}
                        type="button"
                        onClick={() => handleFeeSelect(fee)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">
                          {fee.student_first_name} {fee.student_last_name}
                        </div>
                        <div className="text-sm text-gray-500 flex justify-between">
                          <span>{fee.fee_type_name}</span>
                          <span className="font-medium text-yellow-600">{formatCurrency(fee.amount)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedFee && (
                  <div className="mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                    Propina seleccionada: <strong>{selectedFee.fee_type_name}</strong> — vence em {formatDate(selectedFee.due_date)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor (Kz)</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value ? Number(e.target.value) : 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Pagamento</label>
                <input
                  type="date"
                  required
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Método de Pagamento</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                  <option value="multicaixa">Multicaixa</option>
                  <option value="payway">PayWay</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Registar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Propina */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Nova Propina</h3>
              <button onClick={() => setShowFeeModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleFeeSubmit} className="px-6 py-4 space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Estudante</label>
                <input
                  type="text"
                  required
                  value={feeForm.student_number}
                  onChange={(e) => {
                    setFeeForm({ ...feeForm, student_number: e.target.value });
                    handleStudentSearch(e.target.value);
                  }}
                  placeholder="Digite o nome ou número do estudante"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {studentSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {studentSearchResults.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleStudentSelect(student)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">
                          {student.student_number} - {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Propina</label>
                <select
                  required
                  value={feeForm.fee_type_id}
                  onChange={(e) => {
                    const selectedFeeType = feeTypes.find(ft => ft.id === e.target.value);
                    setFeeForm({ 
                      ...feeForm, 
                      fee_type_id: e.target.value,
                      amount: selectedFeeType?.amount || 0
                    });
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um tipo</option>
                  {feeTypes.map((ft) => (
                    <option key={ft.id} value={ft.id}>
                      {ft.name} - {formatCurrency(ft.amount)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor (Kz)</label>
                <input
                  type="number"
                  required
                  value={feeForm.amount || ''}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value ? Number(e.target.value) : 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                <input
                  type="date"
                  required
                  value={feeForm.due_date}
                  onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Tipos de Propina */}
      {showFeeTypeModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Tipos de Propina</h3>
              <button onClick={() => { setShowFeeTypeModal(false); resetFeeTypeForm(); }} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4">
              {/* Lista de tipos existentes */}
              {feeTypes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tipos existentes</h4>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-md max-h-48 overflow-auto">
                    {feeTypes.map((ft) => (
                      <div key={ft.id} className={`flex justify-between items-center px-3 py-2 text-sm ${editingFeeType?.id === ft.id ? 'bg-blue-50' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900">{ft.name}</span>
                          {ft.description && <span className="ml-2 text-gray-400 text-xs">{ft.description}</span>}
                          <span className="ml-2 font-medium text-blue-600">{formatCurrency(ft.amount)}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditFeeType(ft)}
                            className="px-2 py-1 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 rounded"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFeeType(ft)}
                            className="px-2 py-1 text-xs text-red-700 bg-red-100 hover:bg-red-200 rounded"
                          >
                            Apagar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Formulário criar/editar */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {editingFeeType ? `Editar: ${editingFeeType.name}` : 'Criar novo tipo'}
                </h4>
                {editingFeeType && (
                  <button type="button" onClick={resetFeeTypeForm} className="text-xs text-gray-500 hover:text-gray-700">
                    Cancelar edição
                  </button>
                )}
              </div>
              <form onSubmit={handleFeeTypeSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    required
                    value={feeTypeForm.name}
                    onChange={(e) => setFeeTypeForm({ ...feeTypeForm, name: e.target.value })}
                    placeholder="Ex: Mensalidade, Matrícula..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
                  <input
                    type="text"
                    value={feeTypeForm.description}
                    onChange={(e) => setFeeTypeForm({ ...feeTypeForm, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor (Kz)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={feeTypeForm.amount || ''}
                      onChange={(e) => setFeeTypeForm({ ...feeTypeForm, amount: e.target.value ? Number(e.target.value) : 0 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequência</label>
                    <select
                      value={feeTypeForm.frequency}
                      onChange={(e) => setFeeTypeForm({ ...feeTypeForm, frequency: e.target.value as FeeType['frequency'] })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="once">Uma vez</option>
                      <option value="monthly">Mensal</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowFeeTypeModal(false); resetFeeTypeForm(); }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingFeeType ? 'Guardar alterações' : 'Criar Tipo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Propinas em Massa */}
      {showBulkFeeModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Criar Propinas em Massa</h3>
              <button 
                onClick={() => setShowBulkFeeModal(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleBulkFeeSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Propina
                </label>
                <select
                  required
                  value={bulkFeeForm.fee_type_id}
                  onChange={(e) => setBulkFeeForm({ ...bulkFeeForm, fee_type_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um tipo</option>
                  {feeTypes.map((ft) => (
                    <option key={ft.id} value={ft.id}>
                      {ft.name} - {formatCurrency(ft.amount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ano Lectivo
                </label>
                <select
                  required
                  value={bulkFeeForm.academic_year_id}
                  onChange={(e) => setBulkFeeForm({ ...bulkFeeForm, academic_year_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o ano</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name} {year.is_current && '(Actual)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Turma
                </label>
                <select
                  required
                  value={bulkFeeForm.class_id}
                  onChange={(e) => setBulkFeeForm({ ...bulkFeeForm, class_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma turma</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.course_name && `- ${cls.course_name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Atenção:</strong> Esta acção irá criar propinas para todos os estudantes 
                  matriculados na turma seleccionada com o status "active".
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkFeeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Criar Propinas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
