# Phase 4H-A - Navigasyon Yeniden Tasarımı ve Plan Güncellemesi

## Amaç

Phase 4H-A, Phase 5 PDF export öncesinde uygulamanın üst seviye navigasyonunu saha kullanımına daha yakın hale getirir. Eski `Genel` ve `Akış` sekmeleri birincil navigasyondan kaldırıldı; kayıtlı taslaklar, yeni form başlatma, aktif form düzenleme, durum ve sistem tanılaması ayrı başlıklara ayrıldı.

## İzlenen Teknik Plan

- Ana plan dosyasına Phase 4H ara fazları eklendi.
- Route sözleşmesi `Kayıtlı`, `Formlar`, `Form`, `Durum`, `Sistem` düzenine taşındı.
- Üst sekme bileşeni yatay kaydırmalı hale getirildi.
- Eski genel özet ve faz ilerleme bilgisi `Durum` ekranında birleştirildi.
- Aktif form ve kayıtlı taslaklar için ilk ayrıştırılmış ekran kabukları eklendi.
- Build bilgisi `0.4.9 / Faz 4H-A` olarak güncellendi.

## Değişen Alanlar

- Navigasyon: `src/navigation/appRoutes.ts`
- Üst sekme bileşeni: `src/components/RouteTabs.tsx`
- Uygulama ekran dağılımı: `App.tsx`
- Build bilgisi: `src/config/buildInfo.ts`, `app.json`, `package.json`
- Ana plan: `docs/project-plan.md`
- APK workflow: `.github/workflows/phase-4h-a-apk.yml`
- Doğrulama scriptleri: `scripts/verify_form_renderer.js`, `scripts/audit_ui_coverage.js`, `scripts/build_ui_labels.js`

## Doğrulama Beklentisi

- TypeScript typecheck geçmeli.
- Türkçe kullanıcı metni kontrolü geçmeli.
- Form renderer doğrulaması yeni navigasyon sözleşmesini denetlemeli.
- UI coverage önceki 3380 field / 4032 widget kapsamını korumalı.
- APK adı `DviMobile-phase-4h-a-v0.4.9-20260511.apk` olmalı.

## Bilinen Sınırlamalar

- Kayıtlı taslaklar ekranı bu fazda yalnızca ilk ayrıştırılmış yüzeyi sağlar; tam arama, AM/PM/Tümü filtresi ve tüm aksiyon düzeni Phase 4H-B kapsamındadır.
- Formlar ekranındaki eski yeni taslak akışı Phase 4H-C içinde sadeleştirilecektir.
- Aktif form ekranının üst bağlam ve mobil aksiyon cilası Phase 4H-D içinde tamamlanacaktır.
