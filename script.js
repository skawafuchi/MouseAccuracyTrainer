var cookieAllowed = false;
var targetSize = 30;
var intervalTime = 900;
var interval = null;
var gameLength = 5000;
var score = 0;
var targetNum = 0;
var move = false;
var targetFadeIntervals = [];
var targetMoveIntervals = [];
var hitRegister = "click";
var targetSpeed = 0;

const targetSizes = {
  "target-smol": 30,
  "target-medium": 50,
  "target-chonk": 100
};

const intervalPeriods = {
  "difficulty-easy": 900,
  "difficulty-normal": 500,
  "difficulty-brutal": 400
};

const durationLength = {
  "duration-15": 15000,
  "duration-30": 30000,
  "duration-60": 50000,
  "duration-90": 90000
};

const speedType = {
  "speed-slow": 1,
  "speed-normal": 2,
  "speed-zoop": 3
};

function Target(xPosition, yPosition, xIncrement, yIncrement, element) {
  this.xPosition = xPosition;
  this.yPosition = yPosition;
  this.xIncrement = xIncrement;
  this.yIncrement = yIncrement;
  this.opacity = 1;
  this.element = element;
}

function createTarget() {
  let x = Math.random() * window.innerWidth - targetSize;
  if (x < 0) {
    x = 0;
  }
  let y = Math.random() * window.innerHeight - targetSize;
  if (y < 0) {
    y = 0;
  }
  targetNum++;
  let clickType = hitRegister === "hit-click" ? "onclick" : "onmousedown";

  document.querySelector(".container").innerHTML += '<div id="num' + targetNum + '" ' + clickType + '="addScore(this)" class="target" style="margin-top:' + y + 'px;margin-left:' + x +
    'px;height:' + targetSize + 'px;width:' + targetSize + 'px; opacity:1;"></div>';
  let left = getRandomArbitrary(0, targetSpeed);
  let right = getRandomArbitrary(0, targetSpeed);
  let createdTarget = new Target(x, y, left, right, ("#num" + targetNum));

  targetFadeIntervals[targetNum] = setInterval(function() {
    fadeTarget(createdTarget);
  }, 50);

  if (move) {
    targetMoveIntervals[targetNum] = setInterval(function() {
      moveTarget(createdTarget);
    }, 8);
  }
}

//return random number between inclusive min and exclusive max can return negatives
function getRandomArbitrary(min, max) {
  let negative = Math.floor(Math.random() * 2) === 1 ? 1 : -1;
  return negative * (Math.random() * (max - min) + min);
}

function removeTarget(targetElement) {
  let targetNum = parseInt(targetElement.id.split("num")[1]);
  if (move) {
    clearInterval(targetMoveIntervals[targetNum]);
  }
  clearInterval(targetFadeIntervals[targetNum]);
  targetElement.parentNode.removeChild(targetElement);
}

function fadeTarget(target) {
  document.querySelector(target.element).style.opacity = target.opacity - 0.01;
  target.opacity -= 0.01;
  if (target.opacity <= 0) {
    removeTarget(document.querySelector(target.element));
  }
}

function moveTarget(target) {
  let yPosition = target.yPosition;
  if (yPosition + target.yIncrement < window.innerHeight - targetSize && yPosition + target.yIncrement > 0) {
    document.querySelector(target.element).style.marginTop = (target.yIncrement + yPosition) + "px";
    target.yPosition = yPosition + target.yIncrement;
  } else {
    target.yIncrement = -target.yIncrement;
  }
  let xPosition = target.xPosition;
  if (xPosition + target.xIncrement < window.innerWidth - targetSize && xPosition + target.xIncrement > 0) {
    document.querySelector(target.element).style.marginLeft = (target.xIncrement + xPosition) + "px";
    target.xPosition = xPosition + target.xIncrement;
  } else {
    target.xIncrement = -target.xIncrement;
  }
}

function addScore(targetElement) {
  removeTarget(targetElement);
  score += 1;
}

