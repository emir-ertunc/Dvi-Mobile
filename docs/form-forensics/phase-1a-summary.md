# Phase 1A PDF Forensics Özeti

Phase 1A, resmi Türkçe formların teknik biçimini doğrular ve sonraki alan envanteri fazları için sayfa bazlı manifest üretir.

## Doğrulanan kaynaklar

| Form | Beklenen sayfa | Teknik durum | Sonraki faz |
| --- | ---: | --- | --- |
| Ölüm Öncesi Formu (AM) | 18 | Görüntü PDF, metin katmanı yok, AcroForm alanı yok | Phase 1B |
| Ölüm Sonrası Formu (PM) | 16 | Görüntü PDF, metin katmanı yok, AcroForm alanı yok | Phase 1C |

## Üretilen dosyalar

- `data/form-forensics/generated/phase-1a-pdf-forensics.json`
- `data/form-forensics/generated/am-page-manifest.json`
- `data/form-forensics/generated/pm-page-manifest.json`

## Teknik karar

Resmi Türkçe PDF'ler taranmış görüntü PDF'i olduğu için alan envanteri doğrudan AcroForm veya metin katmanı üzerinden çıkarılamaz. Sonraki fazlarda sayfa görüntüsü inceleme, manuel alan kodlama ve gerekiyorsa OCR destekli denetim birlikte kullanılacaktır.
