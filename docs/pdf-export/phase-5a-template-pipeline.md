# Phase 5A - PDF Şablon Pipeline

Bu fazda AM ve PM fillable INTERPOL DVI 2018 PDF dosyaları, ilerideki export motorunun resmi şablon kaynağı olacak şekilde repo asset'i haline getirildi.

## Teknik karar

- Şablonlar uygulama asset klasöründe tutulur.
- Her şablon SHA-256 hash, byte uzunluğu ve Phase 1A forensics metadata ile doğrulanır.
- Manifest deterministiktir; çalışma zamanına bağlı tarih üretmez.
- Metro `pdf` asset uzantısını kabul edecek şekilde yapılandırılır.
- Uygulama tarafında `src/config/pdfTemplates.ts` manifesti ve paketlenecek PDF asset referanslarını merkezi olarak sunar.

## Şablonlar

| Form | Asset | Sayfa | Widget | Unique field | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| AM | `assets/pdf-templates/interpol-dvi-2018-am-fillable.pdf` | 18 | 2006 | 1687 | `0a20690e3510ae844a34cee725a80f54817ead3ba385172d3c7b7c5e492fe171` |
| PM | `assets/pdf-templates/interpol-dvi-2018-pm-fillable.pdf` | 19 | 2026 | 1693 | `203a9d52189f07219b4e64c7c767eaf252d40b2d0d6e8cd9e814b91face83a02` |

## Doğrulama kapıları

- `npm run pdf:templates` manifesti ve assetleri üretir.
- `npm run pdf:templates:verify` repo içindeki şablonların drift üretmediğini doğrular.
- GitHub Actions APK workflow'u PDF şablon doğrulamasını build kapısına dahil eder.

## Kapsam dışı

- Field binding manifesti bu fazda üretilmedi.
- AM/PM veri export işlemi bu fazda başlatılmadı.
- Checkbox state regression, appearance update ve flatten işlemleri Phase 5B-5F kapsamında ele alınacaktır.
