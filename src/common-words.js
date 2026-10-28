/**
 * Common words and first names that people build passwords from, written
 * for this project: everyday English words, places, months and numbers in
 * English and Turkish, and English and Turkish first names. The strength
 * checker looks for them next to the passphrase lists; nothing is generated
 * from them. Lowercase a-z only (Turkish names folded: ayse, not ayşe), at
 * least 3 letters, no duplicates and no word that the passphrase lists or
 * the common password list already have (enforced by test/wordlists.test.js).
 */
export const COMMON_WORDS = Object.freeze(`
the and you your yours for with this that these those what when where which while who whom whose why
how not all any are was were been being have has had having could would should will shall may might
must our ours their theirs them they she her hers him his its mine yourself myself himself herself
ourselves here there now then tonight tomorrow yesterday always never ever forever often sometimes
soon again very much many more most less least only just also even yet already almost enough quite
rather about above across after against along among around before behind below beneath beside
between beyond down during except inside into near off onto out outside over past since through
toward under until upon within without because though although unless whether either neither both
each every other another such something someone somebody anything anyone anybody everything everyone
everybody nothing nobody nowhere somewhere anywhere everywhere yes yeah okay please thanks thankyou
sorry hey goodbye bye

people person human man woman men women child children kid kids boy boys girl girls guy guys lady
ladies gentleman mister miss mrs madam mom mommy mummy mother dad daddy father mama papa parent
parents brother sister bro son daughter uncle aunt auntie cousin nephew niece grandma grandpa granny
grandson granddaughter grandmother grandfather husband wife bride groom fiance fiancee lover darling
sweetie sweetheart babe buddy pal mate dude bestie bestfriend boyfriend girlfriend neighbor stranger
friends teen teenager adult elder twin twins couple partner member fans king queen prince duke
duchess lord emperor empress sultan pharaoh boss chief leader hero heroes heroine champions legends
masters mistress warrior warriors fighter fighters soldiers army marine marines sniper rangers
hunters killer killers assassin ninja ninjas samurai viking vikings pirate pirates cowboy cowboys
knights wizard witch sorcerer angels devil devils demon demons ghost ghosts monster monsters vampire
vampires zombie zombies alien aliens robots giants dwarf elf elves fairy fairies goblin troll ogre
dragons unicorn phoenix griffin mermaid titan titans god gods goddess saint saints jesus christ
allah bismillah lucifer satan heaven hell rebel rebels outlaw bandit thief thieves gangster gangsta
thug hacker hackers gamer gamers player players winner winners loser rookie newbie noob legendary
mystic prophet priest monk nun pope bishop guardian keeper watcher stalker predator raptor slayer
destroyer terminator punisher avenger defender protector savior survivor traveler wanderer explorer
dreamer believer lovers sinner rider riders racer racers drivers pilots commander general major
sergeant colonel admiral agent agents spy police cop cops students worker workers actress model
superstar rockstar popstar idol icon genius nerd geek bosses president minister

body eyes hands soul mind blood bones lips kiss kisses kissing hugs smiles tears tear pain hurt
loved loves loving hate hated hates hating like likes liked wants wanted need needs needed feel
feels feeling feelings emotion desire dreams wishes hopes belief lies liar pride shame fear afraid
scared strength powers powerful force spirits mood happiness joyful fun laughs laughing sad sadness
alone angry anger rage fury mad crazy insane free peaceful chaos evil bad best better worse worst
awesome amazing incredible fantastic wonderful beautiful hot fire

planets space universe galaxies stars skies clouds rainy storms winds fires flames waters oceans
seas rivers lakes islands mountains hills forests beaches lava rocks stones diamond diamonds pearl
pearls crystals jewel jewels gem gems natural wildlife animal animals pet pets birds dogs cats
horses kitty tigers lions wolves bears eagles sharks snakes butterfly foxes dolphins whales bees
flowers roses gardens trees leaves seeds roots fall seasons sunlight moonlight starlight nights day
days rainbows shadows darkness lights

home houses room rooms bedroom doors windows walls phone phones mobile cell smartphone laptop
computers desktop screen monitor camera cameras photo photos picture pictures video videos movie
movies films songs speaker speakers headphones drum drums bass band bands concert shows game games
gaming console controller joystick online offline website web network server servers data database
file files document documents email emails mail messages chat text texts logon logout signin signup
account accounts user users username passwords passcode passphrase pin codes secrets private public
access administrator system systems program programs software hardware app apps application tech
technology digital cyber virtual matrix pixels binary hack hacking virus malware firewall security
secure locked keys default changeme temp temporary testing tester demo sample example

works working job jobs company business money cash dollar dollars euro euros pound pounds coins
bitcoin crypto banks credit cards price prices sale sales shopping store stores paid poor millions
billions millionaire billionaire gamble casino poker jackpot lottery bet bets schools class classes
lessons teachers university campus exam exams tests homework studies math science english french
spanish german physics chemistry biology book books page pages stories word words letters name names

goes going gone went come comes coming came get gets getting got take takes taking took makes making
made gives giving gave sees seeing saw seen looks looking watching hear hears hearing heard
listening speaking talking says saying said telling told asking thinking knows knowing knew known
believing forget forgot forgotten lose losing lost finding found keeping kept leave leaving left
staying waiting starting stopping end ending finished closed running ran walking jumping flying flew
swimming driving riding fight fighting fought kill killing killed die dying died dead death living
alive life lives born growing growth playing played winning won fail failed rise rising falling fell
break breaking broke broken building built destroy destroyed burning burned shoot shooting shot hit
hits hitting punch kicks catching throwing holding touching moving dancing singing writing reading
painting cooking eating drinking sleeping waking party parties celebrate holidays vacation discover

big bigger biggest smaller low faster fastest stronger strongest weak darker dirty newer newest
older younger difficult special false fake right wrong last final next previous main bottom ultra
mega hyper extreme ultimate supreme maximum minimum total absolute infinite infinity eternal
eternity immortal endless alpha beta gamma epsilon sigma omega zeta theta prime holy sacred divine
magical cosmic atomic electric sonic turbo nitro savage brutal deadly toxic poison dangerous furious
grey colour color colors colours

sport sports basketball volleyball handball taekwondo kungfu racing snowboard fishing hunting
climbing hiking fitness workout muscles championship league goal goals score scores teams club clubs
striker matches playoff finals defeat dice puzzles quiz level levels gameover highscore checkmate

london paris berlin rome madrid barcelona lisbon amsterdam brussels vienna prague warsaw budapest
athens moscow kiev dublin glasgow edinburgh manchester liverpool chelsea arsenal newcastle
birmingham leeds oxford cambridge york cardiff belfast milan venice naples florence munich hamburg
frankfurt stockholm oslo copenhagen helsinki zurich geneva tokyo osaka kyoto seoul beijing shanghai
hongkong singapore bangkok delhi mumbai dubai cairo baghdad tehran kabul karachi lagos nairobi
sydney melbourne brisbane perth auckland toronto montreal vancouver chicago boston dallas houston
austin denver seattle portland vegas miami atlanta detroit orlando brooklyn manhattan hollywood
california texas florida hawaii alaska arizona nevada oregon ohio michigan carolina virginia jersey
dakota montana kansas kentucky tennessee alabama louisiana georgia america american usa canada
canadian mexico mexican brazil brasil argentina chile peru colombia cuba jamaica england britain
british scotland scottish ireland irish wales welsh france germany italy italian spain portugal
holland dutch belgium sweden norway denmark finland poland russia russian ukraine greece greek
cyprus egypt morocco tunisia algeria libya africa african europe european asia asian china chinese
japan japanese korea korean india indian pakistan iran iraq syria israel lebanon jordan arabia qatar
kuwait australia zealand azerbaijan baku tbilisi kazakhstan uzbekistan bosnia serbia croatia albania
bulgaria romania kosovo macedonia eskisehir kayseri samsun mersin gaziantep diyarbakir malatya
erzurum sivas denizli manisa sakarya kocaeli izmit tekirdag edirne canakkale balikesir mugla alanya
marmaris fethiye kusadasi rize ordu giresun artvin kars hatay antakya urfa sanliurfa mardin elazig
tokat amasya corum yozgat kirsehir nevsehir aksaray nigde karaman isparta burdur afyon kutahya usak
bilecik bolu duzce zonguldak bartin karabuk kastamonu sinop cankiri kirikkale bingol mus bitlis
siirt sirnak hakkari agri igdir ardahan erzincan tunceli adiyaman kilis osmaniye kahramanmaras maras
yalova kibris lefkosa girne magusa beyoglu kadikoy uskudar taksim bakirkoy

jan feb mar apr jun jul aug sep sept oct nov dec weekday thirteen fourteen fifteen sixteen seventeen
eighteen nineteen sixty seventy eighty ninety trillion zillion

james john robert michael william david richard joseph thomas charles christopher daniel matthew
anthony mark donald steven paul andrew joshua kenneth kevin brian george timothy ronald edward jason
jeffrey ryan jacob gary nicholas eric jonathan stephen larry justin scott brandon benjamin samuel
gregory alexander frank patrick raymond jack dennis jerry tyler aaron jose adam nathan henry douglas
zachary peter kyle ethan walter noah jeremy christian keith roger terry gerald harold sean carl
arthur lawrence dylan jesse bryan billy joe bruce gabriel logan albert willie alan juan wayne elijah
randy roy vincent ralph eugene russell bobby philip louis harry oliver lucas liam max leo oscar jake
luke alex sam ben tom tommy mike mikey chris nick matt dan danny steve stevie tony johnny jimmy joey
eddie freddie frankie ricky robbie andy marcus martin victor cody travis blake connor caleb isaac
owen evan ian colin jared derek trevor shane troy chad brad brett dustin wesley spencer dean carlos
luis miguel diego pedro antonio marco mario luca ivan dmitri sergio rafael pablo javier manuel
fernando ricardo eduardo roberto alejandro andre andrei nikolai vladimir igor boris hans klaus
stefan lars sven olaf pierre jacques francois michel luc andreas mohammed mohamed muhammad ahmed
omar khalid hassan hussein karim tariq rashid jamal malik amir sami mary patricia jennifer linda
elizabeth barbara susan jessica sarah karen lisa nancy betty margaret sandra ashley kimberly emily
donna michelle carol amanda dorothy melissa deborah stephanie rebecca sharon laura cynthia kathleen
amy angela shirley anna brenda pamela emma nicole helen samantha katherine christine debra rachel
carolyn janet catherine maria diane ruth julie olivia joyce victoria kelly lauren christina joan
evelyn judith megan andrea cheryl hannah jacqueline martha gloria teresa ann sara madison frances
kathryn janice jean abigail alice judy sophia grace denise doris marilyn danielle beverly isabella
theresa diana natalie brittany charlotte marie kayla alexis lori jasmine chloe zoe ella mia ava
amelia harper aria ellie lucy molly rosie holly bella stella luna nina tina gina hanna kate katie
kim jenny jenna jess becky maggie sally cindy wendy mandy brandy tiffany destiny sophie monica
veronica erica alyssa alexandra savannah sierra taylor morgan casey riley kelsey courtney lindsay
whitney melanie vanessa jenifer claire clara julia juliet romeo naomi leah sofia camila valentina
lucia elena irina natasha olga svetlana tanya katya anastasia nadia fatima aisha layla yasmin mariam
amira

mehmet ahmet mustafa ali huseyin hasan ibrahim ismail osman yusuf murat omer ramazan halil suleyman
abdullah mahmut recep salih fatih kadir emre hakan adem kemal yasar aydin serkan burak ugur erkan
sinan cem emir eren efe kerem arda berk tolga tuncay levent selim sefa enes furkan yasin hamza taha
oguz oguzhan berkay batuhan alper alperen ozan kaan mert gokhan sercan erdem erdal orhan tarik
tayfun cengiz cagri emrah ilker ilhan kenan metin nihat okan ozgur ozkan rasit sedat sezer sukru
tamer turgut yavuz yilmaz serdar cihan cihat erhan erol ferhat gurkan hayri ilyas koray mesut
muhammet nevzat orcun rifat selcuk semih sertac taner tugay tuncer umit veli yakup yigit bulent
cetin engin ercan ersin fikret gokay hikmet irfan kubilay mevlut necati polat ridvan savas sencer
tekin tufan cemal fatma ayse emine hatice zeynep elif meryem hulya merve esra ebru sibel derya
gulsen aysel songul nur nuray serap seda sevda sinem buse busra kubra rabia irem ece eda ceren cansu
damla defne dilara duygu gizem gonul gulay hande melis melisa nazli nisa nilay selin selen simge
tugba zehra asli aylin burcu cigdem demet dilek gokce hilal leyla oya ozge sena sevim sila tulay
yeliz zuhal aleyna asya azra beren berra betul beyza cemre dicle elcin esin esma feride figen gulcan
gulsah gulten hacer hale havva hazal kevser lutfiye medine meltem mukaddes nalan nermin nesrin nihan
nurcan perihan rukiye saadet saliha seher selma semra serpil sevil sule tulin umran yeter zerrin
zubeyde

imissyou missyou loveme kissme hateyou bestfriends soulmate truelove mylove myheart myworld mylife
mybaby myangel princesa amor amore amigo amigos chica chico bonita cherie liebe schatz lol omg haha
hahaha lmao rofl xoxo pussycat teddy teddybear bubbles sparkle glitter sweetpea peaches buttercup
snowflake snowball snowman buster bailey smokey spike rex zeus milo toby sammy coco whiskers mittens
patches blackie sweety inferno hellfire firestorm thunderbolt tsunami earthquake stardust nightmare
nightfall darkside darklord darkangel blackjack blackhawk blackbird redrose bluesky silverfox
goldfish spiderweb bulls turk turkler bozkurt vatan sehit gazi osmanli kanuni padisah seniseviyorum
seviyorum seni tatlim birtanem cicim kardesim abi abim ablam annem babam oglum kizim dostum kanka
kanki yildizim gunesim melegim

ability accident act activity actually address advice affair age agency agreement aim airline alarm
album alcohol ambition amount angle announce apartment appeal apply approach area argue argument
arrange arrest article aspect assist attack attempt attend attention attitude attract audience
available average avoid award aware background bar base basic basis bath battery battle beat beer
behave behavior benefit bike bill birth birthday bit bite bitter blade blame blank blind block blow
board bomb bond border bore bother bound brand breath brilliant bug bullet bunch burden burst
calculate campaign cancel candidate capable capacity career case cause center centre challenge
chamber channel character charge charity chart check chemical chest church cigarette citizen civil
claim classic client collection column combat command comment commercial commission committee common
community compare compete complain complete complex concept concern condition conference confidence
confirm conflict connect conscious constant contact contain content contest context contract
contribute control conversation corner correct cost council counter course crack crash crew crime
criminal crisis critical cruel curious current custom customer damage danger deal debate debt
decision declare decline defend defense define degree demand deny department depend deposit depth
describe design despite develop device dialog diet differ direct direction director disease display
distance district divide doubt draft drama drug duty economy edge edition education effect effective
efficient election emergency empire employ enemy engage enormous ensure entire entrance entry
environment episode equal equipment error essay essential estate estimate evidence exact examine
excellent exchange excite exercise exist expand expect expense experience expert explain explode
express extend extra fabric factor familiar fault feature federal fee female figure fit flash flight
folk foreign formal format former formula forward foundation fruit fuel function fund funeral
furniture gain gap gender gene generation gesture glance global grade grain grant grave ground group
guarantee guilty headline heat height highlight hire hole horror host ideal identity ignore illegal
illness impact imply import impose impress improve incident income increase index indicate industry
influence inform initial injury inner innocent input insect insist install instance instead
institute insurance intend interest internal interview introduce invest issue item joke journal
junior jury label labor lack landscape language latter launch lawn layer lean lecture legal length
liberal license limit line link liquid list literature load loan local location loose loss lot lower
machine magazine male manage manner margin marriage married mass material matter meaning meat media
medical medicine medium meeting mental mention menu mess middle military minor mistake mixture mode
moderate modest moral mount movement murder nation native negative nerve news newspaper noise normal
northern note nuclear object obtain obvious occasion occur offense official oil operate opinion
opponent opportunity oppose ordinary organize original output owner pace package pair panel panic
parking part particular passenger path penalty pension percent perform period permanent permit
personal perspective phase phrase physical pile pitch plane platform plus pole policy political pool
pop popular population port portion pose position positive possess possible post potential poverty
powder practice pray prayer predict prefer prepare presence present preserve press pressure prevent
primary principle priority prison prisoner privacy prize probably problem procedure process produce
product profession profile profit progress project promote proof proper property proposal protect
protest provide province pub publish punish pupil purchase pure purpose pursue quality quantity
quarter quote radical raise range rank rate rating ratio raw reach react reader reality realize
recall receive recent recognize recommend recover reduce refer reflect reform refuse region register
regret regular reject relate relation release relief religion rely remain remind remote remove rent
repeat replace reply report represent republic request require research reserve resident resist
resolve resource respect respond response responsible restaurant result retain retire reveal revenue
review revolution reward rid risk rival role romance route ruin rule rural sack salary satisfy scene
schedule scheme scholar scope scream script seat section sector select senior sense sentence
separate sequence series serious servant serve service session settle severe shade shape shell shift
shock shower shut sick side sight sign signature similar site situation size skill slice slight slip
smoke snap social society sole solution somewhat source southern speech spend split sponsor spot
spread stable staff stake standard staple stare state statement status steal steam stick stock
storage stress strike stroke structure struggle stuff style subject submit succeed sudden suffer
suggest summary supply support suppose surface surgery surround survey survive suspect swear sweat
switch sympathy symptom tail tank tap target task tax technique telephone television temperature
temple tend tension term terrible territory terror therapy threat tight tip tire tired title tone
tool tour tourist track trade traffic tragedy trail training transfer transform transport trap treat
treaty trend trial tribe trouble tune twist typical unique unit upper urban urge usual variety
various vehicle version vessel victim view violence visible visual vital volume vote wage war warn
waste weapon wedding weight weird western whereas whole widow width willing wine wing witness worth
wound wrap yield troubadour
`.trim().split(/\s+/));
