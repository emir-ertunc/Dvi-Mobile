# Phase 1B Özeti: AM PDF Tam Alan Envanteri

Phase 1B, Türkçe resmi AM formunun 18 sayfasını sayfa sayfa inceleyerek machine-readable envanter dosyasına dönüştürür.

## Çıktılar

- `data/form-inventory/am-field-inventory.json`
- `docs/architecture/pdf-export-adapter-policy.md`
- Güncellenmiş AM coverage matrisi
- Uygulama içi build göstergesi: `Faz 1B / 0.1.1 / phase-1b-v0.1.1-20260510`

## Kapsam

- A0, A1, A2, C1, C2, C3, D1, D2, D3, D4, E1, E2, E4, F1, F2, G, Silüet Taslağı ve kimlik tespit onayı sayfaları işlendi.
- Checkbox/radio seçenekleri option seviyesinde tutuldu.
- Tablolar row/column yapısıyla modellendi; runtime hücreleri bu yapıdan üretilecek.
- Odontogram, vücut diyagramı ve imza/kaşe alanları ayrı alan tipleriyle temsil edildi.

## Not

Resmi PDF görüntü tabanlı olduğu için bu faz koordinat export manifesti üretmez. Phase 5 içinde image-based koordinat manifesti üretilecek; gerçek AcroForm kaynakları gelirse aynı canonical alanlar AcroForm adapter ile eşlenecek.
