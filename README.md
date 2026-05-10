# DVI Mobil

Türkçe INTERPOL DVI iş akışları için geliştirilen mobil uygulama.

Bu depo Phase 1B itibarıyla temiz bir Expo React Native temelini, resmi Türkçe PDF doğrulama hattını, AM tam alan envanterini ve Android APK üretim workflow'unu içerir.

## Phase 1B

- Uygulama dili yalnızca Türkçedir.
- Uygulama içinde görünür build kimliği: `phase-1b-v0.1.1-20260510`
- Resmi Türkçe PDF'ler görüntü tabanlıdır; metin katmanı ve AcroForm alanı yoktur.
- Tam AM alan envanteri `data/form-inventory/am-field-inventory.json` içindedir.
- Tam PM alan envanteri Phase 1C kapsamında tamamlanacaktır.
- Export adapter politikası AcroForm'a geçişi kolaylaştıracak şekilde ayrılmıştır.

## Komutlar

```bash
npm install
npm run typecheck
npm run text:verify-tr
npm run inventory:verify
npm run forensics:verify
```

Android APK GitHub Actions üzerinde `Phase 1B APK` workflow'u ile üretilir.
