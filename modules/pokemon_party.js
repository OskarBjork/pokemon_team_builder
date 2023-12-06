import { Pokemon } from "../script.js";
export { partyAddPokemon };

let partyState = {
  pokemons: new Map(),
  pokemonPartyDiv: document.querySelector(".pokemon-party"),
  pokemonLimit: 5,
};

function partyRemovePokemon(pokemonName) {
  if (!partyState.pokemons.has(pokemonName)) {
    return;
  }

  document.getElementById(partyState.pokemons.get(pokemonName).id).remove();
  partyState.pokemons.delete(pokemonName);
}

async function partyAddPokemon(pokemonName) {
  if (partyState.pokemons.size == partyState.pokemonLimit) {
    return;
  }

  // NOTE: Ska vi kunna ha fler av samma pokemon i ett lag?
  if (partyState.pokemons.has(pokemonName)) {
    return;
  }

  const pokemon = new Pokemon(pokemonName);
  partyState.pokemons.set(pokemonName, {
    pokemon: pokemon,
    id: "party-member-" + (partyState.pokemons.size + 1),
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
  div.id = partyState.pokemons.get(pokemonName).id;
  div.addEventListener("click", function () {
    //this.removePokemon(pokemonName);
    partyRemovePokemon(pokemonName);
  });
  partyState.pokemonPartyDiv.appendChild(div);
}
