const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function read(path) {
  return readFileSync(path, 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function requireToken(source, token, file) {
  if (!source.includes(token)) {
    fail(`${file} içinde beklenen veri giriş sözleşmesi yok: ${token}`);
  }
}

function forbidToken(source, token, file) {
  if (source.includes(token)) {
    fail(`${file} içinde hatalı veri giriş sözleşmesi kalmış: ${token}`);
  }
}

const appSource = read(join('App.tsx'));
const workspaceSource = read(join('src', 'components', 'FormWorkspace.tsx'));
const fieldControlSource = read(join('src', 'components', 'FormFieldControl.tsx'));
const buildInfoSource = read(join('src', 'config', 'buildInfo.ts'));

requireToken(buildInfoSource, 'phase-5a-fix6-v0.5.6-20260512', 'buildInfo.ts');
requireToken(appSource, 'onFieldValueChange={(fieldId, value) => void draftState.updateDraftFieldValue(activeDraft.id, fieldId, value)}', 'App.tsx');
requireToken(appSource, 'readonly onFieldValueChange: (fieldId: string, value:', 'App.tsx');
requireToken(workspaceSource, 'readonly onFieldValueChange: (fieldId: string, value: DraftFieldValue | null) => void;', 'FormWorkspace.tsx');
requireToken(workspaceSource, 'onValueChange={(fieldId, value) => onFieldValueChange(fieldId, value)}', 'FormWorkspace.tsx');
forbidToken(workspaceSource, 'onValueChange={(fieldId, value) => onFieldValueChange(draft.id, fieldId, value)}', 'FormWorkspace.tsx');
forbidToken(workspaceSource, 'readonly onFieldValueChange: (draftId: string, fieldId: string, value:', 'FormWorkspace.tsx');
requireToken(fieldControlSource, 'onChangeText={(nextValue) => onValueChange(field.schemaFieldId, normalizeInputValue(field, nextValue))}', 'FormFieldControl.tsx');
requireToken(fieldControlSource, 'onPress={() => onValueChange(field.schemaFieldId, checked ? null : true)}', 'FormFieldControl.tsx');

console.log('Form veri giriş sözleşmesi doğrulaması geçti.');
