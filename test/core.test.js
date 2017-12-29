import simulant from 'jsdom-simulant';

import { TEST_TABLE, JA_PUNC, EN_PUNC } from './helpers/testTables';

import isKana from '../src/isKana';
import isKanji from '../src/isKanji';
import isJapanese from '../src/isJapanese';
import isKatakana from '../src/isKatakana';
import isHiragana from '../src/isHiragana';
import isRomaji from '../src/isRomaji';
import isMixed from '../src/isMixed';
import { toKana, splitIntoKana } from '../src/toKana';
import toKatakana from '../src/toKatakana';
import toHiragana from '../src/toHiragana';
import toRomaji from '../src/toRomaji';
import stripOkurigana from '../src/stripOkurigana';
import tokenize from '../src/tokenize';
import { bind, unbind } from '../src/domUtils';

describe('Methods should return valid defaults when given no input', () => {
  it('isKana() with no input', () => expect(isKana()).toBe(false));
  it('isKanji() with no input', () => expect(isKanji()).toBe(false));
  it('isJapanese() with no input', () => expect(isJapanese()).toBe(false));
  it('isKatakana() with no input', () => expect(isKatakana()).toBe(false));
  it('isHiragana() with no input', () => expect(isHiragana()).toBe(false));
  it('isRomaji() with no input', () => expect(isRomaji()).toBe(false));
  it('isMixed() with no input', () => expect(isMixed()).toBe(false));
  it('toKana() with no input', () => expect(toKana()).toBe(''));
  it('splitIntoKana() with no input', () =>
    expect(splitIntoKana()).toEqual([]));
  it('toKatakana() with no input', () => expect(toKatakana()).toBe(''));
  it('toHiragana() with no input', () => expect(toHiragana()).toBe(''));
  it('toRomaji() with no input', () => expect(toRomaji()).toBe(''));
  it('stripOkurigana() with no input', () => expect(stripOkurigana()).toBe(''));
  it('tokenize() with no input', () => expect(tokenize()).toEqual(['']));
});

describe('Character type detection', () => {
  describe('isHiragana()', () => {
    it('あ is hiragana', () => expect(isHiragana('あ')).toBe(true));
    it('ああ is hiragana', () => expect(isHiragana('ああ')).toBe(true));
    it('ア is not hiragana', () => expect(isHiragana('ア')).toBe(false));
    it('A is not hiragana', () => expect(isHiragana('A')).toBe(false));
    it('あア is not hiragana', () => expect(isHiragana('あア')).toBe(false));
    it('ignores long dash in hiragana', () =>
      expect(isHiragana('げーむ')).toBe(true));
  });

  describe('isKatakana()', () => {
    it('アア is katakana', () => expect(isKatakana('アア')).toBe(true));
    it('ア is katakana', () => expect(isKatakana('ア')).toBe(true));
    it('あ is not katakana', () => expect(isKatakana('あ')).toBe(false));
    it('A is not katakana', () => expect(isKatakana('A')).toBe(false));
    it('あア is not katakana', () => expect(isKatakana('あア')).toBe(false));
    it('ignores long dash in katakana', () =>
      expect(isKatakana('ゲーム')).toBe(true));
  });

  describe('isKana()', () => {
    it('あ is kana', () => expect(isKana('あ')).toBe(true));
    it('ア is kana', () => expect(isKana('ア')).toBe(true));
    it('あア is kana', () => expect(isKana('あア')).toBe(true));
    it('A is not kana', () => expect(isKana('A')).toBe(false));
    it('あAア is not kana', () => expect(isKana('あAア')).toBe(false));
    it('ignores long dash in mixed kana', () =>
      expect(isKana('アーあ')).toBe(true));
  });

  describe('isKanji()', () => {
    it('切腹 is kanji', () => expect(isKanji('切腹')).toBe(true));
    it('刀 is kanji', () => expect(isKanji('刀')).toBe(true));
    it('🐸 is not kanji', () => expect(isKanji('🐸')).toBe(false));
    it('あ is not kanji', () => expect(isKanji('あ')).toBe(false));
    it('ア is not kanji', () => expect(isKanji('ア')).toBe(false));
    it('あア is not kanji', () => expect(isKanji('あア')).toBe(false));
    it('A is not kanji', () => expect(isKanji('A')).toBe(false));
    it('あAア is not kanji', () => expect(isKanji('あAア')).toBe(false));
    it('１２隻 is not kanji', () => expect(isKanji('１２隻')).toBe(false));
    it('12隻 is not kanji', () => expect(isKanji('12隻')).toBe(false));
    it('隻。 is not kanji', () => expect(isKanji('隻。')).toBe(false));
  });

  describe('isJapanese()', () => {
    it('泣き虫 is japanese', () => expect(isJapanese('泣き虫')).toBe(true));
    it('あア is japanese', () => expect(isJapanese('あア')).toBe(true));
    it('A泣き虫 is not japanese', () =>
      expect(isJapanese('A泣き虫')).toBe(false));
    it('A is not japanese', () => expect(isJapanese('A')).toBe(false));
    it('泣き虫。！〜 (w. zenkaku punctuation) is japanese', () =>
      expect(isJapanese('泣き虫。！〜')).toBe(true));
    it('泣き虫.!~ (w. romaji punctuation) is not japanese', () =>
      expect(isJapanese('泣き虫.!~')).toBe(false));
    it('zenkaku numbers are considered neutral', () =>
      expect(isJapanese('０１２３４５６７８９')).toBe(true));
    it('latin numbers are considered neutral', () =>
      expect(isJapanese('0123456789')).toBe(true));
    it('mixed with numbers is japanese', () =>
      expect(isJapanese('２０１１年')).toBe(true));
    it('hankaku katakana is allowed', () =>
      expect(isJapanese('ﾊﾝｶｸｶﾀｶﾅ')).toBe(true));
  });

  describe('isRomaji()', () => {
    it('A is romaji', () => expect(isRomaji('A')).toBe(true));
    it('xYz is romaji', () => expect(isRomaji('xYz')).toBe(true));
    it('Tōkyō and Ōsaka is romaji', () =>
      expect(isRomaji('Tōkyō and Ōsaka')).toBe(true));
    it('あアA is not romaji', () => expect(isRomaji('あアA')).toBe(false));
    it('お願い is not romaji', () => expect(isRomaji('お願い')).toBe(false));
    it('熟成 is not romaji', () => expect(isRomaji('熟成')).toBe(false));
    it('passes latin punctuation', () =>
      expect(isRomaji('a*b&c-d')).toBe(true));
    it('passes latin numbers', () => expect(isRomaji('0123456789')).toBe(true));
    it('fails zenkaku punctuation', () =>
      expect(isRomaji('a！b&cーd')).toBe(false));
    it('fails zenkaku latin', () => expect(isRomaji('ｈｅｌｌｏ')).toBe(false));
  });

  describe('isMixed()', () => {
    it('Aア is mixed', () => expect(isMixed('Aア')).toBe(true));
    it('Aあ is mixed', () => expect(isMixed('Aあ')).toBe(true));
    it('Aあア is mixed', () => expect(isMixed('Aあア')).toBe(true));
    it('２あア is not mixed', () => expect(isMixed('２あア')).toBe(false));
    it('お腹A is mixed', () => expect(isMixed('お腹A')).toBe(true));
    it('お腹A is not mixed when { passKanji: false }', () =>
      expect(isMixed('お腹A', { passKanji: false })).toBe(false));
    it('お腹 is not mixed', () => expect(isMixed('お腹')).toBe(false));
    it('腹 is not mixed', () => expect(isMixed('腹')).toBe(false));
    it('A is not mixed', () => expect(isMixed('A')).toBe(false));
    it('あ is not mixed', () => expect(isMixed('あ')).toBe(false));
    it('ア is not mixed', () => expect(isMixed('ア')).toBe(false));
  });
});

