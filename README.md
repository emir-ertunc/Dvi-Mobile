# DVI Mobil

DVI Mobil, Türkçe kullanıcı arayüzüne sahip çevrimdışı öncelikli bir mobil uygulama olarak geliştirilecektir. Resmi PDF aktarımı için kaynak şablonlar 2018 INTERPOL fillable AM ve PM formlarıdır.

## Faz 0R

- Uygulama sürümü: `0.1.4`
- Uygulama içinde görünür build kimliği: `phase-0r-v0.1.4-20260510`
- Resmi form kaynağı artık fillable INTERPOL AM/PM PDF dosyalarıdır.
- Eski kaynak envanterleri, forensics çıktıları ve coverage raporları kaldırılmıştır.
- Ana proje planı `docs/project-plan.md` içindedir.

## Komutlar

```bash
npm ci
npm run typecheck
npm run text:verify-tr
npm run rebaseline:verify
```

Android APK GitHub Actions üzerinde `Phase 0R APK` workflow'u ile üretilir. Beklenen artifact adı:

```text
DviMobile-phase-0r-v0.1.4-20260510.apk
```

## Kaynak Sınırı

Uygulama çalışma zamanı Türkçedir. PDF şablon alanları, resmi fillable formlardaki alan adlarıyla takip edilir. Türkçe ekran metni ile PDF alan adı eşleşmeleri ayrı katmanda tutulacaktır.
