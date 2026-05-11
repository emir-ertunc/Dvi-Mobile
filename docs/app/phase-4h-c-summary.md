# Phase 4H-C - Formlar Ekranı: Doğrudan Yeni AM/PM Başlatma

## Amaç

Phase 4H-C, `Formlar` ekranını gereksiz ara seçimlerden arındırır. Kullanıcı artık AM veya PM kayıt türünü seçtiğinde yeni taslak oluşturulur, aktif taslak olarak atanır ve doğrudan `Form` ekranı açılır.

## İzlenen Teknik Plan

- `Formlar` ekranındaki eski form seçici ve ikinci seviye yeni taslak butonları kaldırıldı.
- `Ölüm Öncesi Kaydı Başlat` ve `Ölüm Sonrası Kaydı Başlat` kartları eklendi.
- Yeni kayıt kartı seçildiğinde `createDraft` çağrılır ve başarılı sonuçta kullanıcı `Form` sekmesine yönlendirilir.
- `useLocalDrafts.createDraft` oluşturulan taslak id'sini dönecek şekilde güçlendirildi.
- Kayıtlı taslak yönetimi `Kayıtlı` ekranında kalmaya devam eder.
- Build bilgisi `0.4.11 / Faz 4H-C` olarak güncellendi.

## Değişen Alanlar

- Yeni form başlatma akışı: `App.tsx`
- Taslak oluşturma API'si: `src/hooks/useLocalDrafts.ts`
- Build bilgisi: `src/config/buildInfo.ts`, `app.json`, `package.json`
- APK workflow: `.github/workflows/phase-4h-c-apk.yml`
- Doğrulama scriptleri: `scripts/verify_form_renderer.js`, `scripts/verify_draft_storage_contract.js`, `scripts/audit_ui_coverage.js`, `scripts/build_ui_labels.js`

## Doğrulama Beklentisi

- AM kartı yeni AM taslağı oluşturup `Form` ekranına geçmelidir.
- PM kartı yeni PM taslağı oluşturup `Form` ekranına geçmelidir.
- `Formlar` ekranında eski `Yeni AM taslağı` ve `Yeni PM taslağı` butonları kalmamalıdır.
- TypeScript typecheck, Türkçe metin kontrolü, form renderer doğrulaması, draft storage doğrulaması ve UI coverage doğrulaması geçmelidir.
- APK adı `DviMobile-phase-4h-c-v0.4.11-20260511.apk` olmalıdır.

## Bilinen Sınırlamalar

- Aktif form ekranındaki üst bağlam, tamamlanma yüzdesi ve görünür temel aksiyon cilası Phase 4H-D kapsamındadır.
