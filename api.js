import { typeColors } from "./config.js";

// API URLS

export const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";
export const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species";
export const GENERATION_URL = "https://pokeapi.co/api/v2/generation";

export function checkIfPokemonIsInParty(pokemonName, partyState) {
  return partyState.pokemon.has(pokemonName);
}

// API FUNCTIONS

export async function getGenerations() {
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

export async function getPokemonData(pokemonName) {
  return await fetch(`${POKEMON_URL}/${pokemonName.toLowerCase()}`)
    .then((response) => response.json())
    .then((newPokemon) => {
      return newPokemon;
    });
}

export async function getGenerationPokemon(generation) {
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

export async function getMoveData(move) {
  return await fetch(move.move.url)
    .then((response) => response.json())
    .then((newMove) => {
      return newMove;
    });
}

export async function loadGenerations(dropDown, wrapper) {
  const generations = await getGenerations();
  generations.forEach(function (generation) {
    const p = document.createElement("p");
    p.className = "pokemon-game-box";
    p.textContent = generation.name;
    wrapper(p, generation);
    dropDown.appendChild(p);
  });
}

export async function loadPokemonMoves(
  pokemon,
  container,
  wrapper,
  createMoveDiv
) {
  container.innerHTML = "";
  const moves = pokemon.getMoves();
  moves.forEach(async function (move) {
    const moveData = await getMoveData(move);
    const moveDiv = createMoveDiv(moveData);
    wrapper(moveDiv, moveData);
    container.appendChild(moveDiv);
  });
}

export async function loadGenerationPokemon(
  generation,
  partyState,
  pokemonListDiv,
  createPokemonDiv,
  applyDivEventListeners
) {
  partyState.currentGeneration = generation;
  pokemonListDiv.innerHTML = "";
  const pokemon = await getGenerationPokemon(generation);
  pokemon.forEach(async function (pokemon) {
    if (checkIfPokemonIsInParty(pokemon.name, partyState) == true) {
      return;
    }
    const pokemonData = await getPokemonData(pokemon.name);
    let pokemonDiv = createPokemonDiv(pokemonData);
    applyDivEventListeners(pokemonDiv, pokemon.name);
    pokemonListDiv.appendChild(pokemonDiv);
  });
}

export class Pokemon {
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

  getColor() {
    const primaryType = this.data.types[0].type.name;
    return typeColors[primaryType];
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
