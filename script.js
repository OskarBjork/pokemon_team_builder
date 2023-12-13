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
  loadGenerations,
  loadPokemonMoves,
  loadGenerationPokemon,
  checkIfPokemonIsInParty,
} from "./api.js";

// import { getGenerations } from "./functions.js";

// TODO: Organisera pokemon efter type?
// TODO: Fixa hover klassen på pokemon-preview
// TODO: Fixa ordningen av pokemon i sökresultatet
// TODO: Fixa så att partyt fylls upp när en pokemon tas bort
// TODO: Fixa hela move UI:n
// TODO: Nytt typsnitt till pokemon namn
// TODO: Fixa API calls för pokemon som har flera former
// TODO: Fixa overflow så att det visas fler pokemon i sökresultatet

// DOM ELEMENTS

const pokemonGenerationSelector = document.querySelector(
  ".pokemon-generation-selector"
);
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

closeModalButton.addEventListener("click", closeModal);

pokemonSearchBar.addEventListener("input", searchAndLoadPokemon);

moveSearchInputField.addEventListener("input", searchAndLoadMoves);

pokemonGenerationSelector.addEventListener("change", function () {
  let generation = null;
  for (const gen of currentGenerations) {
    if (
      gen.name.toLowerCase() == pokemonGenerationSelector.value.toLowerCase()
    ) {
      generation = gen;
      break;
    }
  }
  loadGenerationPokemon(
    generation,
    partyState,
    pokemonListDiv,
    createPokemonDiv,
    applyDivEventListeners
  );
});

// GLOBALS

let partyState = {
  pokemon: new Map(),
  pokemonPartyDiv: document.querySelector(".pokemon-party"),
  pokemonLimit: 6,
  currentSelectedPokemon: null,
  currentGeneration: null,
};

// FUNCTIONS

function addMoveEventListeners(moveDiv, moveData) {
  moveDiv.addEventListener("mouseover", function () {
    moveDiv.classList.add("hovered");
  });
  moveDiv.addEventListener("mouseout", function () {
    moveDiv.classList.remove("hovered");
  });
  moveDiv.addEventListener("click", function () {
    if (partyState.currentSelectedPokemon == null) {
      return;
    }
    if (partyState.currentSelectedPokemon.moves.includes(moveData)) {
      return;
    }
    partyState.currentSelectedPokemon.moves.push(moveData);
    updateMoveList();
    moveDiv.classList.add("hidden");
  });
}

async function searchAndLoadPokemon() {
  const searchString = searchInputField.value.toLowerCase();
  const generationPokemon = await getGenerationPokemon(
    partyState.currentGeneration
  );
  pokemonListDiv.innerHTML = "";
  generationPokemon.forEach(async function (pokemon) {
    if (
      pokemon.name.includes(searchString) &&
      checkIfPokemonIsInParty(pokemon.name, partyState) == false
    ) {
      const pokemonData = await getPokemonData(pokemon.name);
      let pokemonDiv = createPokemonDiv(pokemonData);
      applyDivEventListeners(pokemonDiv, pokemon.name);
      pokemonListDiv.appendChild(pokemonDiv);
    }
  });
}

async function searchAndLoadMoves() {
  const searchString = moveSearchInputField.value.toLowerCase();
  const pokemonMoves = await partyState.currentSelectedPokemon.getMoves();
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
  partyState.currentSelectedPokemon = pokemon;
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
  loadPokemonMoves(pokemon, editList, addMoveEventListeners, createMoveDiv);
}

function closeModal() {
  modalWindow.style.display = "none";
}

function removeMove(moveName) {
  if (partyState.currentSelectedPokemon == null) {
    return;
  }
  if (moveName == "Empty move slot") {
    return;
  }
  const currentMoves = partyState.currentSelectedPokemon.moves;
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
    let currentMove = partyState.currentSelectedPokemon.moves[i];
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
  <div class="pokemon" id ="${partyState.pokemon.get(pokemonName).id}">
  <img class="pokemon-sprite" src="${pokemon.getSpriteUrl()}" alt="" />
  <p>${capitalizeFirstLetter(pokemon.name)}</p>
  </div>
  <div class="pokemon-btns">
  <img src="https://cdn-icons-png.flaticon.com/512/0/128.png" class="edit-pokemon-button" />
  <img src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png" class="remove-pokemon-button" />
  </div>
  </div>
  `;

  let availableDiv;

  let pokemonPartyDivisors = document.querySelectorAll(".pokemon-party-member");

  pokemonPartyDivisors = Array.from(pokemonPartyDivisors);

  for (const pokemonPartyDivisor of pokemonPartyDivisors.reverse()) {
    if (pokemonPartyDivisor.children.length == 0) {
      availableDiv = pokemonPartyDivisor;
    }
  }

  availableDiv.insertAdjacentHTML("beforeend", markup);

  availableDiv
    .querySelector(".edit-pokemon-button")
    .addEventListener(
      "click",
      openModal.bind(null, modalWindow, pokemonStatDiv, pokemon)
    );
  availableDiv
    .querySelector(".remove-pokemon-button")
    .addEventListener("click", function () {
      partyRemovePokemon(pokemonName);
    });

  const pokemonColor = pokemon.getColor();

  availableDiv.style.backgroundColor = pokemonColor;

  const pokemonListDiv = document.querySelector("#pokemon-list-" + pokemonName);
  pokemonListDiv.classList.add("hidden");
}

const currentGenerations = await loadGenerations(pokemonGenerationSelector);

loadGenerationPokemon(
  { name: "generation-i", url: GENERATION_URL + "/1" },
  partyState,
  pokemonListDiv,
  createPokemonDiv,
  applyDivEventListeners
);
