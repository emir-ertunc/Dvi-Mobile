# Phase 1C Özeti: PM PDF Tam Alan Envanteri

Phase 1C, Türkçe resmi PM formunun 16 sayfasını sayfa sayfa inceleyerek machine-readable envanter dosyasına dönüştürür.

## Çıktılar

- `data/form-inventory/pm-field-inventory.json`
- Güncellenmiş PM coverage matrisi
- Güncellenmiş PDF export adapter politikası
- Uygulama içi build göstergesi: `Faz 1C / 0.1.2 / phase-1c-v0.1.2-20260510`

## Kapsam

- B0, B, C1, C2, C3, D1, D2, D3, D4, E1, E2, E3, E4, F1, F2 ve G sayfaları işlendi.
- Morg kontrol listesi, olay yeri, kıyafet/eşya/takı tabloları, fiziksel tanımlama, vücut/iskelet diyagramları, otopsi, DNA ve odontoloji blokları ayrı yapılarla temsil edildi.
- Checkbox/radio seçenekleri option seviyesinde tutuldu.
- Tablolar row/column yapısıyla modellendi; runtime hücreleri bu yapıdan üretilecek.
- PM formundaki a/b/c, E1'deki a/b/c/d ve E4'teki yalnız c kanıt kolonları ayrı ortak bloklar olarak kaydedildi.

## AcroForm Plan Güncellemesi

Phase 5 için plan, mevcut image-based resmi PDF'lerden türetilmiş doldurulabilir AcroForm master şablonu üretimini destekleyecek şekilde güncellendi. Bu şablon resmi kaynak değil, export adapter varlığıdır; gerçek kurum AcroForm'u gelirse aynı `canonicalFieldId` modeliyle yeni binding manifesti eklenir.
