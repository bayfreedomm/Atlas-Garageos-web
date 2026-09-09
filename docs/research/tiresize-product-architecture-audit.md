# Atlas GarageOS için TireSize ürün mimarisi incelemesi

## Yönetici özeti

TireSize’ın esas avantajı tasarımı veya tek tek hesap makineleri değildir. Ürün, aynı lastik ve araç verisini birden fazla kullanıcı niyetine bağlayan bir bilgi omurgasıdır. Kullanıcı bir lastik ölçüsüyle hesap yapabilir, iki ölçüyü karşılaştırabilir, alternatif ebat görebilir, aynı ebattaki gerçek ürünleri inceleyebilir veya marka–model–yıl–donanım seçerek OEM ölçüsüne ulaşabilir. Bu sayfalar birbirinden bağımsız SEO girişleri olsa da aynı veri nesnelerine geri bağlanır.

Atlas GarageOS bugün hesaplama ve görselleştirme temelinde güçlüdür; fakat TireSize’ın “kaynak” niteliğini yaratan veri katmanlarına henüz sahip değildir. Eksikler dört gruptadır:

1. Lastik ölçüsü bilgi sayfaları ve taranabilir ölçü tabloları.
2. Marka–model–yıl–donanım tabanlı doğrulanmış araç/OEM fitment verisi.
3. Mevsim, kullanım tipi, performans sınıfı, yük ve hız endeksi gibi lastik katalog taksonomisi.
4. Hesap sonucunu alternatif ebat, ilgili eğitim, uygun ürün ve ticari aksiyona bağlayan devam akışı.

Doğru hedef TireSize’ı görünüş olarak yeniden üretmek değildir. Atlas tasarım sistemi korunmalı; TireSize’ın veri grafiği, sayfa aileleri ve kısa bilgi blokları daha hızlı, daha anlaşılır bir Atlas deneyimine çevrilmelidir.

## TireSize’ın ana ürün döngüsü

TireSize’taki temel döngü şöyledir:

`Araç veya ölçü seç → ölçüyü hesapla → görsel olarak açıkla → alternatifleri göster → gerçek lastikleri filtrele → fiyat/satıcı aksiyonuna geç`

Bu döngü farklı başlangıç noktalarından çalışır:

- Bir ölçü girildiğinde çap, genişlik, yanak, çevre ve devir/mil değerleri hesaplanır; eşdeğer ölçüler ve alternatifler sunulur.^1
- İki ölçü karşılaştırıldığında aynı metriklerin yanında hız göstergesi etkisi ve alternatif ebatlar gösterilir.^2
- Araç seçildiğinde donanıma özel OEM lastik ölçüsü bulunur; ölçü görseline ve bu ölçüdeki lastik kataloğuna geçilir.^3
- Bir lastik türü seçildiğinde ürünler marka ve performans alt sınıflarıyla filtrelenebilir.^4
- Gear ratio gibi uzman araçlar yalnız hesap sonucu vermekle kalmaz; 25–44 inç lastik çaplarını, oranları ve tahmini RPM bölgelerini renk kodlu bir referans matrisiyle açıklar.^5

Atlas için çıkarım: Her yeni araç kendi çıkmaz sayfası olmamalıdır. Sonucu, ortak “tire intelligence” nesnesine ve bir sonraki anlamlı kullanıcı işine bağlamalıdır.

## Sayfa aileleri

