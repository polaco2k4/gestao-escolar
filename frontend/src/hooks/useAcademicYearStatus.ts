import { useState, useEffect } from 'react';
import academicYearsService from '../services/academicYears.service';
import type { AcademicYear } from '../services/academicYears.service';

export interface AcademicYearStatus {
  currentYear: AcademicYear | null;
  daysUntilEnd: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  alertType: 'none' | 'warning' | 'error';
  alertMessage: string;
  loading: boolean;
}

export function useAcademicYearStatus() {
  const [status, setStatus] = useState<AcademicYearStatus>({
    currentYear: null,
    daysUntilEnd: 0,
    isExpired: false,
    isExpiringSoon: false,
    alertType: 'none',
    alertMessage: '',
    loading: true,
  });

  useEffect(() => {
    checkYearStatus();
  }, []);

  async function checkYearStatus() {
    try {
      const years = await academicYearsService.list();
      const currentYear = years.find(y => y.is_current);

      if (!currentYear) {
        setStatus({
          currentYear: null,
          daysUntilEnd: 0,
          isExpired: true,
          isExpiringSoon: false,
          alertType: 'error',
          alertMessage: 'Nenhum ano letivo ativo! Configure um ano letivo como atual.',
          loading: false,
        });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDate = new Date(currentYear.end_date);
      endDate.setHours(0, 0, 0, 0);
      
      const daysUntilEnd = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let alertType: 'none' | 'warning' | 'error' = 'none';
      let alertMessage = '';
      let isExpired = false;
      let isExpiringSoon = false;

      if (daysUntilEnd < 0) {
        // Ano expirado
        isExpired = true;
        alertType = 'error';
        const daysExpired = Math.abs(daysUntilEnd);
        alertMessage = `O ano letivo ${currentYear.name} terminou há ${daysExpired} ${daysExpired === 1 ? 'dia' : 'dias'}! Ative o próximo ano letivo imediatamente.`;
      } else if (daysUntilEnd === 0) {
        // Último dia
        isExpired = false;
        isExpiringSoon = true;
        alertType = 'error';
        alertMessage = `HOJE é o último dia do ano letivo ${currentYear.name}! Prepare a transição para o próximo ano.`;
      } else if (daysUntilEnd <= 7) {
        // Menos de 7 dias
        isExpiringSoon = true;
        alertType = 'error';
        alertMessage = `O ano letivo ${currentYear.name} termina em ${daysUntilEnd} ${daysUntilEnd === 1 ? 'dia' : 'dias'}! Prepare o próximo ano letivo.`;
      } else if (daysUntilEnd <= 30) {
        // Menos de 30 dias
        isExpiringSoon = true;
        alertType = 'warning';
        alertMessage = `O ano letivo ${currentYear.name} termina em ${daysUntilEnd} dias. Comece a preparar o próximo ano letivo.`;
      }

      setStatus({
        currentYear,
        daysUntilEnd,
        isExpired,
        isExpiringSoon,
        alertType,
        alertMessage,
        loading: false,
      });
    } catch (error) {
      console.error('Erro ao verificar status do ano letivo:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  }

  return status;
}
