// ─────────────────────────────────────────────
//  WeatherApp Constructor
// ─────────────────────────────────────────────
function WeatherApp(apiKey) {
    this.apiKey      = apiKey;
    this.apiUrl      = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // DOM references (queried once)
    this.searchBtn     = document.getElementById('search-btn');
    this.cityInput     = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    this.init();
}

// ─────────────────────────────────────────────
//  init – wire up event listeners & welcome
// ─────────────────────────────────────────────
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    this.cityInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') this.handleSearch();
    }.bind(this));

    this.showWelcome();
};

// ─────────────────────────────────────────────
//  showWelcome
// ─────────────────────────────────────────────
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <span class="welcome-icon">🌍</span>
            <p>Enter a city name to get started!</p>
        </div>
    `;
};

// ─────────────────────────────────────────────
//  showLoading
// ─────────────────────────────────────────────
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Fetching weather data...</p>
        </div>
    `;
};

// ─────────────────────────────────────────────
//  showError
// ─────────────────────────────────────────────
WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <span class="error-icon">❌</span>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
        </div>
    `;
};

// ─────────────────────────────────────────────
//  handleSearch – validate input then fetch
// ─────────────────────────────────────────────
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError('Please enter a city name.');
        return;
    }
    if (city.length < 2) {
        this.showError('City name is too short. Please try again.');
        return;
    }

    this.getWeather(city);
    this.cityInput.value = '';
};

// ─────────────────────────────────────────────
//  getWeather – fetch current + forecast via Promise.all
// ─────────────────────────────────────────────
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled    = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        // Fetch both endpoints simultaneously
        const [currentRes, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        console.log('Current weather:', currentRes.data);
        console.log('Forecast data:', forecastData);

        this.displayWeather(currentRes.data);
        this.displayForecast(forecastData);

    } catch (error) {
        console.error('Error fetching weather:', error);
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check the spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled    = false;
        this.searchBtn.textContent = '🔍 Search';
    }
};

// ─────────────────────────────────────────────
//  getForecast – fetch 5-day forecast data
// ─────────────────────────────────────────────
WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error; // bubble up to getWeather catch
    }
};

// ─────────────────────────────────────────────
//  processForecastData – filter to 1 entry per day at noon
// ─────────────────────────────────────────────
WeatherApp.prototype.processForecastData = function (data) {
    const daily = data.list.filter(function (item) {
        return item.dt_txt.includes('12:00:00');
    });
    return daily.slice(0, 5);
};

// ─────────────────────────────────────────────
//  displayWeather – render current weather card
// ─────────────────────────────────────────────
WeatherApp.prototype.displayWeather = function (data) {
    const cityName    = data.name;
    const country     = data.sys.country;
    const temperature = Math.round(data.main.temp);
    const feelsLike   = Math.round(data.main.feels_like);
    const humidity    = data.main.humidity;
    const windSpeed   = Math.round(data.wind.speed);
    const description = data.weather[0].description;
    const iconUrl     = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
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

    this.cityInput.focus();
};

// ─────────────────────────────────────────────
//  displayForecast – append 5-day forecast cards
// ─────────────────────────────────────────────
WeatherApp.prototype.displayForecast = function (data) {
    const dailyForecasts = this.processForecastData(data);

    const cardsHTML = dailyForecasts.map(function (day) {
        const date        = new Date(day.dt * 1000);
        const dayName     = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp        = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const iconUrl     = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        return `
            <div class="forecast-card">
                <p class="forecast-day">${dayName}</p>
                <img src="${iconUrl}" alt="${description}">
                <p class="forecast-temp">${temp}°C</p>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
    }).join('');

    // Append below current weather (don't overwrite it)
    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3 class="forecast-title">📅 5-Day Forecast</h3>
            <div class="forecast-container">
                ${cardsHTML}
            </div>
        </div>
    `;
};

// ─────────────────────────────────────────────
//  Create app instance
// ─────────────────────────────────────────────
const app = new WeatherApp('17fe9d4bc412d239db7c61ea07ad3df8');