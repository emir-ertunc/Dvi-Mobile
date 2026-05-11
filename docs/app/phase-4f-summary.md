# Phase 4F - UI Coverage

## Amaç

Phase 4F, AM ve PM canonical schema bölümlerinin uygulamadaki form gezgini ve alan kontrol katmanı üzerinden eksiksiz erişilebilir olduğunu build kapısına bağlar. Bu faz yeni veri alanı eklemez; Phase 4A-4E arasında açılan veri giriş kapsamını denetlenebilir hale getirir.

## Değişen Alanlar

- `scripts/audit_ui_coverage.js`
  - AM/PM schema bölümlerini `FormWorkspace` içindeki editable section setleriyle karşılaştırır.
  - UI field ve widget toplamlarını canonical schema toplamlarıyla doğrular.
  - Form gezgini, checkbox, metin girişi, keyboard type, date maxLength ve validasyon sözleşmelerini kaynak kod üzerinden denetler.
- `data/ui-coverage/ui-coverage-audit.json`
  - Makine-okur UI coverage raporudur.
- `docs/app/phase-4f-ui-coverage-matrix.md`
  - İnsan-okur AM/PM bölüm coverage matrisidir.
- `src/components/FormFieldControl.tsx`
  - Checkbox kontrollerine alan label'ı üzerinden erişilebilirlik etiketi eklendi.
- `src/components/FormSectionNavigator.tsx`
  - Bölüm düğmelerine erişilebilirlik etiketi ve seçili durum bilgisi eklendi.
- `src/config/diagnostics.ts`, `src/data/dashboard.ts`, `App.tsx`, `README.md`
  - Faz durumu, kalite kapısı ve kullanıcıya görünen kapsam metinleri Phase 4F ile hizalandı.

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

- Uygulama sürümü: `0.4.5`
- Faz: `Faz 4F`
- Derleme kimliği: `phase-4f-v0.4.5-20260511`
- Android versionCode: `22`
- APK adı: `DviMobile-phase-4f-v0.4.5-20260511.apk`

## Bilinen Sınırlar

- Bu faz UI coverage kapısı ekler; PDF export ve matching kapsam dışıdır.
- Alan etiketleri hâlâ canonical envanterden türeyen geçici Türkçe label standardını kullanır.
- Erişilebilirlik denetimi kaynak kod sözleşmesi seviyesindedir; cihaz üstünde ekran okuyucu testi ayrıca yapılmalıdır.