| Sayfa ailesi | TireSize işlevi | Kullanıcı değeri | Atlas’taki durum | Öneri |
|---|---|---|---|---|
| Ana keşif | Araçlar, araç seçici ve katalog girişleri | Nereye gideceğini hızlı seçme | Yeni toolbox doğru yönde | Korunmalı; veri girişleri sonradan eklenmeli |
| Tek ölçü hesaplama | Ölçü, fiziksel metrikler, görsel, alternatifler | Lastiğin gerçek boyutunu anlama | Formül ve temel görsel mevcut | Sonucu zenginleştir |
| İki ölçü karşılaştırma | Ölçü farkları, hız etkisi, yan yana görsel | Değişimin sonuçlarını görme | Büyük ölçüde mevcut | Alternatif ebat ve çoklu hız tablosu ekle |
| Dönüştürücü/plus sizing | Metrik–inç eşdeğeri, farklı jant çapı | Aynı çapı başka jantta arama | Kısmen core arama mevcut | Ayrı kullanıcı akışı olarak yüzeye çıkar |
| Referans tabloları | Jant çapına veya dış çapa göre ölçüler | Bilinen ölçüyü tarayarak bulma | Yok | Formülden üretilen statik indeksler |
| Araç/OEM sayfaları | Make–Model–Year–Trim → OEM ölçü | Kendi aracına doğrudan cevap | Manuel Garage var, katalog yok | Lisanslı/veri kaynağı olan yeni repository |
| Lastik katalog sayfaları | Boyut, marka, tip, performans, fiyat | Gerçek ürünleri karşılaştırma | Yok | Veri ve ticari ortaklık sonrası |
| Eğitim sayfaları | Ölçü okuma, yük/hız sınıfı, yapı | Acemi kullanıcıyı güçlendirme | Kısa açıklamalar mevcut | Etkileşimli, kısa Atlas rehberleri |
| Uzman tabloları | Gear ratio/RPM, pressure/load | Karar bağlamı sağlama | Gear ratio aracı yok | Varsayımları açık yeni araç ailesi |
| Monetizasyon | Reklam alanı, fiyat karşılaştırma, promosyon | Gelir ve satın alma devamı | Yok | Sonucun altına CLS-safe alanlar |

## Hesap makinesi ailesi

### Tire Size Calculator

TireSize tek ölçü için çap, genişlik, yanak, çevre ve devir/mil üretir; metrik ve inç eşdeğerlerini, görseli ve alternatif ölçüleri aynı akışa bağlar.^1 Atlas’ın mevcut hesaplamaları bu çekirdeğin önemli bölümüne sahiptir. Eksik olan, hesap sonrası bilgi mimarisidir.

Atlas sonucu şu sırayla sunmalıdır:

1. Kullanıcının girdiği lastik kodu.
2. Büyük ve okunabilir lastik görseli üzerinde `width`, `sidewall`, `rim`, `overall diameter` işaretleri.
3. Beş kısa metrik: çap, genişlik, yanak, çevre, devir/km veya devir/mil.
4. “Bu ölçüyü oku” kısa açıklaması.
5. Yakın/eşdeğer ölçüler ve farklı jant çapında plus-sizing seçenekleri.
6. Doğrulanmış katalog varsa “bu ölçüde lastikler”.

### Tire Size Comparison

TireSize iki ölçüyü aynı metriklerde karşılaştırır, fiziksel görselleri yan yana koyar ve 20–90 mph aralığında hız göstergesi tablosu verir.^2 Atlas bugün farkları ve ölçekli görseli üretmektedir. Geliştirme alanları:

- Tek bir seçilen hız yerine kısa bir hız dizisi.
- Alternatif ölçülerin sonucu doğrudan ikinci ölçüye uygulanabilmesi.
- Bir ölçüyü “OEM/current”, diğerini “candidate/new” olarak My Garage ile bağlama.
- Yüzde farkı yalnız bilgi olarak gösterme; güvenlik veya uygunluk kararı üretmeme.

### Converter, Height ve Plus Sizing

TireSize, benzer formülleri farklı arama niyetleri için ayrı sayfalara açar: metric-to-inch conversion, overall height ve farklı jant çapında eşdeğer ölçü.^6 Bu trafik stratejisi değerlidir; ancak Atlas’ta kullanıcıyı kopya araçlarla boğmamak gerekir.

Önerilen yapı:

- Her arama niyeti için ayrı indexable rota.
- Aynı doğrulanmış core hesaplama fonksiyonları.
- Aynı sonuç bileşeni.
- Sayfaya göre yalnız başlık, varsayılan tab ve açıklama değişimi.

Bu yaklaşım “her sayfa ayrı, hepsi aynı ürün” hedefiyle uyumludur.

### Wheel Offset

TireSize wheel offset aracında offset/backspacing dönüşümü, iki setup karşılaştırması, ön/yan görünüş, fender–suspension mesafeleri ve alternatif lastikleri bir araya getirir.^7 Atlas’ın geometri çekirdeği daha kontrollü ve provenance açısından daha güvenlidir. Korunması gereken fark, Atlas’ın ölçülmeyen clearance değerlerinden uygunluk veya güvenlik sonucu çıkarmamasıdır.

Atlas’a alınacak yapı:

- Offset converter ve setup comparison aynı sayfada iki sade mod.
- Hub plane, inner edge ve outer face görseli.
- Kullanıcı ölçümü varsa My Garage clearance katmanı.
- Yoksa yalnız geometrik değişim; “fits/safe” hükmü yok.

### Speedometer ve Gear Ratio

Speedometer sayfası iki lastik ölçüsünü ve bir gösterge hızını gerçek hıza çevirir; ayrıca geniş ölçü tablolarına bağlanır.^8 Gear Ratio sayfası stock/new tire ve stock ratio ile effective ratio ve stock hissini geri getirecek oranı hesaplar. Altındaki renkli tablo, 25–44 inç çapları farklı gear ratio sütunlarıyla eşleştirerek yaklaşık 65 mph RPM değerleri verir.^5

Atlas için gear matrisi hard-coded bir resim olmamalıdır. Formülden üretilen erişilebilir bir tablo olmalıdır. Renklerin anlamı “iyi/kötü” veya “güvenli/güvensiz” olmamalı; örneğin:

- Economy-biased
- Balanced operating range
- Torque-biased

Varsayımlar her zaman görünmelidir: hız, transmission top-gear ratio, final drive, converter slip ve kullanılan gerçek/hesaplanan lastik çapı. Böylece renk kullanıcıya bağlam verir fakat sahte kesinlik üretmez.

### Tire Pressure

TireSize’ın pressure calculator’ı basit PSI–bar dönüşümü değildir. OEM placard ölçüsü, yük sınıfı ve yeni lastik ölçüsünü kullanarak orijinal yük kapasitesine yaklaşan basıncı araştırır; sayfa door-jamb değerini başlangıç kaynağı olarak vurgular.^9 Bu yüksek riskli bir alandır.

Atlas’taki mevcut PSI–bar converter güvenle korunabilir. Araç/lastik önerisi üreten pressure calculator ise ancak doğrulanmış load-inflation verisi, lastik sınıfı ayrımı ve güçlü kaynak/provenance sistemiyle eklenmelidir. Veri olmadan tahmin yapılmamalıdır.

### Bolt Pattern Finder

TireSize, make–year–model–option seçiminden bolt pattern üretir ve 4/5/6/7/8 bijon ölçüm yöntemini açıklar.^10 Atlas için bu yeni bir traffic-first utility olabilir; fakat yine vehicle fitment verisi gerektirir. Ölçüm rehberi veri olmadan sunulabilir, vehicle lookup sonucu sunulamaz.

## Lastik ölçüsü bilgi mimarisi

TireSize’taki güçlü fark, `205/55R16` gibi bir değerin yalnız input değil, kendi adresi olan bir bilgi nesnesi olmasıdır. Tek ölçü sayfası fiziksel özellikleri, görseli, alternatif ebatları ve mevcut lastikleri birleştirir.^11

Atlas’ta önerilen canonical tire-size sayfası:

`/en/tires/sizes/205-55-r16/`

Sayfa içeriği:

- `205/55R16` büyük kimlik satırı.
- İnç eşdeğeri.
- Etiketli lastik kesiti ve yan görünüşü.
- Çap, genişlik, yanak, çevre, devir/km ve devir/mil.
- “205 / 55 / R / 16 ne demek?” kısa açıklama.
- Aynı dış çapa yakın ölçüler.
- Aynı jant çapındaki komşu ölçüler.
- Bu ölçüyü kullanan araçlar; yalnız veri doğrulanmışsa.
- Bu ölçüde gerçek lastikler; yalnız katalog/ortaklık verisi varsa.

Bu sayfa calculator sonucu, araç sayfası, ölçü tablosu ve ürün kataloğu arasında ortak hedef olur.

## Taranabilir ölçü tabloları

TireSize üç benzer tarama niyetini ayrı sayfalarda karşılar:

- Jant çapına göre lastik ölçüleri.
- Dış çapa göre lastik ölçüleri.
- Metrik ölçü ile inç eşdeğerini yan yana veren conversion chart.^12

Atlas bu yapıyı daha sade kurabilir:

- Tek `Tire Size Library` ana sayfası.
- Üstte `By wheel` ve `By diameter` segmentleri.
- 13–30 inç jant veya 21–54 inç dış çap için yatay seçici.
- Sonuçlar uzun paragraf yerine kısa, tıklanabilir ölçü satırları.
- Her satır canonical tire-size sayfasına gider.

