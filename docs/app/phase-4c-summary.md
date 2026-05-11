# Phase 4C - AM Klinik ve Destek Blokları

## Amaç

Phase 4C, AM formunda Phase 4B dışında kalan klinik ve destek bloklarını yerel taslak değerlerine bağlar. Bu kapsam AM 300, 400, 500, 600, 700, 800 serileri ve `am.other` bölümünü içerir. PM formu bu fazda düzenlenebilir hale getirilmez.

## Değişen Alanlar

- `src/components/FormWorkspace.tsx`
  - AM 300 kişisel eşya ve etkiler bölümü düzenlenebilir hale geldi.
  - AM 400 fiziksel tanım ve ayırt edici özellikler bölümü düzenlenebilir hale geldi.
  - AM 500 tıbbi bilgiler bölümü düzenlenebilir hale geldi.
  - AM 600 odontoloji bölümü düzenlenebilir hale geldi.
  - AM 700 destek bilgileri bölümü düzenlenebilir hale geldi.
  - AM 800 ekler, temas ve imza bilgileri bölümü düzenlenebilir hale geldi.
  - AM diğer alanı düzenlenebilir kapsamına alındı.
- `src/components/FormFieldControl.tsx`
  - Alan kontrolleri validation core ile bağlandı.
  - Sayı alanları numeric inputtan number değerine normalize edilir.
  - Tarih parçası alanlarında gün/ay/yıl uzunluk sınırı uygulanır.
  - Hatalı değerlerde Türkçe validasyon mesajı gösterilir.
- `scripts/verify_form_renderer.js`
  - Phase 4C AM editable bölüm kapsamı ve validasyon bağlantısı kalite kapısına eklendi.

## Doğrulama

Çalıştırılan kalite kapıları:

- `npm run typecheck`
- `npm run text:verify-tr`
- `npm run rebaseline:verify`
- `npm run forensics:verify`
- `npm run inventory:am:verify`
- `npm run inventory:pm:verify`
- `npm run inventory:audit:verify`
- `npm run schema:primitives:verify`
- `npm run schema:am:verify`
- `npm run schema:pm:verify`
- `npm run schema:coverage:verify`
- `npm run drafts:storage:verify`
- `npm run forms:renderer:verify`

## Sürüm

- Uygulama sürümü: `0.4.2`
- Faz: `Faz 4C`
- Derleme kimliği: `phase-4c-v0.4.2-20260511`
- Android versionCode: `19`
- APK adı: `DviMobile-phase-4c-v0.4.2-20260511.apk`

## Bilinen Sınırlar

- PM formu bu fazda kilitli kalır.
- PDF export ve matching bu fazın kapsamı dışındadır.
- AM alan etiketleri hâlâ canonical envanterdeki geçici Türkçe label standardını kullanır; daha iyi insan-okur label iyileştirmesi ayrı UI metin fazında yapılmalıdır.