describe('Character conversion', () => {
  describe('Quick Brown Fox - Romaji to Hiragana', () => {
    // thanks to Yuki http://www.yesjapan.com/YJ6/question/1099/is-there-a-group-of-sentences-that-uses-every-hiragana
    expect(toHiragana('IROHANIHOHETO', { useObsoleteKana: true })).toBe(
      'いろはにほへと'
    ); // Even the colorful fragrant flowers'
    expect(toHiragana('CHIRINURUWO', { useObsoleteKana: true })).toBe(
      'ちりぬるを'
    ); // die sooner or later.'
    expect(toHiragana('WAKAYOTARESO', { useObsoleteKana: true })).toBe(
      'わかよたれそ'
    ); // Us who live in this world'
    expect(toHiragana('TSUNENARAMU', { useObsoleteKana: true })).toBe(
      'つねならむ'
    ); // cannot live forever, either.'
    expect(toHiragana('UWINOOKUYAMA', { useObsoleteKana: true })).toBe(
      'うゐのおくやま'
    ); // This transient mountain with shifts and changes,'
    expect(toHiragana('KEFUKOETE', { useObsoleteKana: true })).toBe(
      'けふこえて'
    ); // today we are going to overcome, and reach the world of enlightenment.'
    expect(toHiragana('ASAKIYUMEMISHI', { useObsoleteKana: true })).toBe(
      'あさきゆめみし'
    ); // We are not going to have meaningless dreams'
    expect(toHiragana('WEHIMOSESUN', { useObsoleteKana: true })).toBe(
      'ゑひもせすん'
    ); // nor become intoxicated with the fake world anymore.'
  });

  describe('Test every character with toKana(), toHiragana(), and toKatakana()', () => {
    describe('toKana()', () => {
      TEST_TABLE.forEach((item) => {
        const [romaji, hiragana, katakana] = item;
        const lower = toKana(romaji);
        const upper = toKana(romaji.toUpperCase());
        it(`${romaji} lowercase -> ${hiragana}`, () =>
          expect(lower).toBe(hiragana));
        it(`${romaji.toUpperCase()} uppercase -> ${katakana}`, () =>
          expect(upper).toBe(katakana));
        it(`${romaji} lowercase -> ${hiragana} snapshot`, () =>
          expect(lower).toMatchSnapshot());
        it(`${romaji.toUpperCase()} uppercase -> ${katakana} snapshot`, () =>
          expect(upper).toMatchSnapshot());
      });
    });

    describe('toHiragana()', () => {
      TEST_TABLE.forEach((item) => {
        const [romaji, hiragana] = item;
        const lower = toHiragana(romaji);
        const upper = toHiragana(romaji.toUpperCase());
        it(`${romaji} lowercase -> ${hiragana}`, () =>
          expect(lower).toBe(hiragana));
        it(`${romaji.toUpperCase()} uppercase -> ${hiragana}`, () =>
          expect(upper).toBe(hiragana));
        it(`${romaji} lowercase -> ${hiragana} snapshot`, () =>
          expect(lower).toMatchSnapshot());
        it(`${romaji.toUpperCase()} uppercase -> ${hiragana} snapshot`, () =>
          expect(upper).toMatchSnapshot());
      });
    });

    describe('toKatakana()', () => {
      TEST_TABLE.forEach((item) => {
        const [romaji, , katakana] = item;
        const lower = toKatakana(romaji);
        const upper = toKatakana(romaji.toUpperCase());
        it(`${romaji} lowercase -> ${katakana}`, () =>
          expect(lower).toBe(katakana));
        it(`${romaji.toUpperCase()} uppercase -> ${katakana}`, () =>
          expect(upper).toBe(katakana));
        it(`${romaji} lowercase -> ${katakana} snapshot`, () =>
          expect(lower).toMatchSnapshot());
        it(`${romaji.toUpperCase()} uppercase -> ${katakana} snapshot`, () =>
          expect(upper).toMatchSnapshot());
      });
    });
  });

  describe('Double consonants transliterate to glottal stops (small tsu)', () => {
    it('double B', () => expect(toKana('babba')).toBe('ばっば'));
    it('double C', () => expect(toKana('cacca')).toBe('かっか'));
    it('double Ch', () => expect(toKana('chaccha')).toBe('ちゃっちゃ'));
    it('double D', () => expect(toKana('dadda')).toBe('だっだ'));
    it('double F', () => expect(toKana('fuffu')).toBe('ふっふ'));
    it('double G', () => expect(toKana('gagga')).toBe('がっが'));
    it('double H', () => expect(toKana('hahha')).toBe('はっは'));
    it('double J', () => expect(toKana('jajja')).toBe('じゃっじゃ'));
    it('double K', () => expect(toKana('kakka')).toBe('かっか'));
    it('double L', () => expect(toKana('lalla')).toBe('らっら'));
    it('double M', () => expect(toKana('mamma')).toBe('まっま'));
    it('double N', () => expect(toKana('nanna')).toBe('なんな'));
    it('double P', () => expect(toKana('pappa')).toBe('ぱっぱ'));
    it('double Q', () => expect(toKana('qaqqa')).toBe('くぁっくぁ'));
    it('double R', () => expect(toKana('rarra')).toBe('らっら'));
    it('double S', () => expect(toKana('sassa')).toBe('さっさ'));
    it('double Sh', () => expect(toKana('shassha')).toBe('しゃっしゃ'));
    it('double T', () => expect(toKana('tatta')).toBe('たった'));
    it('double Ts', () => expect(toKana('tsuttsu')).toBe('つっつ'));
    it('double V', () => expect(toKana('vavva')).toBe('ゔぁっゔぁ'));
    it('double W', () => expect(toKana('wawwa')).toBe('わっわ'));
    it('double X', () => expect(toKana('yayya')).toBe('やっや'));
    it('double Z', () => expect(toKana('zazza')).toBe('ざっざ'));
  });

  describe('toKana()', () => {
    it('Lowercase characters are transliterated to hiragana.', () =>
      expect(toKana('onaji')).toBe('おなじ'));

    it('Lowercase with double consonants and double vowels are transliterated to hiragana.', () =>
      expect(toKana('buttsuuji')).toBe('ぶっつうじ'));

    it('Uppercase characters are transliterated to katakana.', () =>
      expect(toKana('ONAJI')).toBe('オナジ'));

    it('Uppercase with double consonants and double vowels are transliterated to katakana.', () =>
      expect(toKana('BUTTSUUJI')).toBe('ブッツウジ'));

    it('WaniKani -> ワにカに - Mixed case uses the first character for each syllable.', () =>
      expect(toKana('WaniKani')).toBe('ワにカに'));

    it('Non-romaji will be passed through.', () =>
      expect(toKana('ワニカニ AiUeO 鰐蟹 12345 @#$%')).toBe(
        'ワニカニ アいウえオ 鰐蟹 12345 @#$%'
      ));

    it('It handles mixed syllabaries', () =>
      expect(toKana('座禅‘zazen’スタイル')).toBe('座禅「ざぜん」スタイル'));

    it('Will convert short to long dashes', () =>
      expect(toKana('batsuge-mu')).toBe('ばつげーむ'));

    it('Will convert punctuation but pass through spaces', () =>
      expect(toKana(EN_PUNC.join(' '))).toBe(JA_PUNC.join(' ')));
  });

  describe('splitIntoKana()', () => {
    it('Lowercase characters are transliterated to hiragana.', () =>
      expect(splitIntoKana('onaji')).toEqual([
        [0, 1, 'お'],
        [1, 3, 'な'],
        [3, 5, 'じ'],
      ]));

    it('Lowercase with double consonants and double vowels are transliterated to hiragana.', () =>
      expect(splitIntoKana('buttsuuji')).toEqual([
        [0, 2, 'ぶ'],
        [2, 3, 'っ'],
        [3, 6, 'つ'],
        [6, 7, 'う'],
        [7, 9, 'じ'],
      ]));

    it('Uppercase characters are transliterated to katakana.', () =>
      expect(splitIntoKana('ONAJI')).toEqual([
        [0, 1, 'オ'],
        [1, 3, 'ナ'],
        [3, 5, 'ジ'],
      ]));

    it('Uppercase with double consonants and double vowels are transliterated to katakana.', () =>
      expect(splitIntoKana('BUTTSUUJI')).toEqual([
        [0, 2, 'ブ'],
        [2, 3, 'ッ'],
        [3, 6, 'ツ'],
        [6, 7, 'ウ'],
        [7, 9, 'ジ'],
      ]));

    it('WaniKani -> ワにカに - Mixed case uses the first character for each syllable.', () =>
      expect(splitIntoKana('WaniKani')).toEqual([
        [0, 2, 'ワ'],
        [2, 4, 'に'],
        [4, 6, 'カ'],
        [6, 8, 'に'],
      ]));

    it('Non-romaji will be passed through.', () =>
      expect(splitIntoKana('ワニカニ AiUeO 鰐蟹 12345 @#$%')).toEqual([
        [0, 1, 'ワ'],
        [1, 2, 'ニ'],
        [2, 3, 'カ'],
        [3, 4, 'ニ'],
        [4, 5, ' '],
        [5, 6, 'ア'],
        [6, 7, 'い'],
        [7, 8, 'ウ'],
        [8, 9, 'え'],
        [9, 10, 'オ'],
        [10, 11, ' '],
        [11, 12, '鰐'],
        [12, 13, '蟹'],
        [13, 14, ' '],
        [14, 15, '1'],
        [15, 16, '2'],
        [16, 17, '3'],
        [17, 18, '4'],
        [18, 19, '5'],
        [19, 20, ' '],
        [20, 21, '@'],
        [21, 22, '#'],
        [22, 23, '$'],
        [23, 24, '%'],
      ]));

    it('It handles mixed syllabaries', () =>
      expect(splitIntoKana('座禅‘zazen’スタイル')).toEqual([
        [0, 1, '座'],
        [1, 2, '禅'],
        [2, 3, '「'],
        [3, 5, 'ざ'],
        [5, 7, 'ぜ'],
        [7, 8, 'ん'],
        [8, 9, '」'],
        [9, 10, 'ス'],
        [10, 11, 'タ'],
        [11, 12, 'イ'],
        [12, 13, 'ル'],
      ]));

    it('Will convert short to long dashes', () =>
      expect(splitIntoKana('batsuge-mu')).toEqual([
        [0, 2, 'ば'],
        [2, 5, 'つ'],
        [5, 7, 'げ'],
        [7, 8, 'ー'],
        [8, 10, 'む'],
      ]));

    // it('Will convert punctuation but pass through spaces',
    //   () => expect(splitIntoKana(EN_PUNC.join(' '))).toEqual(JA_PUNC.join(' ')));
  });

  describe('Converting kana to kana', () => {
    it('k -> h', () => expect(toHiragana('バケル')).toBe('ばける'));
    it('h -> k', () => expect(toKatakana('ばける')).toBe('バケル'));

    it('It survives only katakana toKatakana', () =>
      expect(toKatakana('スタイル')).toBe('スタイル'));
    it('It survives only hiragana toHiragana', () =>
      expect(toHiragana('すたーいる')).toBe('すたーいる'));
    it('Mixed kana converts every char k -> h', () =>
      expect(toKatakana('アメリカじん')).toBe('アメリカジン'));
    it('Mixed kana converts every char h -> k', () =>
      expect(toHiragana('アメリカじん')).toBe('あめりかじん'));

    describe('long vowels', () => {
      it('Converts long vowels correctly from k -> h', () =>
        expect(toHiragana('バツゴー')).toBe('ばつごう'));
      it('Preserves long dash from h -> k', () =>
        expect(toKatakana('ばつゲーム')).toBe('バツゲーム'));
      it('Preserves long dash from h -> h', () =>
        expect(toHiragana('ばつげーむ')).toBe('ばつげーむ'));
      it('Preserves long dash from k -> k', () =>
        expect(toKatakana('バツゲーム')).toBe('バツゲーム'));
      it('Preserves long dash from mixed -> k', () =>
        expect(toKatakana('バツゲーム')).toBe('バツゲーム'));
      it('Preserves long dash from mixed -> k', () =>
        expect(toKatakana('テスーと')).toBe('テスート'));
      it('Preserves long dash from mixed -> h', () =>
        expect(toHiragana('てすート')).toBe('てすーと'));
      it('Preserves long dash from mixed -> h', () =>
        expect(toHiragana('てすー戸')).toBe('てすー戸'));
      it('Preserves long dash from mixed -> h', () =>
        expect(toHiragana('手巣ート')).toBe('手巣ーと'));
      it('Preserves long dash from mixed -> h', () =>
        expect(toHiragana('tesート')).toBe('てsーと'));
      it('Preserves long dash from mixed -> h', () =>
        expect(toHiragana('ートtesu')).toBe('ーとてす'));
    });

    describe('Mixed syllabaries', () => {
      it('It passes non-katakana through when passRomaji is true k -> h', () =>
        expect(toHiragana('座禅‘zazen’スタイル', { passRomaji: true })).toBe(
          '座禅‘zazen’すたいる'
        ));

      it('It passes non-hiragana through when passRomaji is true h -> k', () =>
        expect(toKatakana('座禅‘zazen’すたいる', { passRomaji: true })).toBe(
          '座禅‘zazen’スタイル'
        ));

      it('It converts non-katakana when passRomaji is false k -> h', () =>
        expect(toHiragana('座禅‘zazen’スタイル')).toBe(
          '座禅「ざぜん」すたいる'
        ));

      it('It converts non-hiragana when passRomaji is false h -> k', () =>
        expect(toKatakana('座禅‘zazen’すたいる')).toBe(
          '座禅「ザゼン」スタイル'
        ));
    });
  });

  describe('Case sensitivity', () => {
    it("cAse DoEsn'T MatTER for toHiragana()", () =>
      expect(toHiragana('aiueo')).toBe(toHiragana('AIUEO')));
    it("cAse DoEsn'T MatTER for toKatakana()", () =>
      expect(toKatakana('aiueo')).toBe(toKatakana('AIUEO')));
    it('Case DOES matter for toKana()', () =>
      expect(toKana('aiueo')).not.toBe(toKana('AIUEO')));
  });

  describe('N edge cases', () => {
    it('Solo N', () => expect(toKana('n')).toBe('ん'));
    it('double N', () => expect(toKana('onn')).toBe('おん'));
    it('N followed by N* syllable', () =>
      expect(toKana('onna')).toBe('おんな'));
    it('Triple N', () => expect(toKana('nnn')).toBe('んん'));
    it('Triple N followed by N* syllable', () =>
      expect(toKana('onnna')).toBe('おんな'));
    it('Quadruple N', () => expect(toKana('nnnn')).toBe('んん'));
    it('nya -> にゃ', () => expect(toKana('nyan')).toBe('にゃん'));
    it('nnya -> んにゃ', () => expect(toKana('nnyann')).toBe('んにゃん'));
    it('nnnya -> んにゃ', () => expect(toKana('nnnyannn')).toBe('んにゃんん'));
    it("n'ya -> んや", () => expect(toKana("n'ya")).toBe('んや'));
    it("kin'ya -> きんや", () => expect(toKana("kin'ya")).toBe('きんや'));
    it("shin'ya -> しんや", () => expect(toKana("shin'ya")).toBe('しんや'));
    it('kinyou -> きにょう', () => expect(toKana('kinyou')).toBe('きにょう'));
    it("kin'you -> きんよう", () => expect(toKana("kin'you")).toBe('きんよう'));
    it("kin'yu -> きんゆ", () => expect(toKana("kin'yu")).toBe('きんゆ'));
    it('Properly add space after "n[space]"', () =>
      expect(toKana('ichiban warui')).toBe('いちばん わるい'));
  });

  describe('Bogus 4 character sequences', () => {
    it('Non bogus sequences work', () => expect(toKana('chya')).toBe('ちゃ'));
    it('Bogus sequences do not work', () =>
      expect(toKana('chyx')).toBe('chyx'));
    it('Bogus sequences do not work', () =>
      expect(toKana('shyp')).toBe('shyp'));
    it('Bogus sequences do not work', () =>
      expect(toKana('ltsb')).toBe('ltsb'));
  });
});

