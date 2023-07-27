"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

let boardLocked = true;
let firstCardFlipped;
let secondCardFlipped;
let matches = 0;
let guesses = 0;
let currentTimeout;
let currentInterval;
const startBtn = document.querySelector('#start-btn');
const resetBtn = document.querySelector('#reset-btn');
const guessCount = document.querySelector('#guess-count');
const timer = document.querySelector("#timer");
const lowScore = document.querySelector("#low-score");
const fastTime = document.querySelector("#fast-time");
const selectDropdown = document.querySelector('.card-dropdown');
const gameBoard = document.getElementById("game");
const FOUND_MATCH_WAIT_MSECS = 1000;
const COLORS = [];

addRandomColors(COLORS, 12);
const colors = shuffle(COLORS);

createCards(colors);

updateLowScore();
updateFastTime();

let cards = document.querySelectorAll('.card');

/** Shuffle array items in-place and return shuffled array. */

function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.

  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

function changeCardAmount(evt) {
  while (gameBoard.firstChild) {
    gameBoard.removeChild(gameBoard.firstChild);
  }

  COLORS.length = 0;
  const cardAmount = Number(evt.target.value);
  addRandomColors(COLORS, cardAmount);
  shuffle(COLORS);

  createCards(COLORS);
  cards = document.querySelectorAll('.card');

  if (evt.target.value === '16') {
    cards.forEach(card => {
      card.style.height = '22%';
    });
  }
}


function addRandomColors(array, cardAmount) {
  for (let i = 0; i < cardAmount / 2; i++) {
    let num = (Math.random() * 0xfffff * 1000000).toString(16);
    let hexCode = '#' + num.slice(0, 6);
    array.push(hexCode, hexCode);
  }
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click event listener for each card to handleCardClick
 */

function createCards(colors) {
  for (let color of colors) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add(color, 'card');
    gameBoard.appendChild(cardDiv);
  }
}

/** Flip a card face-up. */

function flipCard(card) {
  card.style.backgroundColor = card.classList[0];
}

/** Flip a card face-down. */

function unFlipCard(card) {
  card.style.backgroundColor = '#F0FFFF';
}

/** Handle clicking on a card: this could be first-card or second-card. */

function handleCardClick(evt) {
  if (boardLocked || evt.target === firstCardFlipped) return;

  if (firstCardFlipped) {
    secondCardFlipped = evt.target;
    flipCard(secondCardFlipped);
    boardLocked = true;
    guesses++;
    guessCount.innerText = String(guesses);

    if (cardsAreMatch(firstCardFlipped, secondCardFlipped)) {
      matches++;
      firstCardFlipped.removeEventListener('click', handleCardClick);
      secondCardFlipped.removeEventListener('click', handleCardClick);
      resetCardsAndUnlockBoard();

      if (matches === cards.length / 2) { //if all cards matched
        playSound('win');
        swal({
          title: 'Nice work!',
          text: `You got it in ${guesses} guesses and ${timer.innerText} seconds!`,
          icon: 'success'
        });
        updateLocalStorage(guesses, Number(timer.innerText));
        resetBtn.disabled = false;
        clearInterval(currentInterval);
      } else {
        playSound('match');
      }

    } else { //if cards don't match
      currentTimeout = setTimeout(() => {
        unFlipCard(firstCardFlipped);
        unFlipCard(secondCardFlipped);
        resetCardsAndUnlockBoard();
      }, FOUND_MATCH_WAIT_MSECS);
    }

  } else {
    firstCardFlipped = evt.target;
    flipCard(firstCardFlipped);
  }
}

function resetCardsAndUnlockBoard() {
  firstCardFlipped = undefined;
  secondCardFlipped = undefined;
  boardLocked = false;
}

function cardsAreMatch(card1, card2) {
  return card1.classList[0] === card2.classList[0];
}

function startGame(evt) {
  boardLocked = false;
  cards.forEach(card => {
    card.style.backgroundColor = '#F0FFFF';
    card.style.opacity = 1;
    card.addEventListener('click', handleCardClick);
  });
  startBtn.disabled = true;
  selectDropdown.disabled = true;
  handleTimer(evt.target.id);
}

function resetGame() {
  boardLocked = true;
  cards.forEach(card => {
    card.style.backgroundColor = 'grey';
    card.style.opacity = 0.25;
    card.removeEventListener('click', handleCardClick);
  });
  reorderCards();
  startBtn.disabled = false;
  resetBtn.disabled = true;
  selectDropdown.disabled = false;
  matches = 0;
  guesses = 0;
  guessCount.innerText = 0;
  clearTimeout(currentTimeout);
  handleTimer();
}

function reorderCards() {
  cards.forEach(card => {
    const randomOrder = Math.floor(Math.random() * 12);
    card.style.order = randomOrder;
  });
}

function handleTimer(btnId) {
  if (btnId === 'start-btn') {
    let second = 0;
    currentInterval = setInterval(() => {
      second++;
      timer.innerText = second.toString();
    }, 1000);
  } else {
    timer.innerText = '0';
  }
}

function updateLocalStorage(score, time) {
  const lowestScore = localStorage.getItem("lowestScore");
  const fastestTime = localStorage.getItem('fastestTime');

  if (!lowestScore || score < Number(lowestScore)) {
    localStorage.setItem("lowestScore", score.toString());
  }

  if (!fastestTime || time < Number(fastestTime)) {
    localStorage.setItem("fastestTime", time.toString());
  }

  updateLowScore();
  updateFastTime();
}

function updateLowScore() {
  lowScore.innerText = localStorage.getItem('lowestScore') || "0";
}

function updateFastTime() {
  fastTime.innerText = localStorage.getItem("fastestTime") || "0";
}


function playSound(event) {
  const src = (event === 'win' ?
    './assets/sounds/success_bell-6776.mp3' :
    './assets/sounds/correct-156911.mp3');
  const sound = new Audio(src);
  sound.volume = 0.65;
  sound.play();
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
selectDropdown.addEventListener('change', changeCardAmount);
