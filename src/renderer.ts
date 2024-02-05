import "./index.css";
import { Vertex } from "./javaUtils/structures";
import { CRESCENDO_2024 } from "./constants";
import { convert } from "./utils/units";

declare global {
  interface Window {
    api: {
      generatePath: (start: Vertex, target: Vertex) => Promise<Vertex[]>;
      setPointSpacing: (spacing: number) => void;
      setCornerPointSpacing: (spacing: number) => void;
      setCornerDist: (distance: number) => void;
      setInjectPoints: (inject: boolean) => void;
      setNormalizeCorners: (normalize: boolean) => void;
      setCornerSplitPercent: (percent: number) => void;
      setRobotLength: (height: number) => void;
      setRobotWidth: (width: number) => void;
    };
  }
}

const canvas = document.querySelector(".field-canvas") as HTMLCanvasElement;
const container = document.querySelector(".canvas-container") as HTMLDivElement;
const fieldSelect = document.querySelector("#field") as HTMLSelectElement;
const injectPointsCheckbox = document.querySelector(
  "#injectPoints"
) as HTMLInputElement;
const normalizeCornersCheckbox = document.querySelector(
  "#normalizeCorners"
) as HTMLInputElement;
const robotLengthInput = document.querySelector(
  "#robotLength"
) as HTMLInputElement;

const startXInput = document.querySelector("#startX") as HTMLInputElement;
const startYInput = document.querySelector("#startY") as HTMLInputElement;
const straightawayPointSpacingInput = document.querySelector(
  "#straightawayPointSpacing"
) as HTMLInputElement;
const splitPercentSlider = document.querySelector(
  "#splitPercent"
) as HTMLInputElement;
const splitPercentValueSpan = document.querySelector(
  "#splitPercentValue"
) as HTMLSpanElement;

const robotWidthInput = document.querySelector(
  "#robotWidth"
) as HTMLInputElement;
const targetXInput = document.querySelector("#targetX") as HTMLInputElement;
const targetYInput = document.querySelector("#targetY") as HTMLInputElement;
const cornerPointSpacingInput = document.querySelector(
  "#cornerPointSpacing"
) as HTMLInputElement;
const cornerSizeInput = document.querySelector(
  "#cornerSize"
) as HTMLInputElement;
const robotColorInput = document.querySelector(
  "#robotColor"
) as HTMLInputElement;

injectPointsCheckbox.onchange = () => {
  window.api.setInjectPoints(injectPointsCheckbox.checked);
  regeneratePath();
};

normalizeCornersCheckbox.onchange = () => {
  window.api.setNormalizeCorners(normalizeCornersCheckbox.checked);
  regeneratePath();
};

robotLengthInput.onchange = () => {
  window.api.setRobotLength(parseFloat(robotLengthInput.value));
  regeneratePath();
};

robotWidthInput.onchange = () => {
  window.api.setRobotWidth(parseFloat(robotWidthInput.value));
  regeneratePath();
};

straightawayPointSpacingInput.onchange = () => {
  window.api.setPointSpacing(parseFloat(straightawayPointSpacingInput.value));
  regeneratePath();
};

cornerPointSpacingInput.onchange = () => {
  window.api.setCornerPointSpacing(parseFloat(cornerPointSpacingInput.value));
  regeneratePath();
};

cornerSizeInput.onchange = () => {
  window.api.setCornerDist(parseFloat(cornerSizeInput.value));
  regeneratePath();
};

splitPercentSlider.oninput = () => {
  splitPercentValueSpan.innerText = (parseFloat(splitPercentSlider.value) * 100)
    .toFixed(0)
    .toString();
  window.api.setCornerSplitPercent(parseFloat(splitPercentSlider.value));
  regeneratePath();
};

let pathInputs = [startXInput, startYInput, targetXInput, targetYInput];
for (let input of pathInputs) {
  input.onchange = () => {
    currentStart = new Vertex(
      parseFloat(startXInput.value),
      parseFloat(startYInput.value)
    );
    currentEnd = new Vertex(
      parseFloat(targetXInput.value),
      parseFloat(targetYInput.value)
    );
    regeneratePath();
  };
}

const context = canvas.getContext("2d");
const image = document.createElement("img");
canvas.appendChild(image);
image.src = "/assets/2024.png";

