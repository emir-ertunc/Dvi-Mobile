import type {
  CanonicalFieldPrimitive,
  FieldPrimitiveKind,
  FieldValueType,
  FormType,
  PdfExportBinding,
  PdfWidgetInstanceBinding,
  ReadinessRuleId,
} from './fieldPrimitives';
import type { SchemaValue, ValidationRuleId } from './validation';

export interface CanonicalSchemaField extends CanonicalFieldPrimitive {
  readonly schemaFieldId: string;
  readonly primitiveKind: FieldPrimitiveKind;
  readonly valueType: FieldValueType;
  readonly defaultValue: SchemaValue;
  readonly validationRules: readonly ValidationRuleId[];
  readonly readinessRule: ReadinessRuleId;
  readonly exportBinding: PdfExportBinding;
  readonly widgetInstances: readonly PdfWidgetInstanceBinding[];
}

export interface CanonicalSchemaDocument {
  readonly schemaVersion: string;
  readonly phase: string;
  readonly version: string;
  readonly buildId: string;
  readonly formType: FormType;
  readonly sourceInventory: string;
  readonly totals: {
    readonly fieldCount: number;
    readonly widgetInstanceCount: number;
    readonly requiredFieldCount: number;
    readonly optionalFieldCount: number;
    readonly primitiveCounts: Readonly<Record<string, number>>;
    readonly valueTypeCounts: Readonly<Record<string, number>>;
  };
  readonly fields: readonly CanonicalSchemaField[];
}