Formülden teorik olarak üretilebilen her kombinasyon “gerçek piyasada üretiliyor” anlamına gelmez. Bu nedenle iki ayrı durum gerekir:

- `Calculated size`: matematiksel olarak geçerli.
- `Catalog-confirmed size`: yetkili veri kaynağında gerçek ürün bulunan ölçü.

Bu ayrım Atlas’ın rakipten daha güvenilir olabileceği önemli bir fırsattır.

## Araç seçici ve veri zinciri

TireSize ana sayfa ve birçok alt sayfada `Make → Year → Model → Option` seçicisini tekrar kullanır. 2024 Camry ara sayfası tüm donanımları OEM ölçüleriyle listeler; donanım sayfası ise ölçü görseli, alternatifler ve o ölçüdeki ürünlere geçer.^3 Corolla LE örneğinde `205/55R16`, 24.9 inç çap, 8.1 inç genişlik, 4.4 inç yanak ve 811 rev/mile ile gösterilir; ardından season/performance/load/speed/run-flat/price filtreleri sunulur.^13

Atlas için önerilen veri zinciri:

`Make → Model → Generation/Year → Trim/Option → Axle/Position → OEM Setup → Tire Size → Candidate Setup`

TireSize sırasını birebir almak yerine Atlas kullanıcı zihnine daha uygun sıra kullanılabilir:

`Make → Model → Year → Trim`

Teknik gereksinimler:

- Vehicle catalog, `src/core` içine girmemeli.
- Ağ/veri erişimi bir repository veya API adapter arkasında kalmalı.
- Gelen tüm kayıtlar domain factory’lerle doğrulanmalı.
- Her OEM setup için kaynak, pazar/bölge, model yılı, trim ve güncellenme tarihi tutulmalı.
- Aynı araçta ön/arka farklı ölçü (staggered), opsiyonel jant paketi ve bölgesel farklılık desteklenmeli.
- Emin olunmayan veri “verified fitment” gibi sunulmamalı.

TireSize verisi kopyalanmamalı veya izinsiz scrape edilerek ürün veritabanına dönüştürülmemelidir. Araç/OEM ve ticari lastik verisi için lisanslı bir kaynak, üretici verisi veya açık kullanım izni bulunan dataset gerekir.

## Lastik türleri ve ürün kataloğu

TireSize, ürünleri yalnız Summer/Winter/All Season olarak ayırmaz. Passenger ve Truck/SUV ayrımı, All Terrain, Mud Terrain, Street/Racetrack, Trailer ve Spare gibi kullanım kategorileri; Touring, Grand Touring, Performance, Studdable ve Studless gibi alt sınıflar bulunur.^4 Marka sayfaları da aynı ürünleri tür başlıkları altında yeniden gruplar.^14

Atlas’ın ilk katalog taksonomisi:

- Season: Summer, Winter, All Season, All Weather.
- Vehicle intent: Passenger, SUV/Crossover, Light Truck, EV, Trailer.
- Surface/use: Road, All Terrain, Mud Terrain, Track.
- Performance character: Comfort/Touring, Performance, High Performance.
- Construction/attributes: SL, XL, LT/load range, Run Flat, Studless, Studdable.
- Ratings: load index, speed rating, warranty yalnız kaynaklı veriyle.

Bu katalog hesap makinelerinden ayrı bir “marketplace” gibi başlamamalı. Önce kullanıcı ölçüsünden ilgili filtrelenmiş sonuçlara geçiş sağlamalıdır.

## Eğitim katmanı

TireSize’ın “How to Read Tire Size” sayfası metrik ve flotation formatındaki her parçayı ayrı açıklar; load index, load range ve speed rating tabloları da verir.^15 İçerik kapsamlıdır fakat sunum eskidir ve metin yoğundur.

Atlas bunu daha güçlü ve kısa yapabilir:

- Etkileşimli `P255/60R17 102V` lastik etiketi.
- Kullanıcı bir parçaya dokunduğunda yalnız o parçanın açıklaması.
- Aynı anda görselde width, sidewall, rim veya rating vurgusu.
- “What this changes” bölümünde yalnız teknik sonuç.
- Load/speed değerlerinde kaynak ve maksimum değerlerin kullanım tavsiyesi olmadığı uyarısı.