const gameData = CRESCENDO_2024;
let currentStart = new Vertex(4, 3);
let currentEnd = new Vertex(14, 6);
let currentPath: Vertex[] = [];

image.onload = () => {
  setInterval(render, 1000 / 60);
};
function render() {
  let width = container.clientWidth;
  let height = container.clientHeight;
  canvas.style.width = width.toString() + "px";
  canvas.style.height = height.toString() + "px";
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  context.scale(window.devicePixelRatio, window.devicePixelRatio);
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#202020";
  context.rect(0, 0, width, height);
  context.fill();
  canvas.style.transform = "translate(-50%, -50%)";

  let fieldWidth = gameData.bottomRight[0] - gameData.topLeft[0];
  let fieldHeight = gameData.bottomRight[1] - gameData.topLeft[1];

  let topMargin = gameData.topLeft[1];
  let bottomMargin = image.height - gameData.bottomRight[1];
  let leftMargin = gameData.topLeft[0];
  let rightMargin = image.width - gameData.bottomRight[0];

  let margin = Math.min(topMargin, bottomMargin, leftMargin, rightMargin);
  let extendedFieldWidth = fieldWidth + margin * 2;
  let extendedFieldHeight = fieldHeight + margin * 2;
  let constrainHeight =
    width / height > extendedFieldWidth / extendedFieldHeight;
  let imageScalar: number;
  if (constrainHeight) {
    imageScalar = height / extendedFieldHeight;
  } else {
    imageScalar = width / extendedFieldWidth;
  }
  let fieldCenterX = fieldWidth * 0.5 + gameData.topLeft[0];
  let fieldCenterY = fieldHeight * 0.5 + gameData.topLeft[1];
  let renderValues = [
    Math.floor(width * 0.5 - fieldCenterX * imageScalar), // X (normal)
    Math.floor(height * 0.5 - fieldCenterY * imageScalar), // Y (normal)
    Math.ceil(width * -0.5 - fieldCenterX * imageScalar), // X (flipped)
    Math.ceil(height * -0.5 - fieldCenterY * imageScalar), // Y (flipped)
    image.width * imageScalar, // Width
    image.height * imageScalar, // Height
  ];
  context.drawImage(
    image,
    renderValues[0],
    renderValues[1],
    renderValues[4],
    renderValues[5]
  );

  let canvasFieldLeft = renderValues[0] + gameData.topLeft[0] * imageScalar;
  let canvasFieldTop = renderValues[1] + gameData.topLeft[1] * imageScalar;
  let canvasFieldWidth = fieldWidth * imageScalar;
  let canvasFieldHeight = fieldHeight * imageScalar;
  let pixelsPerInch =
    (canvasFieldHeight / gameData.heightInches +
      canvasFieldWidth / gameData.widthInches) /
    2;

  // Convert translation to pixel coordinates
  let calcCoordinates = (
    translation: [number, number],
    alwaysFlipped = false
  ): [number, number] => {
    if (!gameData) return [0, 0];
    let positionInches = [
      convert(translation[0], "meters", "inches"),
      convert(translation[1], "meters", "inches"),
    ];

    positionInches[1] *= -1; // Positive y is flipped on the canvas
    positionInches[1] += gameData.heightInches;
    let positionPixels: [number, number] = [
      positionInches[0] * (canvasFieldWidth / gameData.widthInches),
      positionInches[1] * (canvasFieldHeight / gameData.heightInches),
    ];
    if (alwaysFlipped) {
      positionPixels[0] =
        canvasFieldLeft + canvasFieldWidth - positionPixels[0];
      positionPixels[1] =
        canvasFieldTop + canvasFieldHeight - positionPixels[1];
    } else {
      positionPixels[0] += canvasFieldLeft;
      positionPixels[1] += canvasFieldTop;
    }
    return positionPixels;
  };

  for (let v of currentPath) {
    drawCircle(calcCoordinates([v.x, v.y]), 3 * pixelsPerInch, "red");
  }
}

function drawCircle(
  center: [number, number],
  radius: number,
  color: string,
  fill = true
) {
  context.beginPath();
  context.arc(center[0], center[1], radius, 0, Math.PI * 2);
  if (fill) {
    context.fillStyle = color;
    context.fill();
  } else {
    context.strokeStyle = color;
    context.stroke();
  }
  context.closePath();
}

async function regeneratePath() {
  currentPath = await window.api.generatePath(currentStart, currentEnd);
}

regeneratePath();
