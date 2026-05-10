const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const INVENTORIES = [
  {
    formType: 'AM',
    path: join('data', 'form-inventory', 'am-field-inventory.json'),
    inventoryVersion: '0.1.1',
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
    expectedPages: 18,
    minimumFields: 180,
    minimumOptions: 180,
    minimumTables: 15,
  },
  {
    formType: 'PM',
    path: join('data', 'form-inventory', 'pm-field-inventory.json'),
    inventoryVersion: '0.1.2',
    requiredPageCodes: ['B0', 'B', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'E3', 'E4', 'F1', 'F2', 'G'],
    expectedPages: 16,
    minimumFields: 150,
    minimumOptions: 240,
    minimumTables: 15,
    requiresDerivedAcroFormMasterPolicy: true,
  },
];

function createContext(definition) {
  return {
    definition,
    failures: [],
    ids: new Set(),
    fieldCount: 0,
    optionCount: 0,
    tableCount: 0,
  };
}

function registerOptions(ctx, options, context) {
  if (!Array.isArray(options)) {
    return;
  }
  options.forEach((option, index) => {
    if (!option || typeof option !== 'object' || !option.optionId || !option.label) {
      ctx.failures.push(`${context}.options[${index}]: optionId/label eksik`);
    }
  });
  ctx.optionCount += options.length;
}

function registerField(ctx, field, context) {
  if (!field || typeof field !== 'object') {
    return;
  }

  const id = field.canonicalFieldId || field.fieldId;
  if (field.canonicalFieldId) {
    if (ctx.ids.has(field.canonicalFieldId)) {
      ctx.failures.push(`Tekrarlanan canonicalFieldId: ${field.canonicalFieldId}`);
    }
    ctx.ids.add(field.canonicalFieldId);
  }

  if (!id) {
    ctx.failures.push(`${context}: alan kimliği eksik`);
  }
  if (!field.label) {
    ctx.failures.push(`${context}: alan etiketi eksik`);
  }
  if (!field.type && !Array.isArray(field.options)) {
    ctx.failures.push(`${context}: alan tipi eksik`);
  }

  ctx.fieldCount += 1;
  registerOptions(ctx, field.options, context);

  (field.fields || []).forEach((nested, index) => registerField(ctx, nested, `${context}.fields[${index}]`));
  (field.subfields || []).forEach((nested, index) => registerField(ctx, nested, `${context}.subfields[${index}]`));
  if (field.otherField) {
    registerField(ctx, field.otherField, `${context}.otherField`);
  }
  if (field.specialOption) {
    registerField(ctx, field.specialOption, `${context}.specialOption`);
  }
}

function registerTable(ctx, table, context) {
  ctx.tableCount += 1;
  if (!table.canonicalFieldId) {
    ctx.failures.push(`${context}: tablo canonicalFieldId eksik`);
  } else if (ctx.ids.has(table.canonicalFieldId)) {
    ctx.failures.push(`Tekrarlanan canonicalFieldId: ${table.canonicalFieldId}`);
  } else {
    ctx.ids.add(table.canonicalFieldId);
  }
  if (!table.type) {
    ctx.failures.push(`${context}: tablo tipi eksik`);
  }
  if (!table.label) {
    ctx.failures.push(`${context}: tablo etiketi eksik`);
  }

  (table.columns || []).forEach((column, index) => {
    if (!column.columnId || !column.label || !column.type) {
      ctx.failures.push(`${context}.columns[${index}]: tablo sütun tanımı eksik`);
    }
  });

  (table.rowDefinitions || []).forEach((row, index) => {
    if (row && typeof row === 'object') {
      registerOptions(ctx, row.options, `${context}.rowDefinitions[${index}]`);
      (row.fields || []).forEach((field, fieldIndex) =>
        registerField(ctx, field, `${context}.rowDefinitions[${index}].fields[${fieldIndex}]`),
      );
    }
  });

  (table.fields || []).forEach((field, index) => registerField(ctx, field, `${context}.fields[${index}]`));
  (table.embeddedChoices || []).forEach((field, index) =>
    registerField(ctx, field, `${context}.embeddedChoices[${index}]`),
  );
  (table.perToothFields || []).forEach((field, index) =>
    registerField(ctx, field, `${context}.perToothFields[${index}]`),
  );
  if (table.specialOption) {
    registerField(ctx, table.specialOption, `${context}.specialOption`);
  }
  (table.legend || []).forEach((marker, index) => {
    if (!marker.markerId || !marker.label || !marker.type) {
      ctx.failures.push(`${context}.legend[${index}]: diyagram işaret tanımı eksik`);
    }
  });
}

