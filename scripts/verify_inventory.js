const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const inventoryPath = join('data', 'form-inventory', 'am-field-inventory.json');
const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));

const failures = [];
const ids = new Set();
let fieldCount = 0;
let optionCount = 0;
let tableCount = 0;

const requiredPageCodes = [
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
];

function registerField(field, context) {
  if (!field || typeof field !== 'object') {
    return;
  }

  const id = field.canonicalFieldId || field.fieldId;
  if (field.canonicalFieldId) {
    if (ids.has(field.canonicalFieldId)) {
      failures.push(`Tekrarlanan canonicalFieldId: ${field.canonicalFieldId}`);
    }
    ids.add(field.canonicalFieldId);
  }

  if (!id) {
    failures.push(`${context}: alan kimliği eksik`);
  }
  if (!field.label) {
    failures.push(`${context}: alan etiketi eksik`);
  }
  if (!field.type && !Array.isArray(field.options)) {
    failures.push(`${context}: alan tipi eksik`);
  }

  fieldCount += 1;

  if (Array.isArray(field.options)) {
    field.options.forEach((option, index) => {
      if (!option || typeof option !== 'object' || !option.optionId || !option.label) {
        failures.push(`${context}.options[${index}]: optionId/label eksik`);
      }
    });
    optionCount += field.options.length;
  }
  if (Array.isArray(field.fields)) {
    field.fields.forEach((nested, index) => registerField(nested, `${context}.fields[${index}]`));
  }
  if (Array.isArray(field.subfields)) {
    field.subfields.forEach((nested, index) => registerField(nested, `${context}.subfields[${index}]`));
  }
}

function registerTable(table, context) {
  tableCount += 1;
  if (!table.canonicalFieldId) {
    failures.push(`${context}: tablo canonicalFieldId eksik`);
  } else if (ids.has(table.canonicalFieldId)) {
    failures.push(`Tekrarlanan canonicalFieldId: ${table.canonicalFieldId}`);
  } else {
    ids.add(table.canonicalFieldId);
  }
  if (!table.type) {
    failures.push(`${context}: tablo tipi eksik`);
  }
  if (!table.label) {
    failures.push(`${context}: tablo etiketi eksik`);
  }
  if (Array.isArray(table.columns)) {
    table.columns.forEach((column) => {
      if (!column.columnId || !column.label || !column.type) {
        failures.push(`${context}: tablo sütun tanımı eksik`);
      }
    });
  }
  if (Array.isArray(table.fields)) {
    table.fields.forEach((field, index) => registerField(field, `${context}.fields[${index}]`));
  }
  if (Array.isArray(table.embeddedChoices)) {
    table.embeddedChoices.forEach((field, index) =>
      registerField(field, `${context}.embeddedChoices[${index}]`),
    );
  }
}

function registerCommonChoiceBlock(block, context) {
  if (!block.canonicalFieldId) {
    failures.push(`${context}: ortak seçim bloğu canonicalFieldId eksik`);
  } else if (ids.has(block.canonicalFieldId)) {
    failures.push(`Tekrarlanan canonicalFieldId: ${block.canonicalFieldId}`);
  } else {
    ids.add(block.canonicalFieldId);
  }
  if (!block.runtimeFieldIdPattern) {
    failures.push(`${context}: runtime alan kimliği kalıbı eksik`);
  }
  (block.columns || []).forEach((column, index) => {
    if (!column.optionId || !column.label || column.type !== 'checkbox') {
      failures.push(`${context}.columns[${index}]: ortak seçim tanımı eksik`);
    }
  });
  optionCount += (block.columns || []).length * (block.appliesToPages || []).length;
}

if (inventory.formType !== 'AM') {
  failures.push('formType AM değil');
}
if (inventory.inventoryVersion !== '0.1.1') {
  failures.push('inventoryVersion 0.1.1 değil');
}
if (!inventory.fieldModelPolicy?.pdfTechnologyIndependent) {
  failures.push('PDF teknolojisinden bağımsız model politikası işaretlenmemiş');
}
if (!inventory.fieldModelPolicy?.relativeFieldIdPolicy) {
  failures.push('Relative fieldId politikası eksik');
}
if (!Array.isArray(inventory.pages) || inventory.pages.length !== 18) {
  failures.push('AM envanteri 18 sayfa içermiyor');
}

const pageCodes = new Set((inventory.pages || []).map((page) => page.officialCode));
for (const code of requiredPageCodes) {
  if (!pageCodes.has(code)) {
    failures.push(`Sayfa kodu eksik: ${code}`);
  }
}

for (const [blockId, block] of Object.entries(inventory.commonBlocks || {})) {
  (block.fields || []).forEach((field, index) =>
    registerField(field, `commonBlocks.${blockId}.fields[${index}]`),
  );
  if (Array.isArray(block.columns)) {
    registerCommonChoiceBlock(block, `commonBlocks.${blockId}`);
  }
}

(inventory.pages || []).forEach((page) => {
  if (!page.pageNumber || !page.officialCode || !page.title) {
    failures.push(`Sayfa üst bilgisi eksik: ${JSON.stringify(page)}`);
  }
  (page.sections || []).forEach((section, sectionIndex) => {
    (section.fields || []).forEach((field, fieldIndex) =>
      registerField(field, `pages[${page.pageNumber}].sections[${sectionIndex}].fields[${fieldIndex}]`),
    );
    (section.fieldsAfterTables || []).forEach((field, fieldIndex) =>
      registerField(
        field,
        `pages[${page.pageNumber}].sections[${sectionIndex}].fieldsAfterTables[${fieldIndex}]`,
      ),
    );
    (section.tables || []).forEach((table, tableIndex) =>
      registerTable(table, `pages[${page.pageNumber}].sections[${sectionIndex}].tables[${tableIndex}]`),
    );
  });
});

if (fieldCount < 180) {
  failures.push(`Alan sayısı beklenenden düşük: ${fieldCount}`);
}
if (optionCount < 180) {
  failures.push(`Seçenek/checkbox sayısı beklenenden düşük: ${optionCount}`);
}
if (tableCount < 15) {
  failures.push(`Tablo sayısı beklenenden düşük: ${tableCount}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `AM envanter kontrolü geçti. Sayfa=${inventory.pages.length}, alan=${fieldCount}, seçenek=${optionCount}, tablo=${tableCount}`,
);
