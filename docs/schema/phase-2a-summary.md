# Phase 2A Özeti: Ortak Field Primitive Katmanı

Phase 2A, AM ve PM AcroForm envanterlerini uygulama domain katmanına taşıyacak ortak primitive tiplerini ve doğrulama kapısını ekler.

## Üretilen Dosyalar

- `src/domain/fieldPrimitives.ts`
- `src/domain/inventoryTypes.ts`
- `src/domain/index.ts`
- `scripts/verify_field_primitives.js`
- `data/schema/field-primitive-coverage.json`
- `docs/schema/field-primitive-standard.md`

## Doğrulanan Sözleşme

- Envanterdeki her `controlType` desteklenen primitive türüne bağlanır.
- Her primitive için izin verilen `valueType` doğrulanır.
- Her canonical id kendi form prefix'iyle başlar.
- Her field `acroformFieldNames` export stratejisini taşır.
- Widget instance form tipi inventory form tipiyle eşleşir.

## Faz Sınırı

Bu faz AM veya PM canonical schema dosyalarını oluşturmaz. Validasyon kuralları, migration ve completion/readiness mantığı Phase 2B/2C içinde genişletilecektir.