describe('Kana to Romaji', () => {
  describe('toRomaji()', () => {
    it('Convert katakana to romaji', () =>
      expect(toRomaji('ワニカニ　ガ　スゴイ　ダ')).toBe(
        'wanikani ga sugoi da'
      ));

    it('Convert hiragana to romaji', () =>
      expect(toRomaji('わにかに　が　すごい　だ')).toBe(
        'wanikani ga sugoi da'
      ));

    it('Convert mixed kana to romaji', () =>
      expect(toRomaji('ワニカニ　が　すごい　だ')).toBe(
        'wanikani ga sugoi da'
      ));

    it('Will convert punctuation and full-width spaces', () =>
      expect(toRomaji(JA_PUNC.join(''))).toBe(EN_PUNC.join('')));

    it('Use the upcaseKatakana flag to preserve casing. Works for katakana.', () =>
      expect(toRomaji('ワニカニ', { upcaseKatakana: true })).toBe('WANIKANI'));

    it('Use the upcaseKatakana flag to preserve casing. Works for mixed kana.', () =>
      expect(
        toRomaji('ワニカニ　が　すごい　だ', { upcaseKatakana: true })
      ).toBe('WANIKANI ga sugoi da'));

    it("Doesn't mangle the long dash 'ー' or slashdot '・'", () =>
      expect(toRomaji('罰ゲーム・ばつげーむ')).toBe('罰ge-mu/batsuge-mu'));

    it('Spaces must be manually entered', () =>
      expect(toRomaji('わにかにがすごいだ')).not.toBe('wanikani ga sugoi da'));
  });

  describe('Quick Brown Fox - Hiragana to Romaji', () => {
    expect(toRomaji('いろはにほへと')).toBe('irohanihoheto');
    expect(toRomaji('ちりぬるを')).toBe('chirinuruwo');
    expect(toRomaji('わかよたれそ')).toBe('wakayotareso');
    expect(toRomaji('つねならむ')).toBe('tsunenaramu');
    expect(toRomaji('うゐのおくやま')).toBe('uwinookuyama');
    expect(toRomaji('けふこえて')).toBe('kefukoete');
    expect(toRomaji('あさきゆめみし')).toBe('asakiyumemishi');
    expect(toRomaji('ゑひもせすん')).toBe('wehimosesun');
  });

  describe("double n's and double consonants", () => {
    it('Double and single n', () =>
      expect(toRomaji('きんにくまん')).toBe('kinnikuman'));
    it('N extravaganza', () =>
      expect(toRomaji('んんにんにんにゃんやん')).toBe("nnninninnyan'yan"));
    it('Double consonants', () =>
      expect(toRomaji('かっぱ　たった　しゅっしゅ ちゃっちゃ　やっつ')).toBe(
        'kappa tatta shusshu chaccha yattsu'
      ));
  });

  describe('Small kana', () => {
    it("Small tsu doesn't transliterate", () =>
      expect(toRomaji('っ')).toBe(''));
    it('Small ya', () => expect(toRomaji('ゃ')).toBe('ya'));
    it('Small yu', () => expect(toRomaji('ゅ')).toBe('yu'));
    it('Small yo', () => expect(toRomaji('ょ')).toBe('yo'));
    it('Small a', () => expect(toRomaji('ぁ')).toBe('a'));
    it('Small i', () => expect(toRomaji('ぃ')).toBe('i'));
    it('Small u', () => expect(toRomaji('ぅ')).toBe('u'));
    it('Small e', () => expect(toRomaji('ぇ')).toBe('e'));
    it('Small o', () => expect(toRomaji('ぉ')).toBe('o'));
    it('Small ke (ka)', () => expect(toRomaji('ヶ')).toBe('ka'));
    it('Small ka', () => expect(toRomaji('ヵ')).toBe('ka'));
    it('Small wa', () => expect(toRomaji('ゎ')).toBe('wa'));
  });

  describe('Apostrophes in vague consonant vowel combos', () => {
    it('おんよみ', () => expect(toRomaji('おんよみ')).toBe("on'yomi"));
    it('んよ んあ んゆ', () =>
      expect(toRomaji('んよ んあ んゆ')).toBe("n'yo n'a n'yu"));
  });
});

