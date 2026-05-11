# Phase 3C Özeti: AM/PM Taslak Yaşam Döngüsü

Phase 3C, Phase 3B’de eklenen yerel taslak saklama temelini tam AM/PM taslak yaşam döngüsüne genişletir.

## Üretilen ve Güncellenen Dosyalar

- `App.tsx`
- `src/storage/draftStore.ts`
- `src/hooks/useLocalDrafts.ts`
- `src/data/dashboard.ts`
- `scripts/verify_draft_storage_contract.js`
- `.github/workflows/phase-3c-apk.yml`

## Uygulama Kapsamı

- AM ve PM taslakları oluşturulabilir.
- Taslak seçilebilir ve aktif taslak olarak dashboard üzerinde görünür.
- Taslağa devam etme işlemi son açılış zamanını ve sürüm sayacını günceller.
- Taslak başlığı düzenlenebilir.
- Taslak kopyalanabilir.
- Taslak silme açık onay gerektirir.
- Eski Phase 3B taslak kayıtları yeni `lastOpenedAt` ve `revision` alanlarına uyarlanır.

## Faz Sınırı

Bu faz tam resmi alan düzenleme ekranlarını, alan değerlerinin kaydedilmesini, PDF export ve matching motorunu başlatmaz. Taslak içindeki gerçek resmi alan değerleri Phase 4 alt fazlarında bağlanacaktır.

## Doğrulama

- TypeScript kontrolü geçmelidir.
- Türkçe kullanıcı arayüzü metin kontrolü geçmelidir.
- Yerel taslak saklama ve yaşam döngüsü sözleşmesi doğrulanmalıdır.
- Önceki forensics, inventory, schema ve coverage kapıları korunmalıdır.
- Expo Android prebuild çalışmalıdır.
- GitHub Actions `Phase 3C APK` artifact üretmelidir.
