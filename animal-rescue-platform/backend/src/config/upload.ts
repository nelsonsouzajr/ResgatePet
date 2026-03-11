/**
 * config/upload.ts
 * Configuração do Multer para upload de imagens.
 * Armazena os arquivos localmente em /uploads/cases/:caseId/
 * com nome único baseado em timestamp + número aleatório.
 *
 * Validações:
 *  - apenas imagens (jpeg, png, webp)
 *  - tamanho máximo definido pela variável MAX_FILE_SIZE_MB
 *  - máximo de 5 arquivos por requisição
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { env } from './env';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/** Armazenamento em disco com estrutura de pastas por caso */
const storage = multer.diskStorage({
  destination(req: Request, _file, cb) {
    // O caseId pode vir como parâmetro de rota (:id) ou como campo do body
    const caseId = req.params.id ?? 'tmp';
    const dir = path.join(process.cwd(), env.UPLOAD_DIR, 'cases', caseId);

    // Cria o diretório recursivamente se não existir
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename(_req, file, cb) {
    // Nome único: timestamp + 4 dígitos aleatórios + extensão original
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}${ext}`;
    cb(null, unique);
  },
});

/** Filtro por tipo MIME */
function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.'));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // converte MB para bytes
    files: 5,                                      // máximo de arquivos por req
  },
});
