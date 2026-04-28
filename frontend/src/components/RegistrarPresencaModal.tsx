import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import api from '../config/api';
import studentsService from '../services/students.service';
import horariosService from '../services/horarios.service';
import type { Student } from '../services/students.service';
import type { Schedule } from '../services/horarios.service';

interface RegistrarPresencaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function RegistrarPresencaModal({ isOpen, onClose, onSuccess }: RegistrarPresencaModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    schedule_id: '',
    school_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present' as 'present' | 'absent' | 'late' | 'justified',
    remarks: '',
  });

  // Student autocomplete
  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const studentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule autocomplete
  const [scheduleQuery, setScheduleQuery] = useState('');
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [scheduleResults, setScheduleResults] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    if (isOpen) {
      horariosService.listSchedules().then(setAllSchedules).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStudentSearch = (query: string) => {
    setStudentQuery(query);
    setSelectedStudent(null);
    setFormData(prev => ({ ...prev, student_id: '' }));
    if (studentTimer.current) clearTimeout(studentTimer.current);
    if (query.length < 2) { setStudentResults([]); return; }
    studentTimer.current = setTimeout(async () => {
      try {
        const res = await studentsService.list({ search: query, limit: 8 });
        setStudentResults(res.students);
      } catch {}
    }, 400);
  };

  const handleStudentSelect = (s: Student) => {
    setSelectedStudent(s);
    setStudentQuery(`${s.student_number} — ${s.first_name} ${s.last_name}`);
    setStudentResults([]);
    setFormData(prev => ({ ...prev, student_id: s.id }));
  };

  const handleScheduleSearch = (query: string) => {
    setScheduleQuery(query);
    setSelectedSchedule(null);
    setFormData(prev => ({ ...prev, schedule_id: '' }));
    if (query.length < 2) { setScheduleResults([]); return; }
    const q = query.toLowerCase();
    setScheduleResults(
      allSchedules.filter(sc =>
        sc.subject_name?.toLowerCase().includes(q) ||
        sc.class_name?.toLowerCase().includes(q) ||
        `${sc.teacher_first_name} ${sc.teacher_last_name}`.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  };

  const handleScheduleSelect = (sc: Schedule) => {
    setSelectedSchedule(sc);
    setScheduleQuery(`${sc.subject_name} — ${sc.class_name} (${DAYS[sc.day_of_week]} ${sc.start_time})`);
    setScheduleResults([]);
    setFormData(prev => ({ ...prev, schedule_id: sc.id, school_id: sc.school_id }));
  };

  const reset = () => {
    setFormData({ student_id: '', schedule_id: '', school_id: '', date: new Date().toISOString().split('T')[0], status: 'present', remarks: '' });
    setStudentQuery(''); setStudentResults([]); setSelectedStudent(null);
    setScheduleQuery(''); setScheduleResults([]); setSelectedSchedule(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assiduidade', formData);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao registar presença:', error);
      alert('Erro ao registar presença');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Registar Presença</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Estudante autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Estudante *</label>
            <input
              type="text"
              required
              value={studentQuery}
              onChange={(e) => handleStudentSearch(e.target.value)}
              placeholder="Digite o nome ou número do estudante"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {studentResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-auto">
                {studentResults.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStudentSelect(s)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                  >
                    <div className="font-medium text-gray-900 text-sm">{s.first_name} {s.last_name}</div>
                    <div className="text-xs text-gray-500">Nº {s.student_number}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedStudent && (
              <div className="mt-1 px-3 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                {selectedStudent.first_name} {selectedStudent.last_name} — Nº {selectedStudent.student_number}
              </div>
            )}
          </div>

          {/* Horário autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Horário *</label>
            <input
              type="text"
              required
              value={scheduleQuery}
              onChange={(e) => handleScheduleSearch(e.target.value)}
              placeholder="Digite a disciplina, turma ou professor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {scheduleResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-auto">
                {scheduleResults.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleScheduleSelect(sc)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100"
                  >
                    <div className="font-medium text-gray-900 text-sm">{sc.subject_name}</div>
                    <div className="text-xs text-gray-500">
                      {sc.class_name} · {DAYS[sc.day_of_week]} {sc.start_time}–{sc.end_time}
                      {sc.teacher_first_name && ` · ${sc.teacher_first_name} ${sc.teacher_last_name}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedSchedule && (
              <div className="mt-1 px-3 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                {selectedSchedule.subject_name} — {selectedSchedule.class_name} ({DAYS[selectedSchedule.day_of_week]} {selectedSchedule.start_time})
              </div>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="present">Presente</option>
              <option value="absent">Ausente</option>
              <option value="late">Atrasado</option>
              <option value="justified">Justificado</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Observações opcionais"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.student_id || !formData.schedule_id}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'A registar...' : 'Registar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
