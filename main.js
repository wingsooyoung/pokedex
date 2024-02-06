const pokemonCount = 151;
var pokedex = {}; // {1 : {"name" : "bulbasaur", "img" : url, "type" : ["grass", "poison"], "desc" : "...."}}

// async function because using await
window.onload = async function() {
    getPokemon(1);
}

// async function because using await
async function getPokemon(num) {
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();


let res = await fetch(url);
let pokemon = await res.json();
// console.log(pokemon)

let pokemonName = pokemon["name"]
let pokemonTypes = pokemon["types"]
let pokemonImg = pokemon["sprites"]["front_default"];
}