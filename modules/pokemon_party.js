import {
  Pokemon,
  getPokemonData,
  capitalizeFirstLetter,
  loadPokemonMoves,
} from "../script.js";
export { partyAddPokemon };

let partyState = {
  pokemon: new Map(),
  pokemonPartyDiv: document.querySelector(".pokemon-party"),
  pokemonLimit: 5,
};

export const modalWindow = document.querySelector(".pokemon-edit-modal-window");
const closeModalButton = modalWindow.querySelector(".close-btn");
const pokemonStatDiv = modalWindow.querySelector(".pokemon-stats");

closeModalButton.addEventListener("click", closeModal);

function openModal(pokemon) {
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
  loadPokemonMoves(pokemon);
}

function closeModal() {
  modalWindow.style.display = "none";
}

function partyRemovePokemon(pokemonName) {
  if (!partyState.pokemon.has(pokemonName)) {
    return;
  }

  document.getElementById(partyState.pokemon.get(pokemonName).id).remove();
  partyState.pokemon.delete(pokemonName);
}

async function partyAddPokemon(pokemonName) {
  if (partyState.pokemon.size == partyState.pokemonLimit) {
    return;
  }

  // NOTE: Ska vi kunna ha fler av samma pokemon i ett lag?
  if (partyState.pokemon.has(pokemonName)) {
    return;
  }

  const pokemonData = await getPokemonData(pokemonName);

  const pokemon = new Pokemon(pokemonData);
  partyState.pokemon.set(pokemonName, {
    pokemon: pokemon,
    id: "party-member-" + (partyState.pokemon.size + 1),
  });

  const div = document.createElement("div");
  const image = document.createElement("img");
  const name = document.createElement("p");

  const img2 = document.createElement("img");

  img2.src = "https://cdn-icons-png.flaticon.com/512/0/128.png";
  img2.className = "edit-pokemon-button";

  div.className = "pokemon";

  image.src = await pokemon.getSpriteUrl();

  name.textContent = capitalizeFirstLetter(pokemon.name);

  image.addEventListener("click", function () {
    //this.removePokemon(pokemonName);
    partyRemovePokemon(pokemonName);
  });
  img2.addEventListener("click", openModal.bind(null, pokemon));
  div.appendChild(image);
  div.appendChild(name);
  div.appendChild(img2);
  // NOTE: Kanske flytta id genererings grej in i egen funktion?
  div.id = partyState.pokemon.get(pokemonName).id;
  partyState.pokemonPartyDiv.appendChild(div);
}
