# Phase 1A Özeti: Fillable PDF Forensics Scaffold

Phase 1A, resmi kaynak kabul edilen 2018 INTERPOL fillable AM ve PM PDF dosyalarının teknik yapısını makine tarafından denetlenebilir JSON çıktısına dönüştürür.

## Üretilen Dosyalar

- `data/acroform-forensics/generated/phase-1a-pdf-forensics.json`
- `data/acroform-forensics/generated/am-widget-manifest.json`
- `data/acroform-forensics/generated/pm-widget-manifest.json`

## Doğrulanan Kaynaklar

| Form | Sayfa | Widget | Unique field name | Text layer | Widget tipleri |
| --- | ---: | ---: | ---: | --- | --- |
| AM | 18 | 2006 | 1687 | Var | Text: 1288, CheckBox: 718 |
| PM | 19 | 2026 | 1693 | Var | Text: 1143, CheckBox: 883 |

## Manifest Standardı

Her widget kaydı şu temel bilgileri içerir:

- form tipi
- sayfa numarası
- sayfa içi widget sırası
- PDF field name
- field type
- rect koordinatları
- field flags
- mevcut field value
- checkbox/button state bilgisi
- yakındaki görünür label adayları
- duplicate field group bilgisi

## Faz Sınırı

Bu faz alanları canonical domain modeline bağlamaz. AM tam alan envanteri Phase 1B içinde, PM tam alan envanteri Phase 1C içinde yapılacaktır.

## Doğrulama Komutları

```bash
npm run forensics:inspect
npm run forensics:verify
npm run typecheck
npm run text:verify-tr
npm run rebaseline:verify
```
