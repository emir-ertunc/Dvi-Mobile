# Phase 1D Envanter Denetim Raporu

Faz: Phase 1D
Denetim sürümü: 0.1.3
Build kimliği: phase-1d-v0.1.3-20260510

| Form | Sayfa | Bölüm | Alan | Kalıcı alan kimliği | Relative alan | Seçenek | Tablo | Durum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| AM | 18 | 26 | 226 | 216 | 26 | 323 | 15 | Geçti |
| PM | 16 | 17 | 158 | 96 | 86 | 330 | 21 | Geçti |

## Zorunlu Kontroller

- AM ve PM sayfa kodları eksiksiz ve sıralı olmalıdır.
- Her kalıcı alan `canonicalFieldId` taşımalı ve form önekiyle başlamalıdır.
- Tekrar eden tablo, diş şeması ve alt blok içi alanlarda `fieldId` yalnızca relative kimlik olarak kullanılabilir.
- Her checkbox/radio seçeneği `optionId` ve `label` taşımalıdır.
- Ortak header/footer ve kanıt durumu blokları sayfa kapsamı ve runtime kimlik kalıbı taşımalıdır.
- Diyagram, odontogram, imza, tarih, sayı, telefon/iletişim ve tablo tipleri envanterde temsil edilmelidir.
- Türetilmiş doldurulabilir PDF şablonu yalnızca dışa aktarım katmanı varlığıdır; resmi kaynak değildir.

