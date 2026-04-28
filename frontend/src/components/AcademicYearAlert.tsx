import { AlertTriangle, AlertCircle, Calendar } from 'lucide-react';
import { useAcademicYearStatus } from '../hooks/useAcademicYearStatus';
import { useNavigate } from 'react-router-dom';

export default function AcademicYearAlert() {
  const status = useAcademicYearStatus();
  const navigate = useNavigate();

  if (status.loading || status.alertType === 'none') {
    return null;
  }

  const handleAction = () => {
    navigate('/anos-lectivos');
  };

  return (
    <div
      className={`rounded-lg p-4 mb-6 ${
        status.alertType === 'error'
          ? 'bg-red-50 border-l-4 border-red-400'
          : 'bg-yellow-50 border-l-4 border-yellow-400'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {status.alertType === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3
            className={`text-sm font-medium ${
              status.alertType === 'error' ? 'text-red-800' : 'text-yellow-800'
            }`}
          >
            {status.isExpired ? 'Ano Letivo Expirado' : 'Atenção: Ano Letivo'}
          </h3>
          <div
            className={`mt-2 text-sm ${
              status.alertType === 'error' ? 'text-red-700' : 'text-yellow-700'
            }`}
          >
            <p>{status.alertMessage}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAction}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                status.alertType === 'error'
                  ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {status.isExpired ? 'Ativar Próximo Ano' : 'Gerenciar Anos Letivos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
