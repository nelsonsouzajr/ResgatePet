/**
 * middlewares/validate.ts
 * Regras de validação usando express-validator para cada endpoint.
 * Centralizar as regras aqui evita duplicação nos controllers.
 */

import { body } from 'express-validator';

/** Validação do registro de usuário */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório.')
    .isLength({ max: 150 }).withMessage('Nome deve ter no máximo 150 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('E-mail é obrigatório.')
    .isEmail().withMessage('E-mail inválido.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória.')
    .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('pt-BR').withMessage('Telefone inválido.'),

  body('role')
    .optional()
    .isIn(['admin', 'volunteer', 'veterinarian'])
    .withMessage('Role inválida. Use: admin, volunteer ou veterinarian.'),
];

/** Validação do login */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('E-mail é obrigatório.')
    .isEmail().withMessage('E-mail inválido.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória.'),
];

/** Validação de criação de ocorrência */
export const validateCreateCase = [
  body('animal.species')
    .notEmpty().withMessage('Espécie do animal é obrigatória.')
    .isIn(['dog', 'cat', 'bird', 'other'])
    .withMessage('Espécie inválida. Use: dog, cat, bird ou other.'),

  body('animal.gender')
    .optional()
    .isIn(['male', 'female', 'unknown'])
    .withMessage('Gênero inválido. Use: male, female ou unknown.'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Prioridade inválida. Use: low, medium, high ou critical.'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número entre -90 e 90.'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número entre -180 e 180.'),
];

/** Validação de atualização de status */
export const validateUpdateStatus = [
  body('status')
    .notEmpty().withMessage('Status é obrigatório.')
    .isIn([
      'reported',
      'awaiting_rescue',
      'in_rescue',
      'under_treatment',
      'resolved',
    ])
    .withMessage(
      'Status inválido. Use: reported, awaiting_rescue, in_rescue, under_treatment ou resolved.'
    ),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Observações devem ter no máximo 2000 caracteres.'),
];

/** Validação de criação de organização */
export const validateCreateOrg = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome da organização é obrigatório.')
    .isLength({ max: 150 }).withMessage('Nome deve ter no máximo 150 caracteres.'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter exatamente 2 caracteres (UF).'),
];
