# PDF Aktarım Adaptörü Politikası

## Karar

PDF aktarım hattı fillable INTERPOL DVI formlarındaki alan adlarını temel alacaktır. Uygulama alan modeli Türkçe kullanıcı deneyiminden sorumludur; PDF alan adları ise şablon bağlama ayrıntısı olarak kalır.

## İlkeler

- Canonical alan kimliği uygulama içinde stabil kalır.
- PDF field name ve button state değerleri export binding dosyalarında tutulur.
- Türkçe ekran etiketi canonical alan kimliğine bağlanır, PDF field name doğrudan kullanıcıya gösterilmez.
- Metin çizim koordinatları yalnızca zorunlu durumlarda fallback olarak kullanılabilir.
- Export deterministik, nonblank, checkbox state açısından doğru ve flatten sonrası okunabilir olmalıdır.

## Sonraki Faz Bağımlılığı

Phase 1A içinde fillable PDF forensics çıktısı üretilecek. Phase 1B ve Phase 1C içinde her widget canonical inventory kararına bağlanmadan schema veya export fazına geçilmeyecektir.
