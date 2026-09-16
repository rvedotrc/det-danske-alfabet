"use strict";

const audio = document.getElementsByTagName("audio")[0];
const letter = document.getElementById("text");

let selectedVoice = "";

(() => {
  const avatars = [...document.getElementsByClassName("avatar")];
  const VOICES = avatars.map((e) => e.dataset.voice);

  const selectVoice = (voice) => {
    selectedVoice = voice;
    for (const e of avatars) {
      if (e.dataset.voice === voice) {
        e.classList.add("selected");
      } else {
        e.classList.remove("selected");
      }
    }
  };

  selectVoice(VOICES[0]);

  for (const e of avatars) {
    e.addEventListener("click", () => {
      selectVoice(e.dataset.voice);
      letter.focus();
    });
  }
})();

var gentagKnap;
var givOpKnap;

var alfabetet = "abcdefghijklmnopqrstuvwxyzæøå";

var kunBogstavere = function (s) {
  var ikkeBogstavere = new RegExp("[^" + alfabetet + "]", "g");
  return s.replace(ikkeBogstavere, "");
};

////////////////////////////////////////////////////////////////////////////////

class BogstavSpiller {
  constructor() {
    this.stop();
  }

  spil(bogstav, naarFaerdigt) {
    if (!naarFaerdigt) throw "Intet callback";

    bogstav = bogstav.toLowerCase();
    if (alfabetet.indexOf(bogstav) < 0) {
      naarFaerdigt();
      return;
    }

    if (this.spillende) throw "Allerede spillende";

    var filename = BogstavSpiller.letterMap[bogstav] || bogstav;
    audio.src = "audio/" + selectedVoice + "/" + filename + ".mp3";
    audio.load();
    audio.play();
    this.spillende = true;
    this.naarFaerdigt = naarFaerdigt;

    var t = this;
    audio.addEventListener(
      "ended",
      function (e) {
        t.spillende = false;
        var cb = t.naarFaerdigt;
        t.naarFaerdigt = null;
        cb();
      },
      { once: true },
    );
  }

  stop() {
    audio.pause();
    this.spillende = false;
    this.naarFaerdigt = null;
  }
}

BogstavSpiller.letterMap = {
  æ: "ae",
  ø: "oe",
  å: "aa",
};

////////////////////////////////////////////////////////////////////////////////

class BogstaverSpiller {
  constructor(bogstavSpiller) {
    this.bogstavSpiller = bogstavSpiller;
    this.tilbage = "";
    this.naarFaerdigt = null;
  }

  hentSpillende() {
    return this.bogstavSpiller.spillende || tilbage != "";
  }

  naesteBogstav() {
    if (this.tilbage == "") {
      var cb = this.naarFaerdigt;
      this.naarFaerdigt = null;
      cb();
    } else {
      var n = this.tilbage.charAt(0);
      this.tilbage = this.tilbage.substr(1);
      var t = this;
      this.bogstavSpiller.spil(n, function () {
        t.naesteBogstav();
      });
    }
  }

  spil(bogstaver, naarFaerdigt) {
    if (this.spillende) throw "Allerede spillende";
    this.tilbage = bogstaver;
    this.naarFaerdigt = naarFaerdigt;
    this.naesteBogstav();
  }

  stop() {
    this.bogstaver.stop();
    this.tilbage = "";
    this.naarFaerdigt = null;
  }
}

////////////////////////////////////////////////////////////////////////////////

class LytterSpil {
  constructor(bogstaverSpiller) {
    this.rigtigtSvar = null;
    this.timer = null;
    this.bogstaverSpiller = bogstaverSpiller;
  }

  lavSvar() {
    var s = "";
    var l = Math.random() * Math.random() * 5;
    for (var i = 0; i < l; ++i) {
      s += alfabetet.charAt(Math.random() * alfabetet.length);
    }
    return s;
  }

  næsteSpørgsmål() {
    this.rigtigtSvar = this.lavSvar();
    letter.value = "";
    this.begyndAtTjekke();
    this.udspil();
    letter.focus();
    givOpKnap.disabled = false;
    gentagKnap.disabled = false;
  }

  begyndAtTjekke() {
    var t = this;
    this.timer = setInterval(function () {
      t.tjekSvar();
    }, 100);
  }

  stoppeAtTjekke() {
    clearInterval(this.timer);
    this.timer = null;
  }

  udspil() {
    this.bogstaverSpiller.spil(this.rigtigtSvar, function () {});
  }

  tjekSvar() {
    if (kunBogstavere(letter.value.toLowerCase()) == this.rigtigtSvar) {
      givOpKnap.disabled = true;
      gentagKnap.disabled = true;
      this.stoppeAtTjekke();
      letter.blur();
      letter.value = "🇩🇰";
      var t = this;
      setTimeout(function () {
        t.næsteSpørgsmål();
      }, 1000);
    }
  }

  givOp() {
    givOpKnap.disabled = true;
    gentagKnap.disabled = true;
    this.stoppeAtTjekke();
    letter.blur();
    letter.value = this.rigtigtSvar;
    var t = this;
    setTimeout(function () {
      t.næsteSpørgsmål();
    }, 1000);
  }

  gentag() {
    this.udspil();
    letter.focus();
  }

  start() {
    gentagKnap.disabled = true;
    givOpKnap.disabled = true;

    // Eksplicit handling kræves af brugeren
    // https://bugs.chromium.org/p/chromium/issues/detail?id=138132
    letter.value = "[start]";
    letter.addEventListener("click", () => this.næsteSpørgsmål(), {
      once: true,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  gentagKnap = document.getElementById("gentag");
  givOpKnap = document.getElementById("givOp");

  const bogstaverSpiller = new BogstaverSpiller(new BogstavSpiller());
  const lytterSpil = new LytterSpil(bogstaverSpiller);
  givOpKnap.addEventListener("click", function () {
    lytterSpil.givOp();
  });
  gentagKnap.addEventListener("click", function () {
    lytterSpil.gentag();
  });
  lytterSpil.start();
});

// vi: set sw=2 et :
