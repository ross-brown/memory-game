"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

let lockBoard = true;
let firstCard;
let secondCard;
const startBtn = document.querySelector('#start-btn');
const resetBtn = document.querySelector('#reset-btn');
const FOUND_MATCH_WAIT_MSECS = 1000;
const COLORS = [
  "red", "blue", "green", "orange", "purple",
  "red", "blue", "green", "orange", "purple",
];

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
    cardDiv.addEventListener('click', handleCardClick);
    gameBoard.appendChild(cardDiv);
  }
}

/** Flip a card face-up. */

function flipCard(card) {
  card.style.backgroundColor = card.classList[0];
}

/** Flip a card face-down. */

function unFlipCard(card) {
  card.style.backgroundColor = 'white';
}

/** Handle clicking on a card: this could be first-card or second-card. */

function handleCardClick(evt) {
  if (lockBoard) return;
  if (evt.target === firstCard) return;
  if (firstCard) {
    secondCard = evt.target;
    flipCard(secondCard);
    lockBoard = true;
    if (cardsAreMatch(firstCard, secondCard)) {
      resetCardsAndUnlockBoard();
    } else {
      setTimeout(() => {
        unFlipCard(secondCard);
        unFlipCard(firstCard);
        resetCardsAndUnlockBoard();
      }, FOUND_MATCH_WAIT_MSECS);
    }
  } else {
    firstCard = evt.target;
    flipCard(firstCard);
  }
}

function resetCardsAndUnlockBoard() {
  firstCard = undefined;
  secondCard = undefined;
  lockBoard = false;
}

function cardsAreMatch(card1, card2) {
  return card1.classList[0] === card2.classList[0];
}

function startGame() {
  lockBoard = false;
  cards.forEach(card => {
    card.style.backgroundColor = 'white';
    card.style.opacity = 1;
  });
  startBtn.disabled = true;
  resetBtn.disabled = false;
}

function resetGame() {
  lockBoard = true;
  cards.forEach(card => {
    card.style.backgroundColor = 'grey';
    card.style.opacity = 0.1;
  });
  startBtn.disabled = false;
  resetBtn.disabled = true;
}


startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
