/**
 * Common Turkish words for passphrases, written for this project.
 * Lowercase Turkish letters only (no q, w, x), 3 to 10 letters,
 * no duplicates (enforced by test/wordlists.test.js).
 */
export const TR_WORDS = Object.freeze(`
kedi köpek kuş balık inek koyun keçi tavuk horoz ördek kaz hindi tavşan sincap ayı
kurt tilki aslan kaplan fil zürafa zebra maymun deve eşek katır geyik ceylan karaca
kirpi yılan kurbağa timsah yunus balina ahtapot yengeç karides ıstakoz midye salyangoz
arı karınca kelebek sinek örümcek böcek solucan güvercin serçe kartal şahin baykuş
karga leylek martı papağan penguen tavus bülbül kanarya kumru saksağan turna pelikan
kuğu çekirge yarasa köstebek fare sıçan panda koala kanguru gergedan jaguar leopar çita
vaşak porsuk kunduz fok morsa alabalık hamsi palamut levrek çipura sardalya uskumru
lüfer kefal sazan kalkan mezgit kuzu buzağı dana oğlak civciv yavru tay boğa öküz
manda keklik bıldırcın sülün atmaca doğan akbaba flamingo kaplumbağa kertenkele sansar
çakal sırtlan antilop bizon lama tazı kısrak aygır sığır ispinoz kerkenez tırtıl pire
kene akrep çıyan yusufçuk istiridye zargana orkinos somon

ekmek peynir zeytin domates biber salatalık patates soğan sarımsak havuç ıspanak lahana
pırasa kabak patlıcan bamya fasulye nohut mercimek bezelye mısır pirinç bulgur makarna
çorba pilav köfte kebap döner lahmacun pide börek baklava lokum helva kadayıf sütlaç
aşure dondurma çikolata şeker bal reçel tereyağı yoğurt ayran süt kaymak yumurta sucuk
pastırma salam sosis elma armut muz portakal mandalina limon greyfurt üzüm karpuz kavun
çilek kiraz vişne şeftali kayısı erik incir nar ayva dut böğürtlen ahududu ananas
fındık ceviz badem fıstık kestane çay kahve şerbet limonata gazoz tuz karabiber kimyon
nane maydanoz dereotu fesleğen kekik tarçın zencefil sumak susam simit poğaça açma
gözleme mantı sarma dolma menemen kumpir turşu salça sirke maya hamur kek pasta
kurabiye bisküvi krep tost sandviç pizza salata cacık humus tahin pekmez leblebi tatlı
lezzet sofra kahvaltı yemek içecek meyve sebze tahıl baharat şurup sos krema hurma
avokado mango kivi brokoli karnabahar enginar kereviz turp pancar roka tere semizotu
bakla barbunya börülce kuskus irmik nişasta kepek lavaş bazlama yufka katmer künefe
revani tulumba lokma güllaç muhallebi kazandibi keşkül tantuni kokoreç tarhana işkembe
hoşaf komposto boza salep

dağ tepe ova vadi nehir ırmak dere göl deniz okyanus körfez koy kıyı sahil kumsal ada
yarımada orman ağaç yaprak dal kök gövde çiçek gül lale papatya menekşe karanfil
zambak sümbül nergis orkide çam meşe kavak söğüt çınar ladin sedir ardıç servi palmiye
kaktüs yosun çimen saman toprak kum taş kaya çakıl çamur toz kar yağmur dolu sis bulut
rüzgar fırtına şimşek yıldırım gök gökyüzü güneş yıldız gezegen evren galaksi buz buzul
şelale pınar kaynak mağara uçurum yamaç zirve çöl vaha bataklık çayır bozkır ufuk şafak
gün gece sabah öğle akşam ikindi gündüz mevsim ilkbahar yaz sonbahar kış bahar tohum
filiz tomurcuk diken hasat tarla bahçe bağ bostan sera çiftlik köy kasaba şehir kanyon
volkan yanardağ deprem sel çığ dalga köpük akıntı gölet kayalık yayla fidan çalı
sarmaşık ıhlamur akasya erguvan manolya leylak begonya lavanta gelincik kardelen
nilüfer yasemin buğday arpa yulaf çavdar pamuk kozalak reçine kabuk budak

masa sandalye koltuk kanepe yatak yastık yorgan battaniye çarşaf halı kilim perde dolap
çekmece raf ayna lamba avize mum saat takvim kalem silgi defter kitap kağıt makas
cetvel zarf pul mektup çanta cüzdan anahtar kilit kapı pencere duvar tavan zemin
merdiven balkon çatı baca çit kova süpürge sabun havlu tarak fırça macun kase tabak
bardak fincan çatal kaşık bıçak tencere tava çaydanlık demlik cezve fırın ocak ütü iğne
iplik düğme fermuar kemer şemsiye sepet kutu şişe kavanoz tepsi sürahi testi vazo
saksı çekiç çivi vida tornavida pense testere balta kürek tırmık orak tırpan halat
zincir kanca mıknatıs pusula harita dürbün gözlük şapka eldiven atkı bere mont ceket
gömlek kazak etek elbise pantolon şort çorap ayakkabı terlik çizme sandalet kravat
yelek palto pijama mendil cep yaka küpe yüzük kolye bilezik broş toka rozet madalya
kupa bayrak çan zil düdük balon uçurtma oyuncak bebek top çanak çömlek küp kazan ibrik
leğen tas sini kepçe süzgeç rende merdane oklava tülbent önlük sünger fener kandil
meşale çakmak kibrit pil priz kablo ekran klavye yazıcı telefon radyo televizyon
kamera hoparlör kulaklık bilgisayar tablet dosya klasör zımba raptiye ataş bant tebeşir
pergel gönye sözlük dergi gazete kartpostal bilet davetiye buzdolabı

baş kafa saç alın kaş göz kulak burun ağız dudak diş dil çene yanak boyun omuz kol
dirsek bilek parmak tırnak göğüs karın bel sırt kalça bacak diz ayak topuk kalp akciğer
mide beyin kemik kas deri kan damar kirpik bıyık sakal avuç yumruk ense şakak gamze
nabız nefes

kırmızı mavi yeşil sarı mor turuncu pembe beyaz siyah gri kahverengi lacivert bordo
turkuaz eflatun bej krem altın gümüş bronz bakır mercan zümrüt yakut safir inci
kehribar fildişi lila haki füme kızıl ela

doktor hemşire öğretmen mühendis avukat hakim polis asker pilot kaptan denizci balıkçı
çiftçi çoban fırıncı kasap aşçı garson terzi berber kuaför marangoz demirci kuyumcu
ressam şair yazar gazeteci muhabir müzisyen şarkıcı dansçı oyuncu yönetmen mimar eczacı
veteriner dişçi bekçi postacı şoför tamirci elektrikçi tesisatçı bahçıvan bakkal manav
kasiyer memur müdür sekreter bankacı esnaf tüccar işçi usta çırak kalfa öğrenci hoca
profesör kaşif çevirmen tercüman rehber hakem antrenör sporcu astronot bilgin mucit
dedektif itfaiyeci çaycı simitçi boyacı çilingir saatçi kitapçı çiçekçi seyyah gezgin

okul hastane eczane market lokanta restoran kafe otel pansiyon kütüphane müze sinema
tiyatro stadyum park meydan cadde sokak köprü liman iskele istasyon durak gar banka
postane belediye karakol çarşı pazar dükkan mağaza atölye fabrika ofis büro saray kale
kule hamam çeşme mahalle semt ilçe ülke kıta dünya bina apartman avlu kiler mutfak
salon oda koridor bodrum teras veranda çardak kulübe çadır kamp ahır kümes değirmen
kuyu sarnıç han bedesten otogar havaalanı tünel otoyol kavşak geçit patika yol bulvar
sahne arena

araba otobüs minibüs dolmuş taksi kamyon kamyonet tren tramvay metro vapur gemi tekne
sandal kayık yat uçak helikopter roket bisiklet motosiklet kızak traktör ambulans
itfaiye feribot denizaltı teleferik kano sal yelkenli römork vagon lokomotif

koşmak yürümek okumak yazmak çizmek gülmek uyumak uyanmak yüzmek dinlemek konuşmak
düşünmek sevmek gezmek görmek bakmak gelmek gitmek almak vermek bilmek bulmak tutmak
atmak açmak kapamak oturmak kalkmak beklemek başlamak bitirmek öğrenmek öğretmek
anlamak anlatmak sormak cevaplamak aramak saymak seçmek sevinmek şaşırmak taşımak
toplamak temizlemek yıkamak pişirmek kesmek doğramak dökmek doldurmak boşaltmak sulamak
biçmek dikmek örmek boyamak süslemek çalmak oynamak zıplamak tırmanmak uçmak dalmak
sürmek binmek inmek dönmek durmak kalmak yaşamak büyümek küçülmek ısınmak soğumak
erimek donmak parlamak yanmak sönmek esmek yağmak akmak damlamak kokmak tatmak
dokunmak sarılmak öpmek gülümsemek ağlamak bağırmak fısıldamak dinlenmek çalışmak
denemek kazanmak kaybetmek paylaşmak hatırlamak unutmak inanmak güvenmek özlemek
beğenmek istemek dilemek affetmek kutlamak çağırmak gezinmek keşfetmek yakalamak
kaçmak saklamak gizlemek göstermek ölçmek tartmak çözmek bağlamak katlamak sarmak
germek itmek çekmek kaldırmak indirmek koymak bırakmak getirmek götürmek göndermek
acıkmak susamak içmek

büyük küçük uzun kısa geniş dar yüksek alçak derin sığ kalın ince ağır hafif sıcak
soğuk ılık serin yeni eski genç yaşlı güzel iyi hızlı yavaş kolay zor temiz boş açık
kapalı sert yumuşak acı ekşi tuzlu taze bayat parlak mat karanlık aydınlık sessiz
sakin neşeli mutlu yorgun dinç cesur akıllı zeki çalışkan nazik kibar dürüst cömert
zengin ünlü gizli eğri düz yuvarlak kare sivri keskin canlı sağlam sevimli şirin hoş
harika muhteşem sade süslü renkli çizgili benekli tüylü pürüzsüz kaygan ıslak kuru
nemli tozlu çamurlu karlı yağmurlu bulutlu güneşli rüzgarlı sisli ılıman yabani evcil
vahşi uysal sadık sabırlı meraklı şakacı komik ciddi sakar utangaç atılgan becerikli
yetenekli çevik dikkatli özenli titiz düzenli dağınık modern klasik antik kadim ebedi
sonsuz minik kocaman devasa dev cüce

sevgi aşk dostluk barış umut hayal rüya düş anı hatıra merak sabır cesaret onur gurur
özgürlük adalet eşitlik saygı güven inanç huzur mutluluk neşe sevinç hüzün özlem şans
kader zaman saniye dakika hafta yıl asır yüzyıl çağ devir tarih gelecek geçmiş bugün
yarın dün hikaye masal efsane destan şiir şarkı türkü ezgi ritim nota melodi ses söz
kelime cümle harf sayı rakam hesap soru cevap fikir düşünce bilgi bilim sanat oyun spor
maç gol takım yarış zafer başarı emek çaba görev ödev ders sınav sınıf tahta bayram
tatil gezi yolculuk macera keşif sır bilmece bulmaca şaka kahkaha gülüş bakış adım
işaret sinyal mesaj haber davet hediye sürpriz armağan ödül şölen düğün kutlama
festival konser sergi gösteri tören resim heykel fotoğraf film roman öykü rol kostüm
maske kukla

pazartesi salı çarşamba perşembe cuma cumartesi şubat mart nisan mayıs haziran temmuz
ağustos eylül ekim kasım aralık

bir iki dört beş altı yedi sekiz dokuz yirmi otuz kırk elli altmış yetmiş seksen
doksan yüz bin milyon milyar çift tek yarım çeyrek sıfır

anne baba kardeş abla ağabey dede nine teyze hala amca dayı kuzen yeğen torun arkadaş
dost komşu misafir konuk çocuk insan kişi halk millet

bağlama saz ney kanun keman piyano gitar davul zurna darbuka flüt klarnet trompet
akordeon def kaval tambur çello arp org

demir çelik kurşun kalay çinko cam ahşap kumaş yün ipek keten plastik lastik mermer
granit beton tuğla kiremit seramik porselen kristal

atom molekül hücre gen enerji ışık ısı hız kuvvet elektrik uydu yörünge teleskop
mikroskop deney formül

futbol basketbol voleybol tenis yüzme koşu güreş boks okçuluk eskrim satranç tavla dama
kart zar raket kayak sörf dalış yelken golf hentbol ragbi paten halter jimnastik maraton
`.trim().split(/\s+/));
