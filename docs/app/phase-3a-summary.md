# Phase 3A Özeti: App Shell, Navigasyon ve Dashboard

Phase 3A, uygulamayı tek faz durumu ekranından çıkarıp Türkçe, çok ekranlı ve ileride offline kayıt yaşam döngüsünü taşıyabilecek bir mobil kabuğa dönüştürür.

## Üretilen ve Güncellenen Dosyalar

- `App.tsx`
- `src/navigation/appRoutes.ts`
- `src/data/dashboard.ts`
- `src/components/RouteTabs.tsx`
- `src/components/MetricTile.tsx`
- `src/config/buildInfo.ts`
- `.github/workflows/phase-3a-apk.yml`

## Uygulama Kapsamı

- Genel Bakış ekranı, AM/PM kapsam metriklerini ve operasyon durumunu gösterir.
- Formlar ekranı, AM ve PM iş akışlarını ayrı seçimlerle gösterir.
- İş Akışı ekranı, tamamlanan ve bekleyen faz kapılarını sıralar.
- Sistem ekranı, uygulama içinde görünür build kimliği ve kalite kapılarını gösterir.
- Navigasyon state tabanlıdır ve ek bağımlılık getirmez.

## Faz Sınırı

Bu faz local draft persistence, veri giriş ekranları, PDF export ve matching motorunu başlatmaz. Form ekranındaki taslak oluşturma bilgisi Phase 3B için bilinçli bekleme durumudur.

## Doğrulama

- TypeScript kontrolü geçmelidir.
- Türkçe kullanıcı arayüzü metin kontrolü geçmelidir.
- Rebaseline, forensics, inventory, schema ve coverage kapıları korunmalıdır.
- Expo Android prebuild çalışmalıdır.
- GitHub Actions `Phase 3A APK` artifact üretmelidir.
