# Phase 1B Özeti: AM AcroForm Tam Alan Envanteri

Phase 1B, AM fillable PDF içindeki 2006 widget instance ve 1687 unique PDF field name değerini canonical AM inventory kaydına bağlar.

## Üretilen Dosyalar

- `data/form-inventory/am-acroform-inventory.json`
- `data/form-inventory/am-acroform-audit.json`
- `docs/acroform-forensics/am-coverage-matrix.md`

## Inventory Standardı

- Her unique PDF field name için bir canonical field kaydı vardır.
- Her widget instance `pdfBinding.widgetInstances` içinde sayfa, sıra, rect ve button state bilgisiyle korunur.
- Header ve checklist alanları kullanıcı alanlarından ayrı audit class ile işaretlenir.
- Checkbox alanlarında button state değerleri export hazırlığı için saklanır.
- Türkçe UI etiketi Phase 1B düzeyinde alan kimliğinden üretilir; resmi ekran metni Phase 4 içinde kesinleştirilecektir.

## Sayısal Sonuç

| Metrik | Değer |
| --- | ---: |
| Widget instance | 2006 |
| Inventory field | 1687 |
| Covered widget | 2006 |
| Checkbox field | 610 |
| Repeated field | 57 |
| Bölüm sayısı | 11 |

## Faz Sınırı

Bu faz PM envanterini, canonical schema katmanını, uygulama veri giriş ekranlarını veya PDF export motorunu başlatmaz.
