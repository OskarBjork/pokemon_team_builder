let foo = document.querySelector(".lol");
// alert(foo);

const dropDiv = document.querySelector(".dropdown");
const dropBtn = document.querySelector(".dropbtn");
const dropDownContentDiv = document.querySelector(".dropdown-content");
const dropDownContents = dropDownContentDiv.childNodes;

// console.log(dropDownContents);
// console.log(dropBtn);

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

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon";
const GENERATION_URL = "https://pokeapi.co/api/v2/generation";

const root = document.getElementById("root");
const form = document.getElementById("addPokemonForm");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const pokemonName = document
    .getElementById("newPokemonName")
    .value.toLowerCase();

  fetch(`${POKEMON_URL}/${pokemonName}`)
    .then((response) => response.json())
    .then((newPokemon) => {
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
        generations.push({
          name: gen_data.results[i].name,
          url: gen_data.results[i].url,
        });
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
