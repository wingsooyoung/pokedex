document.addEventListener("DOMContentLoaded", initialize);
const EMPTY_HEART = '♡';
const FULL_HEART = '♥';

const pokemonCount = 1025;
var pokedex = {}; // {1 : {"name" : "bulbasaur", "img" : url, "type" : ["grass", "poison"], "desc" : "...."}}
var likedPokemon = [];


// async function because using await
async function initialize() {
    // getPokemon(1);
    
    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemon(i);
        let pokemon = document.createElement("div");
        pokemon.id = i;
        pokemon.innerText = i.toString() + ". " + pokedex[i]["name"].toUpperCase();
        pokemon.classList.add("poke-name");
        pokemon.addEventListener("click", updatePokemon);
        document.getElementById("poke-list").append(pokemon);
         // Create heart icon
        let heart = document.createElement("span");
        heart.classList.add("heart");
        heart.dataset.pokemonId = i;
        heart.dataset.liked = pokedex[i].liked ? "true" : "false";
        heart.innerText = pokedex[i].liked ? FULL_HEART : EMPTY_HEART;
        heart.addEventListener("click", toggleLike);
         
         // Append heart to pokemon name on list
        pokemon.appendChild(heart);
 
        document.getElementById("poke-list").append(pokemon);
        // set bulbasaur(1) as init
        if (i === 1) {
        document.getElementById("poke-description").innerText = pokedex[1]["desc"];

    }

}
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
    let types = pokedex[num]["types"].map(typeObj => typeObj["type"]["name"]).join(' ');
    pokemon.innerHTML = `
    <div class="poke-name" data-types="${types}">
        ${num}. ${pokedex[num]["name"].toUpperCase()}
        <span class="heart" data-pokemon-id="${num}" data-liked="${pokedex[num].liked ? 'true' : 'false'}">${pokedex[num].liked ? FULL_HEART : EMPTY_HEART}</span>
    </div>
`;
    document.getElementById("poke-list").append(pokemon);
    pokemon.querySelector(".heart").addEventListener("click", toggleLike);
}


function updatePokemon() {
    document.getElementById("poke-img").src = pokedex[this.id]["img"];

    // clear previous type
    function clearPokemon() {
        let typesDiv = document.getElementById("poke-types");
        while (typesDiv.firstChild) {
            typesDiv.firstChild.remove();
        }
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

// Search filter function (by name/ number)
// Problem: when searching, it finds the pokemon but then list starts to load again
function searchPokemon() {

    let searchInput = document.getElementById("search-input").value.trim(); // trim to fix whitespace issues?
    let pokeList = document.getElementById("poke-list");
    pokeList.innerHTML = ""; // Clear existing list

    // Search by number
    let pokemonNumber = parseInt(searchInput);
    if (!isNaN(pokemonNumber) && pokemonNumber >= 1 && pokemonNumber <= pokemonCount) {
        createPokemonElement(pokemonNumber);
        
        document.querySelectorAll('.heart').forEach(item => {
            item.addEventListener('click', toggleLike);
        });
        return;
    }

    // Search by name
    let name = searchInput.toLowerCase();
    let found = false;

    // Iterate through pokedex to find matching pokemon by name
    Object.keys(pokedex).forEach(id => {
        let pokemonName = pokedex[id]["name"].toLowerCase();
        if (pokemonName.includes(name)) {
            createPokemonElement(parseInt(id));
            found = true;
        }
    });

    // If no match, show alert
    // I want this to be an error message instead of alert but I'm struggling to make it go away when name/number deleted
    if (!found) {
        alert("No Pokémon found with that match the name or number");
    }

    document.querySelectorAll('.heart').forEach(item => {
        item.addEventListener('click', toggleLike);
    });
}


function filterByType() {

}


// Function to update the Pokémon details when clicked
function updatePokemon() {
    let pokemonId = this.id;
    document.getElementById("poke-img").src = pokedex[pokemonId]["img"];

    let typesDiv = document.getElementById("poke-types");
    typesDiv.innerHTML = ""; // Clear previous types

    let types = pokedex[pokemonId]["types"];
    for (let i = 0; i < types.length; i++) {
        let type = document.createElement("span");
        type.innerText = types[i]["type"]["name"].toUpperCase();
        type.classList.add("type");
        type.classList.add(types[i]["type"]["name"]);
        typesDiv.append(type);
    }

    document.getElementById("poke-description").innerText = pokedex[pokemonId]["desc"];
}


function toggleLike() {
    let pokemonId = this.dataset.pokemonId;
    let isLiked = this.dataset.liked === "true";

    // Toggle liked status
    if (isLiked) {
        this.innerText = EMPTY_HEART;
        this.dataset.liked = 'false';
        this.parentElement.classList.remove('liked'); // Remove the 'liked' class
        removeFromFavorites(pokemonId);
    } else {
        this.innerText = FULL_HEART;
        this.dataset.liked = 'true';
        this.parentElement.classList.add('liked'); // Add the 'liked' class
        addToFavorites(pokemonId);
    }

    // Update liked status in the main Pokemon list
    let mainPokemon = document.getElementById(pokemonId);
    if (mainPokemon) {
        mainPokemon.querySelector('.heart').innerText = isLiked ? EMPTY_HEART : FULL_HEART;
        mainPokemon.querySelector('.heart').dataset.liked = isLiked ? 'false' : 'true';
    }
}


// Function add to favourites
function addToFavorites(pokemonId) {
    if (!likedPokemon.includes(pokemonId)) {
        likedPokemon.push(pokemonId);
        pokedex[pokemonId].liked = true; // Update liked status in pokedex
        console.log(`Added ${pokemonId} to favorites`);
        updateFavorites();
        saveFavoritesToJSON();
    }
}

// Function remove from favorites
// Problem: can't remove from favourites by clicking heart on favourites
// It removes it from favourites list but the heart stays coloured on main list
function removeFromFavorites(pokemonId) {
    let index = likedPokemon.indexOf(pokemonId);
    if (index !== -1) {
        likedPokemon.splice(index, 1);
        // Update the liked status in the pokedex object
        pokedex[pokemonId].liked = false; // Set liked status to false
        updateFavorites();
        saveFavoritesToJSON();
    }
}

// Update the favourites list
function updateFavorites() {
    let favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = "";
    likedPokemon.forEach(pokemonId => {
        let pokemon = pokedex[pokemonId];
        let pokemonDiv = document.createElement("div");
        pokemonDiv.classList.add("poke-name");
        pokemonDiv.dataset.pokemonId = pokemonId;
        pokemonDiv.innerHTML = `
            <span class="pokemon-number">${pokemonId}</span>
            <span class="pokemon-name">${pokemon.name.toUpperCase()}</span>
            <span class="heart" data-pokemon-id="${pokemonId}" data-liked="true">${FULL_HEART}</span>
        `;
        favoritesList.appendChild(pokemonDiv);
        // Add event listener to toggleLike function when clicking on the heart icon
        pokemonDiv.querySelector('.heart').addEventListener('click', toggleLike);

        // Update liked status in the pokedex object
        pokedex[pokemonId].liked = true;
    });
}


