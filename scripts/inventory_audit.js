const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const AUDIT_VERSION = '0.1.3';
const PHASE = 'Phase 1D';
const BUILD_ID = 'phase-1d-v0.1.3-20260510';

const DEFINITIONS = [
  {
    formType: 'AM',
    path: join('data', 'form-inventory', 'am-field-inventory.json'),
    inventoryVersion: '0.1.1',
    expectedPages: 18,
    expectedSource: {
      pageCount: 18,
      imageBased: true,
      hasTextLayer: false,
      hasAcroForm: false,
    },
    requiredPageCodes: [
      'A0',
      'A1',
      'A2',
      'C1',
      'C2',
      'C3',
      'D1',
      'D2',
      'D3',
      'D4',
      'E1',
      'E2',
      'E4',
      'F1',
      'F2',
      'G',
      'Silüet Taslağı',
      'Kimlik tespit onayı',
    ],
    requiredCommonBlocks: ['missingPersonHeader', 'abcEvidenceStatus', 'collectorFooter'],
    requiredTypes: ['date', 'number', 'contact', 'phone', 'signature', 'drawingLayer', 'odontogram'],
    requiredCanonicalIds: [
      'am.header.familyName',
      'am.a0.collectedEvidenceChecklist',
      'am.d4.diagramAnnotations',
      'am.e4.dna.profiles',
      'am.f2.dentalChart.primaryOrPermanent',
      'am.certificate.identificationOfficer.signature',
    ],
    minimums: {
      fields: 220,
      options: 300,
      tables: 15,
      canonicalIds: 120,
    },
  },
  {
    formType: 'PM',
    path: join('data', 'form-inventory', 'pm-field-inventory.json'),
    inventoryVersion: '0.1.2',
    expectedPages: 16,
    expectedSource: {
      pageCount: 16,
      imageBased: true,
      hasTextLayer: false,
      hasAcroForm: false,
    },
    requiredPageCodes: ['B0', 'B', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'E3', 'E4', 'F1', 'F2', 'G'],
    requiredCommonBlocks: [
      'bodyHeader',
      'abcEvidenceStatus',
      'abcdInternalExamStatus',
      'cOnlyEvidenceStatus',
      'approverFooter',
    ],
    requiredTypes: ['date', 'number', 'contact', 'phone', 'signature', 'drawingLayer', 'odontogram'],
    requiredCanonicalIds: [
      'pm.header.bodyNumber',
      'pm.b0.morgOperations',
      'pm.d4.diagramMarks',
      'pm.e1.internalFindings',
      'pm.e4.dnaProfile',
      'pm.f2.dentalChart.permanentTeeth',
      'pm.g.otherInformation',
    ],
    minimums: {
      fields: 150,
      options: 320,
      tables: 20,
      canonicalIds: 95,
    },
    requiresDerivedAcroFormMasterPolicy: true,
  },
];

const OUTPUT_JSON = join('data', 'form-inventory', 'inventory-audit.json');
const OUTPUT_MD = join('docs', 'form-forensics', 'phase-1d-inventory-audit.md');

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function addFailure(ctx, message) {
  ctx.failures.push(message);
}

function createContext(definition, inventory) {
  return {
    definition,
    inventory,
    failures: [],
    canonicalIds: new Set(),
    typeCounts: new Map(),
    fieldCount: 0,
    optionCount: 0,
    tableCount: 0,
    relativeFieldCount: 0,
    commonChoiceOptionCount: 0,
    sectionCount: 0,
  };
}

function incrementType(ctx, type) {
  if (!type) {
    return;
  }
  ctx.typeCounts.set(type, (ctx.typeCounts.get(type) || 0) + 1);
}

function hasType(ctx, type) {
  if (ctx.typeCounts.has(type)) {
    return true;
  }
  if (type === 'date') {
    return Array.from(ctx.typeCounts.keys()).some((key) => key.includes('date') || key === 'placeDate');
  }
  if (type === 'number') {
    return Array.from(ctx.typeCounts.keys()).some((key) => key.includes('number'));
  }
  if (type === 'phone') {
    return ctx.typeCounts.has('contact');
  }
  if (type === 'signature') {
    return Array.from(ctx.typeCounts.keys()).some((key) => key.includes('signature'));
  }
  return false;
}

