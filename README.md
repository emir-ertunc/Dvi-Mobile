# DVI Mobil

Türkçe INTERPOL DVI iş akışları için geliştirilen mobil uygulama.

Bu depo Phase 1A itibarıyla temiz bir Expo React Native temelini, resmi Türkçe PDF doğrulama hattını, sayfa manifestlerini ve Android APK üretim workflow'unu içerir.

## Phase 1A

- Uygulama dili yalnızca Türkçedir.
- Uygulama içinde görünür build kimliği: `phase-1a-v0.1.0-20260510`
- Resmi Türkçe PDF'ler görüntü tabanlıdır; metin katmanı ve AcroForm alanı yoktur.
- Tam AM alan envanteri Phase 1B, tam PM alan envanteri Phase 1C kapsamında tamamlanacaktır.

## Komutlar

```bash
npm install
npm run typecheck
npm run text:verify-tr
npm run forensics:verify
```

Android APK GitHub Actions üzerinde `Phase 1A APK` workflow'u ile üretilir.
