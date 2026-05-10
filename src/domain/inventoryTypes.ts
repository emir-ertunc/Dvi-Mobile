import type {
  FieldValueType,
  FormType,
  InventoryControlType,
  OfficialSectionRef,
  PdfButtonStates,
  PdfExportBinding,
  PdfWidgetInstanceBinding,
  ReadinessRuleId,
  RepeatGroupRef,
} from './fieldPrimitives';

export interface InventoryFieldRecord {
  readonly schemaVersion: string;
  readonly canonicalId: string;
  readonly canonicalFieldId: string;
  readonly status: 'mapped';
  readonly formType: FormType;
  readonly pdfFieldName: string;
  readonly officialSection: OfficialSectionRef;
  readonly visibleLabel: string;
  readonly uiLabelTr: string;
  readonly auditClass: 'header' | 'section-checklist' | 'user-field' | 'technical-review';
  readonly visibleLabelCandidates: readonly string[];
  readonly turkishUiLabel: string;
  readonly turkishUiLabelStatus: 'aday-etiket-var' | 'pdf-alan-adindan-turetildi';
  readonly controlType: InventoryControlType;
  readonly valueType: FieldValueType;
  readonly requiredRule: ReadinessRuleId;
  readonly readinessRule: ReadinessRuleId;
  readonly repeatGroup: RepeatGroupRef | null;
  readonly repeated: {
    readonly isRepeated: boolean;
    readonly instanceCount: number;
    readonly pages: readonly number[];
    readonly reason: string | null;
  };
  readonly dependencies: readonly string[];
  readonly choiceGroupId: string | null;
  readonly checkboxButtonStates: readonly PdfButtonStates[];
  readonly exportBinding: PdfExportBinding;
  readonly widgetInstances: readonly PdfWidgetInstanceBinding[];
}

export interface FormInventoryDocument {
  readonly schemaVersion: string;
  readonly phase: string;
  readonly version: string;
  readonly buildId: string;
  readonly formType: FormType;
  readonly formName: string;
  readonly sourceStrategy: 'fillable INTERPOL AcroForm PDF';
  readonly sourceManifest: string;
  readonly totals: {
    readonly fieldCount: number;
    readonly widgetInstanceCount: number;
    readonly pageCount: number;
    readonly checkboxFieldCount: number;
    readonly textFieldCount: number;
    readonly repeatedFieldCount: number;
    readonly duplicateFieldNameCount: number;
    readonly ignoredWidgetCount: number;
    readonly needsReviewWidgetCount: number;
    readonly unaccountedWidgetCount: number;
  };
  readonly sections: ReadonlyArray<{
    readonly sectionId: string;
    readonly title: string;
    readonly fieldCount: number;
    readonly widgetCount: number;
  }>;
  readonly ignoredWidgets: readonly unknown[];
  readonly fields: readonly InventoryFieldRecord[];
}