function startGame() {
  let checkedValues = document.querySelectorAll('input[type="radio"]:checked');
  let settings = [];
  for (let i = 0; i < checkedValues.length; i++) {
    switch (checkedValues[i].attributes.name.value) {
      case "size":
        targetSize = targetSizes[checkedValues[i].attributes.id.value];
        settings["size"] = checkedValues[i].attributes.id.value;
        break;
      case "difficulty":
        intervalTime = intervalPeriods[checkedValues[i].attributes.id.value];
        settings["difficulty"] = checkedValues[i].attributes.id.value;
        break;
      case "hit-register":
        hitRegister = checkedValues[i].attributes.id.value;
        settings["hit-register"] = checkedValues[i].attributes.id.value;
        break;
      case "duration":
        gameLength = durationLength[checkedValues[i].attributes.id.value];
        settings["duration"] = checkedValues[i].attributes.id.value;
        break;
      case "moving":
        move = checkedValues[i].attributes.id.value === "moving-on" ? true : false;
        settings["moving"] = checkedValues[i].attributes.id.value;
        break;
      case "speed":
        targetSpeed = speedType[checkedValues[i].attributes.id.value];
        settings["speed"] = checkedValues[i].attributes.id.value;
        break;
    }
  }
  if (cookieAllowed) {
    document.cookie =
      "settings=" + settings["size"] + "," +
      settings["difficulty"] + "," +
      settings["hit-register"] + "," +
      settings["duration"] + "," +
      settings["moving"] + "," +
      settings["speed"] + ";" +
      "path=/";
  }
  targetNum = 0;
  score = 0;
  interval = setInterval(createTarget, intervalTime);
  //add interval time to give player time to hit last target, minus one to not add another target
  setTimeout(stopGame, gameLength + intervalTime - 1);
  document.querySelector(".settings").classList.add("removed");
}

function stopGame() {
  clearInterval(interval);
  document.querySelector(".settings").classList.remove("removed");
  document.querySelector(".score").textContent = "Hit " + score + "/" + targetNum + " (" + Math.round(score/targetNum*1000)/100 + "%)";
  targets = document.querySelectorAll(".target");
  for (let i = 0; i < targets.length; i++) {
    targets[i].parentNode.removeChild(targets[i]);
  }
  for (let i = 0; i < targetMoveIntervals.length; i++) {
    clearInterval(targetMoveIntervals[i]);
  }
  targetMoveIntervals = [];
  for (let i = 0; i < targetFadeIntervals.length; i++) {
    clearInterval(targetFadeIntervals[i]);
  }
  targetFadeIntervals = [];
  //eventListener being removed when adding the innerHTML from the createTarget function
  document.querySelector(".button-start").addEventListener("click", startGame);
}

document.querySelector(".button-start").addEventListener("click", startGame);
document.querySelector("#moving-off").addEventListener("click", function() {
  for (let i = 0; i < document.querySelectorAll(".speed").length; i++) {
    document.querySelectorAll(".speed")[i].classList.add("hidden");
  }
});

document.querySelector("#moving-on").addEventListener("click", function() {
  let speedButtons = document.querySelectorAll(".speed");
  for (let i = 0; i < speedButtons.length; i++) {
    speedButtons[i].classList.remove("hidden");
  }
});

document.querySelector('input[name="cookie-yes"]').addEventListener("click", function() {
  cookieAllowed = true;
  document.querySelector("footer").classList.add("removed");
});

document.querySelector('input[name="cookie-no"]').addEventListener("click", function() {
  document.querySelector("footer").classList.add("removed");
});

if (document.cookie) {
  cookieAllowed = true;

  //clear values set from HTML
  let checkedValues = document.querySelectorAll('input[type="radio"]:checked');
  for (let i = 0; i < checkedValues.length; i++) {
    checkedValues[i].checked = false;
  }

  let cookieValues = document.cookie.split("=")[1].split(",");
  for (let i = 0; i < cookieValues.length; i++) {
    document.querySelector("#" + cookieValues[i]).checked = true;
  }
  if (document.querySelector("#moving-off").checked){
    let speedButtons = document.querySelectorAll(".speed");
    for (let i = 0; i < speedButtons.length; i++) {
      speedButtons[i].classList.add("hidden");
    }
  }
  document.querySelector("footer").classList.add("removed");
}
