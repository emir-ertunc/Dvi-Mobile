# Phase 4G-C - Uzun Form Ergonomisi ve Mobil İş Akışı

## Amaç

Phase 4G-C, AM/PM formlarındaki uzun alan listelerinin mobilde daha yönetilebilir olmasını sağlar. Bu faz veri kapsamını değiştirmez; mevcut 3380 alanın içinde arama, durum filtresi ve bölüm ilerleme takibi ekler.

## Değişen Alanlar

- `src/components/FormWorkspace.tsx`
  - Aktif bölüm için alan arama eklendi.
  - `Tümü`, `Boş`, `Dolu`, `Uyarı` filtreleri eklendi.
  - Bölüm doluluk sayacı ve ilerleme çubuğu eklendi.
  - Filtre sonucu sayısı ve boş/dolu özetleri eklendi.
  - Eşleşen alan yok durumunda kullanıcıya Türkçe boş sonuç paneli gösterilir.
- `scripts/audit_ui_coverage.js`
  - Arama, filtre ve bölüm ilerleme sözleşmeleri UI coverage kapısına eklendi.
- `scripts/verify_form_renderer.js`
  - Uzun form ergonomisi bileşenlerinin renderer doğrulamasına dahil edilmesi sağlandı.
- `README.md`, `App.tsx`, `src/data/dashboard.ts`, `src/config/buildInfo.ts`
  - Faz ve kullanıcıya görünen kapsam metinleri `Faz 4G-C` ile hizalandı.

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
- `npm run ui:labels:verify`
- `npm run ui:coverage:verify`

## Sürüm

- Uygulama sürümü: `0.4.8`
- Faz: `Faz 4G-C`
- Derleme kimliği: `phase-4g-c-v0.4.8-20260511`
- Android versionCode: `25`
- APK adı: `DviMobile-phase-4g-c-v0.4.8-20260511.apk`

## Bilinen Sınırlar

- Bu faz bölüm içi ergonomiyi iyileştirir; tüm form için global arama ve sticky bottom action bar daha sonraki UI sertleştirme işlerinde genişletilebilir.
- Alan etiketlerinin 3120 tanesi otomatik gözden geçirme işaretini korur.
- PDF export ve matching kapsam dışıdır.
