# Phase 4G-B - İnsan-Okur Türkçe Label ve Yardım Metni

## Amaç

Phase 4G-B, schema içindeki teknik placeholder etiketlerini kullanıcı ekranından ayırır. PDF field name ve canonical id değerleri export/binding katmanında korunur; kullanıcıya görünen alan adı ve yardım metni ayrı Türkçe label map dosyasından gelir.

## Değişen Alanlar

- `scripts/build_ui_labels.js`
  - AM/PM schema alanları için Türkçe label/help map üretir.
  - Teknik runtime label kullanımını denetler.
  - Eksik veya otomatik üretilmiş etiketleri `needs_human_review` olarak raporlar.
- `data/ui-labels/field-ui-labels.json`
  - 3380 alan için Türkçe label/help kaydı içerir.
- `src/data/fieldUiLabels.ts`
  - Runtime label çözümleyici eklendi.
- `src/components/FormFieldControl.tsx`
  - Alan başlıkları, erişilebilirlik etiketleri ve yardım metinleri yeni label katmanından okunur.
  - PDF field name kullanıcı etiketi olmaktan çıkarıldı; yalnızca teknik bağlantı sayısı gösterilir.
- `docs/app/phase-4g-b-label-coverage.md`
  - Label coverage raporu eklendi.
- `docs/app/phase-4g-b-ui-coverage-matrix.md`
  - Faz 4G-B UI coverage matrisi eklendi.

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

- Uygulama sürümü: `0.4.7`
- Faz: `Faz 4G-B`
- Derleme kimliği: `phase-4g-b-v0.4.7-20260511`
- Android versionCode: `24`
- APK adı: `DviMobile-phase-4g-b-v0.4.7-20260511.apk`

## Bilinen Sınırlar

- 3120 alan otomatik section/type tabanlı etiketle işaretlendi ve insan gözden geçirmesi bekliyor.
- Bu faz teknik etiketleri ekrandan kaldırır; nihai adli terminoloji ve daha özel alan adları sonraki UI metin iyileştirmelerinde güçlendirilecektir.
- Uzun form ergonomisi, sticky aksiyonlar, arama ve filtreleme Phase 4G-C kapsamındadır.
- PDF export ve matching kapsam dışıdır.
