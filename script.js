class MeiteiMayekTransliterator {
  constructor() {
    this.mapum = {
      kh: "ꯈ",
      ng: "ꯉ",
      th: "ꯊ",
      ph: "ꯐ",
      ch: "ꯆ",
      sh: "ꯁ",

      k: "ꯀ",
      s: "ꯁ",
      l: "ꯂ",
      m: "ꯃ",
      p: "ꯄ",
      n: "ꯅ",
      c: "ꯆ",
      t: "ꯇ",
      w: "ꯋ",
      y: "ꯌ",
      h: "ꯍ",
      g: "ꯒ",
      r: "ꯔ",
      b: "ꯕ",
      v: "ꯕ",
      j: "ꯖ",
      z: "ꯖ",
      d: "ꯗ",
      f: "ꯐ",
      q: "ꯀ"
    };

    this.lonsum = {
      k: "ꯛ",
      l: "ꯜ",
      m: "ꯝ",
      p: "ꯞ",
      n: "ꯟ",
      t: "ꯠ",
      ng: "ꯡ"
    };

    this.cheitap = {
      ng: "ꯪ"
    };

    /*
      Visible browser/demo form:
      dra -> ꯗ◌꯭ꯔ

      For technically correct plain Unicode, change this to:
      this.apunIyek = "꯭";
    */
    this.apunIyek = "꯭";

    this.middleVowels = {
      aa: "ꯥ",
      ee: "ꯤ",
      ei: "ꯩ",
      ou: "ꯧ",
      oo: "ꯨ",
      ae: "ꯦ",
      a: "",
      e: "ꯦ",
      i: "ꯤ",
      u: "ꯨ",
      o: "ꯣ"
    };

    this.initialVowels = {
      aa: "ꯑꯥ",
      ee: "ꯏ",
      ei: "ꯑꯩ",
      ou: "ꯑꯧ",
      oo: "ꯎ",
      ae: "ꯑꯦ",
      a: "ꯑ",
      e: "ꯏ",
      i: "ꯏ",
      u: "ꯎ",
      o: "ꯑꯣ"
    };

    this.numbers = {
      0: "꯰",
      1: "꯱",
      2: "꯲",
      3: "꯳",
      4: "꯴",
      5: "꯵",
      6: "꯶",
      7: "꯷",
      8: "꯸",
      9: "꯹"
    };

    this.customPronunciations = {
      romy: "romi",
      romey: "romi",
      alex: "aleksa",
      alexa: "aleksa",
      max: "maksa",
      rex: "reksa",
      felix: "feliksa",
      phoenix: "phiniksa",
      xavier: "zavier",
      zavier: "zavier",
      george: "jorj",
      michael: "maikel",
      sarah: "sara"
    };

    this.patterns = [
      ...Object.keys(this.mapum),
      ...Object.keys(this.middleVowels),
      ...Object.keys(this.initialVowels),
      ...Object.keys(this.cheitap)
    ];

    this.patterns = [...new Set(this.patterns)].sort(
      (a, b) => b.length - a.length
    );
  }

  hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  normalizeEnglishPronunciation(word) {
    const original = word;
    let w = word.toLowerCase().trim();

    if (![...w].some((ch) => /[a-z]/.test(ch))) {
      return original.toLowerCase();
    }

    if (this.customPronunciations[w]) {
      return this.customPronunciations[w];
    }

    const replacements = [
      ["ck", "k"],
      ["qu", "kw"],
      ["ph", "f"],
      ["gh", "g"],
      ["tion", "shon"],
      ["sion", "shon"],
      ["cia", "shia"],
      ["cian", "shian"],
      ["ci", "si"],
      ["ce", "se"],
      ["cy", "si"]
    ];

    for (const [oldText, newText] of replacements) {
      w = w.split(oldText).join(newText);
    }

    if (w.length > 1 && w.endsWith("y")) {
      w = w.slice(0, -1) + "i";
    }

    if (w.endsWith("x")) {
      w = w.slice(0, -1) + "ksa";
    } else {
      w = w.split("x").join("ks");
    }

    return w;
  }

  tokenizeWord(word) {
    word = word.toLowerCase().trim();
    const tokens = [];
    let i = 0;

    while (i < word.length) {
      const current = word[i];

      if (/[0-9]/.test(current)) {
        tokens.push(current);
        i++;
        continue;
      }

      if (!/[a-z0-9]/.test(current)) {
        tokens.push(current);
        i++;
        continue;
      }

      let matched = false;

      for (const pattern of this.patterns) {
        if (word.startsWith(pattern, i)) {
          tokens.push(pattern);
          i += pattern.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        tokens.push(current);
        i++;
      }
    }

    return tokens;
  }

  isConsonant(token) {
    return this.hasOwn(this.mapum, token);
  }

  isVowel(token) {
    return (
      this.hasOwn(this.initialVowels, token) ||
      this.hasOwn(this.middleVowels, token)
    );
  }

  previousTokenIsMapumConsonant(tokens, index) {
    if (index === 0) {
      return false;
    }

    return this.hasOwn(this.mapum, tokens[index - 1]);
  }

  shouldUseCheitapNg(tokens, index) {
    const token = tokens[index];

    if (token !== "ng") {
      return false;
    }

    return this.previousTokenIsMapumConsonant(tokens, index);
  }

  shouldUseApunIyekBeforeR(tokens, index) {
    const token = tokens[index];
    const nextToken = index < tokens.length - 1 ? tokens[index + 1] : null;

    if (!this.isConsonant(token)) {
      return false;
    }

    if (token === "r") {
      return false;
    }

    return nextToken === "r";
  }

  shouldUseCheitapAForAiAo(tokens, index) {
    const token = tokens[index];

    if (token !== "a") {
      return false;
    }

    const previousToken = index > 0 ? tokens[index - 1] : null;
    const nextToken = index < tokens.length - 1 ? tokens[index + 1] : null;

    /*
      consonant + ai / ay / ao
      The 'a' becomes Cheitap ꯥ.

      kai -> ꯀꯥꯏ
      kay -> ꯀꯥꯏ
      kao -> ꯀꯥꯎ
    */
    if (!previousToken || !this.isConsonant(previousToken)) {
      return false;
    }

    return nextToken === "i" || nextToken === "y" || nextToken === "o";
  }

  shouldUseMapumIResubstitution(tokens, index) {
    const token = tokens[index];

    /*
      Resubstitution Rule:
      When y or i comes after a vowel at the end of a syllable,
      use the Mapum Mayek for i/ee: ꯏ.
    */
    if (token !== "y" && token !== "i") {
      return false;
    }

    const previousToken = index > 0 ? tokens[index - 1] : null;
    const nextToken = index < tokens.length - 1 ? tokens[index + 1] : null;

    if (previousToken === null) {
      return false;
    }

    if (!this.isVowel(previousToken)) {
      return false;
    }

    if (nextToken === null) {
      return true;
    }

    if (this.isConsonant(nextToken)) {
      return true;
    }

    return false;
  }

  shouldUseMapumUResubstitution(tokens, index) {
    const token = tokens[index];

    if (token !== "o") {
      return false;
    }

    const previousToken = index > 0 ? tokens[index - 1] : null;
    const previousPreviousToken = index > 1 ? tokens[index - 2] : null;
    const nextToken = index < tokens.length - 1 ? tokens[index + 1] : null;

    /*
      consonant + a + o
      The 'o' becomes Mapum vowel oo/u: ꯎ.

      kao -> ꯀꯥꯎ
      chao -> ꯆꯥꯎ
      mao -> ꯃꯥꯎ
    */
    if (
      previousToken === "a" &&
      previousPreviousToken &&
      this.isConsonant(previousPreviousToken)
    ) {
      if (nextToken === null || this.isConsonant(nextToken)) {
        return true;
      }
    }

    return false;
  }

  shouldUseLonsum(tokens, index) {
    const token = tokens[index];

    if (!this.hasOwn(this.lonsum, token)) {
      return false;
    }

    const previousToken = index > 0 ? tokens[index - 1] : null;
    const nextToken = index < tokens.length - 1 ? tokens[index + 1] : null;

    if (previousToken === null) {
      return false;
    }

    /*
      apng = a + p + ng

      Since 'a' is the beginning independent vowel,
      p must stay Mapum Mayek:
      apng -> ꯑꯄꯪ, not ꯑꯞꯪ
    */
    if (index === 1 && this.hasOwn(this.initialVowels, previousToken)) {
      return false;
    }

    if (!this.hasOwn(this.middleVowels, previousToken)) {
      return false;
    }

    if (nextToken === null) {
      return true;
    }

    if (this.isConsonant(nextToken)) {
      return true;
    }

    return false;
  }

  /*
    Generate a/aa alternatives when:
    - user wrote normal 'a'
    - user did not explicitly write 'aa'
    - there is at least one consonant + a position

    This works even when the word has other vowels later.

    Example:
    kang     -> kang / kaang
    kanglei  -> kanglei / kaanglei
    kanada   -> kanada / kaanada / kanaada / kaanaada etc.
    kaanglei -> no alternatives because user explicitly wrote aa
  */
  shouldGenerateACombinations(rawWord) {
    const word = rawWord.toLowerCase().trim();

    if (!/[a-z]/.test(word)) {
      return false;
    }

    if (word.includes("aa")) {
      return false;
    }

    if (!word.includes("a")) {
      return false;
    }

    const tokens = this.tokenizeWord(word);

    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i] === "a" && this.isConsonant(tokens[i - 1])) {
        return true;
      }
    }

    return false;
  }

  /*
    Creates all possible versions of a word where each consonant + a
    can be treated as either:
    - short/inherent a: a
    - long a: aa

    Example:
    kanglei -> kanglei, kaanglei
    kanada  -> kanada, kaanada, kanaada, kaanaada, kanadaa, etc.
  */
  generateACombinationWords(rawWord) {
    const word = rawWord.toLowerCase().trim();
    const tokens = this.tokenizeWord(word);

    const aPositions = [];

    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i] === "a" && this.isConsonant(tokens[i - 1])) {
        aPositions.push(i);
      }
    }

    const total = Math.pow(2, aPositions.length);
    const variants = [];

    for (let mask = 0; mask < total; mask++) {
      const newTokens = [...tokens];

      for (let bit = 0; bit < aPositions.length; bit++) {
        const position = aPositions[bit];

        if ((mask & (1 << bit)) !== 0) {
          newTokens[position] = "aa";
        }
      }

      variants.push(newTokens.join(""));
    }

    return variants;
  }

  transliterateWord(word, normalizeEnglish = true) {
    if (normalizeEnglish) {
      word = this.normalizeEnglishPronunciation(word);
    }

    const tokens = this.tokenizeWord(word);
    let result = "";

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      const isFirst = index === 0;

      if (this.hasOwn(this.numbers, token)) {
        result += this.numbers[token];
        continue;
      }

      if (!/^[a-z0-9]+$/.test(token)) {
        result += token;
        continue;
      }

      if (isFirst && this.hasOwn(this.initialVowels, token)) {
        result += this.initialVowels[token];
        continue;
      }

      /*
        consonant + ai / ay / ao:
        The 'a' becomes Cheitap ꯥ.
      */
      if (this.shouldUseCheitapAForAiAo(tokens, index)) {
        result += "ꯥ";
        continue;
      }

      /*
        vowel + y/i at syllable end:
        The y/i becomes Mapum i/ee ꯏ.
      */
      if (this.shouldUseMapumIResubstitution(tokens, index)) {
        result += "ꯏ";
        continue;
      }

      /*
        consonant + ao:
        The 'o' becomes Mapum oo/u ꯎ.
      */
      if (this.shouldUseMapumUResubstitution(tokens, index)) {
        result += "ꯎ";
        continue;
      }

      if (this.hasOwn(this.middleVowels, token)) {
        result += this.middleVowels[token];
        continue;
      }

      /*
        Special short-a + ng rule:
        kang -> k + short a + cheitap ng = ꯀꯪ
        ang  -> initial a + cheitap ng = ꯑꯪ

        Important:
        kaang is tokenized as k + aa + ng.
        Since previous token is aa, this rule does not apply.
        kaang -> ꯀꯥꯡ by normal Lonsum rule.
      */
      if (token === "ng") {
        const previousToken = index > 0 ? tokens[index - 1] : null;

        if (previousToken === "a") {
          result += this.cheitap.ng;
          continue;
        }
      }

      if (this.shouldUseCheitapNg(tokens, index)) {
        result += this.cheitap.ng;
        continue;
      }

      if (this.shouldUseLonsum(tokens, index)) {
        result += this.lonsum[token];
        continue;
      }

      if (this.hasOwn(this.mapum, token)) {
        result += this.mapum[token];

        // consonant + r -> consonant + Apun Iyek + r
        if (this.shouldUseApunIyekBeforeR(tokens, index)) {
          result += this.apunIyek;
        }

        continue;
      }

      result += token;
    }

    return result;
  }

  transliterateSentence(text, normalizeEnglish = true) {
    return text
      .split(" ")
      .map((word) => this.transliterateWord(word, normalizeEnglish))
      .join(" ");
  }
}

