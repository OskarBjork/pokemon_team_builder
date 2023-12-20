import { typeColors, typeIcons } from "./modules/config.js";
import {
  createMoveDiv,
  capitalizeFirstLetter,
  createPokemonDiv,
} from "./modules/functions.js";
import {
  GENERATION_URL,
  POKEMON_URL,
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
} from "./modules/api.js";

// DOM ELEMENTS

const pokemonGenerationSelector = document.querySelector(
  ".pokemon-generation-selector"
);
const pokemonListBoxDiv = document.querySelector(".pokemon-list-box");
const modalWindow = document.querySelector(".pokemon-edit-modal-window");
const pokemonSearchBar = document.querySelector(".search-bar");
const searchInputField = pokemonSearchBar.querySelector("input");

const closeModalButton = modalWindow.querySelector(".close-btn");
const pokemonDataDiv = modalWindow.querySelector(".pokemon-data");
const editList = modalWindow.querySelector(".pokemon-edit-list");
const currentPokemonMoves = modalWindow.querySelector(".pokemon-moves");
const moveSearchBar = modalWindow.querySelector(".move-search-bar");
const moveSearchInputField = moveSearchBar.querySelector("input");
const pokemonPartyDiv = document.querySelector(".pokemon-party");
const saveBtn = document.querySelector(".save-btn");
const clearSaveBtn = document.querySelector(".clear-btn");
const clearPartyBtn = document.querySelector(".clear-party-btn");
const loadingIcon = document.querySelector(".loading-icon");
const loadPartyBtn = document.querySelector(".load-btn");

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
    const pokemonName = div.querySelector(".pokemon")?.id;
    div.innerHTML = "";
    div.style.borderStyle = null;
    div.style.borderColor = "";
    div.style.backgroundColor = "";
    if (pokemonName != null) {
      const pokemonListDiv = document.querySelector(
        "#pokemon-list-" + pokemonName
      );
      if (pokemonListDiv != null) pokemonListDiv.classList.remove("hidden");
    }
  });
});

