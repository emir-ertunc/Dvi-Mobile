# PDF Export Adapter Politikası

Phase 1B itibarıyla uygulama alan modeli PDF teknolojisinden bağımsız tutulur.

## Karar

- `canonicalFieldId` uygulama, şema, validasyon, taslak kayıt ve eşleştirme için tek kalıcı alan kimliğidir.
- Görüntü tabanlı PDF dışa aktarımı ayrı bir binding kullanır: `canonicalFieldId -> page/rect/style`.
- İleride gerçek AcroForm PDF gelirse ayrı bir binding eklenecektir: `canonicalFieldId -> acroFormFieldName/buttonState`.
- UI, validasyon ve yerel saklama hiçbir PDF koordinatı veya AcroForm alan adı bilmeyecektir.

## Sonuç

Gerçek AcroForm kaynakları geldiğinde uygulama yeniden yazılmayacak; yalnızca export adapter ve manifest katmanı değişecektir.
