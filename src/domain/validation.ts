import type { FieldValueType, ReadinessRuleId } from './fieldPrimitives';

export type ValidationRuleId =
  | 'optional'
  | 'required'
  | 'string'
  | 'boolean'
  | 'number'
  | 'email'
  | 'phone'
  | 'datePart.day'
  | 'datePart.month'
  | 'datePart.year';

export type SchemaValue = string | boolean | number | null;

export interface ValidationIssue {
  readonly code: string;
  readonly messageTr: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

export interface FieldValidationContext {
  readonly valueType: FieldValueType;
  readonly readinessRule: ReadinessRuleId;
  readonly validationRules: readonly ValidationRuleId[];
}

function isBlank(value: SchemaValue): boolean {
  return value === null || value === '';
}

function ok(): ValidationResult {
  return { valid: true, issues: [] };
}

function fail(code: string, messageTr: string): ValidationResult {
  return { valid: false, issues: [{ code, messageTr }] };
}

function merge(results: ValidationResult[]): ValidationResult {
  const issues = results.flatMap((result) => result.issues);
  return { valid: issues.length === 0, issues };
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value: string): boolean {
  return /^[+()\d\s.-]{6,32}$/.test(value);
}

function validateIntegerRange(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value)) return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max;
}

export function validateSchemaValue(value: SchemaValue, context: FieldValidationContext): ValidationResult {
  const checks: ValidationResult[] = [];
  const required = context.readinessRule === 'readiness.required' || context.validationRules.includes('required');

  if (required && isBlank(value)) {
    checks.push(fail('required', 'Bu alan zorunludur.'));
  }

  if (isBlank(value)) {
    return merge(checks);
  }

  for (const rule of context.validationRules) {
    if (rule === 'optional' || rule === 'required') continue;

    if (rule === 'string' && typeof value !== 'string') {
      checks.push(fail('string', 'Bu alan metin olmalıdır.'));
    }
    if (rule === 'boolean' && typeof value !== 'boolean') {
      checks.push(fail('boolean', 'Bu alan işaretli veya işaretsiz olmalıdır.'));
    }
    if (rule === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
      checks.push(fail('number', 'Bu alan sayı olmalıdır.'));
    }
    if (rule === 'email' && (typeof value !== 'string' || !validateEmail(value))) {
      checks.push(fail('email', 'Geçerli bir e-posta adresi girilmelidir.'));
    }
    if (rule === 'phone' && (typeof value !== 'string' || !validatePhone(value))) {
      checks.push(fail('phone', 'Geçerli bir telefon numarası girilmelidir.'));
    }
    if (rule === 'datePart.day' && (typeof value !== 'string' || !validateIntegerRange(value, 1, 31))) {
      checks.push(fail('datePart.day', 'Gün değeri 1 ile 31 arasında olmalıdır.'));
    }
    if (rule === 'datePart.month' && (typeof value !== 'string' || !validateIntegerRange(value, 1, 12))) {
      checks.push(fail('datePart.month', 'Ay değeri 1 ile 12 arasında olmalıdır.'));
    }
    if (rule === 'datePart.year' && (typeof value !== 'string' || !validateIntegerRange(value, 1800, 2200))) {
      checks.push(fail('datePart.year', 'Yıl değeri dört haneli ve makul aralıkta olmalıdır.'));
    }
  }

  return checks.length > 0 ? merge(checks) : ok();
}
