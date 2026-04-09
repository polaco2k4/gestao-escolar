import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import matriculasRoutes from './modules/matriculas/matriculas.routes';
import studentsRoutes from './modules/students/students.routes';
import classesRoutes from './modules/classes/classes.routes';
import academicYearsRoutes from './modules/academicYears/academicYears.routes';
import avaliacoesRoutes from './modules/avaliacoes/avaliacoes.routes';
import horariosRoutes from './modules/horarios/horarios.routes';
import financeiroRoutes from './modules/financeiro/financeiro.routes';
import comunicacaoRoutes from './modules/comunicacao/comunicacao.routes';
import assiduidadeRoutes from './modules/assiduidade/assiduidade.routes';
import documentosRoutes from './modules/documentos/documentos.routes';
import relatoriosRoutes from './modules/relatorios/relatorios.routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use(globalLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/matriculas', matriculasRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/academic-years', academicYearsRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/comunicacao', comunicacaoRoutes);
app.use('/api/assiduidade', assiduidadeRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
