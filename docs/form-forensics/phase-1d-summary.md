# Phase 1D Özeti: AM/PM Coverage ve Envanter Denetimi

Phase 1D, Phase 1B ve Phase 1C içinde çıkarılan AM/PM envanterlerinin Phase 2 için güvenilir kaynak olmasını sağlamak üzere denetim kurallarını sertleştirir.

## Çıktılar

- `scripts/inventory_audit.js`
- `data/form-inventory/inventory-audit.json`
- `docs/form-forensics/phase-1d-inventory-audit.md`
- Güncellenmiş envanter doğrulama komutu
- Uygulama içi build göstergesi: `Faz 1D / 0.1.3 / phase-1d-v0.1.3-20260510`

## Sertleştirilen Kontroller

- AM ve PM sayfa kodları, sayfa sayıları ve sıraları denetlenir.
- `canonicalFieldId` önekleri, tekrarları ve kritik alan kimlikleri denetlenir.
- Tekrar eden tablo/odontogram/diyagram alt alanlarındaki `fieldId` kullanımı relative kimlik olarak sayılır.
- Checkbox/radio seçeneklerinde `optionId` ve `label` zorunludur; aynı grup içinde tekrar eden `optionId` reddedilir.
- Ortak header/footer/kanıt durumu bloklarında sayfa kapsamı ve runtime kimlik kalıbı zorunludur.
- Tarih, sayı, iletişim, imza, diyagram, odontogram ve tablo alan tiplerinin varlığı denetlenir.

## Sonuç

AM ve PM envanterleri Phase 2 şema ve validasyon çekirdeği için denetlenmiş kaynak olarak kullanılabilir.
