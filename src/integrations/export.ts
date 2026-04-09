import logger from '../utils/logger';

export class ExportService {
  async generatePDF(data: any, filename: string): Promise<string> {
    logger.info(`Gerando PDF: ${filename}`);
    return `/exports/${filename}`;
  }

  async generateExcel(data: any[], filename: string): Promise<string> {
    logger.info(`Gerando Excel: ${filename}`);
    return `/exports/${filename}`;
  }
}

export default new ExportService();
