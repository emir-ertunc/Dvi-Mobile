# Phase 5A-Fix7 Özeti

## Tamamlanan iş

Bu ara düzeltme, form giriş ekranlarında kullanıcıdan istenmemesi gereken teknik AcroForm alanlarını gizler. `A/B/C` suffix'li seçim alanları ve `302/304/306` suffix'li devam kutuları uygulamadaki doldurma akışından çıkarıldı.

## Teknik karar

- Canonical schema, inventory ve AcroForm export binding kapsamı korunur.
- Gizlenen alanlar PDF sözleşmesinde kalır; veri boşsa export aşamasında boş bırakılır.
- Kullanıcıdan "veri mevcut değil", "ek belge" veya "devamı" gibi ayrı seçenekler istenmez.
- Tek bir veri girişi için ikinci bir devam kutusu açılmaz.

## Değişen alanlar

- Görünür AM giriş alanı: `1243`
- Görünür PM giriş alanı: `1246`
- Toplam görünür giriş alanı: `2489`
- UI'dan gizlenen teknik/devam alanı: `891`
- Toplam schema kapsamı: `3380` field / `4032` PDF widget

## Doğrulama

- TypeScript kontrolü
- Türkçe kullanıcı metni kontrolü
- Form renderer sözleşmesi
- Form veri girişi sözleşmesi
- Görünür form girişi sözleşmesi
- UI label coverage
- UI coverage
- Alan sözleşmesi
- Schema, inventory, PDF template ve draft storage doğrulamaları

## Build

- Uygulama sürümü: `0.5.7`
- Faz: `Faz 5A-Fix7`
- Build kimliği: `phase-5a-fix7-v0.5.7-20260512`
- Android versionCode: `38`
- APK adı: `DviMobile-phase-5a-fix7-v0.5.7-20260512.apk`
