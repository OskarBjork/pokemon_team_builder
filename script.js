import { typeColors } from "./config.js";
import {
  createMoveDiv,
  capitalizeFirstLetter,
  createPokemonDiv,
} from "./functions.js";
import {
  GENERATION_URL,
  POKEMON_URL,
  getGenerations,
  getPokemonData,
  getGenerationPokemon,
  Pokemon,
  getMoveData,
} from "./api.js";

// import { getGenerations } from "./functions.js";

// TODO: Organisera pokemons efter type?

// DOM ELEMENTS

const dropDiv = document.querySelector(".dropdown");
const dropBtn = document.querySelector(".dropbtn");
const dropDownContentDiv = document.querySelector(".dropdown-content");
const pokemonListDiv = document.querySelector(".pokemon-list-box");
const modalWindow = document.querySelector(".pokemon-edit-modal-window");
const pokemonSearchBar = document.querySelector(".search-bar");
const searchInputField = pokemonSearchBar.querySelector("input");

const closeModalButton = modalWindow.querySelector(".close-btn");
const pokemonStatDiv = modalWindow.querySelector(".pokemon-stats");
const editList = modalWindow.querySelector(".pokemon-edit-list");
const currentPokemonMoves = modalWindow.querySelector(".pokemon-moves");
const moveSearchBar = modalWindow.querySelector(".move-search-bar");
const moveSearchInputField = moveSearchBar.querySelector("input");

// Event Listeners

dropBtn.addEventListener("click", function () {
  dropDownContentDiv.classList.toggle("hidden");
  // dropDownContentDiv.style.display = "block";
});

dropDiv.addEventListener("mouseleave", function () {
  dropDownContentDiv.classList.add("hidden");
});

closeModalButton.addEventListener("click", closeModal);

pokemonSearchBar.addEventListener("input", searchAndLoadPokemon);

moveSearchInputField.addEventListener("input", searchAndLoadMoves);

// GLOBALS

let partyState = {
  pokemon: new Map(),
  pokemonPartyDiv: document.querySelector(".pokemon-party"),
  pokemonLimit: 6,
};

let currentSelectedPokemon = null;

let currentGeneration = null;

// FUNCTIONS

function addMoveEventListeners(moveDiv, moveData) {
  moveDiv.addEventListener("mouseover", function () {
    moveDiv.classList.add("hovered");
  });
  moveDiv.addEventListener("mouseout", function () {
    moveDiv.classList.remove("hovered");
  });
  moveDiv.addEventListener("click", function () {
    if (currentSelectedPokemon == null) {
      return;
    }
    if (currentSelectedPokemon.moves.includes(moveData)) {
      return;
    }
    currentSelectedPokemon.moves.push(moveData);
    updateMoveList();
    moveDiv.classList.add("hidden");
  });
}

async function loadGenerations() {
  const generations = await getGenerations();
  generations.forEach(function (generation) {
    const p = document.createElement("p");
    p.className = "pokemon-game-box";
    p.textContent = generation.name;
    addParagraphEventListeners(p, generation);
    dropDownContentDiv.appendChild(p);
  });
}

async function loadPokemonMoves(pokemon) {
  editList.innerHTML = "";
  const moves = pokemon.getMoves();
  moves.forEach(async function (move) {
    const moveData = await getMoveData(move);
    const moveDiv = createMoveDiv(moveData);
    addMoveEventListeners(moveDiv, moveData);
    editList.appendChild(moveDiv);
  });
}

async function loadGenerationPokemon(generation) {
  currentGeneration = generation;
  pokemonListDiv.innerHTML = "";
  const pokemon = await getGenerationPokemon(generation);
  pokemon.forEach(async function (pokemon) {
    if (checkIfPokemonIsInParty(pokemon.name) == true) {
      return;
    }
    const pokemonData = await getPokemonData(pokemon.name);
    let pokemonDiv = createPokemonDiv(pokemonData);
    applyDivEventListeners(pokemonDiv, pokemon.name);
    pokemonListDiv.appendChild(pokemonDiv);
  });
}

async function searchAndLoadPokemon() {
  const searchString = searchInputField.value.toLowerCase();
  const generationPokemon = await getGenerationPokemon(currentGeneration);
  pokemonListDiv.innerHTML = "";
  generationPokemon.forEach(async function (pokemon) {
    if (
      pokemon.name.includes(searchString) &&
      checkIfPokemonIsInParty(pokemon.name) == false
    ) {
      const pokemonData = await getPokemonData(pokemon.name);
      let pokemonDiv = createPokemonDiv(pokemonData);
      applyDivEventListeners(pokemonDiv, pokemon.name);
      pokemonListDiv.appendChild(pokemonDiv);
    }
  });
}

export function addParagraphEventListeners(p, generation) {
  p.addEventListener("mouseover", function () {
    p.classList.add("hovered");
  });
  p.addEventListener("mouseout", function () {
    p.classList.remove("hovered");
  });
  p.addEventListener("click", loadGenerationPokemon.bind(null, generation));
}

function checkIfPokemonIsInParty(pokemonName) {
  return partyState.pokemon.has(pokemonName);
}

async function searchAndLoadMoves() {
  const searchString = moveSearchInputField.value.toLowerCase();
  const pokemonMoves = await currentSelectedPokemon.getMoves();
  editList.innerHTML = "";
  pokemonMoves.forEach(async function (move) {
    if (move.move.name.includes(searchString)) {
      const moveData = await getMoveData(move);
      let moveDiv = createMoveDiv(moveData);
      addMoveEventListeners(moveDiv, moveData);
      editList.appendChild(moveDiv);
    }
  });
}

