# Phase 4G-A - Kritik Aksiyon Kullanılabilirliği

## Amaç

Phase 4G-A, Phase 4A-4F boyunca coverage odaklı kurulan UI'nin ilk kullanılabilirlik açığını kapatır. Silme onayı artık uzun form akışının sonunda inline panel olarak kalmaz; kullanıcı hangi noktadaysa aynı ekranın üzerinde modal olarak görünür.

## Değişen Alanlar

- `App.tsx`
  - Silme onayı React Native `Modal` bileşenine taşındı.
  - Modal panel `accessibilityRole="alert"` ile işaretlendi.
  - Operasyon özeti metni Faz 4G-A kapsamına güncellendi.
- `docs/project-plan.md`
  - Phase 4G eklendi.
  - Phase 4G-A, Phase 4G-B ve Phase 4G-C alt fazları ayrıntılı planlandı.
- `scripts/verify_form_renderer.js`
  - Modal silme onayı sözleşmesi kalite kapısına eklendi.
- `README.md`, `src/config/buildInfo.ts`, `src/data/dashboard.ts`
  - Faz, sürüm ve görünür kapsam metinleri güncellendi.

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
- `npm run ui:coverage:verify`

## Sürüm

- Uygulama sürümü: `0.4.6`
- Faz: `Faz 4G-A`
- Derleme kimliği: `phase-4g-a-v0.4.6-20260511`
- Android versionCode: `23`
- APK adı: `DviMobile-phase-4g-a-v0.4.6-20260511.apk`

## Bilinen Sınırlar

- Alan etiketleri bu alt fazda iyileştirilmedi; Phase 4G-B kapsamına alındı.
- Uzun form navigasyonu ve sticky action bar bu alt fazda yapılmadı; Phase 4G-C kapsamına alındı.
- PDF export ve matching kapsam dışıdır.
