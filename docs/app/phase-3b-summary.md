# Phase 3B Özeti: Yerel Taslak Saklama

Phase 3B, uygulama kabuğuna cihazda kalıcı AM/PM taslak saklama temelini ekler.

## Üretilen ve Güncellenen Dosyalar

- `src/storage/draftStore.ts`
- `src/hooks/useLocalDrafts.ts`
- `scripts/verify_draft_storage_contract.js`
- `App.tsx`
- `src/data/dashboard.ts`
- `.github/workflows/phase-3b-apk.yml`

## Uygulama Kapsamı

- AM ve PM için ayrı yeni taslak oluşturma aksiyonları eklendi.
- Taslak üst veri kayıtları cihaz depolamasında kalıcı tutulur.
- Uygulama açıldığında yerel taslak listesi yeniden okunur.
- Taslaklar form türüne göre listelenir.
- Taslak silme aksiyonu eklendi.
- Sistem ekranı AM/PM yerel taslak sayılarını gösterir.

## Faz Sınırı

Bu faz tam form düzenleme ekranı, alan bazlı veri girişi, PDF export ve matching motorunu başlatmaz. Taslak içinde resmi alan değerlerinin düzenlenmesi Phase 3C ve Phase 4 alt fazlarında ilerletilecektir.

## Test Edilebilirlik Notu

Phase 3B sonunda APK açılarak temel navigasyon ve yerel taslak oluşturma/silme davranışı test edilebilir. Daha anlamlı kayıt yaşam döngüsü testi Phase 3C sonunda beklenir.

## Doğrulama

- TypeScript kontrolü geçmelidir.
- Türkçe kullanıcı arayüzü metin kontrolü geçmelidir.
- Yerel taslak saklama sözleşmesi doğrulanmalıdır.
- Önceki forensics, inventory, schema ve coverage kapıları korunmalıdır.
- GitHub Actions `Phase 3B APK` artifact üretmelidir.
