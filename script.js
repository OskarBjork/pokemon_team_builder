import { partyAddPokemon } from "./modules/pokemon_party.js";
export { Pokemon };

// TODO: Organisera pokemons efter type?

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species";
const GENERATION_URL = "https://pokeapi.co/api/v2/generation";

const dropDiv = document.querySelector(".dropdown");
const dropBtn = document.querySelector(".dropbtn");
const dropDownContentDiv = document.querySelector(".dropdown-content");
const pokemonListDiv = document.querySelector(".pokemon-list-box");

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

// dropBtn.addEventListener("");

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

function addParagraphEventListeners(p, generation) {
  p.addEventListener("mouseover", function () {
    p.classList.add("hovered");
  });
  p.addEventListener("mouseout", function () {
    p.classList.remove("hovered");
  });
  p.addEventListener("click", function () {
    console.log("click");
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

export async function getPokemonData(pokemonName) {
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
  const markup = `<div class="pokemon-preview">
  <img
    src="${pokemonData.sprites.front_default}"
    alt=""
  />
  <p class="pokemon-info"> ${capitalizeFirstLetter(pokemonData.name)}</p>
  <p class="pokemon-info">HP: ${pokemonData.stats[0].base_stat}</p>
  <p class="pokemon-info">ATK: ${pokemonData.stats[1].base_stat}</p>
  <p class="pokemon-info">DEF: ${pokemonData.stats[2].base_stat}</p>
  <p class="pokemon-info">S.ATK: ${pokemonData.stats[3].base_stat}</p>
  <p class="pokemon-info">S.DEF: ${pokemonData.stats[4].base_stat}</p>
  <p class="pokemon-info">SPEED: ${pokemonData.stats[5].base_stat}</p>
  <p class="pokemon-info">Index: ${
    pokemonData.game_indices.at(-1).game_index
  }</p>
</div>
<div class="pokemon-preview">`;
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

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class Pokemon {
  constructor(pokemonData) {
    this.data = pokemonData;
  }

  get name() {
    return this.data.name;
  }

  async getSpriteUrl() {
    return this.data.sprites.front_default;
  }

  async getHp() {
    return this.data.stats[0].base_stat;
  }

  async getData() {
    return this.data;
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

loadGenerations();

// const generations = getGenerations();

// console.log(generations);

// initPokemonList();
