# Phase 2D Özeti: Schema Coverage Testleri

Phase 2D, AM ve PM canonical schema dosyalarını AcroForm inventory kaynaklarıyla karşılaştıran build gate denetimini ekler.

## Üretilen Dosyalar

- `scripts/audit_schema_coverage.js`
- `data/schema/schema-coverage-audit.json`
- `docs/schema/phase-2d-summary.md`

## Denetlenen Sözleşme

- Inventory içindeki her canonical field schema içinde birebir temsil edilir.
- Schema içinde inventory karşılığı olmayan alan bulunmaz.
- Widget instance key, sayfa, field name, rect ve checkbox state bilgileri kayıpsız taşınır.
- Export binding AcroForm field name ve widget instance sayısıyla tutarlıdır.
- Primitive/value type eşleşmeleri ve validation rule setleri yeniden hesaplanarak doğrulanır.
- Default değerler ilgili validation kurallarından geçer.
- Çözülmemiş, ignore edilmiş veya review bekleyen widget yoktur.

## Sayısal Sonuç

| Form | Schema field | Widget binding | Exact widget field | Exact export binding | Default validasyonu | Sonuç |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| AM | 1687 | 2006 | 1687 | 1687 | 1687 | Geçti |
| PM | 1693 | 2026 | 1693 | 1693 | 1693 | Geçti |

## Faz Sınırı

Bu faz veri giriş UI, local persistence ve PDF export motorunu başlatmaz. Çıktı, Phase 3 ve Phase 4 başlamadan önce schema kapsamını CI kapısı haline getirir.
