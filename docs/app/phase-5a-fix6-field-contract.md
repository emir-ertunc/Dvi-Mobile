# Phase 5A-Fix6 Alan Sözleşmesi Denetimi

Bu rapor, PDF AcroForm widget kapsamı ile uygulamadaki envanter, schema, export binding ve Türkçe alan metinleri arasındaki sözleşmeyi denetler.

## Sonuç

- Toplam PDF widget: 4032 / 4032
- Toplam canonical alan: 3380 / 3380
- Türkçe UI label karşılığı: 3380 / 3380
- AcroForm export binding: 3380 / 3380
- Denetim sonucu: Geçti

| Form | Alan | PDF widget | Türkçe label | AcroForm binding | Checkbox state | Sonuç |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| AM | 1687 | 2006 | 1687 | 1687 | 610 | Geçti |
| PM | 1693 | 2026 | 1693 | 1693 | 755 | Geçti |

## Gate

- Her PDF widget instance anahtarı inventory ve schema içinde bire bir temsil edilmelidir.
- Her schema alanı Türkçe label, kısa label ve yardım metni taşımalıdır.
- Kullanıcıya görünen metinde teknik PDF field id, sıra numarası, belirsiz blok numarası veya genel placeholder kalıbı bulunmamalıdır.
- E-posta, telefon, tarih parçası ve checkbox alanları kendi input tipini açıkça yansıtmalıdır.
