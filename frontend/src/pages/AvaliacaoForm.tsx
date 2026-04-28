import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import avaliacoesService from '../services/avaliacoes.service';
import type { AssessmentFormData } from '../services/avaliacoes.service';
import classesService from '../services/classes.service';
import type { Class } from '../services/classes.service';
import subjectsService from '../services/subjects.service';
import type { Subject } from '../services/subjects.service';
import teachersService from '../services/teachers.service';
import type { Teacher } from '../services/teachers.service';
import assessmentTypesService from '../services/assessmentTypes.service';
import type { AssessmentType } from '../services/assessmentTypes.service';
import academicYearsService from '../services/academicYears.service';
import type { AcademicYear } from '../services/academicYears.service';

export default function AvaliacaoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  
  const [formData, setFormData] = useState<AssessmentFormData>({
    school_id: '',
    academic_year_id: '',
    class_id: '',
    subject_id: '',
    teacher_id: '',
    assessment_type_id: '',
    name: '',
    description: '',
    date: '',
    trimester: undefined,
  });

  useEffect(() => {
    loadInitialData();
    if (isEditing) {
      loadAssessment();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [classesData, subjectsData, teachersData, typesData, yearsData] = await Promise.all([
        classesService.list(),
        subjectsService.list(),
        teachersService.list(),
        assessmentTypesService.list(),
        academicYearsService.list(),
      ]);
      
      setClasses(classesData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setAssessmentTypes(typesData);
      setAcademicYears(yearsData);

      const currentYear = yearsData.find(y => y.is_current);
      if (currentYear && !isEditing) {
        setFormData(prev => ({
          ...prev,
          academic_year_id: currentYear.id,
          school_id: currentYear.school_id,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados necessários');
    }
  };

  const loadAssessment = async () => {
    try {
      const assessment = await avaliacoesService.getById(id!);
      setFormData({
        school_id: assessment.school_id,
        academic_year_id: assessment.academic_year_id,
        class_id: assessment.class_id,
        subject_id: assessment.subject_id,
        teacher_id: assessment.teacher_id,
        assessment_type_id: assessment.assessment_type_id,
        name: assessment.name,
        description: assessment.description || '',
        date: assessment.date ? assessment.date.split('T')[0] : '',
        trimester: assessment.trimester,
      });
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error);
      alert('Erro ao carregar avaliação');
      navigate('/avaliacoes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.school_id || !formData.academic_year_id || !formData.class_id || 
        !formData.subject_id || !formData.teacher_id || !formData.assessment_type_id || !formData.name) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se o ano letivo selecionado está expirado
    const selectedYear = academicYears.find(y => y.id === formData.academic_year_id);
    if (selectedYear) {
      const today = new Date();
      const endDate = new Date(selectedYear.end_date);
      if (endDate < today) {
        const confirmCreate = confirm(
          `ATENÇÃO: O ano letivo "${selectedYear.name}" já terminou em ${endDate.toLocaleDateString('pt-PT')}.\n\n` +
          'Criar avaliações em um ano expirado pode causar problemas.\n\n' +
          'Deseja continuar mesmo assim?'
        );
        if (!confirmCreate) {
          return;
        }
      }
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        ...formData,
        trimester: formData.trimester ? Number(formData.trimester) : undefined,
      };

      if (isEditing) {
        await avaliacoesService.update(id!, dataToSend);
      } else {
        await avaliacoesService.create(dataToSend);
      }
      
      navigate('/avaliacoes');
    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error);
      alert(error.response?.data?.message || 'Erro ao salvar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/avaliacoes')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Preencha os dados da avaliação
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da Avaliação *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ex: Teste de Matemática - 1º Trimestre"
              />
            </div>

            <div>
              <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-700">
                Ano Lectivo *
              </label>
              <select
                name="academic_year_id"
                id="academic_year_id"
                required
                value={formData.academic_year_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccione o ano lectivo</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} {year.is_current && '(Actual)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
                Turma *
              </label>
              <select
                name="class_id"
                id="class_id"
                required
                value={formData.class_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccione a turma</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700">
                Disciplina *
              </label>
              <select
                name="subject_id"
                id="subject_id"
                required
                value={formData.subject_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccione a disciplina</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
                Professor *
              </label>
              <select
                name="teacher_id"
                id="teacher_id"
                required
                value={formData.teacher_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccione o professor</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assessment_type_id" className="block text-sm font-medium text-gray-700">
                Tipo de Avaliação *
              </label>
              <select
                name="assessment_type_id"
                id="assessment_type_id"
                required
                value={formData.assessment_type_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccione o tipo</option>
                {assessmentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} (Nota máxima: {type.max_score})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="trimester" className="block text-sm font-medium text-gray-700">
                Trimestre
              </label>
              <select
                name="trimester"
                id="trimester"
                value={formData.trimester || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccione o trimestre</option>
                <option value="1">1º Trimestre</option>
                <option value="2">2º Trimestre</option>
                <option value="3">3º Trimestre</option>
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Data da Avaliação
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Descrição opcional da avaliação"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-4">
            <button
              type="button"
              onClick={() => navigate('/avaliacoes')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'A guardar...' : isEditing ? 'Actualizar' : 'Criar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
