import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import matriculasService from '../services/matriculas.service';
import type { EnrollmentFormData } from '../services/matriculas.service';
import studentsService from '../services/students.service';
import type { Student } from '../services/students.service';
import academicYearsService from '../services/academicYears.service';
import type { AcademicYear } from '../services/academicYears.service';
import classesService from '../services/classes.service';
import type { Class } from '../services/classes.service';

export default function MatriculaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    student_id: '',
    academic_year_id: '',
    class_id: '',
    enrollment_number: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      loadEnrollment(id);
    }
  }, [id, isEdit]);

  const loadData = async () => {
    try {
      const [studentsResponse, yearsData, classesData] = await Promise.all([
        studentsService.list({ limit: 1000 }),
        academicYearsService.list(),
        classesService.list(),
      ]);
      setStudents(studentsResponse.students || []);
      setAcademicYears(yearsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados necessários');
    }
  };

  const loadEnrollment = async (enrollmentId: string) => {
    try {
      const enrollment = await matriculasService.getById(enrollmentId);
      setFormData({
        student_id: enrollment.student_id,
        academic_year_id: enrollment.academic_year_id,
        class_id: enrollment.class_id,
        enrollment_number: enrollment.enrollment_number,
        notes: enrollment.notes || '',
      });
    } catch (error) {
      console.error('Erro ao carregar matrícula:', error);
      alert('Erro ao carregar matrícula');
      navigate('/matriculas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.academic_year_id || !formData.class_id) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    console.log('Dados sendo enviados:', formData);

    try {
      setLoading(true);
      if (isEdit && id) {
        await matriculasService.update(id, formData);
        alert('Matrícula actualizada com sucesso!');
      } else {
        await matriculasService.create(formData);
        alert('Matrícula criada com sucesso!');
      }
      navigate('/matriculas');
    } catch (error: any) {
      console.error('Erro ao salvar matrícula:', error);
      console.error('Response data:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      
      let errorMessage = 'Erro ao salvar matrícula';
      
      if (error.response?.status === 409) {
        errorMessage = 'Estudante já matriculado neste ano lectivo';
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && errors.length > 0) {
          const errorDetails = errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
          errorMessage = `Dados inválidos:\n${errorDetails}`;
        } else {
          errorMessage = 'Dados inválidos. Verifique se todos os campos estão preenchidos corretamente';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Matrícula' : 'Nova Matrícula'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? 'Actualize os dados da matrícula' : 'Preencha os dados para criar uma nova matrícula'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-2">
              Estudante <span className="text-red-500">*</span>
            </label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Seleccione um estudante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} ({student.student_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-700 mb-2">
              Ano Lectivo <span className="text-red-500">*</span>
            </label>
            <select
              id="academic_year_id"
              name="academic_year_id"
              value={formData.academic_year_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione o ano lectivo</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_current ? '(Actual)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-2">
              Turma <span className="text-red-500">*</span>
            </label>
            <select
              id="class_id"
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione a turma</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.year_level}º Ano {cls.section ? `(${cls.section})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="enrollment_number" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Matrícula
            </label>
            <input
              type="text"
              id="enrollment_number"
              name="enrollment_number"
              value={formData.enrollment_number}
              onChange={handleChange}
              placeholder="Deixe vazio para gerar automaticamente"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Se deixar vazio, será gerado automaticamente
            </p>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Observações adicionais sobre a matrícula..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/matriculas')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'A guardar...' : isEdit ? 'Actualizar' : 'Criar Matrícula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
