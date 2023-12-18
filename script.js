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
  LegendaryPokemon,
  MythicalPokemon,
  getMoveData,
  loadGenerations,
  loadPokemonMoves,
  loadGenerationPokemon,
  checkIfPokemonIsInParty,
  pokemonIsLegendary,
  pokemonIsMythical,
} from "./api.js";

// import { getGenerations } from "./functions.js";

// TODO: Organisera pokemon efter type?
// TODO: Fixa hover klassen på pokemon-preview
// TODO: Fixa hela move UI:n
// TODO: Nytt typsnitt till pokemon namn
// TODO: Fixa API calls för pokemon som har flera former
// TODO: Fixa overflow så att det visas fler pokemon i sökresultatet
// TODO: Lägg till loading ikon
// TODO: Gör om formen av bakgrunden till pokemon i partyt

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
const pokemonPartyDiv = document.querySelector(".pokemon-party");
const saveBtn = document.querySelector(".save-btn");
const clearSaveBtn = document.querySelector(".clear-btn");
const clearPartyBtn = document.querySelector(".clear-party-btn");

// Event Listeners

closeModalButton.addEventListener("click", closeModal);

pokemonSearchBar.addEventListener("input", searchAndLoadPokemon);

moveSearchInputField.addEventListener("input", searchAndLoadMoves);

saveBtn.addEventListener("click", savePokemonToLocalStorage);

clearSaveBtn.addEventListener("click", function () {
  localStorage.clear();
});

clearPartyBtn.addEventListener("click", function () {
  partyState.pokemon.clear();
  const pokemonPartyArray = Array.from(pokemonPartyDiv.children);
  pokemonPartyArray.forEach(function (div) {
    div.innerHTML = "";
    div.style.borderStyle = null;
    div.style.backgroundColor = "";
  });
});

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
  const pokemonMoves = await partyState.currentSelectedPokemon.availableMoves;
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
  console.log(currentMoves);
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
    if (currentMove === undefined) {
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

function savePokemonToLocalStorage() {
  localStorage.clear();
  const currentPokemonParty = Array.from(partyState.pokemon.values());
  currentPokemonParty.forEach(function (pokemon) {
    console.log(pokemon.pokemon.data.name);
    localStorage.setItem(pokemon.id, pokemon.pokemon.data.name);
  });
}

async function loadPokemonFromLocalStorage() {
  const keys = [];
  for (let i = 0; i < localStorage.length; ++i) {
    let key = localStorage.key(i);
    keys.push(key);
  }
  keys.sort(function (a, b) {
    return a[a.length - 1] - b[b.length - 1]; // Inte pålitligt i alla fall
  });
  const promises = [];
  keys.forEach(function (key) {
    const pokemonName = localStorage.getItem(key);
    promises.push(partyAddPokemon(pokemonName, true));
  });

  console.log(promises);
}

function partyRemovePokemon(pokemonName) {
  if (!partyState.pokemon.has(pokemonName)) return;
  const pokemonPartyArray = Array.from(pokemonPartyDiv.children);
  for (const div of pokemonPartyArray) {
    if (div.children.length === 0) continue;
    const pokemonDiv = div.querySelector(".pokemon");
    if (pokemonDiv.id === pokemonName) {
      div.innerHTML = "";
      div.style.borderStyle = null;
      div.style.backgroundColor = "";
      const pokemonPreviewDiv = document.querySelector(
        "#pokemon-list-" + pokemonName
      );
      if (pokemonPreviewDiv != null)
        pokemonPreviewDiv.classList.remove("hidden");
      partyState.pokemon.delete(pokemonName);
    }
  }

  // document.getElementById(partyState.pokemon.get(pokemonName).id).remove();

  // const pokemonListDiv = document.querySelector("#pokemon-list-" + pokemonName);
  // pokemonListDiv.classList.remove("hidden");

  // partyState.pokemon.delete(pokemonName);
}

async function partyAddPokemon(pokemonName, local = false) {
  if (partyState.pokemon.size + 1 > partyState.pokemonLimit) {
    return;
  }

  // NOTE: Ska vi kunna ha fler av samma pokemon i ett lag?

  if (partyState.pokemon.has(pokemonName)) {
    return;
  }

  const pokemonData = await getPokemonData(pokemonName);

  let pokemon;
  if (await pokemonIsLegendary(pokemonData)) {
    pokemon = new LegendaryPokemon(pokemonData);
  } else if (await pokemonIsMythical(pokemonData)) {
    pokemon = new MythicalPokemon(pokemonData);
  } else {
    pokemon = new Pokemon(pokemonData);
  }
  partyState.pokemon.set(pokemonName, {
    pokemon: pokemon,
    id: "party-member-" + (partyState.pokemon.size + 1),
  });

  const markup = `
  <div class="pokemon" id ="${pokemonName}">
  <img class="pokemon-sprite" src="${pokemon.spriteUrl}" alt="" />
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

  pokemonPartyDivisors.reverse().forEach(function (pokemonPartyDivisor, index) {
    if (pokemonPartyDivisor.children.length == 0) {
      availableDiv = pokemonPartyDivisor;
    }
  });
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

  const pokemonColor = pokemon.color;

  availableDiv.style.backgroundColor = pokemonColor;
  availableDiv.style.borderStyle = "solid";
  availableDiv.style.borderColor = pokemon.borderColor;
  if (!local) {
    const pokemonListDiv = document.querySelector(
      "#pokemon-list-" + pokemonName
    );
    pokemonListDiv.classList.add("hidden");
  }
}

const currentGenerations = await loadGenerations(pokemonGenerationSelector);

async function init() {
  await loadPokemonFromLocalStorage();

  loadGenerationPokemon(
    { name: "generation-i", url: GENERATION_URL + "/1" },
    partyState,
    pokemonListDiv,
    createPokemonDiv,
    applyDivEventListeners
  );
}
init();
