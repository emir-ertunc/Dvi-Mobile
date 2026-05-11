# DVI Mobil Ana Proje Planı

## 1. Proje Amacı

DVI Mobil, afet kurbanı kimliklendirme süreçlerinde AM ve PM kayıtlarının mobil cihaz üzerinde çevrimdışı oluşturulmasını, saklanmasını, daha sonra sürdürülmesini, karşılaştırılmasını ve resmi PDF formlarına aktarılmasını sağlayan profesyonel bir uygulama olacaktır.

Uygulamanın hedef kullanıcısı Türkçe çalışan saha ve kurum ekipleridir. Bu nedenle uygulama çalışma zamanı, ekran metinleri, uyarılar, validasyon mesajları, menüler, build bilgileri ve açıklamalar yalnızca Türkçe olacaktır.

Resmi PDF aktarımı için kaynak şablonlar 2018 INTERPOL fillable DVI formlarıdır:

- AM kaynak: `Ante Mortem (yellow) INTERPOL DVI form (2018, fillable) - Missing person.pdf`
- PM kaynak: `Post Mortem (pink) INTERPOL DVI form (2018, fillable) - Unidentified human remains.pdf`

Bu plan, uygulama dilini Türkçe tutarken PDF export doğruluğunu fillable form alanları üzerinden kurar.

## 2. Ana Mimari Kararlar

### 2.1 Kaynak Form Kararı

Yeni resmi kaynak fillable INTERPOL PDF dosyalarıdır. Önceki kaynaklara bağlı envanter, coverage, forensics ve script çıktıları bu fazda kaldırılır. Bundan sonra doğruluk kaynağı PDF widget alanları, field name değerleri, button state değerleri ve PDF metin katmanından çıkarılacak görünür bölüm yapısıdır.

### 2.2 Türkçe UI ve PDF Binding Ayrımı

Uygulama içinde üç ayrı alan katmanı olacaktır:

- Canonical field id: Uygulama domain modelinde stabil alan kimliği.
- Türkçe UI label: Kullanıcının gördüğü etiket, yardım metni ve hata metni.
- PDF binding: Fillable PDF field name, widget instance, page, rect ve button state bilgisi.

Bu ayrım korunmadığı takdirde export kırılgan hale gelir. Bu nedenle schema ve UI, PDF field name değerlerine doğrudan bağımlı yazılmayacaktır.

### 2.3 Faz Kapısı

Her faz veya subfaz sonunda şu kapılar tamamlanmadan sonraki faza geçilmeyecektir:

- Kod ve dokümantasyon tamamlanmış olacak.
- Doğrulama komutları çalışacak.
- Versioned APK üretilecek.
- Uygulama içinde faz, sürüm ve derleme kimliği görünecek.
- Commit alınacak.
- Branch push edilecek.
- Faz raporu verilecek.
- Sonraki faz için kullanıcı onayı beklenecek.

### 2.4 Sürümleme

Mevcut sürüm çizgisi bozulmadan devam eder:

- Phase 0R: `0.1.4`, build id `phase-0r-v0.1.4-20260510`
- Phase 1A: `0.1.5`, build id `phase-1a-v0.1.5-YYYYMMDD`
- Phase 1B: `0.1.6`
- Phase 1C: `0.1.7`
- Phase 1D: `0.1.8`

Sonraki major özellikler Phase 2 ve sonrasında `0.2.x`, `0.3.x` çizgisine taşınabilir.

## 3. Phase 0R - Rebaseline

### Hedef

Projeyi fillable INTERPOL PDF kaynaklarına göre yeniden baz almak, eski kaynak artefaktlarını kaldırmak ve sonraki fazların kararlarını yazılı hale getirmek.

### Kapsam

- Ana plan dosyasını oluştur.
- README ve mimari politika dokümanını güncelle.
- Uygulama build bilgisini `0.1.4 / Phase 0R` yap.
- Uygulama giriş ekranındaki eski faz metinlerini yeni kaynak kararına göre güncelle.
- Eski inventory, coverage, forensics ve audit dosyalarını kaldır.
- Eski PDF doğrulama ve inventory audit scriptlerini kaldır.
- Phase 0R APK workflow'unu oluştur.
- Rebaseline doğrulama scripti ekle.

### Kapsam Dışı

- AM tam alan envanteri çıkarılmayacak.
- PM tam alan envanteri çıkarılmayacak.
- Schema, validasyon, persistence, export veya matching motoru başlatılmayacak.
- Fillable PDF dosyaları repoya kopyalanmayacak.

### Çıkış Kriterleri

- Eski kaynak artefaktları repo içinde kalmayacak.
- `npm run typecheck` geçecek.
- `npm run text:verify-tr` geçecek.
- `npm run rebaseline:verify` geçecek.
- APK adı `DviMobile-phase-0r-v0.1.4-20260510.apk` olacak.
- Commit ve push tamamlanacak.

