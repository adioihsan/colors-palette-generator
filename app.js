// Global Selection and variables;
const colorPlates = document.querySelectorAll(".plate");
const btnGenerate = document.querySelector(".btn-generate");
const sliders = document.querySelectorAll('input[type="range"]');
const hexColorText = document.querySelectorAll(".hex-color-text");
const copyContainer = document.querySelector(".copy-container");
const slidersContainer = document.querySelectorAll(".sliders-adjust");
const btnAdjust = document.querySelectorAll(".adjust");
const btnCloseAdjust = document.querySelectorAll(".close-adjust");
const btnLock = document.querySelectorAll(".lock");

// var for local Stograge
let savedPalettes = [];
let initialColors = [];

// Functions
btnGenerate.addEventListener("click", () => {
  randomColors();
});
//Color GenerateHex;
function generateColor() {
  const hexColor = chroma.random();
  return hexColor;
}
// add event listeners for the sliders
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

//add event listterner for the color plates
colorPlates.forEach((colorPlate, index) => {
  colorPlate.addEventListener("change", () => {
    updateTextUI(colorPlate, index);
  });
});
// event for each time color text clicked
hexColorText.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex.textContent);
  });
});
// Remove copy message after copied
copyContainer.addEventListener("transitionend", () => {
  copyContainer.classList.remove("active");
  copyContainer.children[0].classList.remove("active");
});
// show adjust slider
btnAdjust.forEach((button, index) => {
  button.addEventListener("click", () => {
    showAdjustSlider(index);
  });
});
btnCloseAdjust.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustSlider(index);
  });
});
//lock plate
btnLock.forEach((button, index) => {
  button.addEventListener("click", () => {
    lockColorPlate(button, index);
  });
});

function randomColors() {
  colorPlates.forEach((div, index) => {
    //set color text from random to color-text
    let hexColorText = div.children[0];
    let plateIcons = div.querySelectorAll(".adjust,.lock");
    let hexColor = generateColor();
    if (div.classList.contains("locked")) {
      hexColor = hexColorText.textContent;
      initialColors.push(hexColor);
      return;
    } else {
      initialColors.push(hexColor.hex());
    }

    hexColorText.textContent = hexColor;
    //set color as div background
    div.style.backgroundColor = hexColor;
    //change text contrast based on background color
    changeTextContrast(hexColor, hexColorText);
    //change icon contrass based on background color
    for (icon of plateIcons) {
      changeTextContrast(hexColor, icon);
    }

    //set background color of sliders (initial colorize the sliders)
    const sliders = div.querySelectorAll(".sliders-adjust input");
    const hue = sliders[0];
    const saturtion = sliders[1];
    const brigthness = sliders[2];
    hue.value = hexColor.hsl()[0];
    saturtion.value = hexColor.hsl()[1];
    brigthness.value = hexColor.hsl()[2];
    colorizeSliders(hexColor, hue, saturtion, brigthness);
  });
}
function changeTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "rgb(19, 11, 49)";
  } else {
    text.style.color = "whitesmoke";
  }
}
function colorizeSliders(color, hue, saturtion, brightness) {
  //scale Saturtion

  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //update input colors
  saturtion.style.backgroundImage =
    "linear-gradient(to right," + scaleSat(0) + "," + scaleSat(1);
  brightness.style.backgroundImage =
    "linear-gradient(to right," +
    scaleBright(0) +
    "," +
    midBright +
    "," +
    scaleBright(1);
  hue.style.backgroundImage =
    "linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))";
}

function hslControls(event) {
  const index =
    event.target.getAttribute("data-bright") ||
    event.target.getAttribute("data-sat") ||
    event.target.getAttribute("data-hue");

  const sliders = event.target.parentElement.querySelectorAll(
    "input[type='range']"
  );
  const hue = sliders[0];
  const saturtion = sliders[1];
  const brightness = sliders[2];

  const textColor = initialColors[index];
  let color = chroma(textColor)
    .set("hsl.h", hue.value)
    .set("hsl.s", saturtion.value)
    .set("hsl.l", brightness.value);
  colorPlates[index].style.backgroundColor = color;
  colorizeSliders(color, hue, saturtion, brightness);
}
function updateTextUI(colorPlate, index) {
  const colorBg = colorPlate.style.backgroundColor;
  const colorText = colorPlate.querySelector(".hex-color-text");
  const btnIcons = colorPlate.querySelectorAll(".adjust,.lock");
  colorText.textContent = chroma(colorBg).hex();
  changeTextContrast(colorBg, colorText);
  for (btn of btnIcons) {
    changeTextContrast(colorBg, btn);
  }
}

function copyToClipboard(text) {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  //add copied text to popup
  const popup = copyContainer.children[0];
  const copiedText = popup.children[0];
  copiedText.textContent = text;

  //change icon color to copied color
  const icon = popup.children[1];
  icon.style.color = text;

  copyContainer.classList.add("active");
  popup.classList.add("active");
}

