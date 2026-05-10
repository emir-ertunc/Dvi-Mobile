const { buildAudit } = require('./inventory_audit');

const audit = buildAudit();

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
