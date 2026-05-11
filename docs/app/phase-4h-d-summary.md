# Phase 4H-D - Aktif Form Çalışma Alanı ve Mobil Kullanım Cilası

## Amaç

Phase 4H-D, `Form` ekranını seçili taslağın net ve okunabilir çalışma alanı haline getirir. Kullanıcı artık aktif AM/PM kayıt türünü, taslak başlığını, tamamlanma yüzdesini, aktif bölümü, kaydedilen alan sayısını ve son kayıt zamanını formun üstünde görür.

## İzlenen Teknik Plan

- Aktif form üst paneli yeniden düzenlendi.
- AM/PM türü, taslak adı, son kayıt zamanı, tamamlanma yüzdesi, aktif bölüm ve kaydedilen alan sayısı üst bağlama taşındı.
- `FormWorkspace` aktif bölüm başlığını dışarı bildirecek şekilde genişletildi.
- `Formu kapat` aksiyonu üst aksiyon alanında görünür hale getirildi.
- Eski açıklayıcı doğrulama metni kaldırıldı; ekran daha doğrudan kayıt düzenleme bağlamına çekildi.
- Build bilgisi `0.4.12 / Faz 4H-D` olarak güncellendi.

## Değişen Alanlar

- Aktif form çalışma alanı: `App.tsx`
- Aktif bölüm bildirim sözleşmesi: `src/components/FormWorkspace.tsx`
- Build bilgisi: `src/config/buildInfo.ts`, `app.json`, `package.json`
- APK workflow: `.github/workflows/phase-4h-d-apk.yml`
- Doğrulama scriptleri: `scripts/verify_form_renderer.js`, `scripts/verify_draft_storage_contract.js`, `scripts/audit_ui_coverage.js`, `scripts/build_ui_labels.js`

## Doğrulama Beklentisi

- Aktif taslak yokken kullanıcı `Kayıtlı` veya `Formlar` ekranına yönlendirilebilir.
- Aktif taslak açıldığında AM/PM türü, taslak başlığı, tamamlanma yüzdesi, aktif bölüm ve son kayıt zamanı görünür.
- `Formu kapat` aksiyonu formun üstünde erişilebilir olur.
- TypeScript typecheck, Türkçe metin kontrolü, form renderer doğrulaması, draft storage doğrulaması ve UI coverage doğrulaması geçer.
- APK adı `DviMobile-phase-4h-d-v0.4.12-20260511.apk` olmalıdır.

## Bilinen Sınırlamalar

- Form içi önceki/sonraki bölüm aksiyonları hâlâ bölüm panelinde yer alır; daha ileri sticky bottom action bar ihtiyacı Phase 5 öncesi ayrı bir UI hardening fazı olarak değerlendirilebilir.
- PDF export motoru bu fazda başlatılmamıştır; sıradaki ana çalışma Phase 5A kapsamındadır.
