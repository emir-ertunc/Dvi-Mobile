# Phase 4A - Ortak Form Renderer ve Bölüm Gezgini

## Amaç

Phase 4A, AM ve PM canonical schema dosyalarını uygulama içinde ortak bir form gezginiyle görünür hale getirir. Bu faz gerçek alan değerlerini kalıcı olarak saklamaz; sonraki AM/PM alan grubu fazlarının aynı renderer üzerinde ilerleyebilmesi için bölüm navigasyonu, alan kontrol tipi iskeleti ve doğrulama kapısını kurar.

## Değişen Alanlar

- `src/data/formSchemaCatalog.ts`
  - AM/PM schema JSON dosyalarını uygulama tarafında okunabilir katalog haline getirir.
  - Bölüm listesi, alan sayısı, widget sayısı ve sayfa özeti üretir.
- `src/components/FormWorkspace.tsx`
  - Seçili taslak için AM/PM form çalışma alanını açar.
  - Resmi alan, PDF bileşeni ve bölüm sayılarını gösterir.
  - Aktif bölümü ve önceki/sonraki bölüm geçişlerini yönetir.
- `src/components/FormSectionNavigator.tsx`
  - Bölüm kartlarını yatay gezilebilir şekilde gösterir.
  - Her bölüm için alan, bileşen ve sayfa kapsamını görünür yapar.
- `src/components/FormFieldControl.tsx`
  - Schema primitive türlerine göre Türkçe kontrol iskeleti üretir.
  - Metin, telefon, e-posta, sayı, tarih parçası ve seçim kutusu görünümlerini ayırır.
- `App.tsx`
  - Taslak detay paneline ortak form workspace bağlandı.
- `scripts/verify_form_renderer.js`
  - Renderer dosyalarının ve schema sayı sözleşmesinin varlığını denetler.
- `.github/workflows/phase-4a-apk.yml`
  - APK artifact adı ve kalite kapıları Phase 4A için güncellendi.

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

- Uygulama sürümü: `0.4.0`
- Faz: `Faz 4A`
- Derleme kimliği: `phase-4a-v0.4.0-20260511`
- Android versionCode: `17`
- APK adı: `DviMobile-phase-4a-v0.4.0-20260511.apk`

## Bilinen Sınırlar

- Alan değerlerinin kalıcı kaydı bu fazda bağlanmadı.
- AM/PM alanlarının bölüm bazlı gerçek düzenleme deneyimi Phase 4B ve sonrası için bırakıldı.
- PDF export, matching ve field-level completion hesaplaması bu fazın kapsamı dışındadır.