const transliterator = new MeiteiMayekTransliterator();

let chosenVariants = {};

function getPartsWithWordPositions(text) {
  const parts = text.split(/(\s+)/);
  const result = [];
  let wordIndex = 0;

  for (const part of parts) {
    if (part.trim() === "") {
      result.push({
        type: "space",
        text: part
      });
    } else {
      result.push({
        type: "word",
        text: part,
        wordIndex: wordIndex
      });
      wordIndex++;
    }
  }

  return result;
}

function getWordOptions(word) {
  const normalizedWord = transliterator.normalizeEnglishPronunciation(word);

  if (transliterator.shouldGenerateACombinations(normalizedWord)) {
    const variants = transliterator.generateACombinationWords(normalizedWord);

    const options = variants.map((variant) => {
      return {
        roman: variant,
        mayek: transliterator.transliterateWord(variant, false)
      };
    });

    const uniqueOptions = [];
    const seenMayek = new Set();

    for (const option of options) {
      if (!seenMayek.has(option.mayek)) {
        uniqueOptions.push(option);
        seenMayek.add(option.mayek);
      }
    }

    return uniqueOptions;
  }

  return [
    {
      roman: normalizedWord,
      mayek: transliterator.transliterateWord(word, true)
    }
  ];
}

function renderSuggestions(parts) {
  const suggestionsBox = document.getElementById("suggestionsBox");
  suggestionsBox.innerHTML = "";

  const ambiguousWords = parts.filter((part) => {
    if (part.type !== "word") {
      return false;
    }

    const options = getWordOptions(part.text);
    return options.length > 1;
  });

  if (ambiguousWords.length === 0) {
    return;
  }

  const latestAmbiguousWord = ambiguousWords[ambiguousWords.length - 1];
  const options = getWordOptions(latestAmbiguousWord.text);

  const label = document.createElement("div");
  label.className = "suggestion-label";
  label.textContent = `Choose spelling for "${latestAmbiguousWord.text}"`;
  suggestionsBox.appendChild(label);

  const key = latestAmbiguousWord.wordIndex;

  options.forEach((option, optionIndex) => {
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.type = "button";
    chip.textContent = option.mayek;
    chip.title = option.roman;

    const selectedIndex = chosenVariants[key] ?? 0;

    if (selectedIndex === optionIndex) {
      chip.classList.add("selected");
    }

    chip.addEventListener("click", () => {
      chosenVariants[key] = optionIndex;
      handleTransliteration();
    });

    suggestionsBox.appendChild(chip);
  });
}

