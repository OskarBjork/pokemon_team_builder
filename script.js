// TODO: Organisera pokemons efter type?

// API URLS

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species";
const GENERATION_URL = "https://pokeapi.co/api/v2/generation";

// DOM ELEMENTS

const dropDiv = document.querySelector(".dropdown");
const dropBtn = document.querySelector(".dropbtn");
const dropDownContentDiv = document.querySelector(".dropdown-content");
const pokemonListDiv = document.querySelector(".pokemon-list-box");
const modalWindow = document.querySelector(".pokemon-edit-modal-window");

const closeModalButton = modalWindow.querySelector(".close-btn");
const pokemonStatDiv = modalWindow.querySelector(".pokemon-stats");
const editList = modalWindow.querySelector(".pokemon-edit-list");
const currentPokemonMoves = modalWindow.querySelector(".pokemon-moves");

// Event Listeners

dropBtn.addEventListener("click", function () {
  console.log("click");
  console.log(dropDownContentDiv.classList);
  dropDownContentDiv.classList.toggle("hidden");
  // dropDownContentDiv.style.display = "block";
  // console.log(dropDownContentDiv.classList);
});

dropDiv.addEventListener("mouseleave", function () {
  dropDownContentDiv.classList.add("hidden");
});

closeModalButton.addEventListener("click", closeModal);

// GLOBALS

let partyState = {
  pokemon: new Map(),
  pokemonPartyDiv: document.querySelector(".pokemon-party"),
  pokemonLimit: 6,
};

let currentSelectedPokemon = null;

// FUNCTIONS

async function getGenerations() {
  let generations = [];

  try {
    const response = await fetch(GENERATION_URL);
    const genData = await response.json();
    for (let i = 0; i < genData.count; ++i) {
      generations.push({
        name: genData.results[i].name,
        url: genData.results[i].url,
      });
    }
  } catch (error) {
    console.log(error);
  }

  return generations;
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
  const moves = pokemon.getMoves();
  moves.forEach(async function (move) {
    const moveData = await getMoveData(move);
    const moveDiv = createMoveDiv(moveData);
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
    });
    console.log(pokemon);
    editList.appendChild(moveDiv);
  });
}

async function getMoveData(move) {
  return await fetch(move.move.url)
    .then((response) => response.json())
    .then((newMove) => {
      return newMove;
    });
}

function createMoveDiv(moveData) {
  console.log(moveData);
  let accuracy = "";
  if (moveData.accuracy == null) {
    accuracy = "Status";
  } else {
    accuracy = moveData.accuracy;
  }
  let power = "";
  if (moveData.power == null) {
    power = "Status";
  } else {
    power = moveData.power;
  }
  const markup = `<div class="pokemon-move-preview">
  <p class="pokemon-info"> ${capitalizeFirstLetter(moveData.name)}:</p>
  <p class="pokemon-info">Type: ${capitalizeFirstLetter(moveData.type.name)}</p>
  <p class="pokemon-info">Acc: ${accuracy}</p>
  <p class="pokemon-info">Pow: ${power}</p>
  <p class="pokemon-info">PP: ${moveData.pp}</p>
  <p class="pokemon-info">Priority: ${moveData.priority}</p>
  <p class="pokemon-info">Desc: ${moveData.effect_entries[0].effect}</p>
  </div>`;
  const doc = new DOMParser().parseFromString(markup, "text/html");

  return doc.body.firstChild;
}

function addParagraphEventListeners(p, generation) {
  p.addEventListener("mouseover", function () {
    p.classList.add("hovered");
  });
  p.addEventListener("mouseout", function () {
    p.classList.remove("hovered");
  });
  p.addEventListener("click", function () {
    loadGenerationPokemon(generation);
  });
}

async function loadGenerationPokemon(generation) {
  // console.log("loadGenerationPokemon");
  pokemonListDiv.innerHTML = "";
  const pokemon = await getGenerationPokemon(generation);
  pokemon.forEach(async function (pokemon) {
    const pokemonData = await getPokemonData(pokemon.name);
    let pokemonDiv = createPokemonDiv(pokemonData);
    applyDivEventListeners(pokemonDiv, pokemon.name);
    pokemonListDiv.appendChild(pokemonDiv);
  });
}

