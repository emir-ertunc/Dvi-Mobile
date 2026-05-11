# Phase 4B - AM Kimlik, Olay, Kişi, İletişim ve Genel Bilgiler

## Amaç

Phase 4B, AM formunun genel bilgi kapsamındaki bölümlerini salt-okunur iskeletten çıkarıp yerel taslak değerlerine bağlar. Kapsam AM header, sayfa kontrol listesi, 100 serisi kayıt/başvuru ve 200 serisi kayıp kişi alanlarıdır.

## Değişen Alanlar

- `src/storage/draftStore.ts`
  - Taslaklara `fieldValues` sözleşmesi eklendi.
  - Saklama sürümü `3` oldu.
  - Eski taslaklar boş `fieldValues` ile migrate edilir.
  - `savedFieldCount` ve `completionPercent` gerçek kayıtlı alan değerlerinden hesaplanır.
  - `updateDraftFieldValue` ile alan değeri çevrimdışı saklanır.
- `src/hooks/useLocalDrafts.ts`
  - Alan değeri güncelleme akışı hook üzerinden uygulamaya açıldı.
- `src/components/FormWorkspace.tsx`
  - AM genel bilgi bölümleri düzenlenebilir hale getirildi.
  - Diğer bölümler sonraki alt fazlara kadar kilitli görünür.
- `src/components/FormFieldControl.tsx`
  - Metin, e-posta, telefon, sayı, tarih parçası ve checkbox kontrolleri gerçek state ile çalışır.
- `scripts/verify_draft_storage_contract.js`
  - Yeni field value storage sözleşmesi denetime eklendi.
- `scripts/verify_form_renderer.js`
  - Phase 4B AM editable bölüm kapsamı denetime eklendi.

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

- Uygulama sürümü: `0.4.1`
- Faz: `Faz 4B`
- Derleme kimliği: `phase-4b-v0.4.1-20260511`
- Android versionCode: `18`
- APK adı: `DviMobile-phase-4b-v0.4.1-20260511.apk`

## Bilinen Sınırlar

- AM 300 ve sonrası bu fazda kilitli kalır.
- PM alanları bu fazda düzenlenebilir değildir.
- PDF export, matching ve tam completion/readiness iş kuralları bu fazın kapsamı dışındadır.
