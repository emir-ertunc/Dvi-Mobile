# DVI Mobil

Türkçe INTERPOL DVI iş akışları için geliştirilen mobil uygulama.

Bu depo Phase 1C itibarıyla temiz bir Expo React Native temelini, resmi Türkçe PDF doğrulama hattını, AM/PM tam alan envanterlerini ve Android APK üretim workflow'unu içerir.

## Phase 1C

- Uygulama dili yalnızca Türkçedir.
- Uygulama içinde görünür build kimliği: `phase-1c-v0.1.2-20260510`
- Resmi Türkçe PDF'ler görüntü tabanlıdır; metin katmanı ve AcroForm alanı yoktur.
- Tam AM alan envanteri `data/form-inventory/am-field-inventory.json` içindedir.
- Tam PM alan envanteri `data/form-inventory/pm-field-inventory.json` içindedir.
- Export adapter politikası, mevcut image-based PDF'lerden türetilmiş doldurulabilir AcroForm master üretimini ve ileride gerçek AcroForm'a geçişi destekleyecek şekilde ayrılmıştır.

## Komutlar

```bash
npm install
npm run typecheck
npm run text:verify-tr
npm run inventory:verify
npm run forensics:verify
```

Android APK GitHub Actions üzerinde `Phase 1C APK` workflow'u ile üretilir.