## 4. Phase 1A - Fillable PDF Forensics Scaffold

### Hedef

AM ve PM fillable PDF dosyalarının teknik yapısını makine tarafından denetlenebilir şekilde çıkarmak.

### Uygulama

Yeni PDF inspection scripti yazılacaktır. Script şu bilgileri üretir:

- source file path resolution
- SHA-256 hash
- page count
- text layer character count
- widget count
- unique field name count
- duplicate field groups
- widget type distribution
- checkbox/button states
- page-level widget counts
- alan bileşeni üst verisi

### Beklenen Teknik Gerçekler

- AM: 18 sayfa, 2006 widget, 1687 unique field name.
- PM: 19 sayfa, 2026 widget, 1693 unique field name.
- Her iki PDF text layer içerir.
- Her iki PDF fillable widget içerir.

### Çıktılar

- `data/acroform-forensics/generated/phase-1a-pdf-forensics.json`
- `data/acroform-forensics/generated/am-widget-manifest.json`
- `data/acroform-forensics/generated/pm-widget-manifest.json`
- `docs/acroform-forensics/phase-1a-summary.md`

### Doğrulama

- PDF dosyaları bulunamazsa script fail eder.
- Beklenen page/widget/field count saparsa script fail eder.
- Text layer boşsa script fail eder.
- Alan bileşeni üst verisi eksikse script hata verir.

## 5. Phase 1B - AM Tam Alan Envanteri

### Hedef

AM fillable PDF içindeki her kullanıcı alanını canonical inventory kararına bağlamak.

### Alan Sınıflandırma Standardı

Her alan kaydı en az şu bilgileri içerir:

- canonical field id
- PDF field name
- form type
- page number
- official section
- visible label
- Türkçe UI label
- control type
- value type
- required/readiness rule
- repeat group bilgisi
- dependency bilgisi
- checkbox/button state bilgisi
- export binding
- audit status

### Özel Kurallar

- Header tekrarları tek canonical alana bağlanır, widget instance listesi saklanır.
- Checkbox grupları option listesi olarak modellenir.
- Aynı field name birden fazla widget instance içeriyorsa davranış sınıflandırılır.
- Signature/contact/footer alanları kullanıcı alanı sayılır ve inventory dışında bırakılamaz.
- Görsel dental/chart alanları varsa atomik hücre veya koordinat stratejisi ayrıca işaretlenir.

### Çıktılar

- `data/form-inventory/am-acroform-inventory.json`
- `docs/acroform-forensics/am-coverage-matrix.md`
- `docs/acroform-forensics/phase-1b-summary.md`

### Doğrulama

- AM widget manifestindeki her user widget mapped veya explicitly ignored olmalı.
- Ignore edilen her widget için neden olmalı.
- Duplicate field groups açıklanmış olmalı.
- Coverage matrix sayfa bazında eksik bırakmamalı.

## 6. Phase 1C - PM Tam Alan Envanteri

### Hedef

PM fillable PDF içindeki her kullanıcı alanını canonical inventory kararına bağlamak.

### PM Özel Alanları

PM envanterinde özellikle şu bloklar eksiksiz temsil edilir:

- recovery bilgileri
- unidentified remains bilgileri
- body condition
- pathology
- odontology
- fingerprints ve supporting identifiers
- belongings
- attachments
- signature/contact/footer
- page-level repeated structures

### Çıktılar

- `data/form-inventory/pm-acroform-inventory.json`
- `docs/acroform-forensics/pm-coverage-matrix.md`
- `docs/acroform-forensics/phase-1c-summary.md`

### Doğrulama

- PM widget manifestindeki her user widget mapped veya explicitly ignored olmalı.
- 19 sayfalık PM yapısı coverage içinde açık görünmeli.
- Checkbox/button state bilgisi export için yeterli olmalı.
- Footer ve signature blokları eksiksiz olmalı.

## 7. Phase 1D - Coverage ve Inventory Audit Sertleştirmesi

### Hedef

AM ve PM envanterlerinin Phase 2 için güvenilir kaynak olmasını sağlamak.

### Uygulama

- Ortak inventory audit scripti yaz.
- AM/PM inventory şemalarını doğrula.
- Widget coverage hesapla.
- Canonical id benzersizliğini denetle.
- Türkçe UI label eksiklerini denetle.
- PDF binding eksiklerini denetle.
- Checkbox option state eksiklerini denetle.
- Repeated group tutarlılığını denetle.

### Çıkış Kriterleri

- Unmapped user widget sayısı sıfır.
- Unknown control type sayısı sıfır.
- Eksik Türkçe UI label sayısı sıfır.
- Eksik PDF binding sayısı sıfır.
- Audit raporu committed.

## 8. Phase 2 - Canonical Schema ve Validasyon

### Phase 2A - Ortak Field Primitive Katmanı

Field primitive türleri:

- text
- multiline text
- date
- number
- decimal
- phone
- email
- single choice
- multi choice
- checkbox
- table row
- repeated group
- signature block
- attachment reference
- body chart reference
- dental chart reference

### Phase 2B - AM Schema

AM inventory alanları typed schema içine taşınır. Her alanın default value, validation rule ve readiness rule karşılığı olur.

### Phase 2C - PM Schema

PM inventory alanları typed schema içine taşınır. PM özel alanları için pathology, odontology ve recovery blokları ayrı domain modülleri olarak modellenir.

### Phase 2D - Schema Coverage Testleri

Her inventory alanı schema içinde temsil edilmelidir. Schema içinde inventory karşılığı olmayan alan kalmamalıdır.

## 9. Phase 3 - Offline App Foundation

### Phase 3A - App Shell

Ana ekran, AM/PM ayrımı, vaka listesi ve build info paneli oluşturulur.

### Phase 3B - Local Persistence

Taslak kayıtları cihaz üzerinde saklanır. Veri modeli sürümlemeli veri geçişini destekler.

### Phase 3C - Taslak Yaşam Döngüsü

Create, edit, resume, duplicate ve delete akışları kurulur. Silme işlemi explicit confirmation gerektirir.

### Phase 3D - Diagnostics

Yerel veri sürümü, build id, storage durumu ve son migration bilgisi Türkçe diagnostics panelinde görünür.

## 10. Phase 4 - Tam Türkçe Veri Giriş UI

### Phase 4A - Form Renderer

Inventory ve schema üzerinden section-based form renderer kurulur. Büyük formlar mobilde hızlı gezinilebilir olmalıdır.

### Phase 4B - AM Temel Bloklar

Kimlik, olay, iletişim, aile ve genel AM blokları uygulanır.

### Phase 4C - AM Klinik ve Destek Blokları

Medikal, dental, eşya, ekler, signature ve footer blokları uygulanır.

### Phase 4D - PM Temel Bloklar

Recovery, remains, body condition ve temel PM blokları uygulanır.

### Phase 4E - PM Uzmanlık Blokları

Pathology, odontology, attachments, signature ve footer blokları uygulanır.

### Phase 4F - UI Coverage

Her inventory alanının ekranda bir control karşılığı olduğu doğrulanır.

### Phase 4G - Kullanılabilirlik ve Türkçe Alan Anlaşılırlığı

Phase 4A-4F kapsamı, resmi alanların eksiksiz ekrana bağlanmasını hedeflemiştir. Bu yaklaşım export ve coverage doğruluğu için gerekliydi; ancak saha kullanıcısı için tek başına yeterli değildir. Phase 4G, tam veri kapsamını bozmadan uzun AM/PM formlarının kullanılabilirliğini iyileştirir.

#### Phase 4G-A - Kritik Aksiyon Kullanılabilirliği ve Plan Güncellemesi

Hedef:

- Silme gibi yıkıcı aksiyonların uzun form akışı içinde kaybolmasını engelle.
- Silme onayını sayfa sonundaki inline panel yerine modal onaya taşı.
- Proje planında UI kullanılabilirlik borcunu açık fazlara böl.
- Build bilgisini `0.4.6 / Faz 4G-A` olarak güncelle.

Kapsam dışı:

- Tüm field label haritasını bu alt fazda tamamlamak.
- PDF export motoruna başlamak.
- Matching ekranı tasarlamak.

Doğrulama:

- Typecheck geçmeli.
- Türkçe metin kontrolü geçmeli.
- Form renderer doğrulaması modal silme sözleşmesini denetlemeli.
- UI coverage doğrulaması önceki 21/21 section kapsamını korumalı.
- Versioned APK üretilmeli, commit ve push tamamlanmalı.

#### Phase 4G-B - İnsan-Okur Türkçe Label ve Yardım Metni Stratejisi

Hedef:

- Teknik `AM alanı 300.4.4` / `PM alanı 300.4.4` etiketlerini kullanıcıya anlamlı Türkçe label yapısına taşımak.
- PDF field name değerlerini kullanıcı etiketi olarak göstermeyi bırakmak; bu bilgi yalnızca teknik binding/debug alanında kalmalı.
- Section başlıkları, alt grup başlıkları ve alan yardım metinleri için ayrı bir Türkçe UI label map dosyası oluşturmak.
- Label coverage audit scripti eklemek.

Kapsam:

- İlk geçişte otomatik label üretimi yerine resmi PDF label/text layer ve mevcut section bağlamından türeyen denetlenebilir map dosyası kullanılacak.
- Eksik veya şüpheli label değerleri `needsReview` olarak işaretlenecek, kullanıcıya teknik field id gösterilmeyecek.
- AM/PM için label coverage raporu üretilecek.

Çıkış kriterleri:

- Her editable field için insan-okur Türkçe label veya explicit review açıklaması bulunmalı.
- Teknik field id yalnızca debug/binding satırında görünmeli.
- UI label audit build kapısı olmalı.