function buildOutput(parts) {
  let output = "";

  for (const part of parts) {
    if (part.type === "space") {
      output += part.text;
      continue;
    }

    const options = getWordOptions(part.text);
    const key = part.wordIndex;

    if (options.length > 1) {
      const selectedIndex = chosenVariants[key] ?? 0;
      output += options[selectedIndex].mayek;
    } else {
      output += options[0].mayek;
    }
  }

  return output;
}

function cleanChosenVariants(parts) {
  const validWordIndexes = new Set();

  for (const part of parts) {
    if (part.type === "word") {
      validWordIndexes.add(part.wordIndex);
    }
  }

  for (const key of Object.keys(chosenVariants)) {
    if (!validWordIndexes.has(Number(key))) {
      delete chosenVariants[key];
    }
  }
}

function handleTransliteration() {
  const input = document.getElementById("inputText").value;
  const outputBox = document.getElementById("outputText");
  const suggestionsBox = document.getElementById("suggestionsBox");

  if (input.trim() === "") {
    outputBox.textContent = "";
    suggestionsBox.innerHTML = "";
    chosenVariants = {};
    return;
  }

  const parts = getPartsWithWordPositions(input);
  cleanChosenVariants(parts);
  renderSuggestions(parts);

  outputBox.textContent = buildOutput(parts);
}

document
  .getElementById("inputText")
  .addEventListener("input", handleTransliteration);

handleTransliteration();