function applyDivEventListeners(div, pokemonName) {
  div.addEventListener("mouseover", function () {
    div.classList.add("hovered");
  });
  div.addEventListener("mouseout", function () {
    div.classList.remove("hovered");
  });
  div.addEventListener("click", function () {
    partyAddPokemon(pokemonName);
  });
}

function openModal(modal, statDiv, pokemon) {
  currentSelectedPokemon = pokemon;
  modal.style.display = "block";
  statDiv.innerHTML = "";
  const markup = `
  <p class="pokemon-info">${capitalizeFirstLetter(pokemon.data.name)}</p>
        <p class="pokemon-info">HP: ${pokemon.data.stats[0].base_stat}</p>
        <p class="pokemon-info">ATK: ${pokemon.data.stats[1].base_stat}</p>
        <p class="pokemon-info">DEF: ${pokemon.data.stats[2].base_stat}</p>
        <p class="pokemon-info">S.ATK: ${pokemon.data.stats[3].base_stat}</p>
        <p class="pokemon-info">S.DEF: ${pokemon.data.stats[4].base_stat}</p>
        <p class="pokemon-info">SPEED: ${pokemon.data.stats[5].base_stat}</p>
  `;
  statDiv.innerHTML = markup;
  updateMoveList();
  loadPokemonMoves(pokemon);
}

function closeModal() {
  modalWindow.style.display = "none";
}

function removeMove(moveName) {
  if (currentSelectedPokemon == null) {
    return;
  }
  if (moveName == "Empty move slot") {
    return;
  }
  const currentMoves = currentSelectedPokemon.moves;
  for (let i = 0; i < currentMoves.length; ++i) {
    if (currentMoves[i].name == moveName) {
      currentMoves.splice(i, 1);
      updateMoveList();
      break;
    }
  }
  const moveDiv = document.querySelector("#pokemon-move-" + moveName);
  moveDiv.classList.remove("hidden");
}

function updateMoveList() {
  currentPokemonMoves.innerHTML = "";
  for (let i = 0; i < 4; ++i) {
    let currentMove = currentSelectedPokemon.moves[i];
    let moveName;
    if (currentMove == undefined) {
      moveName = "Empty move slot";
    } else {
      moveName = currentMove.name;
    }
    const p = document.createElement("p");
    p.className = "pokemon-move";
    p.textContent = capitalizeFirstLetter(moveName);
    p.addEventListener("click", removeMove.bind(null, moveName));
    currentPokemonMoves.appendChild(p);
  }
}

function partyRemovePokemon(pokemonName) {
  if (!partyState.pokemon.has(pokemonName)) {
    return;
  }

  document.getElementById(partyState.pokemon.get(pokemonName).id).remove();

  const pokemonListDiv = document.querySelector("#pokemon-list-" + pokemonName);
  pokemonListDiv.classList.remove("hidden");

  partyState.pokemon.delete(pokemonName);
}

async function partyAddPokemon(pokemonName) {
  if (partyState.pokemon.size + 1 > partyState.pokemonLimit) {
    return;
  }

  // NOTE: Ska vi kunna ha fler av samma pokemon i ett lag?

  if (partyState.pokemon.has(pokemonName)) {
    return;
  }

  const pokemonData = await getPokemonData(pokemonName);

  const pokemon = new Pokemon(pokemonData);
  partyState.pokemon.set(pokemonName, {
    pokemon: pokemon,
    id: "party-member-" + (partyState.pokemon.size + 1),
  });

  const markup = `
  <div class="pokemon-party-member-container" id="${
    partyState.pokemon.get(pokemonName).id
  }">
  <div class="pokemon">
  <img class="pokemon-sprite" src="${pokemon.getSpriteUrl()}" alt="" />
  <p>${capitalizeFirstLetter(pokemon.name)}</p>
  <div class="pokemon-btns">
  <img src="https://cdn-icons-png.flaticon.com/512/0/128.png" class="edit-pokemon-button" />
  <img src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png" class="remove-pokemon-button" />
  </div>
  </div>
  </div>
  `;

  const doc = new DOMParser().parseFromString(markup, "text/html");
  const div = doc.body.firstChild;
  div
    .querySelector(".edit-pokemon-button")
    .addEventListener(
      "click",
      openModal.bind(null, modalWindow, pokemonStatDiv, pokemon)
    );
  div
    .querySelector(".remove-pokemon-button")
    .addEventListener("click", function () {
      partyRemovePokemon(pokemonName);
    });

  const pokemonColor = pokemon.getColor();

  div.style.backgroundColor = pokemonColor;

  const pokemonListDiv = document.querySelector("#pokemon-list-" + pokemonName);
  pokemonListDiv.classList.add("hidden");

  const pokemonPartyDivisors = document.querySelectorAll(
    ".pokemon-party-member"
  );
  for (const pokemonPartyDivisor of pokemonPartyDivisors) {
    if (pokemonPartyDivisor.children.length == 0) {
      pokemonPartyDivisor.appendChild(div);
      break;
    }
  }
}

loadGenerations();
loadGenerationPokemon({ name: "generation-i", url: GENERATION_URL + "/1" });
