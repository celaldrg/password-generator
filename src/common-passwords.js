/**
 * A small list of very common passwords (international and Turkish), roughly
 * most popular first, ending with famous examples from comics, films and
 * security guides that attackers try early. Entries are lowercase and
 * ASCII-folded (sifre, not şifre) because the strength estimator folds what
 * it checks the same way.
 */
export const COMMON_PASSWORDS = Object.freeze(`
123456 password 123456789 12345678 12345 qwerty 1234567 111111 1234567890 123123
abc123 password1 1234 iloveyou 1q2w3e4r 000000 qwerty123 zaq12wsx dragon sunshine
princess letmein 654321 monkey 666666 1qaz2wsx 123321 qwertyuiop superman asdfghjkl
7777777 121212 112233 159753 987654321 qazwsx 1q2w3e 123qwe qwe123 a123456 123456a
passw0rd p@ssw0rd admin admin123 root welcome login master shadow football baseball
soccer hockey charlie freedom whatever trustno1 starwars hello hello123 secret test
test123 guest google computer internet cookie flower summer winter chocolate 123abc
abcdef abcd1234 aaaaaa asdasd qweqwe zxcvbnm asdf1234 11111111 00000000 88888888
12341234 123654 147258369 147258 789456123 456789 102030 101010 202020 5555555 lovely
love iloveu loveyou baby angel purple orange banana apple cheese ginger pepper qweasd
asdqwe qazwsxedc 1qazxsw2 zxcvbn asdfgh qwert 1q2w3e4r5t q1w2e3r4 abcabc password123
letmein123 welcome1 sifre parola sifre123 parola123 galatasaray fenerbahce besiktas
trabzonspor cimbom ankara istanbul izmir antalya bursa adana konya trabzon turkiye
ataturk askim sevgilim canim bebegim hayatim kalbim gunes yildiz deniz melek prenses
kral aslan kartal 1903 1905 1907 1923 1453 asd123 qwe321
correcthorsebatterystaple tr0ub4dor&3 troubador hunter2 swordfish opensesame
`.trim().split(/\s+/));
