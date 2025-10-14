document.addEventListener("DOMContentLoaded", initialize);

const EMPTY_HEART = '♡';
const FULL_HEART = '❤️';
const pokemonCount = 1025;
var pokedex = {};
var likedPokemon = [];

async function initialize() {
    document.getElementById("loading-screen").style.display = "block";
    document.getElementById("app-content").style.display = "none";

    loadFavorites();

    const promises = [];
    for (let i = 1; i <= pokemonCount; i++) {
        promises.push(getPokemon(i));
    }
    await Promise.all(promises);

    for (let i = 1; i <= pokemonCount; i++) {
        createPokemonElement(i);
    }

    if (pokedex[1]) {
        document.getElementById("poke-name").innerText = pokedex[1]["name"].charAt(0).toUpperCase() + pokedex[1]["name"].slice(1);
        document.getElementById("poke-description").innerText = pokedex[1]["desc"];
        //document.getElementById("poke-img").src = pokedex[1]["img"];
        document.getElementById("poke-normal-img").src = pokedex[1]["normal"];
        document.getElementById("poke-shiny-img").src = pokedex[1]["shiny"];
    }

    updateFavorites();

    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("app-content").style.display = "block";
}


function loadFavorites() {
    const saved = localStorage.getItem("likedPokemon");
    if (saved) {
        likedPokemon = JSON.parse(saved);
    }
}

async function getPokemon(num) {
    let url = `https://pokeapi.co/api/v2/pokemon/${num}`;
    let res = await fetch(url);
    let pokemon = await res.json();

    let pokemonName = pokemon["name"];
    let pokemonType = pokemon["types"];
    //let pokemonImg = pokemon["sprites"]["front_default"];
    let pokeNormalImg = `https://img.pokemondb.net/sprites/home/normal/2x/${pokemon["name"]}.jpg`
    let pokeShinyImg = `https://img.pokemondb.net/sprites/home/shiny/2x/${pokemon["name"]}.jpg`

    res = await fetch(pokemon["species"]["url"]);
    let pokemonDescData = await res.json();
    let flavorEntry = pokemonDescData["flavor_text_entries"].find(entry => entry.language.name === "en");
    let pokemonDesc = flavorEntry ? flavorEntry["flavor_text"] : "No description available.";

    pokedex[num] = {
        "name": pokemonName,
        //"img": pokemonImg,
        "normal": pokeNormalImg,
        "shiny": pokeShinyImg,
        "types": pokemonType,
        "desc": pokemonDesc,
        "liked": likedPokemon.includes(num.toString())
    };
}

function createPokemonElement(num) {
    let pokemon = document.createElement("div");
    pokemon.id = num;
    pokemon.classList.add("poke-name");

    let nameSpan = document.createElement("span");
    nameSpan.textContent = `${num}. ${pokedex[num]["name"].toUpperCase()}`;
    pokemon.appendChild(nameSpan);

    let heart = document.createElement("span");
    heart.classList.add("heart");
    heart.dataset.pokemonId = num;
    heart.dataset.liked = pokedex[num].liked ? "true" : "false";
    heart.innerText = pokedex[num].liked ? FULL_HEART : EMPTY_HEART;
    if (pokedex[num].liked) {
        heart.classList.add('red-heart');
    }
    heart.addEventListener("click", toggleLike);
    pokemon.appendChild(heart);

    pokemon.addEventListener("click", updatePokemon);
    document.getElementById("poke-list").appendChild(pokemon);
}

function updatePokemon() {
    let pokemonId = this.id || this.dataset.pokemonId;

    document.querySelectorAll(".poke-name").forEach(el => {
        el.classList.remove("selected");
    });

    const selectedMain = document.querySelector(`#poke-list .poke-name[id='${pokemonId}']`);
    if (selectedMain) selectedMain.classList.add("selected");

    const selectedFav = document.querySelector(`#favorites-list .poke-name[data-pokemon-id='${pokemonId}']`);
    if (selectedFav) selectedFav.classList.add("selected");

    document.getElementById("poke-name").innerText =
        pokedex[pokemonId]["name"].charAt(0).toUpperCase() + pokedex[pokemonId]["name"].slice(1);
    document.getElementById("poke-normal-img").src = pokedex[pokemonId]["normal"];
    document.getElementById("poke-shiny-img").src = pokedex[pokemonId]["shiny"];
    document.getElementById("poke-description").innerText = pokedex[pokemonId]["desc"];

    let typesDiv = document.getElementById("poke-types");
    typesDiv.innerHTML = "";

    let types = pokedex[pokemonId]["types"];
    types.forEach(typeObj => {
        let type = document.createElement("span");
        let typeName = typeObj["type"]["name"];
        type.innerText = typeName.toUpperCase();
        type.classList.add("type", typeName);
        typesDiv.appendChild(type);
    });
}