#### Phase 4G-C - Uzun Form Ergonomisi ve Mobil İş Akışı

Hedef:

- Binlerce alanı düz liste gibi göstermek yerine daha okunabilir bölüm içi grup düzeni oluşturmak.
- Aktif bölüm, alan ilerlemesi, eksik alanlar ve hızlı gezinme deneyimini güçlendirmek.
- Kritik aksiyonları sticky/bottom action alanına almak.
- Bölüm içi arama, kontrol tipi filtresi ve hata filtresi eklemek.

Kapsam:

- Section navigator mobilde daha hızlı taranabilir hale getirilecek.
- Form field card yoğunluğu azaltılacak; label, yardım, değer ve validasyon hiyerarşisi netleşecek.
- Uzun form içinde silme/kapat/devam gibi aksiyonlar kaybolmayacak.

Çıkış kriterleri:

- AM ve PM taslakları telefon ekranında kaybolmadan düzenlenebilir olmalı.
- Silme, kapatma ve devam etme aksiyonları görünür ve geri dönüşü anlaşılır olmalı.
- UI coverage korunmalı.
- Accessibility ve Türkçe metin kontrolleri geçmeli.

### Phase 4H - Mobil Navigasyon ve Çalışma Akışı Ayrıştırması

Phase 4G, alan içi okunabilirliği iyileştirmiştir; ancak üst seviye uygulama akışı hâlâ geliştirme odaklı `Genel`, `Formlar`, `Akış`, `Sistem` yapısına dayanır. Phase 4H, Phase 5 PDF export öncesinde saha kullanıcısının doğal iş akışına uygun bir navigasyon düzeni kurar. Amaç, kayıtlı taslakları, yeni kayıt başlatmayı, aktif form düzenlemeyi ve sistem durumunu birbirinden ayırmaktır.

#### Phase 4H-A - Navigasyon Yeniden Tasarımı ve Plan Güncellemesi

Hedef:

- Birincil navigasyonu `Kayıtlı`, `Formlar`, `Form`, `Durum`, `Sistem` başlıklarına taşımak.
- `Genel` ve `Akış` sekmelerini birincil navigasyondan kaldırmak.
- Eski genel özet ve faz ilerleme bilgisini sadeleştirilmiş `Durum` ekranında toplamak.
- Üst sekmeleri yatay kaydırmalı hale getirerek beş başlığın mobilde okunur kalmasını sağlamak.
- Build bilgisini `0.4.9 / Faz 4H-A` olarak güncellemek.

Kapsam dışı:

- Taslak listesini bu alt fazda tam arama/filtre/aksiyon ekranına dönüştürmek.
- Formlar ekranından tekrar eden yeni taslak butonlarını kaldırmak.
- Aktif form ekranında tüm sticky aksiyon cila işlerini tamamlamak.
- PDF export veya matching motoruna başlamak.

Çıkış kriterleri:

- Yeni route sözleşmesi `Kayıtlı`, `Formlar`, `Form`, `Durum`, `Sistem` başlıklarını içerir.
- `Genel` ve `Akış` artık üst sekme olarak görünmez.
- Sekmeler daralıp okunmaz hale gelmez; yatay kaydırma desteklenir.
- Typecheck, Türkçe metin kontrolü, form renderer doğrulaması ve UI coverage doğrulaması geçer.
- Versioned APK üretilir, commit ve push tamamlanır.

#### Phase 4H-B - Kayıtlı Taslaklar Ekranı

Hedef:

- Taslak listesini `Formlar` ekranından çıkarıp `Kayıtlı` ekranına taşımak.
- AM/PM/Tümü filtresi, taslak arama, tamamlanma yüzdesi, son güncelleme bilgisi ve `Devam`, `Kopyala`, `Sil` aksiyonlarını bu ekranda toplamak.
- `Devam` aksiyonunda aktif taslağı seçip kullanıcıyı `Form` ekranına almak.
- Boş liste halinde kullanıcıyı yeni kayıt başlatmaya yönlendirmek.

Çıkış kriterleri:

- Taslak oluşturma, devam etme, kopyalama ve silme akışı çalışır.
- Silme onayı modal kalır ve uzun formun en altına inme zorunluluğu oluşturmaz.
- Typecheck, UI coverage, Türkçe metin kontrolü, APK build, commit ve push tamamlanır.

#### Phase 4H-C - Formlar Ekranı: Doğrudan Yeni AM/PM Başlatma

Hedef:

- `Formlar` ekranını yalnızca yeni AM/PM kayıt başlatma yüzeyi haline getirmek.
- `Ölüm Öncesi Kaydı Başlat` ve `Ölüm Sonrası Kaydı Başlat` aksiyonlarını doğrudan yeni taslak oluşturup `Form` ekranına yönlendirecek şekilde düzenlemek.
- Gereksiz ikinci seviye `Yeni AM taslağı` ve `Yeni PM taslağı` butonlarını kaldırmak.