function showAdjustSlider(index) {
  slidersContainer[index].classList.toggle("active");
}
function closeAdjustSlider(index) {
  slidersContainer[index].classList.remove("active");
}
function lockColorPlate(button, index) {
  colorPlates[index].classList.toggle("locked");
  if (button.children[0].classList.contains("fa-lock-open")) {
    button.children[0].classList.remove("fa-lock-open");
    button.children[0].classList.add("fa-lock");
  } else {
    button.children[0].classList.remove("fa-lock");
    button.children[0].classList.add("fa-lock-open");
  }
}

// save palatte to storage
const btnSave = document.querySelector(".btn-save");
const saveContainer = document.querySelector(".save-container");
const savePopup = document.querySelector(".save-popup");
const inputPaletteName = document.querySelector("#palatte-name");
const btnCloseSave = document.querySelector(".close-save");
const btnSavePalatte = document.querySelector(".btn-save-palatte");

const btnLib = document.querySelector(".btn-lib");
const libContainer = document.querySelector(".lib-container");
const libPopup = document.querySelector(".lib-popup");
const btnCloseLib = document.querySelector(".close-lib");

//event listerner to save palatte
btnSave.addEventListener("click", () => {
  saveContainer.classList.add("active");
  savePopup.classList.add("active");
});
btnCloseSave.addEventListener("click", closeSave);
btnSavePalatte.addEventListener("click", savePalette);

function closeSave(e) {
  savePopup.classList.remove("active");
  saveContainer.classList.remove("active");
}

function savePalette(e) {
  const name = inputPaletteName.value;
  const number = savedPalettes.length;
  const colors = [];
  hexColorText.forEach((hex) => {
    colors.push(hex.textContent);
  });
  const palette = { number: number, name, colors };
  savedPalettes.push(palette);
  let previewPalette = createPreviewPalette(palette);
  libPopup.appendChild(previewPalette);
  saveToLocal();
  inputPaletteName.value = "";
  closeSave();
}

function saveToLocal() {
  localStorage.setItem("palettes", JSON.stringify(savedPalettes));
}

function getFromLocal() {
  let localPalettes = JSON.parse(localStorage.getItem("palettes"));
  if (localPalettes === null) localPalettes = [];
  return localPalettes;
}

//get pallate from storage

btnLib.addEventListener("click", () => {
  showLibrary();
});
btnCloseLib.addEventListener("click", () => {
  closeLibrary();
});

function showLibrary() {
  libContainer.classList.add("active");
  libPopup.classList.add("active");
}
function closeLibrary() {
  libContainer.classList.remove("active");
  libPopup.classList.remove("active");
}

function loadFromStorage() {
  savedPalettes = getFromLocal();
  savedPalettes.forEach((palette, index) => {
    //  savedPalettes.push(palette);
    let previewPalette = createPreviewPalette(palette);
    libPopup.appendChild(previewPalette);
  });
}

function createPreviewPalette(palette) {
  let previewPalette = document.createElement("div");
  previewPalette.classList.add("preview-palette");
  let paletteName = document.createElement("p");
  paletteName.innerHTML = palette.name;
  paletteName.classList.add("palette-name");
  previewPalette.appendChild(paletteName);
  palette.colors.forEach((color) => {
    let smallPalette = document.createElement("div");
    smallPalette.classList.add("small-palette");
    smallPalette.style.backgroundColor = color;
    previewPalette.appendChild(smallPalette);
  });
  let btnUse = document.createElement("button");
  btnUse.classList.add("btn-use-palette");
  btnUse.innerHTML = "Use";
  let btnDelete = document.createElement("button");
  btnDelete.classList.add("btn-delete-palette");
  btnDelete.innerHTML = "X";

  initialColors = [];
  btnUse.addEventListener("click", () => {
    palette.colors.forEach((color, index) => {
      initialColors.push(color);
      colorPlates[index].style.backgroundColor = color;
      updateTextUI(colorPlates[index], index);
      const sliders = colorPlates[index].querySelectorAll(
        ".sliders-adjust input"
      );
      let objColor = chroma(color);
      const hue = sliders[0];
      const saturtion = sliders[1];
      const brigthness = sliders[2];
      hue.value = objColor.hsl()[0];
      saturtion.value = objColor.hsl()[1];
      brigthness.value = objColor.hsl()[2];
      colorizeSliders(objColor, hue, saturtion, brigthness);
    });
    closeLibrary();
  });
  btnDelete.addEventListener("click", () => {
    libPopup.removeChild(previewPalette);
    let index = savedPalettes.indexOf(palette);
    savedPalettes.splice(index, 1);
    saveToLocal();
  });

  previewPalette.appendChild(btnUse);
  previewPalette.appendChild(btnDelete);

  return previewPalette;
}
randomColors();
loadFromStorage();
