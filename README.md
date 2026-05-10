# DVI Mobil

DVI Mobil, Türkçe kullanıcı arayüzüne sahip çevrimdışı öncelikli bir mobil uygulama olarak geliştirilecektir. Resmi PDF aktarımı için kaynak şablonlar 2018 INTERPOL fillable AM ve PM formlarıdır.

## Faz 1B

- Uygulama sürümü: `0.1.6`
- Uygulama içinde görünür build kimliği: `phase-1b-v0.1.6-20260510`
- Resmi form kaynağı artık fillable INTERPOL AM/PM PDF dosyalarıdır.
- AM fillable PDF: 18 sayfa, 2006 widget, 1687 unique field name.
- PM fillable PDF: 19 sayfa, 2026 widget, 1693 unique field name.
- AM canonical AcroForm envanteri `data/form-inventory/am-acroform-inventory.json` içindedir.
- Widget manifestleri `data/acroform-forensics/generated` altında tutulur.
- Ana proje planı `docs/project-plan.md` içindedir.

## Komutlar

```bash
npm ci
npm run typecheck
npm run text:verify-tr
npm run rebaseline:verify
npm run forensics:inspect
npm run forensics:verify
npm run inventory:am
npm run inventory:am:verify
```

Android APK GitHub Actions üzerinde `Phase 1B APK` workflow'u ile üretilir. Beklenen artifact adı:

```text
DviMobile-phase-1b-v0.1.6-20260510.apk
```

## Kaynak Sınırı

Uygulama çalışma zamanı Türkçedir. PDF şablon alanları, resmi fillable formlardaki alan adlarıyla takip edilir. Türkçe ekran metni ile PDF alan adı eşleşmeleri ayrı katmanda tutulacaktır.
