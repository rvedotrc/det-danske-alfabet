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

var alfabetet = "abcdefghijklmnopqrstuvwxyzæøå";
var letterMap = {
  æ: "ae",
  ø: "oe",
  å: "aa",
};

var isPlayable = function (c) {
  return alfabetet.indexOf(c.toLowerCase()) >= 0;
};

var discardCharacter = function () {
  letter.value = letter.value.substr(1);
};

var playLetter = function (c) {
  var filename = letterMap[c.toLowerCase()] || c.toLowerCase();
  audio.src = "audio/" + selectedVoice + "/" + filename + ".mp3";
  audio.load();
  audio.play();

  audio.addEventListener(
    "ended",
    function (e) {
      if (letter.value[0] === c) discardCharacter();
      nibble();
    },
    { once: true },
  );
};

var nibble = function () {
  if (!audio.paused) return;

  while (letter.value.length > 0) {
    var nextCharacter = letter.value[0];

    if (isPlayable(nextCharacter)) {
      playLetter(nextCharacter);
      break;
    } else {
      discardCharacter();
    }
  }
};

setInterval(nibble, 100);

letter.focus();
