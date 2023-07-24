"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

let boardLocked = true;
let firstCard;
let secondCard;
let matches = 0;
let guesses = 0;
let currentTimout;
const startBtn = document.querySelector('#start-btn');
const resetBtn = document.querySelector('#reset-btn');
const guessCount = document.querySelector('#guess-count');
const FOUND_MATCH_WAIT_MSECS = 1000;
const COLORS = [];

addRandomColors(COLORS);

const colors = shuffle(COLORS);

createCards(colors);

const cards = document.querySelectorAll('.card');

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


function addRandomColors(array) {
  for (let i = 0; i < 6; i++) {
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
  const gameBoard = document.getElementById("game");

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
  if (boardLocked) return;
  if (evt.target === firstCard) return;
  if (firstCard) {
    secondCard = evt.target;
    flipCard(secondCard);
    boardLocked = true;
    if (cardsAreMatch(firstCard, secondCard)) {
      matches++;
      if (matches === cards.length / 2) {
        swal({
          title: 'Nice work!',
          text: `You got it in ${guesses + 1} guesses!`,
          icon: 'success'
        });
      }
      resetCardsAndUnlockBoard();
    } else {
      currentTimout = setTimeout(() => {
        unFlipCard(secondCard);
        unFlipCard(firstCard);
        resetCardsAndUnlockBoard();
      }, FOUND_MATCH_WAIT_MSECS);
    }
    guessCount.innerText = String(++guesses);
  } else {
    firstCard = evt.target;
    flipCard(firstCard);
  }
}

function resetCardsAndUnlockBoard() {
  firstCard = undefined;
  secondCard = undefined;
  boardLocked = false;
}

function cardsAreMatch(card1, card2) {
  return card1.classList[0] === card2.classList[0];
}

function startGame() {
  boardLocked = false;
  cards.forEach(card => {
    card.style.backgroundColor = '#F0FFFF';
    card.style.opacity = 1;
    card.addEventListener('click', handleCardClick);
  });
  startBtn.disabled = true;
  resetBtn.disabled = false;
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
  matches = 0;
  guesses = 0;
  guessCount.innerText = 0;
  clearTimeout(currentTimout);
}

function reorderCards() {
  cards.forEach(card => {
    const randomOrder = Math.floor(Math.random() * 12);
    card.style.order = randomOrder;
  });
}



startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
