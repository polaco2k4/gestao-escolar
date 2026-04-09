import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classesService from '../services/classes.service';
import type { ClassFormData } from '../services/classes.service';
import schoolsService from '../services/schools.service';
import type { School } from '../services/schools.service';
import academicYearsService from '../services/academicYears.service';
import type { AcademicYear } from '../services/academicYears.service';
import coursesService from '../services/courses.service';
import type { Course } from '../services/courses.service';

export default function TurmaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [schools, setSchools] = useState<School[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClassFormData>({
    school_id: '',
    academic_year_id: '',
    course_id: '',
    name: '',
    year_level: 1,
    section: '',
    max_students: 40,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      loadClass(id);
    }
  }, [id, isEdit]);

  const loadData = async () => {
    try {
      const [schoolsData, yearsData, coursesData] = await Promise.all([
        schoolsService.list(),
        academicYearsService.list(),
        coursesService.list(),
      ]);
      setSchools(schoolsData);
      setAcademicYears(yearsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados necessários');
    }
  };

  const loadClass = async (classId: string) => {
    try {
      const classData = await classesService.getById(classId);
      setFormData({
        school_id: classData.school_id,
        academic_year_id: classData.academic_year_id,
        course_id: classData.course_id,
        name: classData.name,
        year_level: classData.year_level,
        section: classData.section || '',
        max_students: classData.max_students || 40,
        class_director_id: classData.class_director_id,
      });
    } catch (error) {
      console.error('Erro ao carregar turma:', error);
      alert('Erro ao carregar dados da turma');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.school_id || !formData.academic_year_id || !formData.course_id || !formData.name) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await classesService.update(id, formData);
      } else {
        await classesService.create(formData);
      }
      navigate('/turmas');
    } catch (error: any) {
      console.error('Erro ao salvar turma:', error);
      alert(error.response?.data?.message || 'Erro ao salvar turma');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Turma' : 'Nova Turma'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escola <span className="text-red-500">*</span>
              </label>
              <select
                name="school_id"
                value={formData.school_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione uma escola</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano Lectivo <span className="text-red-500">*</span>
              </label>
              <select
                name="academic_year_id"
                value={formData.academic_year_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione um ano lectivo</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso <span className="text-red-500">*</span>
              </label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione um curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Turma <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: 10ª A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year_level"
                value={formData.year_level}
                onChange={handleChange}
                required
                min="1"
                max="13"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secção
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="Ex: A, B, C"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Estudantes
              </label>
              <input
                type="number"
                name="max_students"
                value={formData.max_students}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/turmas')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'A guardar...' : isEdit ? 'Actualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