function validateCanonicalId(ctx, id, context) {
  const expectedPrefix = `${ctx.definition.formType.toLowerCase()}.`;
  if (!id.startsWith(expectedPrefix)) {
    addFailure(ctx, `${context}: canonicalFieldId ${expectedPrefix} ile başlamıyor: ${id}`);
  }
  if (!/^[a-z][a-z0-9]*(\.[A-Za-z0-9_]+)+$/.test(id)) {
    addFailure(ctx, `${context}: canonicalFieldId biçimi hatalı: ${id}`);
  }
  if (ctx.canonicalIds.has(id)) {
    addFailure(ctx, `${context}: tekrarlanan canonicalFieldId: ${id}`);
  }
  ctx.canonicalIds.add(id);
}

function validateOptions(ctx, options, context) {
  if (!Array.isArray(options)) {
    return;
  }
  const seen = new Set();
  options.forEach((option, index) => {
    const optionContext = `${context}.options[${index}]`;
    if (!option || typeof option !== 'object') {
      addFailure(ctx, `${optionContext}: option nesnesi değil`);
      return;
    }
    if (!option.optionId || !option.label) {
      addFailure(ctx, `${optionContext}: optionId/label eksik`);
    }
    if (option.optionId && !/^[A-Za-z0-9_]+$/.test(option.optionId)) {
      addFailure(ctx, `${optionContext}: optionId biçimi hatalı`);
    }
    if (seen.has(option.optionId)) {
      addFailure(ctx, `${optionContext}: tekrarlanan optionId: ${option.optionId}`);
    }
    seen.add(option.optionId);
  });
  ctx.optionCount += options.length;
}

function validateField(ctx, field, context, relativeAllowed = true) {
  if (!field || typeof field !== 'object') {
    addFailure(ctx, `${context}: alan nesnesi değil`);
    return;
  }

  const id = field.canonicalFieldId || field.fieldId;
  if (!id) {
    addFailure(ctx, `${context}: alan kimliği eksik`);
  }
  if (field.canonicalFieldId) {
    validateCanonicalId(ctx, field.canonicalFieldId, context);
  } else if (field.fieldId) {
    ctx.relativeFieldCount += 1;
    if (!relativeAllowed) {
      addFailure(ctx, `${context}: relative fieldId bu bağlamda izinli değil`);
    }
    if (!/^[A-Za-z0-9_.]+$/.test(field.fieldId)) {
      addFailure(ctx, `${context}: fieldId biçimi hatalı: ${field.fieldId}`);
    }
  }

  if (!field.label) {
    addFailure(ctx, `${context}: alan etiketi eksik`);
  }
  if (!field.type && !Array.isArray(field.options)) {
    addFailure(ctx, `${context}: alan tipi eksik`);
  }

  ctx.fieldCount += 1;
  incrementType(ctx, field.type);
  validateOptions(ctx, field.options, context);

  (field.fields || []).forEach((nested, index) => validateField(ctx, nested, `${context}.fields[${index}]`));
  (field.subfields || []).forEach((nested, index) => validateField(ctx, nested, `${context}.subfields[${index}]`));
  if (field.otherField) {
    validateField(ctx, field.otherField, `${context}.otherField`);
  }
  if (field.specialOption) {
    validateField(ctx, field.specialOption, `${context}.specialOption`);
  }
}