function registerCommonChoiceBlock(ctx, block, context) {
  if (!block.canonicalFieldId) {
    ctx.failures.push(`${context}: ortak seçim bloğu canonicalFieldId eksik`);
  } else if (ctx.ids.has(block.canonicalFieldId)) {
    ctx.failures.push(`Tekrarlanan canonicalFieldId: ${block.canonicalFieldId}`);
  } else {
    ctx.ids.add(block.canonicalFieldId);
  }
  if (!block.runtimeFieldIdPattern) {
    ctx.failures.push(`${context}: runtime alan kimliği kalıbı eksik`);
  }
  (block.columns || []).forEach((column, index) => {
    if (!column.optionId || !column.label || column.type !== 'checkbox') {
      ctx.failures.push(`${context}.columns[${index}]: ortak seçim tanımı eksik`);
    }
  });
  ctx.optionCount += (block.columns || []).length * (block.appliesToPages || []).length;
}

function verifyInventory(definition) {
  const inventory = JSON.parse(readFileSync(definition.path, 'utf8'));
  const ctx = createContext(definition);

  if (inventory.formType !== definition.formType) {
    ctx.failures.push(`formType ${definition.formType} değil`);
  }
  if (inventory.inventoryVersion !== definition.inventoryVersion) {
    ctx.failures.push(`inventoryVersion ${definition.inventoryVersion} değil`);
  }
  if (!inventory.fieldModelPolicy?.pdfTechnologyIndependent) {
    ctx.failures.push('PDF teknolojisinden bağımsız model politikası işaretlenmemiş');
  }
  if (!inventory.fieldModelPolicy?.relativeFieldIdPolicy) {
    ctx.failures.push('Relative fieldId politikası eksik');
  }
  if (definition.requiresDerivedAcroFormMasterPolicy && !inventory.fieldModelPolicy?.derivedAcroFormMasterAllowed) {
    ctx.failures.push('Türetilmiş AcroForm master politikası eksik');
  }
  if (!Array.isArray(inventory.pages) || inventory.pages.length !== definition.expectedPages) {
    ctx.failures.push(`${definition.formType} envanteri ${definition.expectedPages} sayfa içermiyor`);
  }

  const pageCodes = new Set((inventory.pages || []).map((page) => page.officialCode));
  for (const code of definition.requiredPageCodes) {
    if (!pageCodes.has(code)) {
      ctx.failures.push(`Sayfa kodu eksik: ${code}`);
    }
  }

  for (const [blockId, block] of Object.entries(inventory.commonBlocks || {})) {
    (block.fields || []).forEach((field, index) =>
      registerField(ctx, field, `commonBlocks.${blockId}.fields[${index}]`),
    );
    if (Array.isArray(block.columns)) {
      registerCommonChoiceBlock(ctx, block, `commonBlocks.${blockId}`);
    }
  }

  (inventory.pages || []).forEach((page) => {
    if (!page.pageNumber || !page.officialCode || !page.title) {
      ctx.failures.push(`Sayfa üst bilgisi eksik: ${JSON.stringify(page)}`);
    }
    (page.sections || []).forEach((section, sectionIndex) => {
      (section.fields || []).forEach((field, fieldIndex) =>
        registerField(ctx, field, `pages[${page.pageNumber}].sections[${sectionIndex}].fields[${fieldIndex}]`),
      );
      (section.fieldsAfterTables || []).forEach((field, fieldIndex) =>
        registerField(
          ctx,
          field,
          `pages[${page.pageNumber}].sections[${sectionIndex}].fieldsAfterTables[${fieldIndex}]`,
        ),
      );
      (section.tables || []).forEach((table, tableIndex) =>
        registerTable(ctx, table, `pages[${page.pageNumber}].sections[${sectionIndex}].tables[${tableIndex}]`),
      );
    });
  });

  if (ctx.fieldCount < definition.minimumFields) {
    ctx.failures.push(`Alan sayısı beklenenden düşük: ${ctx.fieldCount}`);
  }
  if (ctx.optionCount < definition.minimumOptions) {
    ctx.failures.push(`Seçenek/checkbox sayısı beklenenden düşük: ${ctx.optionCount}`);
  }
  if (ctx.tableCount < definition.minimumTables) {
    ctx.failures.push(`Tablo sayısı beklenenden düşük: ${ctx.tableCount}`);
  }

  return {
    formType: definition.formType,
    pageCount: inventory.pages?.length || 0,
    fieldCount: ctx.fieldCount,
    optionCount: ctx.optionCount,
    tableCount: ctx.tableCount,
    failures: ctx.failures,
  };
}

const results = INVENTORIES.map(verifyInventory);
const failures = results.flatMap((result) => result.failures.map((failure) => `${result.formType}: ${failure}`));

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  results
    .map(
      (result) =>
        `${result.formType} envanter kontrolü geçti. Sayfa=${result.pageCount}, alan=${result.fieldCount}, seçenek=${result.optionCount}, tablo=${result.tableCount}`,
    )
    .join('\n'),
);
