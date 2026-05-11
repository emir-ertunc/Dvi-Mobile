# Phase 4E - PM Uzmanlık Blokları

## Amaç

Phase 4E, PM formunda Phase 4D sonunda kapalı kalan destek, DNA, ek, imza, iletişim ve diğer uzmanlık alanlarını yerel taslak değerlerine bağlar. Bu faz sonunda AM ve PM tarafındaki bütün envanter bölümleri form gezgini üzerinden düzenlenebilir durumdadır.

## Değişen Alanlar

- `src/components/FormWorkspace.tsx`
  - PM editable kapsamı `pm.700.destek`, `pm.800.dna-ekler-imza` ve `pm.other` bölümlerini içerecek şekilde genişletildi.
  - PM çalışma alanı metni destek, DNA, ek ve imza bloklarını kapsayacak şekilde güncellendi.
- `scripts/verify_form_renderer.js`
  - PM 700, PM 800 ve PM other bölümlerinin düzenlenebilir kapsamda yer alması kalite kapısına eklendi.
- `src/data/dashboard.ts`, `App.tsx`, `README.md`
  - Faz durumu ve kullanıcıya görünen kapsam metinleri Phase 4E'ye güncellendi.
- `.github/workflows/phase-4e-apk.yml`
  - APK artifact adı Phase 4E sürümüyle hizalandı.

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

- Uygulama sürümü: `0.4.4`
- Faz: `Faz 4E`
- Derleme kimliği: `phase-4e-v0.4.4-20260511`
- Android versionCode: `21`
- APK adı: `DviMobile-phase-4e-v0.4.4-20260511.apk`

## Bilinen Sınırlar

- PDF export ve matching bu fazın kapsamı dışındadır.
- PM alan etiketleri canonical envanterden türeyen geçici Türkçe label standardını kullanır; insan-okur label iyileştirmesi ayrı UI metin fazında yapılmalıdır.
- Bu faz veri giriş kapsamını açar; export field binding doğruluğu Phase 5 altında test edilecektir.