function validateTable(ctx, table, context) {
  if (!table || typeof table !== 'object') {
    addFailure(ctx, `${context}: tablo nesnesi değil`);
    return;
  }

  ctx.tableCount += 1;
  incrementType(ctx, table.type);

  if (!table.canonicalFieldId) {
    addFailure(ctx, `${context}: tablo canonicalFieldId eksik`);
  } else {
    validateCanonicalId(ctx, table.canonicalFieldId, context);
  }
  if (!table.type) {
    addFailure(ctx, `${context}: tablo tipi eksik`);
  }
  if (!table.label) {
    addFailure(ctx, `${context}: tablo etiketi eksik`);
  }

  const hasRows =
    Array.isArray(table.rowDefinitions) ||
    Array.isArray(table.rowDefinitionGroups) ||
    Array.isArray(table.teeth) ||
    Array.isArray(table.fields);
  if (!hasRows && !['choiceGroupCollection', 'multiCheckbox'].includes(table.type)) {
    addFailure(ctx, `${context}: tablo satır/alan yapısı eksik`);
  }

  (table.columns || []).forEach((column, index) => {
    if (!column.columnId || !column.label || !column.type) {
      addFailure(ctx, `${context}.columns[${index}]: tablo sütun tanımı eksik`);
    }
    incrementType(ctx, column.type);
  });

  (table.rowDefinitions || []).forEach((row, index) => {
    if (row && typeof row === 'object') {
      validateOptions(ctx, row.options, `${context}.rowDefinitions[${index}]`);
      (row.fields || []).forEach((field, fieldIndex) =>
        validateField(ctx, field, `${context}.rowDefinitions[${index}].fields[${fieldIndex}]`),
      );
    }
  });

  (table.fields || []).forEach((field, index) => validateField(ctx, field, `${context}.fields[${index}]`));
  (table.embeddedChoices || []).forEach((field, index) =>
    validateField(ctx, field, `${context}.embeddedChoices[${index}]`),
  );
  (table.perToothFields || []).forEach((field, index) =>
    validateField(ctx, field, `${context}.perToothFields[${index}]`),
  );
  if (table.specialOption) {
    validateField(ctx, table.specialOption, `${context}.specialOption`);
  }
  (table.legend || []).forEach((marker, index) => {
    if (!marker.markerId || !marker.label || !marker.type) {
      addFailure(ctx, `${context}.legend[${index}]: diyagram işaret tanımı eksik`);
    }
  });
}

function validateCommonBlocks(ctx) {
  const blocks = ctx.inventory.commonBlocks || {};
  for (const blockId of ctx.definition.requiredCommonBlocks) {
    if (!blocks[blockId]) {
      addFailure(ctx, `commonBlocks.${blockId}: ortak blok eksik`);
    }
  }

  for (const [blockId, block] of Object.entries(blocks)) {
    if (!Array.isArray(block.appliesToPages) || block.appliesToPages.length === 0) {
      addFailure(ctx, `commonBlocks.${blockId}: appliesToPages eksik`);
    }
    (block.appliesToPages || []).forEach((pageNumber) => {
      if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > ctx.definition.expectedPages) {
        addFailure(ctx, `commonBlocks.${blockId}: geçersiz sayfa referansı ${pageNumber}`);
      }
    });
    (block.fields || []).forEach((field, index) =>
      validateField(ctx, field, `commonBlocks.${blockId}.fields[${index}]`, false),
    );
    if (Array.isArray(block.columns)) {
      if (!block.canonicalFieldId) {
        addFailure(ctx, `commonBlocks.${blockId}: ortak seçim bloğu canonicalFieldId eksik`);
      } else {
        validateCanonicalId(ctx, block.canonicalFieldId, `commonBlocks.${blockId}`);
      }
      if (!block.runtimeFieldIdPattern) {
        addFailure(ctx, `commonBlocks.${blockId}: runtime alan kimliği kalıbı eksik`);
      }
      const seen = new Set();
      block.columns.forEach((column, index) => {
        if (!column.optionId || !column.label || column.type !== 'checkbox') {
          addFailure(ctx, `commonBlocks.${blockId}.columns[${index}]: ortak seçim tanımı eksik`);
        }
        if (seen.has(column.optionId)) {
          addFailure(ctx, `commonBlocks.${blockId}.columns[${index}]: tekrarlanan optionId`);
        }
        seen.add(column.optionId);
      });
      const expandedCount = block.columns.length * block.appliesToPages.length;
      ctx.commonChoiceOptionCount += expandedCount;
      ctx.optionCount += expandedCount;
    }
  }
}