describe('stripOkurigana', () => {
  it('passes default parameter tests', () => {
    expect(stripOkurigana('ふふフフ')).toBe('ふふフフ');
    expect(stripOkurigana('ふaふbフcフ')).toBe('ふaふbフcフ');
    expect(stripOkurigana('お腹')).toBe('お腹');
    expect(stripOkurigana('踏み込む')).toBe('踏み込');
    expect(stripOkurigana('お祝い')).toBe('お祝');
    expect(stripOkurigana('粘り')).toBe('粘');
    expect(stripOkurigana('〜い海軍い、。')).toBe('〜い海軍、。');
  });
  it('strips all kana when passed optional config', () => {
    expect(stripOkurigana('お腹', { all: true })).toBe('腹');
    expect(stripOkurigana('踏み込む', { all: true })).toBe('踏込');
    expect(stripOkurigana('お祝い', { all: true })).toBe('祝');
    expect(stripOkurigana('お踏み込む', { all: true })).toBe('踏込');
    expect(stripOkurigana('〜い海軍い、。', { all: true })).toBe('〜海軍、。');
  });
});

describe('tokenize', () => {
  it('passes default parameter tests', () => {
    expect(tokenize('ふふ')).toEqual(['ふふ']);
    expect(tokenize('フフ')).toEqual(['フフ']);
    expect(tokenize('ふふフフ')).toEqual(['ふふ', 'フフ']);
    expect(tokenize('阮咸')).toEqual(['阮咸']);
    expect(tokenize('感じ')).toEqual(['感', 'じ']);
    expect(tokenize('私は悲しい')).toEqual(['私', 'は', '悲', 'しい']);
    expect(tokenize('what the...私は「悲しい」。')).toEqual([
      'what the...',
      '私',
      'は',
      '「',
      '悲',
      'しい',
      '」。',
    ]);
  });
});

