# Phase 4D - PM Recovery, Remains, Pathology, Odontology ve Bulgu Blokları

## Amaç

Phase 4D, PM formunda buluntu/kayıt, kalıntı, eşya, fiziksel tanım, tıbbi-patoloji ve odontoloji bloklarını yerel taslak değerlerine bağlar. PM 700 destek ve PM 800 DNA/ekler/imza/contact blokları Phase 4E için kilitli kalır.

## Değişen Alanlar

- `src/components/FormWorkspace.tsx`
  - AM editable kapsamı korunur.
  - PM header ve bölüm kontrol listesi düzenlenebilir hale geldi.
  - PM 100 kayıt, buluntu ve ilk inceleme bilgileri düzenlenebilir hale geldi.
  - PM 300 eşya, giysi ve bulgu bilgileri düzenlenebilir hale geldi.
  - PM 400 fiziksel tanım ve ayırt edici özellikler düzenlenebilir hale geldi.
  - PM 500 tıbbi ve patoloji bilgileri düzenlenebilir hale geldi.
  - PM 600 odontoloji bilgileri düzenlenebilir hale geldi.
  - PM 700/800 ve `pm.other` kilitli bırakıldı.
- `scripts/verify_form_renderer.js`
  - Phase 4D PM editable bölüm kapsamı kalite kapısına eklendi.
- `src/data/dashboard.ts`, `App.tsx`, `README.md`
  - Faz durumu ve kullanıcıya görünen build/kapsam metinleri Phase 4D’ye güncellendi.

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

- Uygulama sürümü: `0.4.3`
- Faz: `Faz 4D`
- Derleme kimliği: `phase-4d-v0.4.3-20260511`
- Android versionCode: `20`
- APK adı: `DviMobile-phase-4d-v0.4.3-20260511.apk`

## Bilinen Sınırlar

- PM 700 destek ve PM 800 DNA/ekler/imza/contact blokları Phase 4E’ye bırakıldı.
- PDF export ve matching bu fazın kapsamı dışındadır.
- PM alan etiketleri hâlâ canonical envanterdeki geçici Türkçe label standardını kullanır; insan-okur label iyileştirmesi ayrı UI metin fazında yapılmalıdır.
