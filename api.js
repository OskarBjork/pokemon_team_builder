import { typeColors } from "./config.js";

// API URLS

export const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";
export const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species";
export const GENERATION_URL = "https://pokeapi.co/api/v2/generation";

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
