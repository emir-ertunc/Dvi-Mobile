# Phase 4H-B - Kayıtlı Taslaklar Ekranı

## Amaç

Phase 4H-B, kayıtlı AM/PM taslaklarını `Formlar` ekranından ayırır ve `Kayıtlı` ekranını gerçek taslak yönetim yüzeyi haline getirir. Kullanıcı artık mevcut kayıtları bu ekranda arar, filtreler, devam eder, kopyalar veya siler.

## İzlenen Teknik Plan

- `Kayıtlı` ekranına AM/PM/Tümü filtresi eklendi.
- Taslak başlığı, türü ve tarih bilgisi üzerinden arama eklendi.
- Taslak satırları `Devam`, `Kopyala` ve `Sil` aksiyonlarıyla tek yerde toplandı.
- `Devam` aksiyonu aktif taslağı seçip kullanıcıyı `Form` sekmesine yönlendirir.
- Boş liste ve eşleşmeyen arama durumları ayrı gösterilir.
- `Formlar` ekranından kalıcı taslak listesi ve aktif taslak editörü kaldırıldı.
- Build bilgisi `0.4.10 / Faz 4H-B` olarak güncellendi.

## Değişen Alanlar

- Uygulama ekran dağılımı ve taslak listesi: `App.tsx`
- Build bilgisi: `src/config/buildInfo.ts`, `app.json`, `package.json`
- APK workflow: `.github/workflows/phase-4h-b-apk.yml`
- Doğrulama scriptleri: `scripts/verify_form_renderer.js`, `scripts/audit_ui_coverage.js`, `scripts/build_ui_labels.js`

## Doğrulama Beklentisi

- TypeScript typecheck geçmeli.
- Türkçe kullanıcı metni kontrolü geçmeli.
- Form renderer doğrulaması yeni kayıtlı taslak ekranı sözleşmesini denetlemeli.
- UI coverage önceki 3380 field / 4032 widget kapsamını korumalı.
- APK adı `DviMobile-phase-4h-b-v0.4.10-20260511.apk` olmalı.

## Bilinen Sınırlamalar

- `Formlar` ekranındaki yeni AM/PM başlatma akışı bu fazda korunur; doğrudan form açma sadeleştirmesi Phase 4H-C kapsamındadır.
- Aktif form ekranında üst bağlam ve görünür temel aksiyon cilası Phase 4H-D içinde tamamlanacaktır.
