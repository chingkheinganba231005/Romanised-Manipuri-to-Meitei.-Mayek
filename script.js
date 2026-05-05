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
    return Object.prototype.hasOwnProperty.call(this.mapum, token);
  }

  isVowel(token) {
    return (
      Object.prototype.hasOwnProperty.call(this.initialVowels, token) ||
      Object.prototype.hasOwnProperty.call(this.middleVowels, token)
    );
  }

  previousTokenIsMapumConsonant(tokens, index) {
    if (index === 0) {
      return false;
    }

    return Object.prototype.hasOwnProperty.call(this.mapum, tokens[index - 1]);
  }

  shouldUseCheitapNg(tokens, index) {
    const token = tokens[index];

    if (token !== "ng") {
      return false;
    }

    return this.previousTokenIsMapumConsonant(tokens, index);
  }

  shouldUseMapumIResubstitution(tokens, index) {
    const token = tokens[index];

    /*
      Resubstitution Rule 2:
      When y or i comes after a vowel at the end of a syllable,
      use the Mapum Mayek for i/ee: ꯏ
      instead of the Cheitap Mayek vowel sign ꯤ or Mapum y ꯌ.
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

  shouldUseLonsum(tokens, index) {
    const token = tokens[index];

    if (!Object.prototype.hasOwnProperty.call(this.lonsum, token)) {
      return false;
    }

    const previousToken = index > 0 ? tokens[index - 1] : null;
    const nextToken = index < tokens.length - 1 ? tokens[index + 1] : null;

    if (previousToken === null) {
      return false;
    }

    /*
      Important exception:
      apng = a + p + ng

      Since 'a' is the beginning independent vowel,
      p must stay Mapum Mayek:
      apng -> ꯑꯄꯪ, not ꯑꯞꯪ
    */
    if (
      index === 1 &&
      Object.prototype.hasOwnProperty.call(this.initialVowels, previousToken)
    ) {
      return false;
    }

    if (!Object.prototype.hasOwnProperty.call(this.middleVowels, previousToken)) {
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

  transliterateWord(word, normalizeEnglish = true) {
    if (normalizeEnglish) {
      word = this.normalizeEnglishPronunciation(word);
    }

    const tokens = this.tokenizeWord(word);
    let result = "";

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      const isFirst = index === 0;

      if (Object.prototype.hasOwnProperty.call(this.numbers, token)) {
        result += this.numbers[token];
        continue;
      }

      if (!/^[a-z0-9]+$/.test(token)) {
        result += token;
        continue;
      }

      if (
        isFirst &&
        Object.prototype.hasOwnProperty.call(this.initialVowels, token)
      ) {
        result += this.initialVowels[token];
        continue;
      }

      /*
        Resubstitution Rule 2 must come before normal middle-vowel conversion.
        Otherwise, i would become ꯤ too early.
      */
      if (this.shouldUseMapumIResubstitution(tokens, index)) {
        result += "ꯏ";
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(this.middleVowels, token)) {
        result += this.middleVowels[token];
        continue;
      }

      if (this.shouldUseCheitapNg(tokens, index)) {
        result += this.cheitap.ng;
        continue;
      }

      if (this.shouldUseLonsum(tokens, index)) {
        result += this.lonsum[token];
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(this.mapum, token)) {
        result += this.mapum[token];
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

function handleTransliteration() {
  const input = document.getElementById("inputText").value;
  const output = transliterator.transliterateSentence(input);

  document.getElementById("outputText").textContent =
    output.trim() === "" ? "ꯃꯤꯇꯩ ꯃꯌꯦꯛ output will appear here" : output;
}

document
  .getElementById("inputText")
  .addEventListener("input", handleTransliteration);