Bu eğitim bileşeni yalnız ayrı rehber sayfasında değil, calculator ve tire-size detail sayfalarında tekrar kullanılabilir.

## Reklam ve ticari alanlar

TireSize bazı bilgi sayfalarında açıkça `Advertisement` alanı kullanır; ölçü ve araç sonuçlarını ürün fiyat karşılaştırmasına bağlar.^5,13 Gelir mimarisi iki kanallıdır:

1. Display advertising.
2. Lastik/satıcı fiyat karşılaştırmasına giden ticari veya affiliate akış.

Atlas için önerilen reklam kuralları:

- Input ile primary CTA arasına reklam konmamalı.
- CTA ile ilk sonuç arasına reklam konmamalı.
- İlk güvenli yer, ana sonuç ve görsel tamamlandıktan sonradır.
- Reklam alanı yüklenmeden önce sabit yüksekliğe sahip olmalı; layout shift yaratmamalı.
- Alan açıkça `Advertisement` olarak etiketlenmeli.
- Reklam yoksa boş beyaz blok bırakılmamalı.
- Script below-the-fold ve lazy olmalı.
- Kişiselleştirilmiş reklam kullanılacaksa hedef pazarlardaki consent/CMP gereklilikleri ayrıca ele alınmalı.
- Affiliate/fiyat bağlantıları reklamdan ayrı ve açıkça ticari bağlantı olarak etiketlenmeli.

İlk teknik adım gerçek reklam ağı eklemek değil, ortak bir `AdSlot` sözleşmesi ve üç izinli konum oluşturmaktır:

- `after-primary-result`
- `between-reference-sections`
- `before-related-tools`

Bu yaklaşım reklam eklenmese bile gelecekte tasarımın bozulmasını önler.

## Logo ve marka işareti

TireSize logosu adındaki “tire” fikrini dairesel lastik formuyla birleştirdiği için site kategorisini ilk bakışta açıklar. Atlas aynı görsel numarayı kopyalamamalıdır. Ayrıca Atlas yalnız lastik sitesi değildir; yakıt, yolculuk, performans, Garage ve Fitment Studio’yu kapsar.

Önerilen Atlas marka yönü:

- Ana kelime işareti `ATLAS` güçlü ve mekanik-geometrik karakterde kalır.
- `A` harfinin negatif alanı yol/garaj açıklığını çağrıştırır.
- `GarageOS` içindeki `O`, sade bir wheel/hub halkasına dönüşür.
- Amber dikey ayrım çizgisi gün doğumu/horizon işlevi görür.
- İşaret tek renkte de çalışmalıdır; küçük favicon’da okunmalıdır.
- Araç silueti kullanılacaksa yalnız tek, kesintisiz roofline olmalı; çizgi-film araba ikonu olmamalıdır.

Bu çözüm aynı anda “otomotiv”, “garage” ve “operating system” çağrışımı yapar. Logo ayrı bir marka turunda en az üç yönle, 16 px favicon’dan mobil header’a kadar test edilmelidir.

## Atlas için önceliklendirilmiş uygulama

### Aşama 1 — Mevcut ürünün tek sistem hâline gelmesi

- Ana toolbox korunur.
- Bütün tool sayfalarında `← Toolbox` `/en/` adresine gider.
- Mobil heading ve açıklamalar sıkıştırılır.
- Kategori accent token’ları CTA, ikon, eyebrow ve visual üzerinde tutarlı uygulanır.
- Input → action → result → visual sırası standartlaştırılır.
- Ham ondalıklar insan dostu precision ile gösterilir.
- `/en/tools/` satırları bağımsız buton diline yaklaştırılır.

### Aşama 2 — Tire Intelligence

- “How to read a tire size” etkileşimli bileşeni.
- Canonical tire-size detail route.
- Tire Size Library: by wheel / by diameter.
- Plus sizing ve yakın ölçü önerileri.
- Speedometer çoklu hız tablosu.
- Gear Ratio Calculator ve erişilebilir renkli RPM matrisi.

Bu aşama büyük bir ticari veritabanı olmadan, mevcut doğrulanmış formüllerden üretilebilir. Gerçek üretim ölçüsü iddiası yapılmamalıdır.

### Aşama 3 — Vehicle Intelligence

