# PDF Export Adapter Politikası

Phase 1C itibarıyla uygulama alan modeli PDF teknolojisinden bağımsız tutulur.

## Karar

- `canonicalFieldId` uygulama, şema, validasyon, taslak kayıt ve eşleştirme için tek kalıcı alan kimliğidir.
- Mevcut resmi Türkçe PDF'ler görüntü tabanlıdır; metin katmanı ve AcroForm alanı yoktur.
- Phase 5 içinde bu resmi görüntü PDF'leri arka plan olarak korunarak türetilmiş doldurulabilir AcroForm master şablonları üretilebilir.
- Türetilmiş AcroForm master resmi kaynak değil, export adapter şablonudur.
- Türetilmiş master binding'i ayrı tutulur: `canonicalFieldId -> acroFormFieldName/buttonState`.
- Doğrudan koordinat tabanlı export gerekirse ayrı binding tutulur: `canonicalFieldId -> page/rect/style`.
- Kurumdan gerçek doldurulabilir AcroForm PDF gelirse üçüncü binding katmanı eklenir; uygulama alan modeli değişmez.
- UI, validasyon ve yerel saklama hiçbir PDF koordinatı veya AcroForm alan adı bilmeyecektir.

## Sonuç

Image-based PDF üzerinden türetilmiş AcroForm master kullanmak export kalitesini artırabilir, fakat resmi doğruluk kaynağı yine resmi Türkçe formlar ve committed inventory dosyalarıdır. Gerçek AcroForm kaynakları geldiğinde uygulama yeniden yazılmayacak; yalnızca export adapter ve manifest katmanı değişecektir.
