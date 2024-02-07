const pokemonCount = 1025;
var pokedex = {}; // {1 : {"name" : "bulbasaur", "img" : url, "type" : ["grass", "poison"], "desc" : "...."}}

// async function because using await
window.onload = async function() {
    // getPokemon(1);
    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemon(i);
        //<div></div>
        let pokemon = document.createElement("div");
        pokemon.id = i;
        pokemon.innerText = i.toString() + ". " + pokedex[i]["name"].toUpperCase();
        pokemon.classList.add("poke-name");
        pokemon.addEventListener("click", updatePokemon);
        document.getElementById("poke-list").append(pokemon);

        // set bulbasaur(1) as init
        if (i === 1) {
        document.getElementById("poke-description").innerText = pokedex[1]["desc"];
    }

}
    
    console.log(pokedex);
}

// async function because using await
async function getPokemon(num) {
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();

    let res = await fetch(url);
    let pokemon = await res.json();
    // console.log(pokemon)

    let pokemonName = pokemon["name"]
    let pokemonType = pokemon["types"]
    let pokemonImg = pokemon["sprites"]["front_default"];

    res = await fetch(pokemon["species"]["url"]);
    let pokemonDesc = await res.json();

    // console.log(pokemonDesc);
    pokemonDesc = pokemonDesc["flavor_text_entries"][0]["flavor_text"];

    pokedex[num] = {"name" : pokemonName, "img" : pokemonImg, "types" : pokemonType, "desc" : pokemonDesc}
}

function createPokemonElement(num) {
    let pokemon = document.createElement("div");
    pokemon.id = num;
    pokemon.innerText = num.toString() + ". " + pokedex[num]["name"].toUpperCase();
    pokemon.classList.add("poke-name");
    pokemon.addEventListener("click", updatePokemon);
    document.getElementById("poke-list").append(pokemon);
}

function updatePokemon() {
    document.getElementById("poke-img").src = pokedex[this.id]["img"];

    // clear previous type
    let typesDiv = document.getElementById("poke-types");
    while (typesDiv.firstChild) {
        typesDiv.firstChild.remove();
    }

    // update types
    let types = pokedex[this.id]["types"];
    for (let i=0; i < types.length; i++) {
        let type = document.createElement("span");
        type.innerText = types[i]["type"]["name"].toUpperCase();
        type.classList.add("type");
        type.classList.add(types[i]["type"]["name"]); // adds background and font colour
        typesDiv.append(type);
    }

    // update description
    document.getElementById("poke-description").innerText = pokedex[this.id]["desc"];
}

// Function to handle search button click event
function searchPokemon() {
    let searchInput = document.getElementById("search-input").value.trim();
    let pokeList = document.getElementById("poke-list");
    pokeList.innerHTML = ""; // Clear existing Pokémon list

    // Search Pokémon by number
    let pokemonNumber = parseInt(searchInput);
    if (!isNaN(pokemonNumber) && pokemonNumber >= 1 && pokemonNumber <= pokemonCount) {
        createPokemonElement(pokemonNumber);
    } else {
        // Search Pokémon by name
        let name = searchInput.toLowerCase();
        let found = false;
        // Iterate through pokedex to find matching Pokémon by name
        Object.keys(pokedex).forEach(id => {
            let pokemonName = pokedex[id]["name"].toLowerCase();
            if (pokemonName.includes(name)) {
                createPokemonElement(parseInt(id));
                found = true;
            }
        });
        // If no matching Pokémon found, show alert
        if (!found) {
            alert("No Pokémon found with the name '" + name + "' or number '" + searchInput + "'.");
        }
    }
}