describe('Event listener helpers', () => {
  document.body.innerHTML = `
      <div>
        <input id="ime" type="text" />
        <textarea id="ime2"></textarea>
        <input id="ime3" type="text" />
        <input class="has-no-id" type="text" />
      </div>
    `;
  const inputField1 = document.querySelector('#ime');
  const inputField2 = document.querySelector('#ime2');
  const inputField3 = document.querySelector('.has-no-id');

  it('adds onInput event listener', () => {
    bind(inputField1);
    inputField1.value = 'wanakana';
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('わなかな');
    expect(inputField1.getAttribute('data-wanakana-id')).toBeDefined();
  });

  it('forces autocapitalize "none"', () => {
    expect(inputField1.autocapitalize).toEqual('none');
  });

  it('removes onInput event listener', () => {
    unbind(inputField1);
    inputField1.value = 'fugu';
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('fugu');
    expect(inputField1.getAttribute('data-wanakana-id')).toBeNull();
  });

  it('forces IMEMode true if option not specified', () => {
    bind(inputField1);
    inputField1.value = "n'";
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('ん');
    unbind(inputField1);
  });

  it('should handle an options object', () => {
    bind(inputField1, { useObsoleteKana: true });
    inputField1.value = 'wiweWIWEwo';
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('ゐゑヰヱを');
    unbind(inputField1);
  });

  it('should allow conversion type selection', () => {
    bind(inputField1, { IMEMode: 'toKatakana' });
    bind(inputField2, { IMEMode: 'toHiragana' });
    inputField1.value = 'amerika';
    inputField2.value = 'KURO';
    simulant.fire(inputField1, 'input');
    simulant.fire(inputField2, 'input');
    expect(inputField1.value).toEqual('アメリカ');
    expect(inputField2.value).toEqual('くろ');
    unbind(inputField1);
    unbind(inputField2);
  });

  it('should instantiate separate onInput bindings', () => {
    bind(inputField1, {});
    bind(inputField2, { useObsoleteKana: true });
    inputField1.value = 'WIWEwiwe';
    inputField2.value = 'WIWEwiwe';
    simulant.fire(inputField1, 'input');
    simulant.fire(inputField2, 'input');
    expect(inputField1.value).toEqual('ウィウェうぃうぇ');
    expect(inputField2.value).toEqual('ヰヱゐゑ');
    unbind(inputField1);
    unbind(inputField2);
  });

  it('should keep track of separate onInput bindings if element has no id', () => {
    bind(inputField2);
    bind(inputField3);
    inputField2.value = 'wana';
    inputField3.value = 'kana';
    simulant.fire(inputField2, 'input');
    simulant.fire(inputField3, 'input');
    expect(inputField2.value).toEqual('わな');
    expect(inputField3.value).toEqual('かな');
    unbind(inputField2);
    unbind(inputField3);
  });

  it('ignores double consonants following composeupdate', () => {
    bind(inputField1);
    inputField1.value = 'かｔ';
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('かｔ');
    inputField1.value = 'かｔｔ';
    // have to fake it... no compositionupdate in jsdom
    inputField1.dispatchEvent(
      new CustomEvent('compositionupdate', {
        bubbles: true,
        cancellable: true,
        detail: { data: 'かｔｔ' },
      })
    );
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('かｔｔ');
    unbind(inputField1);
  });

  it('should handle nonascii', () => {
    bind(inputField1);
    inputField1.value = 'ｈｉｒｏｉ';
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('ひろい');
    // skips setting value if conversion would be the same
    inputField1.value = 'かんじ';
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('かんじ');
    unbind(inputField1);
  });

  it('should keep the cursor at the correct position even after conversion', () => {
    bind(inputField1);
    const inputValue = 'sentaku';
    const expected = 'せんたく';
    const expectedCursorPositions = [0, 1, 1, 2, 3, 3, 4, 4];
    for (let index = 0; index < expected.length; index += 1) {
      inputField1.value = inputValue;
      inputField1.setSelectionRange(index, index);
      simulant.fire(inputField1, 'input');
      expect(inputField1.value).toEqual(expected);
      expect(inputField1.selectionStart).toBe(expectedCursorPositions[index]);
    }
    unbind(inputField1);
  });

  it('should reset cursor to end of input values on IE < 9', () => {
    const setSelRef = inputField1.setSelectionRange;
    const collapseSpy = jest.fn();
    const selectSpy = jest.fn();
    inputField1.setSelectionRange = null;
    inputField1.createTextRange = () => ({
      collapse: collapseSpy,
      select: selectSpy,
    });
    bind(inputField1);
    inputField1.value = 'sentaku';
    simulant.fire(inputField1, 'input');
    expect(inputField1.value).toEqual('せんたく');
    expect(collapseSpy).toBeCalled();
    expect(selectSpy).toBeCalled();
    delete inputField1.createTextRange;
    inputField1.setSelectionRange = setSelRef;
    unbind(inputField1);
  });
});

