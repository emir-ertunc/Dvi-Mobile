export type FormType = 'AM' | 'PM';

export type FieldPrimitiveKind =
  | 'text'
  | 'multilineText'
  | 'datePart'
  | 'date'
  | 'number'
  | 'decimal'
  | 'phone'
  | 'email'
  | 'checkbox'
  | 'singleChoice'
  | 'multiChoice'
  | 'tableRow'
  | 'repeatedGroup'
  | 'signatureBlock'
  | 'attachmentReference'
  | 'bodyChartReference'
  | 'dentalChartReference';

export type FieldValueType =
  | 'string'
  | 'boolean'
  | 'datePart'
  | 'date'
  | 'number'
  | 'decimal'
  | 'phone'
  | 'email'
  | 'enum'
  | 'enumArray'
  | 'object'
  | 'objectArray'
  | 'attachment'
  | 'chartReference';

export type InventoryControlType = 'text' | 'date-part' | 'number' | 'email' | 'phone' | 'checkbox';

export type ReadinessRuleId = 'readiness.optional' | 'readiness.required' | `readiness.${string}`;

export interface Rect {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export interface PdfButtonStates {
  readonly normal: readonly string[];
  readonly down?: readonly string[];
}

export interface PdfWidgetInstanceBinding {
  readonly formType: FormType;
  readonly pageNumber: number;
  readonly pageWidgetIndex: number;
  readonly instanceKey: string;
  readonly fieldName: string;
  readonly fieldType: 'Text' | 'CheckBox' | string;
  readonly fieldTypeCode: number;
  readonly rect: readonly [number, number, number, number];
  readonly fieldFlags: number;
  readonly buttonStates: PdfButtonStates | null;
}

export interface PdfExportBinding {
  readonly strategy: 'acroformFieldNames';
  readonly fieldName: string;
  readonly widgetInstanceCount: number;
}

export interface OfficialSectionRef {
  readonly id: string;
  readonly title: string;
  readonly from?: number;
  readonly to?: number;
}

export interface RepeatGroupRef {
  readonly instanceCount: number;
  readonly pages: readonly number[];
  readonly reason: string | null;
}

export interface CanonicalFieldPrimitive {
  readonly canonicalId: string;
  readonly canonicalFieldId: string;
  readonly formType: FormType;
  readonly pdfFieldName: string;
  readonly officialSection: OfficialSectionRef;
  readonly visibleLabel: string;
  readonly uiLabelTr: string;
  readonly controlType: InventoryControlType;
  readonly primitiveKind: FieldPrimitiveKind;
  readonly valueType: FieldValueType;
  readonly readinessRule: ReadinessRuleId;
  readonly repeatGroup: RepeatGroupRef | null;
  readonly dependencies: readonly string[];
  readonly exportBinding: PdfExportBinding;
  readonly widgetInstances: readonly PdfWidgetInstanceBinding[];
}

export const INVENTORY_CONTROL_TO_PRIMITIVE: Record<InventoryControlType, FieldPrimitiveKind> = {
  checkbox: 'checkbox',
  'date-part': 'datePart',
  email: 'email',
  number: 'number',
  phone: 'phone',
  text: 'text',
} as const;

export const PRIMITIVE_VALUE_TYPES: Record<FieldPrimitiveKind, readonly FieldValueType[]> = {
  attachmentReference: ['attachment'],
  bodyChartReference: ['chartReference'],
  checkbox: ['boolean'],
  date: ['date'],
  datePart: ['datePart'],
  decimal: ['decimal'],
  dentalChartReference: ['chartReference'],
  email: ['email'],
  multiChoice: ['enumArray'],
  multilineText: ['string'],
  number: ['number'],
  phone: ['phone'],
  repeatedGroup: ['objectArray'],
  signatureBlock: ['object'],
  singleChoice: ['enum'],
  tableRow: ['object'],
  text: ['string'],
} as const;

export function primitiveForControl(controlType: InventoryControlType): FieldPrimitiveKind {
  return INVENTORY_CONTROL_TO_PRIMITIVE[controlType];
}

export function isValueTypeAllowed(primitiveKind: FieldPrimitiveKind, valueType: FieldValueType): boolean {
  return PRIMITIVE_VALUE_TYPES[primitiveKind].includes(valueType);
}
