const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";
const GENERATION_URL = "https://pokeapi.co/api/v2/generation";

const root = document.getElementById("root");
const form = document.getElementById("addPokemonForm");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const pokemonName = document.getElementById("newPokemonName").value.toLowerCase();

  fetch(`${POKEMON_URL}/${pokemonName}`)
    .then((response) => response.json())
    .then((newPokemon) => {
      console.log(newPokemon)
      const div = document.createElement("div");
      const image = document.createElement("img");
      const name = document.createElement("h1");

      div.className = "card";
      image.src = newPokemon.sprites.other.dream_world.front_default;
      name.textContent = capitalizeFirstLetter(newPokemon.name);

      div.appendChild(name);
      div.appendChild(image);
      root.appendChild(div);
  });
});

function getGenerations() {
  let generations = [];
  fetch(GENERATION_URL)
    .then((response) => response.json())
    .then((gen_data) => {
      for (let i = 0; i < gen_data.count; ++i) {
        generations.push(gen_data.results[i].name);
      }
    });
  return generations;
}

class Pokemon {
  constructor(name) {}
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