Çıkış kriterleri:

- AM seçimi doğrudan yeni AM formunu açar.
- PM seçimi doğrudan yeni PM formunu açar.
- Formlar ekranında taslak listesi veya tekrar eden yeni taslak aksiyonları kalmaz.
- Typecheck, UI coverage, Türkçe metin kontrolü, APK build, commit ve push tamamlanır.

#### Phase 4H-D - Aktif Form Çalışma Alanı ve Mobil Kullanım Cilası

Hedef:

- `Form` ekranını yalnızca aktif taslak düzenleme alanı haline getirmek.
- Aktif taslak yoksa `Kayıtlı` ve `Formlar` ekranlarına net yönlendirme vermek.
- Aktif form üstünde AM/PM türü, taslak başlığı, tamamlanma yüzdesi, aktif bölüm ve son kaydetme bağlamını göstermek.
- Uzun formda kapat, taslak adı düzenle ve önceki/sonraki bölüm aksiyonlarının görünür kalmasını sağlamak.
- Gereksiz açıklama metinlerini azaltarak kullanıcının hangi kaydı doldurduğunu daha net hissettirmek.

Çıkış kriterleri:

- Aktif taslak yokken boş ekran kalmaz.
- Aktif taslakla form açıldığında kullanıcı hangi kayıt üzerinde çalıştığını anlar.
- Uzun formdaki temel aksiyonlar için sayfanın en altına inme zorunluluğu azaltılır.
- Typecheck, UI coverage, Türkçe metin kontrolü, APK build, commit ve push tamamlanır.

### Phase 4I - Doldurma Rehberi ve Alan Anlaşılırlığı

Phase 4H uygulama akışını sadeleştirmiştir; Phase 4I, alan düzeyindeki kullanıcı metinlerini belgeyi hiç bilmeyen saha görevlisi için daha açık hale getirir. Amaç, her alanın yalnızca resmi PDF karşılığına bağlı kalması değil, kullanıcıya hangi kişi, kurum, tarih, adres, bulgu veya görevli bilgisinin istendiğini açıkça anlatmasıdır.

#### Phase 4I-A - Görevli-Dostu Alan Etiketi ve Yardım Metni

Hedef:

- `by`, `agency`, `name`, `date`, `address`, `phone`, `signature` gibi kısa PDF label kaynaklarını açık Türkçe görevli metinlerine çevirmek.
- Teknik veya yetersiz label bulunan alanlarda resmi bölüm ve alan serisi bağlamından anlamlı Türkçe açıklama üretmek.
- Alan kartlarında `Ne doldurulacak?` başlığıyla yardım metnini daha görünür hale getirmek.
- Placeholder metnini genel `Değer girin` yerine daha açıklayıcı `İstenen bilgiyi yazın` diline çekmek.
- Teknik export/debug hissi veren alan alt metinlerini kullanıcı-dostu resmi form eşleşmesi diline çevirmek.

Kapsam dışı:

- Tüm 3380 alanın adli terminolojiyle elle tek tek redaksiyonu.
- PDF export motoruna başlamak.
- Canonical schema veya envanter alan sayısını değiştirmek.

Çıkış kriterleri:

- UI label üretimi görevli-dostu bağlamlı açıklama üretmeli.
- `İşlemi yapan görevli veya memur` gibi rol açıklamaları runtime label map içinde görünmeli.
- UI coverage 3380 field / 4032 widget kapsamını korumalı.
- Typecheck, Türkçe metin kontrolü, form renderer doğrulaması ve label doğrulaması geçmeli.
- Versioned APK üretilmeli, commit ve push tamamlanmalı.

## 11. Phase 5 - PDF Export Engine

### Phase 5A - Template Pipeline

Fillable PDF şablonları uygulama asset'i olarak sabitlenir ve hash kontrolüyle yanlış şablon kullanımı engellenir.

Hedef:

- AM ve PM INTERPOL DVI 2018 fillable PDF dosyalarını repo içinde tekil, adlandırılmış asset olarak tutmak.
- Şablonların sayfa sayısı, widget sayısı, unique field sayısı, byte uzunluğu ve SHA-256 hash değerlerini manifestte kilitlemek.
- CI ve yerel build sırasında yanlış PDF, eksik PDF veya değişmiş PDF kullanımını erken durdurmak.
- PDF export motoruna başlamadan önce runtime'ın kullanacağı resmi template kaynağını deterministik hale getirmek.

Kapsam dışı:

- Canonical field id ile PDF field name eşlemesi üretmek.
- AM/PM verisini PDF alanlarına yazmak.
- Checkbox button state regression, appearance update veya flatten işlemi yapmak.
- Koordinat tabanlı fallback export eklemek.

Implementation dosya grupları:

- `assets/pdf-templates/`: Hash ile kilitlenen AM/PM fillable PDF şablonları.
- `data/pdf-templates/pdf-template-manifest.json`: Şablon metadata ve doğrulama manifesti.
- `scripts/build_pdf_template_manifest.js`: Şablon asset kopyalama, manifest üretme ve drift doğrulama scripti.
- `src/config/pdfTemplates.ts`: Uygulama tarafında manifest ve paketlenmiş PDF asset referansları.
- `.github/workflows/phase-5a-apk.yml`: Build kapısına PDF şablon doğrulamasını ekleyen APK workflow'u.
- `docs/pdf-export/phase-5a-template-pipeline.md`: Faz çıktısı ve denetim notları.

Veri sözleşmesi:

- AM asset yolu: `assets/pdf-templates/interpol-dvi-2018-am-fillable.pdf`
- PM asset yolu: `assets/pdf-templates/interpol-dvi-2018-pm-fillable.pdf`
- AM beklenen özet: 18 sayfa, 2006 widget, 1687 unique field, text layer var.
- PM beklenen özet: 19 sayfa, 2026 widget, 1693 unique field, text layer var.
- Manifest içerikleri wall-clock zamana bağlı olmayacak; tekrar üretim aynı çıktıyı vermeli.

Doğrulama komutları:

- `npm run pdf:templates`
- `npm run pdf:templates:verify`
- `npm run typecheck`
- `npm run text:verify-tr`
- `npm run forensics:verify`
- `npm run forms:renderer:verify`
- `npm run ui:coverage:verify`

Çıkış kriterleri:

- AM/PM PDF asset dosyaları repo içinde mevcut olmalı.
- Manifest hash, byte uzunluğu ve forensics metadata ile tutarlı olmalı.
- Metro `pdf` asset uzantısını paketleyebilmeli.
- Uygulamada `Faz 5A / 0.5.0 / phase-5a-v0.5.0-20260511` görünür olmalı.
- Versioned APK üretilmeli, commit ve push tamamlanmalı.

### Phase 5A-Fix1 - Checkbox Seçenek Görünürlüğü

Phase 5B export binding'e geçmeden önce checkbox kullanıcı deneyimindeki belirsizlik giderilir. Mevcut renderer checkbox satırında yalnızca `İşaretli değil` durumunu gösterdiği için kullanıcı hangi seçeneği işaretlediğini bazı alanlarda anlayamaz. Bu ara fix, checkbox satırını seçenek adı ve durum bilgisiyle okunur hale getirir.

Hedef:

- Checkbox satırında ana metin olarak seçilecek seçenek gösterilir.
- `İşaretli değil` tek başına görünen ana metin olmaktan çıkarılır.
- Durum bilgisi ikincil metin olarak `Seçili` / `Seçili değil` şeklinde gösterilir.
- Düzenlenebilir checkbox satırında açık aksiyon etiketi bulunur: `Seç` veya `Kaldır`.
- Mevcut 3380 field / 4032 widget UI coverage korunur.

Kapsam dışı:

- PDF export başlatılmaz.
- Checkbox button state regression başlatılmaz.
- Canonical schema field sayısı veya inventory kapsamı değiştirilmez.
- Choice group/radio davranışı tam olarak bu fazda modellenmez; bu konu Phase 5E ve gerekirse ayrı UI grouping fazında sertleştirilecektir.

Implementation dosya grupları:

- `src/components/FormFieldControl.tsx`: Checkbox satırının seçenek metni ve durum düzeni.
- `scripts/verify_form_renderer.js`: Checkbox seçenek görünürlüğünü build kapısı yapan doğrulama.
- `src/config/buildInfo.ts`, `app.json`, Android config ve workflow: `0.5.1` ara fix sürümlemesi.
- `docs/app/phase-5a-fix1-summary.md`: Ara fix raporu.

Çıkış kriterleri:

- Checkbox satırları sadece durum metniyle görünmemeli.
- Kullanıcı satırda hangi seçeneği işaretlediğini görebilmeli.
- TypeScript, Türkçe metin, renderer, UI coverage ve PDF template doğrulamaları geçmeli.
- `DviMobile-phase-5a-fix1-v0.5.1-20260512.apk` üretilmeli.
- Commit ve push tamamlanmalı.

### Phase 5A-Fix2 - Checkbox Label Sadeleştirme

Phase 5A-Fix1 seçenek görünürlüğünü düzeltti; ancak bazı alanlarda label üretimi hâlâ `1. satır`, `bilgi parçası` veya `115 numaralı resmi form bloğu` gibi kullanıcıya ne dolduracağını söylemeyen teknik kalıplar üretebiliyordu. Bu ara fix, checkbox ve genel field label üretimini daha açık Türkçe görev metnine çevirir.

Hedef:

- Checkbox içinde satır/parça gibi teknik ayrıntılar gösterilmez.
- `numaralı resmi form bloğu` fallback'i kullanıcı-facing label ve yardım metinlerinden kaldırılır.
- `115` serisi gibi eksik konu başlıkları açık metne çevrilir: `eş veya partner bilgisi`.
- Checkbox içindeki seçenek metninden kontrol tipi artıkları kaldırılır; örneğin `eş veya partner bilgisi seçim` yerine `Eş veya partner bilgisi` görünür.
- Yardım metinleri `bilgisini bilgiyi yazın` gibi bozuk tekrarlar üretmez.
- Label doğrulaması teknik satır/parça ve belirsiz blok numarası kalıplarını hata sayar.

Kapsam dışı:

- PDF export başlatılmaz.
- Choice group/radio davranışı ve export state regression başlatılmaz.
- Elle tüm 3380 alanın adli terminoloji redaksiyonu yapılmaz; bu faz otomatik label üretimini güvenli hale getirir.

Çıkış kriterleri:

- `npm run ui:labels:verify` teknik satır/parça ve belirsiz blok numarası kalıbı olmadan geçmeli.
- AM 115 serisi checkbox/metin alanları `eş veya partner bilgisi` bağlamıyla görünmeli.
- UI coverage 3380 field / 4032 widget kapsamını korumalı.
- `DviMobile-phase-5a-fix2-v0.5.2-20260512.apk` üretilmeli.
- Commit ve push tamamlanmalı.

### Phase 5A-Fix3 - Tekrarlı İletişim ve Adres Label Netleştirme

Phase 5A-Fix2 teknik blok/satır ifadelerini temizledi; ancak bazı AM/PM adres-iletişim bloklarında PDF'den yakalanan `Town` veya `Country` etiketi e-posta inputlarına taşınabiliyordu. Bu nedenle kullanıcı üst üste aynı `İl, ilçe veya yerleşim yeri` alanını görüyor, e-posta alanları ise yanlış başlıkla açılıyordu.

Hedef:

- Input tipi e-posta olan hiçbir alan `İl, ilçe veya yerleşim yeri` veya `Ülke` ana başlığıyla görünmez.
- Adres/iletişim alt alanları net ayrılır:
  - açık adres satırı 1
  - açık adres satırı 2
  - il veya ilçe
  - posta kodu, ülke veya yer ayrıntısı
  - e-posta adresi
  - ek e-posta adresi
- Ana label, bölüm ve konu bağlamını da içerir; kullanıcı `Ne doldurulacak?` yardımına bakmadan temel olarak ne gireceğini anlayabilmelidir.
- `Ne doldurulacak?` ara başlığı kaldırılır; açıklama metni ikincil rehber olarak kalır.
- Label doğrulaması input tipiyle çelişen kullanıcı metinlerini hata sayar.

Kapsam dışı:

- PDF export başlatılmaz.
- Choice group/radio davranışı başlatılmaz.
- Resmi PDF alan koordinatı veya widget mapping değiştirilmez.

Çıkış kriterleri:

- AM ilk bloktaki 305/306 e-posta alanları e-posta olarak görünmeli.
- PM kayıt/buluntu iletişim bloklarındaki e-posta alanları e-posta olarak görünmeli.
- UI label doğrulaması input tipi çelişkisi olmadan geçmeli.
- UI coverage 3380 field / 4032 widget kapsamını korumalı.
- `DviMobile-phase-5a-fix3-v0.5.3-20260512.apk` üretilmeli.
- Commit ve push tamamlanmalı.

### Phase 5A-Fix4 - Alan Sözleşmesi ve Label Netlik Denetimi

Phase 5A-Fix3 alan başlıklarını belirgin biçimde iyileştirdi; ancak bu güvence UI label üreticisinin kendi doğrulamasıyla sınırlıydı. Bu ara fix, PDF manifest, envanter, schema, export binding ve Türkçe UI label katmanını tek sözleşme denetimine bağlar. Amaç, her kutucuğun PDF'de karşılığı olduğunu ve PDF'deki her alanın uygulamada doğru formatta, anlaşılır Türkçe metinle temsil edildiğini build aşamasında kanıtlamaktır.

Hedef:

- AM 1687 alan / 2006 widget ve PM 1693 alan / 2026 widget kapsamı tek denetimde doğrulanır.
- Her PDF widget instance anahtarı inventory ve schema içinde bire bir temsil edilir.
- Her schema alanı AcroForm field name export binding'i taşır.
- Her schema alanının Türkçe UI label, kısa label ve yardım metni bulunur.
- Kullanıcıya görünen metinde `gerekli metin`, `gerekli seçim`, `1. alan`, `1. satır`, teknik PDF field id veya belirsiz blok numarası kalmaz.
- E-posta, telefon, tarih parçası ve checkbox alanları kendi input tipini kullanıcıya açıkça yansıtır.
- Kısa alan adlarında sıra numarası gösterilmez; sıra ve widget bilgisi yalnızca audit/coverage çıktılarında kalır.