async function getPokemonData(pokemonName) {
  return await fetch(`${POKEMON_URL}/${pokemonName.toLowerCase()}`)
    .then((response) => response.json())
    .then((newPokemon) => {
      return newPokemon;
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

function createPokemonDiv(pokemonData) {
  let pokemonTypes = "";
  pokemonData.types.forEach(function (type) {
    pokemonTypes += " ";
    pokemonTypes += capitalizeFirstLetter(type.type.name);
  });

  const markup = `<div class="pokemon-preview">
  <img
    src="${pokemonData.sprites.front_default}"
    alt=""
  />
  <p class="pokemon-info"> ${capitalizeFirstLetter(pokemonData.name)}</p>
  <div class="pokemon-info">Type: ${pokemonTypes}</div>
  <p class="pokemon-info">HP: ${pokemonData.stats[0].base_stat}</p>
  <p class="pokemon-info">ATK: ${pokemonData.stats[1].base_stat}</p>
  <p class="pokemon-info">DEF: ${pokemonData.stats[2].base_stat}</p>
  <p class="pokemon-info">S.ATK: ${pokemonData.stats[3].base_stat}</p>
  <p class="pokemon-info">S.DEF: ${pokemonData.stats[4].base_stat}</p>
  <p class="pokemon-info">SPEED: ${pokemonData.stats[5].base_stat}</p>
  <p class="pokemon-info">Index: ${pokemonData.id}</p>
</div>`;
  const doc = new DOMParser().parseFromString(markup, "text/html");

  return doc.body.firstChild;
}

async function getGenerationPokemon(generation) {
  const generationUrl = generation.url;
  let pokemon = [];
  try {
    const response = await fetch(generationUrl);
    const genData = await response.json();
    for (let i = 0; i < genData.pokemon_species.length; ++i) {
      pokemon.push({
        name: genData.pokemon_species[i].name,
        url: genData.pokemon_species[i].url,
      });
    }
  } catch (error) {
    console.log(error);
  }

  return pokemon;
}

function getEvolutionChainUrl(pokemonName) {
  let url = "";
  fetch(`${SPECIES_URL}/${pokemonName}`)
    .then((response) => response.json())
    .then((species) => (url = species.evolution_chain.url));
  return url;
}

function getEvolutions(pokemonName) {
  const url = getEvolutionChainUrl(pokemonName);

  let evolutionStrings = [];
  fetch(`${url}`)
    .then((response) => response.json())
    .then((evolution) => {
      // Första evolutionen:
      evolutionStrings.push(evolution.chain.species.name);
      // De andra evolutionerna:
      evolutionStrings.push(evolution.chain.evolves_to[0].species.name);
      /*
      evolutionStrings.push(
        evolution.chain.evolves_to[0].evolves_to[0].species.name
      );
      */
    });
  return evolutionStrings;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class Pokemon {
  moves = [];
  constructor(pokemonData) {
    this.data = pokemonData;
  }

  get name() {
    return this.data.name;
  }

  getSpriteUrl() {
    return this.data.sprites.front_default;
  }

  getHp() {
    return this.data.stats[0].base_stat;
  }

  getData() {
    return this.data;
  }

  getMoves() {
    return this.data.moves;
  }
}

class LegendaryPokemon extends Pokemon {
  constructor(name) {}
}

class MythicalPokemon extends Pokemon {
  constructor(name) {}
}

class BabyPokemon extends Pokemon {
  constructor(name) {}
}

class ShinyPokemon extends Pokemon {
  constructor(name) {}
}

async function initPokemonList() {
  const pokemonListDiv = document.querySelector(".pokemon-list-box");
  let pokemonNames = [
    "bulbasaur",
    "ivysaur",
    "venusaur",
    "pichu",
    "pikachu",
    "ditto",
  ];
  for (const pokemonName of pokemonNames) {
    const pokemon = new Pokemon(pokemonName);
    const pokemonSpriteUrl = await pokemon.getSpriteUrl();
    const pokemonHp = await pokemon.getHp();

    const div = document.createElement("div");
    const image = document.createElement("img");
    const name = document.createElement("p");
    const hp = document.createElement("p");

    div.className = "pokemon-preview";

    image.src = pokemonSpriteUrl;

    name.textContent = pokemon.name;
    name.className = "pokemon-info";

    hp.textContent = "HP: " + pokemonHp;
    hp.className = "pokemon-info";

    div.appendChild(image);
    div.appendChild(name);
    div.appendChild(hp);
    div.addEventListener("click", function () {
      partyAddPokemon(pokemonName);
    });
    pokemonListDiv.appendChild(div);
  }
}

function openModal(pokemon) {
  currentSelectedPokemon = pokemon;
  modalWindow.style.display = "block";
  pokemonStatDiv.innerHTML = "";
  const markup = `
  <p class="pokemon-info">${capitalizeFirstLetter(pokemon.data.name)}</p>
        <p class="pokemon-info">HP: ${pokemon.data.stats[0].base_stat}</p>
        <p class="pokemon-info">ATK: ${pokemon.data.stats[1].base_stat}</p>
        <p class="pokemon-info">DEF: ${pokemon.data.stats[2].base_stat}</p>
        <p class="pokemon-info">S.ATK: ${pokemon.data.stats[3].base_stat}</p>
        <p class="pokemon-info">S.DEF: ${pokemon.data.stats[4].base_stat}</p>
        <p class="pokemon-info">SPEED: ${pokemon.data.stats[5].base_stat}</p>
  `;
  pokemonStatDiv.innerHTML = markup;
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
  partyState.pokemon.delete(pokemonName);
}

async function partyAddPokemon(pokemonName) {
  if (partyState.pokemon.size + 1 > partyState.pokemonLimit) {
    return;
  }

  // NOTE: Ska vi kunna ha fler av samma pokemon i ett lag? Ja

  const pokemonData = await getPokemonData(pokemonName);

  const pokemon = new Pokemon(pokemonData);
  partyState.pokemon.set(pokemonName, {
    pokemon: pokemon,
    id: "party-member-" + (partyState.pokemon.size + 1),
  });

  const markup = `
  <div class="pokemon" id="${partyState.pokemon.get(pokemonName).id}">
  <img class="pokemon-sprite" src="${pokemon.getSpriteUrl()}" alt="" />
  <p>${capitalizeFirstLetter(pokemon.name)}</p>
  <img src="https://cdn-icons-png.flaticon.com/512/0/128.png" class="edit-pokemon-button" />
  </div>`;

  const doc = new DOMParser().parseFromString(markup, "text/html");
  const div = doc.body.firstChild;
  div
    .querySelector(".edit-pokemon-button")
    .addEventListener("click", openModal.bind(null, pokemon));
  div.querySelector(".pokemon-sprite").addEventListener("click", function () {
    partyRemovePokemon(pokemonName);
  });

  partyState.pokemonPartyDiv.appendChild(div);
}

loadGenerations();
