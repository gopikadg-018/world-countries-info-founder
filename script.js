
const searchForm = document.getElementById("searchForm");
const countryInput = document.getElementById("countryInput");
const searchButton = searchForm.querySelector("button");
const message = document.getElementById("message");
const countryCard = document.getElementById("countryCard");

let allCountries = [];

function normalizeName(name) {
    return String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

// Load the country list only once
async function loadCountries() {
    if (allCountries.length > 0) {
        return allCountries;
    }

    const response = await fetch(
        "https://countries.dev/countries"
    );

    if (!response.ok) {
        throw new Error("Unable to load country list");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("Invalid country list");
    }

    allCountries = data;
    return allCountries;
}

function displayCountry(data) {
    const name = data.name || "Unknown country";

    const flag =
        data.flags?.png ||
        data.flags?.svg ||
        (typeof data.flag === "string" &&
         data.flag.startsWith("http") ? data.flag : "");

    const flagElement = document.getElementById("flag");

    if (flag) {
        flagElement.src = flag;
        flagElement.hidden = false;
    } else {
        flagElement.hidden = true;
    }

    flagElement.alt = "Flag of " + name;

    document.getElementById("countryName").textContent = name;

    const capital = Array.isArray(data.capital)
        ? data.capital.join(", ")
        : data.capital;

    document.getElementById("capital").textContent =
        capital || "Not available";

    document.getElementById("continent").textContent =
        data.region || "Not available";

    document.getElementById("region").textContent =
        data.subregion || data.region || "Not available";

    document.getElementById("population").textContent =
        typeof data.population === "number"
            ? data.population.toLocaleString("en-IN")
            : "Not available";

    const currencies = Array.isArray(data.currencies)
        ? data.currencies.map(currency =>
            `${currency.name || currency.code || "Currency"} ` +
            `(${currency.symbol || currency.code || ""})`
        ).join(", ")
        : "";

    document.getElementById("currency").textContent =
        currencies || "Not available";

    const languages = Array.isArray(data.languages)
        ? data.languages.map(language =>
            typeof language === "string"
                ? language
                : language.name
        ).filter(Boolean).join(", ")
        : "";

    document.getElementById("languages").textContent =
        languages || "Not available";

    document.getElementById("countryCode").textContent =
        data.alpha2Code || data.cca2 || "Not available";

    document.getElementById("mapLink").href =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(name);

    countryCard.hidden = false;
}

searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const searchName = countryInput.value.trim();

    if (!searchName) {
        message.textContent = "Please enter a country name.";
        return;
    }

    countryCard.hidden = true;
    message.textContent = "Loading country information...";
    searchButton.disabled = true;

    try {
        const countries = await loadCountries();
        const search = normalizeName(searchName);

        // Match the complete name first
        let country = countries.find(item =>
            normalizeName(item.name) === search
        );

        // If no exact match, try names that start with the search
        if (!country) {
            country = countries.find(item =>
                normalizeName(item.name).startsWith(search)
            );
        }

        // Finally, try a partial name match
        if (!country) {
            country = countries.find(item =>
                normalizeName(item.name).includes(search)
            );
        }

        if (!country) {
            message.textContent =
                "Country not found. Check the spelling and try again.";
            return;
        }

        displayCountry(country);
        message.textContent = "Country information found!";

    } catch (error) {
        console.error("Country API error:", error);

        message.textContent =
            "Unable to load country list. Check your internet connection and try again.";

    } finally {
        searchButton.disabled = false;
    }
});