Kapsam dışı:

- PDF export motoru başlatılmaz.
- Choice group/radio state export davranışı değiştirilmez.
- 3380 alanın manuel adli terminoloji redaksiyonu bu fazda yapılmaz; ancak belirsiz otomatik kalıplar build gate ile engellenir.

Implementation dosya grupları:

- `scripts/audit_field_contract.js`: PDF widget, inventory, schema, AcroForm binding ve Türkçe UI label sözleşmesi.
- `scripts/build_ui_labels.js`: Sıra numarasız, placeholder içermeyen label/help üretimi.
- `data/field-contract/field-contract-audit.json`: Makine okunur sözleşme denetimi.
- `docs/app/phase-5a-fix4-field-contract.md`: İnsan okunur sözleşme raporu.
- `docs/app/phase-5a-fix4-summary.md`: Faz raporu.
- Build metadata ve workflow: `0.5.4` / `phase-5a-fix4-v0.5.4-20260512`.

Çıkış kriterleri:

- `npm run field:contract:verify` geçmeli.
- `npm run ui:labels:verify` placeholder ve sıra numarası üretmeden geçmeli.
- UI coverage 3380 field / 4032 widget kapsamını korumalı.
- TypeScript, Türkçe metin, schema, inventory, PDF template ve draft storage doğrulamaları geçmeli.
- `DviMobile-phase-5a-fix4-v0.5.4-20260512.apk` üretilmeli.
- Commit ve push tamamlanmalı.

### Phase 5B - Binding Manifest

Canonical field id ile PDF field name/button state eşleşmeleri manifest içinde tutulur.

### Phase 5C - AM Export

AM taslak verisi resmi fillable AM PDF’ye aktarılır.

### Phase 5D - PM Export

PM taslak verisi resmi fillable PM PDF’ye aktarılır.

### Phase 5E - Checkbox Regression

Her checkbox ve choice group için doğru button state aktif edilir.

### Phase 5F - Flatten ve Determinizm

Export edilen PDF flatten edilir. Aynı input aynı output yapısını üretmelidir.

## 12. Phase 6 - PM to AM Matching

### Phase 6A - Factor Matrix

Karşılaştırma faktörleri ve ağırlıkları tanımlanır.

### Phase 6B - Güçlü Göstergeler

Dental, implant, protez, yara izi, dövme ve ayırt edici işaretler yüksek ağırlıkla ele alınır.

### Phase 6C - Destekleyici Göstergeler

Yaş, cinsiyet, boy, kilo, eşya ve notlar destekleyici faktör olur.

### Phase 6D - Çelişki ve Eksik Veri

Çelişen veri puanı düşürür. Eksik veri yanlış negatif üretmeyecek şekilde ele alınır.

### Phase 6E - Açıklama UI

Top 30 aday, Türkçe gerekçe ve coverage/confidence bilgisiyle gösterilir.

## 13. Phase 7 - Hardening ve Release

### Phase 7A - Repo Temizliği

Dead code, kullanılmayan asset, eski workflow ve geçici scriptler kaldırılır.

### Phase 7B - Metin ve Encoding QA

Türkçe karakterler, uygulama metinleri ve PDF export metinleri denetlenir.

### Phase 7C - Export Regression

AM/PM örnek taslak setleriyle export tekrar testleri çalışır.

### Phase 7D - Offline Edge Cases

Uçuş modu, uygulama kapanması, yarım kayıt ve migration edge-case testleri yapılır.

### Phase 7E - Release Build

Final APK/AAB üretilir, QA raporu yazılır ve repo temiz bırakılır.

## 14. Kalite Kapıları

Her fazda zorunlu kontroller:

- Typecheck.
- Faz özel doğrulama scriptleri.
- Türkçe kullanıcı metni kontrolü.
- Versioned APK.
- Commit.
- Push.
- Faz sonu raporu.

## 15. Bilinen Riskler

- Fillable PDF field name yapısı karmaşık duplicate gruplar içerebilir.
- Checkbox button state değerleri tüm viewer araçlarında aynı yorumlanmayabilir.
- Bazı görsel çizim alanları klasik text/checkbox field gibi davranmayabilir.
- Mobil form deneyimi büyük AM/PM formları için section navigation gerektirir.
- Export flatten seçimi Android runtime kütüphanesine göre ayrıca doğrulanmalıdır.

## 16. Uygulama Sırası

Sıradaki uygulama sırası:

1. Phase 0R tamamlanır.
2. Kullanıcı onayı alınır.
3. Phase 1A fillable PDF forensics scaffold uygulanır.
4. Kullanıcı onayı alınır.
5. Phase 1B AM inventory uygulanır.
6. Kullanıcı onayı alınır.
7. Phase 1C PM inventory uygulanır.
8. Kullanıcı onayı alınır.
9. Phase 1D audit sertleştirmesi uygulanır.

Bu sıra bozulmayacaktır.