pokemonGenerationSelector.addEventListener("change", async function () {
  loadingIcon.classList.remove("hidden");
  let generation = null;
  for (const gen of currentGenerations) {
    if (
      gen.name.toLowerCase() == pokemonGenerationSelector.value.toLowerCase()
    ) {
      generation = gen;
      break;
    }
  }
  await loadGenerationPokemon(
    generation,
    partyState,
    pokemonListBoxDiv,
    createPokemonDiv,
    applyDivEventListeners
  );
  loadingIcon.classList.add("hidden");
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

    if (partyState.currentSelectedPokemon.moves.length >= 4) {
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
  let pokemonPreviews = pokemonListBoxDiv.querySelectorAll(".pokemon-preview");

  pokemonPreviews.forEach(function (pokemonPreview) {
    pokemonListBoxDiv.removeChild(pokemonPreview);
  });
  generationPokemon.forEach(async function (pokemon) {
    if (
      pokemon.name.includes(searchString) &&
      checkIfPokemonIsInParty(pokemon.name, partyState) == false
    ) {
      const pokemonData = await getPokemonData(pokemon.name);
      let pokemonDiv = await createPokemonDiv(pokemonData);
      applyDivEventListeners(pokemonDiv, pokemon.name);
      pokemonListBoxDiv.appendChild(pokemonDiv);
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
      const moveDiv = createMoveDiv(moveData);
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

function openModal(modal, pokemonDataDiv, pokemon) {
  partyState.currentSelectedPokemon = pokemon;
  document.body.style.overflowY = "hidden";
  modal.style.overflowY = "hidden";
  modal.style.display = "block";
  const pokemonCard = pokemonDataDiv.querySelector(".pokemon-card");
  pokemonCard.innerHTML = "";
  const markup = `
  <div class="pokemon" style="margin-bottom:1rem;" id="${pokemon.name}">
  <img class="pokemon-sprite" src="${pokemon.spriteUrl}" alt="" />
  <div>${capitalizeFirstLetter(pokemon.name)}&nbsp; </div>
  </div>
  <div class="pokemon-info-modal" >
  <img class="modal-stat-image" src="https://cdn-icons-png.flaticon.com/128/13207/13207019.png" alt="" />
  <p class="pokemon-info-value">: ${pokemon.data.stats[0].base_stat}</p>
  </div>
  <div class="pokemon-info-modal">
  <img class="modal-stat-image" src="https://cdn-icons-png.flaticon.com/128/1408/1408937.png" alt="" />
  <p class="pokemon-info-value">: ${pokemon.data.stats[1].base_stat}</p>
  </div>
  <div class="pokemon-info-modal">
  <img class="modal-stat-image" src="https://cdn-icons-png.flaticon.com/128/3288/3288844.png" alt="" />
  <p class="pokemon-info-value">: ${pokemon.data.stats[2].base_stat}</p>
  </div>
  <div class="pokemon-info-modal">
  <img class="modal-stat-image" src="https://cdn-icons-png.flaticon.com/128/9742/9742560.png" alt="" />
  <p class="pokemon-info-value">: ${pokemon.data.stats[3].base_stat}</p>
  </div>
  <div class="pokemon-info-modal">
  <img class="modal-stat-image" src="https://cdn-icons-png.flaticon.com/128/5906/5906032.png" alt="" />
  <p class="pokemon-info-value">: ${pokemon.data.stats[4].base_stat}</p>
  </div>
  <div class="pokemon-info-modal">
  <img class="modal-stat-image"  src="https://cdn-icons-png.flaticon.com/128/9717/9717736.png" alt="" />
  <p class="pokemon-info-value">: ${pokemon.data.stats[5].base_stat}</p>
  </div>
  </div>
  `;
  pokemonCard.innerHTML = markup;
  pokemonCard.style.backgroundColor = pokemon.color;
  pokemonCard.style.borderColor = pokemon.borderColor;
  updateMoveList();
  loadPokemonMoves(pokemon, editList, addMoveEventListeners, createMoveDiv);
}

function closeModal() {
  modalWindow.style.display = "none";
  document.body.style.overflowY = "scroll";
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
    const currentMove = partyState.currentSelectedPokemon.moves[i];

    const moveName =
      currentMove !== undefined ? currentMove.name : "Empty move slot";

    const moveDiv = document.createElement("div");
    moveDiv.className = "pokemon-move";
    moveDiv.textContent = capitalizeFirstLetter(moveName);

    if (currentMove !== undefined) {
      moveDiv.style.backgroundColor = typeColors[currentMove.type.name];

      const textDiv = document.createElement("div");

      const accuracy =
        currentMove.accuracy !== null ? currentMove.accuracy : "Status";

      const power = currentMove.power !== null ? currentMove.power : "Status";

      textDiv.textContent = `Pow: ${power}, Acc: ${accuracy}`;
      textDiv.style.marginTop = "0.5rem";

      const buttonsDiv = document.createElement("div");

      const typeImg = document.createElement("img");
      typeImg.src = typeIcons[currentMove.type.name];
      typeImg.className = "move-type-button";

      const removeMoveImg = document.createElement("img");
      removeMoveImg.src =
        "https://cdn-icons-png.flaticon.com/512/1214/1214428.png";
      removeMoveImg.className = "remove-move-button";
      removeMoveImg.addEventListener("click", removeMove.bind(null, moveName));

      buttonsDiv.append(typeImg);
      buttonsDiv.append(removeMoveImg);

      moveDiv.appendChild(textDiv);
      moveDiv.appendChild(buttonsDiv);
    }

    currentPokemonMoves.appendChild(moveDiv);
  }
}

function savePokemonToLocalStorage() {
  localStorage.clear();
  const currentPokemonParty = Array.from(partyState.pokemon.values());
  currentPokemonParty.forEach(function (pokemon) {
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
      div.style.borderColor = "";
      div.style.backgroundColor = "";
      const pokemonPreviewDiv = document.querySelector(
        "#pokemon-list-" + pokemonName
      );
      if (pokemonPreviewDiv != null)
        pokemonPreviewDiv.classList.remove("hidden");
      partyState.pokemon.delete(pokemonName);
    }
  }
}

async function partyAddPokemon(pokemonName, local = false) {
  if (partyState.pokemon.size + 1 > partyState.pokemonLimit) {
    return;
  }

  if (partyState.pokemon.has(pokemonName)) {
    return;
  }

  const pokemonListDiv = document.getElementById(`pokemon-list-${pokemonName}`);
  const isLegendary =
    pokemonListDiv.getAttribute("data-is-legendary") == "true" ? true : false;
  console.log(pokemonListDiv.getAttribute("data-is-legendary"));
  const isMythical =
    pokemonListDiv.getAttribute("data-is-mythical") == "true" ? true : false;

  const pokemonData = await getPokemonData(pokemonName);
  let pokemon;
  if (isLegendary) {
    pokemon = new LegendaryPokemon(pokemonData);
  } else if (isMythical) {
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
  <div>${capitalizeFirstLetter(pokemon.name)}${pokemon.descriptiveText}</div>
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
      openModal.bind(null, modalWindow, pokemonDataDiv, pokemon)
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
  pokemonListDiv.classList.add("hidden");
}

const currentGenerations = await loadGenerations(pokemonGenerationSelector);

async function init() {
  await loadGenerationPokemon(
    { name: "generation-i", url: GENERATION_URL + "/1" },
    partyState,
    pokemonListBoxDiv,
    createPokemonDiv,
    applyDivEventListeners
  );
  loadingIcon.classList.add("hidden");
  loadPartyBtn.addEventListener("click", loadPokemonFromLocalStorage);
}

init();