function verifyInventory(definition) {
  const inventory = loadJson(definition.path);
  const ctx = createContext(definition, inventory);

  if (inventory.formType !== definition.formType) {
    addFailure(ctx, `formType ${definition.formType} değil`);
  }
  if (inventory.inventoryVersion !== definition.inventoryVersion) {
    addFailure(ctx, `inventoryVersion ${definition.inventoryVersion} değil`);
  }
  if (!inventory.formName) {
    addFailure(ctx, 'formName eksik');
  }
  if (!inventory.sourcePdf?.sha256) {
    addFailure(ctx, 'sourcePdf.sha256 eksik');
  }
  for (const [key, value] of Object.entries(definition.expectedSource)) {
    if (inventory.sourcePdf?.[key] !== value) {
      addFailure(ctx, `sourcePdf.${key} beklenen değerle eşleşmiyor`);
    }
  }
  if (!inventory.fieldModelPolicy?.canonicalFieldIdStable) {
    addFailure(ctx, 'Kalıcı canonicalFieldId politikası işaretlenmemiş');
  }
  if (!inventory.fieldModelPolicy?.pdfTechnologyIndependent) {
    addFailure(ctx, 'PDF teknolojisinden bağımsız model politikası işaretlenmemiş');
  }
  if (!inventory.fieldModelPolicy?.choicePolicy || !inventory.fieldModelPolicy?.tablePolicy) {
    addFailure(ctx, 'choice/table politikası eksik');
  }
  if (!inventory.fieldModelPolicy?.relativeFieldIdPolicy) {
    addFailure(ctx, 'relative fieldId politikası eksik');
  }
  if (definition.requiresDerivedAcroFormMasterPolicy && !inventory.fieldModelPolicy?.derivedAcroFormMasterAllowed) {
    addFailure(ctx, 'türetilmiş doldurulabilir şablon politikası eksik');
  }

  const pages = inventory.pages || [];
  if (!Array.isArray(pages) || pages.length !== definition.expectedPages) {
    addFailure(ctx, `${definition.expectedPages} sayfa beklenirken ${pages.length} sayfa bulundu`);
  }

  const pageNumbers = new Set();
  const pageCodes = new Set();
  pages.forEach((page, index) => {
    if (page.pageNumber !== index + 1) {
      addFailure(ctx, `pages[${index}]: sayfa sırası hatalı`);
    }
    if (pageNumbers.has(page.pageNumber)) {
      addFailure(ctx, `pages[${index}]: tekrarlanan pageNumber ${page.pageNumber}`);
    }
    pageNumbers.add(page.pageNumber);
    if (pageCodes.has(page.officialCode)) {
      addFailure(ctx, `pages[${index}]: tekrarlanan officialCode ${page.officialCode}`);
    }
    pageCodes.add(page.officialCode);
    if (!page.title) {
      addFailure(ctx, `pages[${index}]: title eksik`);
    }
    if (!Array.isArray(page.sections) || page.sections.length === 0) {
      addFailure(ctx, `pages[${index}]: sections eksik`);
    }
    ctx.sectionCount += (page.sections || []).length;
    (page.sections || []).forEach((section, sectionIndex) => {
      if (!section.sectionId || !section.label) {
        addFailure(ctx, `pages[${page.pageNumber}].sections[${sectionIndex}]: sectionId/label eksik`);
      }
      const fields = section.fields || [];
      const tables = section.tables || [];
      const fieldsAfterTables = section.fieldsAfterTables || [];
      if (fields.length + tables.length + fieldsAfterTables.length === 0) {
        addFailure(ctx, `pages[${page.pageNumber}].sections[${sectionIndex}]: alan/tablo yok`);
      }
      fields.forEach((field, fieldIndex) =>
        validateField(ctx, field, `pages[${page.pageNumber}].sections[${sectionIndex}].fields[${fieldIndex}]`),
      );
      tables.forEach((table, tableIndex) =>
        validateTable(ctx, table, `pages[${page.pageNumber}].sections[${sectionIndex}].tables[${tableIndex}]`),
      );
      fieldsAfterTables.forEach((field, fieldIndex) =>
        validateField(
          ctx,
          field,
          `pages[${page.pageNumber}].sections[${sectionIndex}].fieldsAfterTables[${fieldIndex}]`,
        ),
      );
    });
  });

  let requiredPageCodesCovered = 0;
  definition.requiredPageCodes.forEach((code) => {
    if (!pageCodes.has(code)) {
      addFailure(ctx, `Sayfa kodu eksik: ${code}`);
    } else {
      requiredPageCodesCovered += 1;
    }
  });

  validateCommonBlocks(ctx);

  definition.requiredCanonicalIds.forEach((id) => {
    if (!ctx.canonicalIds.has(id)) {
      addFailure(ctx, `Kritik canonicalFieldId eksik: ${id}`);
    }
  });

  definition.requiredTypes.forEach((type) => {
    if (!hasType(ctx, type)) {
      addFailure(ctx, `Gerekli alan tipi yok: ${type}`);
    }
  });

  for (const [metric, minimum] of Object.entries(definition.minimums)) {
    const actual =
      metric === 'fields'
        ? ctx.fieldCount
        : metric === 'options'
          ? ctx.optionCount
          : metric === 'tables'
            ? ctx.tableCount
            : ctx.canonicalIds.size;
    if (actual < minimum) {
      addFailure(ctx, `${metric} sayısı beklenenden düşük: ${actual} < ${minimum}`);
    }
  }

  return {
    formType: definition.formType,
    inventoryVersion: inventory.inventoryVersion,
    pageCount: pages.length,
    sectionCount: ctx.sectionCount,
    fieldCount: ctx.fieldCount,
    canonicalFieldIdCount: ctx.canonicalIds.size,
    relativeFieldIdCount: ctx.relativeFieldCount,
    optionCount: ctx.optionCount,
    commonChoiceOptionCount: ctx.commonChoiceOptionCount,
    tableCount: ctx.tableCount,
    typeCounts: Object.fromEntries([...ctx.typeCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
    requiredPageCodesCovered,
    failures: ctx.failures,
  };
}

function buildAudit() {
  const forms = DEFINITIONS.map(verifyInventory);
  return {
    auditVersion: AUDIT_VERSION,
    phase: PHASE,
    buildId: BUILD_ID,
    generatedAt: '2026-05-10',
    forms,
    failures: forms.flatMap((form) => form.failures.map((failure) => `${form.formType}: ${failure}`)),
  };
}

function renderMarkdown(audit) {
  const lines = [
    '# Phase 1D Envanter Denetim Raporu',
    '',
    `Faz: ${audit.phase}`,
    `Denetim sürümü: ${audit.auditVersion}`,
    `Build kimliği: ${audit.buildId}`,
    '',
    '| Form | Sayfa | Bölüm | Alan | Kalıcı alan kimliği | Relative alan | Seçenek | Tablo | Durum |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ];

  audit.forms.forEach((form) => {
    lines.push(
      `| ${form.formType} | ${form.pageCount} | ${form.sectionCount} | ${form.fieldCount} | ${form.canonicalFieldIdCount} | ${form.relativeFieldIdCount} | ${form.optionCount} | ${form.tableCount} | ${
        form.failures.length === 0 ? 'Geçti' : 'Hata var'
      } |`,
    );
  });

  lines.push('', '## Zorunlu Kontroller', '');
  lines.push('- AM ve PM sayfa kodları eksiksiz ve sıralı olmalıdır.');
  lines.push('- Her kalıcı alan `canonicalFieldId` taşımalı ve form önekiyle başlamalıdır.');
  lines.push('- Tekrar eden tablo, diş şeması ve alt blok içi alanlarda `fieldId` yalnızca relative kimlik olarak kullanılabilir.');
  lines.push('- Her checkbox/radio seçeneği `optionId` ve `label` taşımalıdır.');
  lines.push('- Ortak header/footer ve kanıt durumu blokları sayfa kapsamı ve runtime kimlik kalıbı taşımalıdır.');
  lines.push('- Diyagram, odontogram, imza, tarih, sayı, telefon/iletişim ve tablo tipleri envanterde temsil edilmelidir.');
  lines.push('- Türetilmiş doldurulabilir PDF şablonu yalnızca dışa aktarım katmanı varlığıdır; resmi kaynak değildir.');

  if (audit.failures.length > 0) {
    lines.push('', '## Hatalar', '');
    audit.failures.forEach((failure) => lines.push(`- ${failure}`));
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function writeOutputs(audit) {
  mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
  mkdirSync(dirname(OUTPUT_MD), { recursive: true });
  writeFileSync(OUTPUT_JSON, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  writeFileSync(OUTPUT_MD, renderMarkdown(audit), 'utf8');
}

function main() {
  const shouldWrite = process.argv.includes('--write');
  const audit = buildAudit();
  if (shouldWrite) {
    writeOutputs(audit);
  }

  if (audit.failures.length > 0) {
    console.error(audit.failures.join('\n'));
    process.exit(1);
  }

  console.log(
    audit.forms
      .map(
        (form) =>
          `${form.formType} envanter denetimi geçti. Sayfa=${form.pageCount}, alan=${form.fieldCount}, kalıcıKimlik=${form.canonicalFieldIdCount}, seçenek=${form.optionCount}, tablo=${form.tableCount}`,
      )
      .join('\n'),
  );
}

if (require.main === module) {
  main();
}

module.exports = { buildAudit, renderMarkdown };
