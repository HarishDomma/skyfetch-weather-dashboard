const API_KEY = '17fe9d4bc412d239db7c61ea07ad3df8';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Element references
const searchBtn  = document.getElementById('search-btn');
const cityInput  = document.getElementById('city-input');

// ── Show Loading ──────────────────────────────────────────────
function showLoading() {
    document.getElementById('weather-display').innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Fetching weather data...</p>
        </div>
    `;
}

// ── Show Error ────────────────────────────────────────────────
function showError(message) {
    document.getElementById('weather-display').innerHTML = `
        <div class="error-message">
            <span class="error-icon">❌</span>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
        </div>
    `;
}

// ── Display Weather ───────────────────────────────────────────
function displayWeather(data) {
    const cityName    = data.name;
    const country     = data.sys.country;
    const temperature = Math.round(data.main.temp);
    const feelsLike   = Math.round(data.main.feels_like);
    const humidity    = data.main.humidity;
    const windSpeed   = Math.round(data.wind.speed);
    const description = data.weather[0].description;
    const icon        = data.weather[0].icon;
    const iconUrl     = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    document.getElementById('weather-display').innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}, ${country}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
            <div class="weather-details">
                <div class="detail">
                    <span class="detail-label">Feels Like</span>
                    <span class="detail-value">${feelsLike}°C</span>
                </div>
                <div class="detail">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${humidity}%</span>
                </div>
                <div class="detail">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${windSpeed} m/s</span>
                </div>
            </div>
        </div>
    `;

    cityInput.focus();
}

// ── Fetch Weather (async/await) ───────────────────────────────
async function getWeather(city) {
    showLoading();
    searchBtn.disabled    = true;
    searchBtn.textContent = 'Searching...';

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        console.log('Weather data:', response.data);
        displayWeather(response.data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Something went wrong. Please try again later.');
        }
    } finally {
        searchBtn.disabled    = false;
        searchBtn.textContent = '🔍 Search';
    }
}

// ── Search Handler ────────────────────────────────────────────
function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }
    if (city.length < 2) {
        showError('City name is too short. Please try again.');
        return;
    }

    getWeather(city);
    cityInput.value = '';
}

// ── Event Listeners ───────────────────────────────────────────
searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});