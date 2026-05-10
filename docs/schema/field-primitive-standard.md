# Ortak Field Primitive Standardı

Phase 2A, Phase 1 envanterlerindeki PDF alanlarını uygulama domain katmanında kullanılacak ortak primitive sözleşmesine bağlar.

## Katmanlar

- Canonical field id: Uygulama içinde stabil alan kimliği.
- Türkçe UI label: Kullanıcının gördüğü Türkçe etiket.
- Field primitive: Uygulamanın control ve value davranışı.
- PDF binding: AcroForm field name, widget instance, rect ve button state bilgisi.

## Desteklenen İlk Primitive Eşleşmeleri

| Inventory control type | Primitive | Value type |
| --- | --- | --- |
| `text` | `text` | `string` |
| `date-part` | `datePart` | `datePart` |
| `number` | `number` | `number` |
| `email` | `email` | `email` |
| `phone` | `phone` | `phone` |
| `checkbox` | `checkbox` | `boolean` |

## Genişleme Noktaları

Phase 2B/2C içinde AM ve PM schema çalışması sırasında şu primitive türleri kullanılabilir hale getirilecektir:

- `multilineText`
- `date`
- `decimal`
- `singleChoice`
- `multiChoice`
- `tableRow`
- `repeatedGroup`
- `signatureBlock`
- `attachmentReference`
- `bodyChartReference`
- `dentalChartReference`

## Değişmez Kurallar

- PDF field name kullanıcıya gösterilmez.
- Export binding canonical field kaydında kalır.
- Checkbox export için button state bilgisi korunur.
- Widget instance kimliği sayfa ve sayfa içi sıra ile doğrulanır.
- Runtime uygulama dili yalnızca Türkçedir.
