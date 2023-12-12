import { typeColors } from "./config.js";

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
  <p class="pokemon-info"> ${capitalizeFirstLetter(moveData.name)}:</p>
  <p class="pokemon-info">Type: ${capitalizeFirstLetter(moveData.type.name)}</p>
  <p class="pokemon-info">Acc: ${accuracy}</p>
  <p class="pokemon-info">Pow: ${power}</p>
  <p class="pokemon-info">PP: ${moveData.pp}</p>
  <p class="pokemon-info">Priority: ${moveData.priority}</p>
  <p class="pokemon-info">Desc: ${getMoveDesc(moveData)}</p>
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

  const markup = `<div id="pokemon-list-${
    pokemonData.name
  }" class="pokemon-preview">
  <img
    src="${pokemonData.sprites.front_default}"
    alt=""
  />
  <p class="pokemon-info"> ${capitalizeFirstLetter(pokemonData.name)}</p>
  <div class="pokemon-info">Type: ${pokemonTypes}</div>
  <p class="pokemon-info">HP: ${pokemonData.stats[0].base_stat}</p>
  <p class="pokemon-info">ATK: ${pokemonData.stats[1].base_stat}</p>
  <p class="pokemon-info">DEF: ${pokemonData.stats[2].base_stat}</p>
  <p class="pokemon-info">S.ATK: ${pokemonData.stats[3].base_stat}</p>
  <p class="pokemon-info">S.DEF: ${pokemonData.stats[4].base_stat}</p>
  <p class="pokemon-info">SPEED: ${pokemonData.stats[5].base_stat}</p>
  <p class="pokemon-info">Index: ${pokemonData.id}</p>
</div>`;
  const doc = new DOMParser().parseFromString(markup, "text/html");

  doc.body.firstChild.data = pokemonData.name;

  const pokemonDiv = doc.body.firstChild;

  const pokemonColor = typeColors[pokemonData.types[0].type.name];

  pokemonDiv.style.backgroundColor = pokemonColor;

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
