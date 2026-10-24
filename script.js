const searchBox = document.querySelector("#search-box");
const searchBtn = document.querySelector("#search-icon");
const weatherIcon = document.querySelector(".weatherIcon");
const body = document.querySelector("body");

async function Check(city) {
    if (!city.trim()) return; // Prevent empty searches

    try {
        // Step 1: Get latitude and longitude using Open-Meteo Geocoding API (No API key required)
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("Invalid City name!");
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Step 2: Get current weather using coordinates
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        
        if (!weatherResponse.ok) {
            throw new Error(`HTTP error! status: ${weatherResponse.status}`);
        }

        const data = await weatherResponse.json();

        // Update DOM elements safely
        document.querySelector(".city").innerHTML = `${name}${country ? `, ${country}` : ''}`;
        document.querySelector(".temp").innerHTML = Math.round(data.current.temperature_2m) + "°C";
        
        // Handle potential class name variance for humidity (.humadity vs .humidity)
        const humidityEl = document.querySelector(".humadity") || document.querySelector(".humidity");
        if (humidityEl) humidityEl.innerHTML = data.current.relative_humidity_2m + "%";
        
        document.querySelector(".wind").innerHTML = data.current.wind_speed_10m + " km/h";

        // Weather icon mapping based on WMO weather codes
        const code = data.current.weather_code;
        if (code === 0) {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/128/11742/11742559.png"; // Clear
        } else if (code >= 1 && code <= 3) {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/128/704/704845.png"; // Clouds
        } else if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/128/4735/4735072.png"; // Rain
        } else if (code >= 56 && code <= 57) {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/128/3076/3076129.png"; // Drizzle
        } else if (code === 45 || code === 48) {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/128/2930/2930095.png"; // Fog/Mist
        } else if (code >= 95 && code <= 99) {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/128/1146/1146799.png"; // Thunderstorm
        } else if (code >= 71 && code <= 77) {
            weatherIcon.src = "https://cdn-icons-png.flaticon.com/128/642/642000.png"; // Snow
        }

        // Show UI card
        document.querySelector(".error").style.display = "none";
        document.querySelector(".weather").style.display = "block";

    } catch (error) {
        console.error("Fetch failed:", error);
        alert("Network error or failed to fetch weather data. Check your browser console (F12).");
    }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
    Check(searchBox.value);
});

body.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        Check(searchBox.value);
    }
});