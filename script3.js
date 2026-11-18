
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherDisplay = document.getElementById("weatherDisplay");

// Search button event
searchBtn.addEventListener("click", searchWeather);

// Enter key event
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});

// Search weather by city
async function searchWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        showMessage("Please enter a city name!");
        return;
    }

    try {
        showMessage("Loading weather data...");
        searchBtn.disabled = true;

        // Step 1: Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another city.");
        }

        // Step 2: Extract city details
        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 3: Fetch weather data
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();

        // Step 4: Display weather
        displayWeather(location, weatherData);

        showMessage("");

    } catch (error) {
        weatherDisplay.classList.add("hidden");
        showMessage(error.message);
        console.error("Weather Error:", error);

    } finally {
        searchBtn.disabled = false;
    }
}

// Display weather information
function displayWeather(location, data) {

    const current = data.current;

    document.getElementById("cityName").textContent =
        `${location.name}, ${location.country}`;

    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m);

    document.getElementById("feelsLike").textContent =
        Math.round(current.apparent_temperature);

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
        current.wind_speed_10m + " km/h";

    document.getElementById("rain").textContent =
        current.precipitation + " mm";

    document.getElementById("date").textContent =
        new Date(current.time).toLocaleString();

    document.getElementById("updated").textContent =
        "Weather data time: " + current.time;

    // Weather condition
    const weather = getWeatherCondition(current.weather_code);

    document.getElementById("description").textContent =
        weather.description;

    document.getElementById("weatherIcon").textContent =
        current.is_day ? weather.dayIcon : weather.nightIcon;

    weatherDisplay.classList.remove("hidden");
}

// Convert weather codes into descriptions
function getWeatherCondition(code) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            dayIcon: "☀️",
            nightIcon: "🌙"
        };
    }

    if (code <= 3) {
        return {
            description: "Partly Cloudy",
            dayIcon: "🌤️",
            nightIcon: "☁️"
        };
    }

    if (code <= 48) {
        return {
            description: "Foggy",
            dayIcon: "🌫️",
            nightIcon: "🌫️"
        };
    }

    if (code <= 67) {
        return {
            description: "Rainy",
            dayIcon: "🌧️",
            nightIcon: "🌧️"
        };
    }

    if (code <= 77) {
        return {
            description: "Snowy",
            dayIcon: "❄️",
            nightIcon: "❄️"
        };
    }

    if (code <= 82) {
        return {
            description: "Rain Showers",
            dayIcon: "🌦️",
            nightIcon: "🌧️"
        };
    }

    if (code <= 86) {
        return {
            description: "Snow Showers",
            dayIcon: "🌨️",
            nightIcon: "🌨️"
        };
    }

    return {
        description: "Thunderstorm",
        dayIcon: "⛈️",
        nightIcon: "⛈️"
    };
}

// Display messages
function showMessage(text) {
    message.textContent = text;
}

// Load default city
cityInput.value = "Kurnool";
searchWeather();