describe('IMEMode', () => {
  /**
   * Simulate real typing by calling the function on every character in sequence
   * @param  {String} input
   * @param  {Object} options
   * @return {String} converted romaji as kana
   */
  function testTyping(input, options) {
    let pos = 1;
    let text = input;
    const len = text.length;
    // console.log(`--${text}--`);
    while (pos <= len) {
      let buffer = text.slice(0, pos);
      const rest = text.slice(pos);
      buffer = toKana(buffer, options);
      // console.log(`${pos}:${buffer} <-${rest}`);
      text = buffer + rest;
      pos += 1;
    }
    return text;
  }

  it("Without IME mode, solo n's are transliterated.", () =>
    expect(toKana('n')).toBe('ん'));
  it("Without IME mode, double n's are transliterated.", () =>
    expect(toKana('nn')).toBe('ん'));

  it("With IME mode, solo n's are not transliterated.", () =>
    expect(testTyping('n', { IMEMode: true })).toBe('n'));
  it("With IME mode, double n's are transliterated.", () =>
    expect(testTyping('nn', { IMEMode: true })).toBe('ん'));
  it('With IME mode, n + space are transliterated.', () =>
    expect(testTyping('n ', { IMEMode: true })).toBe('ん'));
  it("With IME mode, n + ' are transliterated.", () =>
    expect(testTyping("n'", { IMEMode: true })).toBe('ん'));
  it('With IME mode, ni.', () =>
    expect(testTyping('ni', { IMEMode: true })).toBe('に'));

  it('kan', () => expect(testTyping('kan', { IMEMode: true })).toBe('かn'));
  it('kanp', () => expect(testTyping('kanp', { IMEMode: true })).toBe('かんp'));
  it('kanpai!', () =>
    expect(testTyping('kanpai', { IMEMode: true })).toBe('かんぱい'));
  it('nihongo', () =>
    expect(testTyping('nihongo', { IMEMode: true })).toBe('にほんご'));

  it("y doesn't count as a consonant for IME", () =>
    expect(testTyping('ny', { IMEMode: true })).toBe('ny'));
  it('nya works as expected', () =>
    expect(testTyping('nya', { IMEMode: true })).toBe('にゃ'));

  it("With IME mode, solo N's are not transliterated - katakana.", () =>
    expect(testTyping('N', { IMEMode: true })).toBe('N'));
  it("With IME mode, double N's are transliterated - katakana.", () =>
    expect(testTyping('NN', { IMEMode: true })).toBe('ン'));
  it('With IME mode, NI - katakana.', () =>
    expect(testTyping('NI', { IMEMode: true })).toBe('ニ'));
  it('With IME mode - KAN - katakana', () =>
    expect(testTyping('KAN', { IMEMode: true })).toBe('カN'));
  it('With IME mode - NIHONGO - katakana', () =>
    expect(testTyping('NIHONGO', { IMEMode: true })).toBe('ニホンゴ'));
});

