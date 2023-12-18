import { typeColors, typeIcons } from "./config.js";

export function createMoveDiv(moveData) {
  let accuracy = "";
  if (moveData.accuracy == null) {
    accuracy = "Status";
  } else {
    accuracy = moveData.accuracy;
  }
  let power = "";
  if (moveData.power == null) {
    power = "Status";
  } else {
    power = moveData.power;
  }

  const markup = `<div id="pokemon-move-${
    moveData.name
  }" class="pokemon-move-preview">
  <p class="move-info"> ${capitalizeFirstLetter(moveData.name)}:</p>
  <p class="move-info">Type: ${capitalizeFirstLetter(moveData.type.name)}</p>
  <p class="move-info">Acc: ${accuracy}</p>
  <p class="move-info">Pow: ${power}</p>
  <p class="move-info">PP: ${moveData.pp}</p>
  <p class="move-info">Priority: ${moveData.priority}</p>
  <p class="move-info-desc">Desc: ${getMoveDesc(moveData)}</p>
  </div>`;
  const doc = new DOMParser().parseFromString(markup, "text/html");

  return doc.body.firstChild;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getMoveDesc(moveData) {
  if (moveData.effect_entries.length == 0) {
    return "No description";
  }
  const effect = moveData.effect_entries[0].effect;
  if (effect.includes("$effect_chance%")) {
    return effect.replace("$effect_chance%", moveData.effect_chance + "%");
  }
  return moveData.effect_entries[0].effect;
}

export function createPokemonDiv(pokemonData) {
  let pokemonTypes = "";
  pokemonData.types.forEach(function (type) {
    pokemonTypes += " ";
    pokemonTypes += capitalizeFirstLetter(type.type.name);
  });
  const pokemonColor = typeColors[pokemonData.types[0].type.name];
  const markup = `<div id="pokemon-list-${
    // TODO: Vi hade kunnat loopa igenom alla base stats och skapa markup för dem enklare
    pokemonData.name
  }" class="pokemon-preview" style="--bg-color: ${pokemonColor}">
  <img
    src="${pokemonData.sprites.front_default}"
    alt=""
  />
  <p class="pokemon-info"> ${capitalizeFirstLetter(pokemonData.name)}</p>
  ${getPokemonTypeIcons(pokemonData)}
  <div class="pokemon-info" >
  <img src="https://cdn-icons-png.flaticon.com/128/13207/13207019.png" alt="" />
  <p class="pokemon-info-value">: ${pokemonData.stats[0].base_stat}</p>
  </div>
  <div class="pokemon-info">
  <img src="https://cdn-icons-png.flaticon.com/128/1408/1408937.png" alt="" />
  <p class="pokemon-info-value">: ${pokemonData.stats[1].base_stat}</p>
  </div>
  <div class="pokemon-info">
  <img src="https://cdn-icons-png.flaticon.com/128/3288/3288844.png" alt="" />
  <p class="pokemon-info-value">: ${pokemonData.stats[2].base_stat}</p>
  </div>
  <div class="pokemon-info">
  <img src="https://cdn-icons-png.flaticon.com/128/9742/9742560.png" alt="" />
  <p class="pokemon-info-value">: ${pokemonData.stats[3].base_stat}</p>
  </div>
  <div class="pokemon-info">
  <img src="https://cdn-icons-png.flaticon.com/128/5906/5906032.png" alt="" />
  <p class="pokemon-info-value">: ${pokemonData.stats[4].base_stat}</p>
  </div>
  <div class="pokemon-info">
  <img src="https://cdn-icons-png.flaticon.com/128/9717/9717736.png" alt="" />
  <p class="pokemon-info-value">: ${pokemonData.stats[5].base_stat}</p>
  </div>
  <div class="pokemon-index" style="display:flex; flex-direction:row; align-items:center; margin:1rem">
  <div>Index: </div>
  <div class="pokemon-index-value">${pokemonData.id}</div>
  </div>
</div>`;
  const doc = new DOMParser().parseFromString(markup, "text/html");

  doc.body.firstChild.data = pokemonData.name;

  const pokemonDiv = doc.body.firstChild;

  // pokemonDiv.style.backgroundColor = pokemonColor;

  return pokemonDiv;
}

export function getEvolutionChainUrl(pokemonName) {
  let url = "";
  fetch(`${SPECIES_URL}/${pokemonName}`)
    .then((response) => response.json())
    .then((species) => (url = species.evolution_chain.url));
  return url;
}

export function getEvolutions(pokemonName) {
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

function getPokemonTypeIcons(pokemonData) {
  let pokemonTypeIcons = [];
  pokemonData.types.forEach(function (type) {
    pokemonTypeIcons.push(typeIcons[type.type.name]);
  });
  let markup = `<div class="pokemon-info-types"> Type:`;

  pokemonTypeIcons.forEach(function (icon) {
    markup += `<img src="${icon}" alt="" />`;
  });

  markup += `</div>`;

  return markup;
}
