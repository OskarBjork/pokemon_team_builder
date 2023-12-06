import { partyAddPokemon } from "./modules/pokemon_party.js";
export { Pokemon };

// TODO: Organisera pokemons efter type?

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species";
const GENERATION_URL = "https://pokeapi.co/api/v2/generation";

const dropDiv = document.querySelector(".dropdown");
const dropBtn = document.querySelector(".dropbtn");
const dropDownContentDiv = document.querySelector(".dropdown-content");
const dropDownContents = dropDownContentDiv.childNodes;

function changeDropDownContents(dropDownContents) {
  dropDownContents.forEach(function (link) {
    console.log(link);
  });
}

changeDropDownContents(dropDownContents);

// Event Listeners

dropBtn.addEventListener("click", function () {
  dropDownContentDiv.classList.toggle("hidden");
  // dropDownContentDiv.style.display = "block";
  // console.log(dropDownContentDiv.classList);
});

dropDiv.addEventListener("mouseleave", function () {
  dropDownContentDiv.classList.add("hidden");
});

// dropBtn.addEventListener("");

for (let i = 0; i < dropDownContents.length; i++) {
  dropDownContents[i].addEventListener("mouseover", function () {
    dropDownContents[i].classList.add("hovered");
  });
  dropDownContents[i].addEventListener("mouseout", function () {
    dropDownContents[i].classList.remove("hovered");
  });
}

function getGenerations() {
  let generations = [];
  fetch(GENERATION_URL)
    .then((response) => response.json())
    .then((gen_data) => {
      for (let i = 0; i < gen_data.count; ++i) {
        generations.push({
          name: gen_data.results[i].name,
          url: gen_data.results[i].url,
        });
      }
    });
  return generations;
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
  #name;

  constructor(name) {
    this.#name = capitalizeFirstLetter(name);
  }

  get name() {
    return this.#name;
  }

  async getSpriteUrl() {
    return await fetch(`${POKEMON_URL}/${this.#name.toLowerCase()}`)
      .then((response) => response.json())
      .then((newPokemon) => {
        return newPokemon.sprites.front_default;
      });
  }

  async getHp() {
    return await fetch(`${POKEMON_URL}/${this.#name.toLowerCase()}`)
      .then((response) => response.json())
      .then((newPokemon) => {
        return newPokemon.stats[0].base_stat;
      });
  }
}

console.log(new Pokemon("pikachu"));

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

let pokemonParty = null;

class PokemonParty {
  #pokemons;
  #pokemonPartyDiv;
  #pokemonLimit = 5;

  constructor() {
    this.#pokemons = new Map();
    this.#pokemonPartyDiv = document.querySelector(".pokemon-party");
  }

  async addPokemon(pokemonName) {
    console.log(`Limit: ${this.#pokemonLimit}, Size: ${this.#pokemons.size}`);
    if (this.#pokemons.size == this.#pokemonLimit) {
      return;
    }

    // NOTE: Ska vi kunna ha fler av samma pokemon i ett lag?
    if (this.#pokemons.has(pokemonName)) {
      return;
    }

    const pokemon = new Pokemon(pokemonName);
    this.#pokemons.set(pokemonName, {
      pokemon: pokemon,
      id: this.#pokemons.size + 1,
    });

    const div = document.createElement("div");
    const image = document.createElement("img");
    const name = document.createElement("p");

    div.className = "pokemon";

    image.src = await pokemon.getSpriteUrl();

    name.textContent = pokemon.name;

    div.appendChild(image);
    div.appendChild(name);
    // NOTE: Kanske flytta id genererings grej in i egen funktion?
    div.id = "party-member-" + this.#pokemons.get(pokemonName).id;
    div.addEventListener("click", function () {
      //this.removePokemon(pokemonName);
      pokemonParty.removePokemon(pokemonName);
    });
    this.#pokemonPartyDiv.appendChild(div);
  }

  removePokemon(pokemonName) {
    if (!this.#pokemons.has(pokemonName)) {
      return;
    }
    document
      .getElementById("party-member-" + this.#pokemons.get(pokemonName).id)
      .remove();
    this.#pokemons.delete(pokemonName);
  }
}

pokemonParty = new PokemonParty();

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
    const pokemonSpirteUrl = await pokemon.getSpriteUrl();
    const pokemonHp = await pokemon.getHp();

    const div = document.createElement("div");
    const image = document.createElement("img");
    const name = document.createElement("p");
    const hp = document.createElement("p");

    div.className = "pokemon-preview";

    image.src = pokemonSpirteUrl;

    name.textContent = pokemon.name;
    name.className = "pokemon-info";

    hp.textContent = "HP: " + pokemonHp;
    hp.className = "pokemon-info";

    div.appendChild(image);
    div.appendChild(name);
    div.appendChild(hp);
    div.addEventListener("click", function () {
      // TODO: Lägg till pokemonen i teamet om det finns utrymme
      console.log("Selected");
      //pokemonParty.addPokemon(pokemonName)
      partyAddPokemon(pokemonName);
    });
    pokemonListDiv.appendChild(div);
  }
}

initPokemonList();
