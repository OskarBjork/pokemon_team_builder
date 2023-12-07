import { Pokemon, getPokemonData } from "../script.js";
export { partyAddPokemon };

let partyState = {
  pokemons: new Map(),
  pokemonPartyDiv: document.querySelector(".pokemon-party"),
  pokemonLimit: 5,
};

const modalWindow = document.querySelector(".pokemon-edit-modal-window");

function openModal(pokemonName) {
  modalWindow.style.display = "block";
  // modalWindow.querySelector(".pokemon-name").textContent = pokemonName;
}

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

  const pokemonData = await getPokemonData(pokemonName);

  console.log(pokemonData);

  const pokemon = new Pokemon(pokemonData);
  partyState.pokemons.set(pokemonName, {
    pokemon: pokemon,
    id: "party-member-" + (partyState.pokemons.size + 1),
  });

  const div = document.createElement("div");
  const image = document.createElement("img");
  const name = document.createElement("p");

  const img2 = document.createElement("img");

  img2.src = "https://cdn-icons-png.flaticon.com/512/0/128.png";
  img2.className = "edit-pokemon-button";

  div.className = "pokemon";

  image.src = await pokemon.getSpriteUrl();

  name.textContent = pokemon.name;

  image.addEventListener("click", function () {
    //this.removePokemon(pokemonName);
    partyRemovePokemon(pokemonName);
  });
  img2.addEventListener("click", openModal.bind(null, pokemonName));
  div.appendChild(image);
  div.appendChild(name);
  div.appendChild(img2);
  // NOTE: Kanske flytta id genererings grej in i egen funktion?
  div.id = partyState.pokemons.get(pokemonName).id;
  partyState.pokemonPartyDiv.appendChild(div);
}
