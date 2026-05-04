import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Plus, Edit2, Trash2, X } from 'lucide-react';
import horariosService from '../services/horarios.service';
import teachersService from '../services/teachers.service';
import academicYearsService from '../services/academicYears.service';
import type { Schedule, Class, Subject, Room } from '../services/horarios.service';
import { useAlert } from '../hooks/useAlert';
import { useAuth } from '../contexts/AuthContext';

export default function Horarios() {
  const { user } = useAuth();
  const canEdit = user?.role !== 'estudante' && user?.role !== 'encarregado';
  const { showAlert, showConfirm, showSuccess, showError, AlertComponent } = useAlert();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const [formData, setFormData] = useState({
    school_id: '',
    academic_year_id: '',
    class_id: '',
    subject_id: '',
    teacher_id: '',
    room_id: '',
    day_of_week: 1,
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, classesData, subjectsData, roomsData, teachersData, academicYearsData] = await Promise.all([
        selectedClass ? horariosService.getScheduleByClass(selectedClass) : horariosService.listSchedules(),
        horariosService.listClasses(),
        horariosService.listSubjects(),
        horariosService.listRooms(),
        teachersService.list(),
        academicYearsService.list(),
      ]);
      
      console.log('Dados carregados:', {
        schedules: schedulesData?.length || 0,
        classes: classesData?.length || 0,
        subjects: subjectsData?.length || 0,
        rooms: roomsData?.length || 0,
        teachers: teachersData?.length || 0,
        academicYears: academicYearsData?.length || 0,
      });
      
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setAcademicYears(Array.isArray(academicYearsData) ? academicYearsData : []);
    } catch (error: any) {
      console.error('Erro ao carregar horários:', error);
      console.error('Detalhes do erro:', error?.response?.data);
      showError('Erro ao Carregar', `Erro ao carregar dados: ${error?.response?.data?.message || error.message}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const submitSchedule = async (data: any) => {
    try {
      if (editingSchedule) {
        await horariosService.updateSchedule(editingSchedule.id, data);
      } else {
        await horariosService.createSchedule(data);
      }
      
      setShowModal(false);
      resetForm();
      loadData();
      showSuccess('Sucesso!', editingSchedule ? 'Horário atualizado com sucesso!' : 'Horário criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar horário:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar horário. Verifique os dados e tente novamente.';
      showError('Erro ao Salvar', errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schoolId = localStorage.getItem('school_id') || '';
      const currentYear = academicYears.find(y => y.is_current);
      
      const academicYearId = formData.academic_year_id || currentYear?.id;
      
      if (!academicYearId) {
        showAlert({
          title: 'Ano Académico Obrigatório',
          message: 'Por favor, selecione um ano académico ou defina um ano académico como atual.',
          type: 'warning'
        });
        return;
      }
      
      // Verificar se o ano letivo selecionado está expirado
      const selectedYear = academicYears.find(y => y.id === academicYearId);
      if (selectedYear) {
        const today = new Date();
        const endDate = new Date(selectedYear.end_date);
        if (endDate < today) {
          showConfirm({
            title: 'Ano Letivo Expirado',
            message: `ATENÇÃO: O ano letivo "${selectedYear.name}" já terminou em ${endDate.toLocaleDateString('pt-PT')}.\n\nCriar horários em um ano expirado pode causar problemas.\n\nDeseja continuar mesmo assim?`,
            type: 'error',
            confirmText: 'Continuar',
            onConfirm: () => submitSchedule(data)
          });
          return;
        }
      }
      
      if (!formData.class_id) {
        showAlert({
          title: 'Turma Obrigatória',
          message: 'Por favor, selecione uma turma.',
          type: 'warning'
        });
        return;
      }
      
      if (!formData.subject_id) {
        showAlert({
          title: 'Disciplina Obrigatória',
          message: 'Por favor, selecione uma disciplina.',
          type: 'warning'
        });
        return;
      }
      
      if (!formData.teacher_id) {
        showAlert({
          title: 'Professor Obrigatório',
          message: 'Por favor, selecione um professor.',
          type: 'warning'
        });
        return;
      }
      
      if (!formData.start_time || !formData.end_time) {
        showAlert({
          title: 'Horários Obrigatórios',
          message: 'Por favor, preencha os horários de início e fim.',
          type: 'warning'
        });
        return;
      }
      
      const data = {
        ...formData,
        school_id: schoolId,
        academic_year_id: academicYearId,
        room_id: formData.room_id || null,
      };

      await submitSchedule(data);
    } catch (error: any) {
      console.error('Erro na validação:', error);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      school_id: schedule.school_id,
      academic_year_id: schedule.academic_year_id || '',
      class_id: schedule.class_id,
      subject_id: schedule.subject_id,
      teacher_id: schedule.teacher_id,
      room_id: schedule.room_id || '',
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este horário?')) return;
    try {
      await horariosService.deleteSchedule(id);
      loadData();
    } catch (error) {
      console.error('Erro ao eliminar horário:', error);
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      school_id: '',
      academic_year_id: '',
      class_id: '',
      subject_id: '',
      teacher_id: '',
      room_id: '',
      day_of_week: 1,
      start_time: '',
      end_time: '',
    });
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek] || '';
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const groupedSchedules = Array.isArray(schedules) ? schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, Schedule[]>) : {};

  const sortedDays = Object.keys(groupedSchedules).sort((a, b) => parseInt(a) - parseInt(b));

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
          <h1 className="text-3xl font-bold text-gray-900">Horários</h1>
          <p className="mt-2 text-sm text-gray-700">Gestão de horários escolares</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Horário
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Horários</p>
              <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Turmas com Horário</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(schedules.map(s => s.class_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Professores Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(schedules.map(s => s.teacher_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Salas em Uso</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(schedules.filter(s => s.room_id).map(s => s.room_id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Todas as turmas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum horário encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Comece por criar um novo horário</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedDays.map((day) => (
            <div key={day} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{getDayName(parseInt(day))}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {groupedSchedules[parseInt(day)].map((schedule) => (
                  <div key={schedule.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-900">{schedule.subject_name}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {schedule.teacher_first_name} {schedule.teacher_last_name}
                            </div>
                            {schedule.room_name && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {schedule.room_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSchedule ? 'Editar Horário' : 'Novo Horário'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ano Académico *</label>
                  <select
                    value={formData.academic_year_id}
                    onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione um ano académico</option>
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name} {year.is_current ? '(Atual)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Turma *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Disciplina *</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione uma disciplina</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Professor *</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione um professor</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sala</label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma sala</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dia da Semana *</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={1}>Segunda-feira</option>
                    <option value={2}>Terça-feira</option>
                    <option value={3}>Quarta-feira</option>
                    <option value={4}>Quinta-feira</option>
                    <option value={5}>Sexta-feira</option>
                    <option value={6}>Sábado</option>
                    <option value={0}>Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Hora de Início *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Hora de Fim *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingSchedule ? 'Actualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      {AlertComponent}
    </div>
  );
}