function searchPokemon() {
    let searchInput = document.getElementById("search-input").value.trim().toLowerCase();
    let selectedType = document.getElementById("type-filter").value.toLowerCase();

    document.querySelectorAll("#poke-list .poke-name").forEach(el => el.remove());
    document.getElementById("error-message").innerText = "";

    let found = false;
    Object.keys(pokedex).forEach(id => {
        let pokemon = pokedex[id];
        let nameMatch = pokemon["name"].includes(searchInput);
        let typeMatch = selectedType === "all" || pokemon["types"].some(type => type["type"]["name"] === selectedType);

        if ((nameMatch || id === searchInput) && typeMatch) {
            createPokemonElement(parseInt(id));
            found = true;
        }
    });

    if (!found) {
        document.getElementById("error-message").innerText =
            selectedType !== "all"
                ? `No Pokémon found of type "${selectedType}" with the name or number entered.`
                : "No Pokémon found with the name or number entered.";
    }
}

function filterByType() {
    searchPokemon();
}

function toggleLike(e) {
    e.stopPropagation();

    let pokemonId = this.dataset.pokemonId;
    let isLiked = this.dataset.liked === "true";

    if (isLiked) {
        this.innerText = EMPTY_HEART;
        this.dataset.liked = 'false';
        this.classList.remove('red-heart');
        this.parentElement.classList.remove('liked');
        removeFromFavorites(pokemonId);
    } else {
        this.innerText = FULL_HEART;
        this.dataset.liked = 'true';
        this.classList.add('red-heart');
        this.parentElement.classList.add('liked');
        addToFavorites(pokemonId);
    }
    const mainListHeart = document.querySelector(`#poke-list .poke-name[id='${pokemonId}'] .heart`);
    if (mainListHeart && mainListHeart !== this) {
        if (isLiked) {
            mainListHeart.innerText = EMPTY_HEART;
            mainListHeart.dataset.liked = 'false';
            mainListHeart.classList.remove('red-heart');
        } else {
            mainListHeart.innerText = FULL_HEART;
            mainListHeart.dataset.liked = 'true';
            mainListHeart.classList.add('red-heart');
        }
    }
}

function addToFavorites(pokemonId) {
    if (!likedPokemon.includes(pokemonId)) {
        likedPokemon.push(pokemonId);
        pokedex[pokemonId].liked = true;
        saveFavorites();
        updateFavorites();
    }
}

function removeFromFavorites(pokemonId) {
    let index = likedPokemon.indexOf(pokemonId);
    if (index !== -1) {
        likedPokemon.splice(index, 1);
        pokedex[pokemonId].liked = false;
        saveFavorites();
        updateFavorites();
    }
}

function saveFavorites() {
    localStorage.setItem("likedPokemon", JSON.stringify(likedPokemon));
}

function updateFavorites() {
    let favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = "";

    likedPokemon.forEach(pokemonId => {
        if (!pokedex[pokemonId]) return;

        let pokemon = pokedex[pokemonId];

        let pokemonDiv = document.createElement("div");
        pokemonDiv.classList.add("poke-name");
        pokemonDiv.dataset.pokemonId = pokemonId;

        let nameSpan = document.createElement("span");
        nameSpan.classList.add("pokemon-name");
        nameSpan.innerText = `${pokemonId}. ${pokemon.name.toUpperCase()}`;

        let heartSpan = document.createElement("span");
        heartSpan.classList.add("heart", "red-heart");
        heartSpan.dataset.pokemonId = pokemonId;
        heartSpan.dataset.liked = 'true';
        heartSpan.innerText = FULL_HEART;
        heartSpan.addEventListener("click", toggleLike);

        pokemonDiv.appendChild(nameSpan);
        pokemonDiv.appendChild(heartSpan);

        favoritesList.appendChild(pokemonDiv);

        pokemonDiv.addEventListener("click", function () {
            updatePokemon.call({ id: pokemonId });
        });
    });
}

