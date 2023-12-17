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

export async function loadGenerations(genSelector) {
  const generations = await getGenerations();
  generations.forEach(function (generation) {
    const o = document.createElement("option");
    // TODO: Flytta till egen funktion eller förtydliga hur detta fungerar
    o.textContent =
      generation.name[0].toUpperCase() +
      generation.name.substr(1, 10) +
      generation.name.substr(11, generation.name.length).toUpperCase();

    genSelector.appendChild(o);
  });

  return generations;
}

export async function loadPokemonMoves(
  pokemon,
  container,
  wrapper,
  createMoveDiv
) {
  container.innerHTML = "";
  const moves = pokemon.moves;
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
  pokemon.forEach(async function (pokemon) {});
  const pokemonDivs = pokemon.map(async function (pokemon) {
    if (checkIfPokemonIsInParty(pokemon.name, partyState) == true) {
      console.log(partyState);
      return;
    }
    const pokemonData = await getPokemonData(pokemon.name);
    let pokemonDiv = createPokemonDiv(pokemonData);
    applyDivEventListeners(pokemonDiv, pokemon.name);
    return pokemonDiv;
  });
  let newDivs = await Promise.allSettled(pokemonDivs);

  // newDivs.forEach(function (pokemonDiv) {
  //   console.log(pokemonDiv);
  // });
  newDivs = newDivs.filter(function (pokemonPromise) {
    return (
      pokemonPromise.status == "fulfilled" &&
      !(pokemonPromise.value == undefined)
    );
  });
  newDivs.sort(function (a, b) {
    const aIndex = a.value.querySelector(".pokemon-index-p").textContent;
    const bIndex = b.value.querySelector(".pokemon-index-p").textContent;
    return aIndex - bIndex;
  });
  newDivs.forEach(function (pokemonPromise) {
    if (pokemonPromise.status == "fulfilled") {
      pokemonListDiv.appendChild(pokemonPromise.value);
    }
  });
}

export async function pokemonIsLegendary(pokemonData) {
  const species = await fetch(pokemonData.species.url).then((response) =>
    response.json()
  );
  return species.is_legendary;
}

export async function pokemonIsMythical(pokemonData) {
  const species = await fetch(pokemonData.species.url).then((response) =>
    response.json()
  );
  return species.is_mythical;
}

export class Pokemon {
  #data;

  constructor(pokemonData) {
    this.#data = pokemonData;
  }

  get name() {
    return this.data.name;
  }

  get spriteUrl() {
    return this.data.sprites.front_default;
  }

  get hp() {
    return this.data.stats[0].base_stat;
  }

  get data() {
    return this.#data;
  }

  get moves() {
    return this.data.moves;
  }

  get color() {
    const primaryType = this.data.types[0].type.name;
    return typeColors[primaryType];
  }

  get borderColor() {
    return this.color;
  }
}

export class LegendaryPokemon extends Pokemon {
  constructor(pokemonData) {
    super(pokemonData);
  }

  get color() {
    return typeColors["legendary"];
  }

  get borderColor() {
    return "#FFD700";
  }
}

export class MythicalPokemon extends Pokemon {
  constructor(pokemonData) {
    super(pokemonData);
  }

  get color() {
    return typeColors["mythical"];
  }

  get borderColor() {
    return "#FFD700";
  }
}

class BabyPokemon extends Pokemon {
  constructor(name) {}
}
