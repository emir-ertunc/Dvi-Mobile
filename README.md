# DVI Mobil

Türkçe INTERPOL DVI iş akışları için geliştirilen mobil uygulama.

Bu depo Phase 1D itibarıyla temiz bir Expo React Native temelini, resmi Türkçe PDF doğrulama hattını, AM/PM tam alan envanterlerini, sertleştirilmiş envanter denetimini ve Android APK üretim workflow'unu içerir.

## Phase 1D

- Uygulama dili yalnızca Türkçedir.
- Uygulama içinde görünür build kimliği: `phase-1d-v0.1.3-20260510`
- Resmi Türkçe PDF'ler görüntü tabanlıdır; metin katmanı ve AcroForm alanı yoktur.
- Tam AM alan envanteri `data/form-inventory/am-field-inventory.json` içindedir.
- Tam PM alan envanteri `data/form-inventory/pm-field-inventory.json` içindedir.
- Envanter denetim raporu `docs/form-forensics/phase-1d-inventory-audit.md` içindedir.
- Export adapter politikası, mevcut image-based PDF'lerden türetilmiş doldurulabilir AcroForm master üretimini ve ileride gerçek AcroForm'a geçişi destekleyecek şekilde ayrılmıştır.

## Komutlar

```bash
npm install
npm run typecheck
npm run text:verify-tr
npm run inventory:verify
npm run inventory:audit
npm run forensics:verify
```

Android APK GitHub Actions üzerinde `Phase 1D APK` workflow'u ile üretilir.