describe('Options', () => {
  describe('useObsoleteKana', () => {
    describe('toKana', () => {
      it('useObsoleteKana is false by default', () =>
        expect(toKana('wi')).toBe('うぃ'));
      it('wi = ゐ (when useObsoleteKana is true)', () =>
        expect(toKana('wi', { useObsoleteKana: true })).toBe('ゐ'));
      it('we = ゑ (when useObsoleteKana is true)', () =>
        expect(toKana('we', { useObsoleteKana: true })).toBe('ゑ'));
      it('WI = ヰ (when useObsoleteKana is true)', () =>
        expect(toKana('WI', { useObsoleteKana: true })).toBe('ヰ'));
      it('WE = ヱ (when useObsoleteKana is true)', () =>
        expect(toKana('WE', { useObsoleteKana: true })).toBe('ヱ'));
    });

    describe('toHiragana', () => {
      it('useObsoleteKana is false by default', () =>
        expect(toHiragana('wi')).toBe('うぃ'));
      it('wi = ゐ (when useObsoleteKana is true)', () =>
        expect(toHiragana('wi', { useObsoleteKana: true })).toBe('ゐ'));
      it('we = ゑ (when useObsoleteKana is true)', () =>
        expect(toHiragana('we', { useObsoleteKana: true })).toBe('ゑ'));
      it('wi = うぃ when useObsoleteKana is false', () =>
        expect(toHiragana('wi', { useObsoleteKana: false })).toBe('うぃ'));
    });

    describe('toKataKana', () => {
      it('wi = ウィ when useObsoleteKana is false', () =>
        expect(toKatakana('WI', { useObsoleteKana: false })).toBe('ウィ'));
      it('WI = ヰ (when useObsoleteKana is true)', () =>
        expect(toKatakana('wi', { useObsoleteKana: true })).toBe('ヰ'));
      it('WE = ヱ (when useObsoleteKana is true)', () =>
        expect(toKatakana('we', { useObsoleteKana: true })).toBe('ヱ'));
    });
  });
});
