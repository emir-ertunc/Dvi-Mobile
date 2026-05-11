# DVI Mobil

DVI Mobil, Türkçe kullanıcı arayüzüne sahip çevrimdışı öncelikli bir mobil uygulama olarak geliştirilecektir. Resmi PDF aktarımı için kaynak şablonlar 2018 INTERPOL fillable AM ve PM formlarıdır.

## Faz 4B

- Uygulama sürümü: `0.4.1`
- Uygulama içinde görünür derleme kimliği: `phase-4b-v0.4.1-20260511`
- Resmi form kaynağı fillable INTERPOL AM/PM PDF dosyalarıdır.
- AM fillable PDF: 18 sayfa, 2006 widget, 1687 unique field name.
- PM fillable PDF: 19 sayfa, 2026 widget, 1693 unique field name.
- AM canonical AcroForm envanteri `data/form-inventory/am-acroform-inventory.json` içindedir.
- PM canonical AcroForm envanteri `data/form-inventory/pm-acroform-inventory.json` içindedir.
- AM canonical schema `data/schema/am-schema.json` içindedir.
- PM canonical schema `data/schema/pm-schema.json` içindedir.
- Yerel taslak saklama katmanı `src/storage/draftStore.ts` ve `src/hooks/useLocalDrafts.ts` içindedir.
- Ortak form gezgini ve alan kontrol iskeleti `src/components/FormWorkspace.tsx`, `src/components/FormSectionNavigator.tsx` ve `src/components/FormFieldControl.tsx` içindedir.
- AM kimlik, olay, kişi, iletişim ve genel bilgi bölümleri yerel taslak değerlerine bağlıdır.
- Tanılama ve veri geçişi bilgileri `src/config/diagnostics.ts` ve Sistem ekranı içinde görünürdür.
- Ana proje planı `docs/project-plan.md` içindedir.

## Komutlar

```bash
npm ci
npm run typecheck
npm run text:verify-tr
npm run rebaseline:verify
npm run forensics:verify
npm run inventory:am:verify
npm run inventory:pm:verify
npm run inventory:audit:verify
npm run schema:primitives:verify
npm run schema:am:verify
npm run schema:pm:verify
npm run schema:coverage:verify
npm run drafts:storage:verify
npm run forms:renderer:verify
```

Android APK GitHub Actions üzerinde `Phase 4B APK` workflow'u ile üretilir. Beklenen artifact adı:

```text
DviMobile-phase-4b-v0.4.1-20260511.apk
```

## Kaynak Sınırı

Uygulama çalışma zamanı Türkçedir. PDF şablon alanları, resmi fillable formlardaki alan adlarıyla takip edilir. Türkçe ekran metni ile PDF alan adı eşleşmeleri ayrı katmanda tutulacaktır.