- Lisanslı veya izinli veri kaynağı seçimi.
- Make–Model–Year–Trim seçici.
- OEM setup provenance modeli.
- Araç ve trim indexable route’ları.
- Sonucu My Garage’a kaydetme.
- Fitment Studio’ya current setup olarak gönderme.

### Aşama 4 — Tire Catalog ve monetizasyon

- Tire product taxonomy ve filtreler.
- Marka, tip ve ölçü sayfaları.
- Ürün görseli/spec verisi için lisans/partnerlik.
- Fiyat/satıcı karşılaştırması.
- Sabit boyutlu, lazy reklam slotları.
- Ticari bağlantı açıklamaları ve consent sistemi.

## Alınmaması gereken parçalar

- Aynı tabloların çok sayıda yakın anahtar kelime sayfasında neredeyse aynen tekrarlanması.
- Uzun, ana işlemi aşağı iten SEO paragrafları.
- Calculator’ın önünde veya sonucu kesen reklamlar.
- Kaynağı görünmeyen OEM/fitment iddiaları.
- Hesaplanan bir ölçünün piyasada üretildiği varsayımı.
- Renkleri güvenlik veya doğrulanmış uygunluk anlamında kullanmak.
- TireSize’ın görsel tasarımını, logosunu veya içerik metnini kopyalamak.

## Son karar

Atlas’ın kısa vadeli yönü değişmemelidir: hızlı toolbox ve ayrı tool rotaları acquisition motorudur. TireSize incelemesi, bunun üzerine kurulacak daha büyük platform katmanını gösterir. En yüksek değerli sıçrama, yeni rastgele calculator sayısını artırmak değil; `tire size`, `vehicle`, `OEM setup`, `candidate setup` ve ileride `tire product` nesnelerini ortak bir veri grafiğinde birleştirmektir.

Bu omurga kurulduğunda kullanıcı herhangi bir sayfadan başlayabilir ve yeniden veri girmeden şu zinciri yaşayabilir:

`Toyota Corolla seç → OEM 205/55R16’yı gör → ölçüyü anla → alternatifleri karşılaştır → speed/gear etkisini gör → setup’ı Garage’a kaydet → Fitment Studio’da devam et`

Bu, TireSize’ın yapısal gücünü Atlas’ın daha sade, daha premium ve daha güvenilir ürün yaklaşımına dönüştürür.

## Kaynaklar

1. TireSize.com, [Tire Size Calculator](https://tiresize.com/calculator/).
2. TireSize.com, [Tire Size Comparison](https://tiresize.com/comparison/).
3. TireSize.com, [2024 Toyota Camry Tire Sizes](https://tiresize.com/tires/Toyota/Camry/2024/).
4. TireSize.com, [Tires by Type](https://tiresize.com/tiretypes/) ve [All Season Tires](https://tiresize.com/tiretypes/All-Season.htm).
5. TireSize.com, [Gear Ratio Calculator](https://tiresize.com/gear-ratio-calculator/).
6. TireSize.com, [Tire Size Converter](https://tiresize.com/converter/), [Tire Height Calculator](https://tiresize.com/height-calculator/) ve [Metric Tire Conversion](https://tiresize.com/metric-tire-conversion/).
7. TireSize.com, [Wheel Offset Calculator](https://tiresize.com/wheel-offset-calculator/).
8. TireSize.com, [Speedometer Calibration](https://tiresize.com/speedometer-calibration/).
9. TireSize.com, [Tire Pressure Calculator](https://tiresize.com/pressure-calculator/).
10. TireSize.com, [Bolt Pattern Finder](https://tiresize.com/bolt-pattern-finder/).
11. TireSize.com, [38X12.50R17 tire-size detail](https://tiresize.com/tiresizes/38X12.50R17.htm).
12. TireSize.com, [Tire Size Chart](https://tiresize.com/chart/), [Tire Conversion Chart](https://tiresize.com/conversion-chart/) ve [Tire Height Chart](https://tiresize.com/height-chart/).
13. TireSize.com, [2024 Toyota Corolla LE Tires](https://tiresize.com/tires/Toyota/Corolla/2024/LE/).
14. TireSize.com, [Toyo Tires](https://tiresize.com/tires/Toyo/).
15. TireSize.com, [How to Read Tire Size](https://tiresize.com/how-to-read-tire-size/).
