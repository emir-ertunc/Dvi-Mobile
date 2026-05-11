# Phase 4I-A - Görevli-Dostu Alan Etiketi ve Yardım Metni

## Amaç

Phase 4I-A, alan kartlarını belgeyi hiç bilmeyen saha kullanıcısı için daha anlaşılır hale getirir. Kısa PDF label kaynakları ve teknik seri metinleri artık daha açık Türkçe görev, kişi, kurum, tarih, adres, bulgu ve uzmanlık bağlamıyla gösterilir.

## İzlenen Teknik Plan

- UI label üreticiye görevli-dostu Türkçe çeviri sözlüğü genişletmesi eklendi.
- AM/PM PDF alan serileri için bağlamsal açıklama haritası eklendi.
- `by` alanları `İşlemi yapan görevli veya memur` gibi açık role çevrildi.
- Teknik label bulunmayan alanlarda bölüm ve seri bağlamından açıklayıcı yardım metni üretilir.
- Alan kartlarına `Ne doldurulacak?` başlığı eklendi.
- Boş metin placeholder'ı `İstenen bilgiyi yazın` olarak sadeleştirildi.
- Teknik bağlantı metni kullanıcı-dostu `Resmi form eşleşmesi` diline çekildi.
- Build bilgisi `0.4.13 / Faz 4I-A` olarak güncellendi.

## Değişen Alanlar

- Label üretimi: `scripts/build_ui_labels.js`
- Alan kartı UI metni: `src/components/FormFieldControl.tsx`
- Ana plan: `docs/project-plan.md`
- Build bilgisi: `src/config/buildInfo.ts`, `app.json`, `package.json`
- APK workflow: `.github/workflows/phase-4i-a-apk.yml`
- Doğrulama scriptleri: `scripts/verify_form_renderer.js`, `scripts/verify_draft_storage_contract.js`, `scripts/audit_ui_coverage.js`

## Doğrulama Beklentisi

- TypeScript typecheck geçmelidir.
- Türkçe kullanıcı metni kontrolü geçmelidir.
- Label üretimi 3380 alan için geçmelidir.
- UI coverage 3380 field / 4032 widget kapsamını korumalıdır.
- APK adı `DviMobile-phase-4i-a-v0.4.13-20260511.apk` olmalıdır.

## Bilinen Sınırlamalar

- Bu faz tüm alanları elle redakte etmez; otomatik bağlamlandırmayı belirgin şekilde iyileştirir.
- 3120 alan hâlâ audit düzeyinde insan terminoloji kontrolü isteyebilir, ancak runtime metinleri artık daha anlaşılır bağlam üretir.
- PDF export motoru başlatılmamıştır; Phase 5 için onay beklenir.
