# Phase 2B Özeti: AM Schema ve Validasyon

Phase 2B, AM AcroForm envanterindeki 1687 alanı canonical AM schema kaydına dönüştürür ve temel validasyon kurallarını bağlar.

## Üretilen Dosyalar

- `data/schema/am-schema.json`
- `data/schema/am-schema-audit.json`
- `src/domain/schemaTypes.ts`
- `src/domain/validation.ts`
- `scripts/build_am_schema.js`

## Doğrulanan Sözleşme

- Her AM inventory alanının schema karşılığı vardır.
- Her schema field benzersiz `schemaFieldId` taşır.
- Primitive ve value type eşleşmeleri doğrulanır.
- Her field export binding ve widget binding taşır.
- Default değerler ilgili validasyon kurallarından geçer.

## Sayısal Sonuç

| Metrik | Değer |
| --- | ---: |
| AM schema field | 1687 |
| Widget binding | 2006 |
| Required field | 0 |
| Optional field | 1687 |
| Default validasyonu geçen field | 1687 |

## Faz Sınırı

Bu faz PM schema dosyasını, UI veri giriş ekranlarını, local persistence veya PDF export motorunu başlatmaz.
