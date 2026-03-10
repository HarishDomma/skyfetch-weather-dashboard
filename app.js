// ─────────────────────────────────────────────
//  WeatherApp Constructor
// ─────────────────────────────────────────────
function WeatherApp(apiKey) {
    this.apiKey      = apiKey;
    this.apiUrl      = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // DOM references
    this.searchBtn              = document.getElementById('search-btn');
    this.cityInput              = document.getElementById('city-input');
    this.weatherDisplay         = document.getElementById('weather-display');
    this.recentSearchesSection  = document.getElementById('recent-searches-section');
    this.recentSearchesContainer = document.getElementById('recent-searches-container');

    // Recent searches state
    this.recentSearches    = [];
    this.maxRecentSearches = 5;

    this.init();
}

// ─────────────────────────────────────────────
//  init
// ─────────────────────────────────────────────
WeatherApp.prototype.init = function () {
    // Search button click
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    // Enter key
    this.cityInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') this.handleSearch();
    }.bind(this));

    // Clear history button
    var clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', this.clearHistory.bind(this));
    }

    // Load saved data
    this.loadRecentSearches();
    this.loadLastCity();
};

// ─────────────────────────────────────────────
//  showWelcome
// ─────────────────────────────────────────────
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <span class="welcome-icon">🌍</span>
            <p>Enter a city name to get started!</p>
            <p class="welcome-hint">Try: London, Tokyo, New York</p>
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
//  handleSearch
// ─────────────────────────────────────────────
WeatherApp.prototype.handleSearch = function () {
    var city = this.cityInput.value.trim();

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
//  getWeather – Promise.all for current + forecast
// ─────────────────────────────────────────────
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled    = true;
    this.searchBtn.textContent = 'Searching...';

    var currentUrl = this.apiUrl + '?q=' + city + '&appid=' + this.apiKey + '&units=metric';

    try {
        var results = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        var currentRes   = results[0];
        var forecastData = results[1];

        console.log('Current weather:', currentRes.data);
        console.log('Forecast data:', forecastData);

        this.displayWeather(currentRes.data);
        this.displayForecast(forecastData);

        // Persist successful search
        this.saveRecentSearch(currentRes.data.name); // use API-returned name (correct casing)
        localStorage.setItem('lastCity', city);

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
//  getForecast
// ─────────────────────────────────────────────
WeatherApp.prototype.getForecast = async function (city) {
    var url = this.forecastUrl + '?q=' + city + '&appid=' + this.apiKey + '&units=metric';
    try {
        var response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};

// ─────────────────────────────────────────────
//  processForecastData – 40 points → 5 daily at noon
// ─────────────────────────────────────────────
WeatherApp.prototype.processForecastData = function (data) {
    var daily = data.list.filter(function (item) {
        return item.dt_txt.includes('12:00:00');
    });
    return daily.slice(0, 5);
};

// ─────────────────────────────────────────────
//  displayWeather
// ─────────────────────────────────────────────
WeatherApp.prototype.displayWeather = function (data) {
    var cityName    = data.name;
    var country     = data.sys.country;
    var temperature = Math.round(data.main.temp);
    var feelsLike   = Math.round(data.main.feels_like);
    var humidity    = data.main.humidity;
    var windSpeed   = Math.round(data.wind.speed);
    var description = data.weather[0].description;
    var iconUrl     = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';

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
//  displayForecast
// ─────────────────────────────────────────────
WeatherApp.prototype.displayForecast = function (data) {
    var dailyForecasts = this.processForecastData(data);

    var cardsHTML = dailyForecasts.map(function (day) {
        var date        = new Date(day.dt * 1000);
        var dayName     = date.toLocaleDateString('en-US', { weekday: 'short' });
        var temp        = Math.round(day.main.temp);
        var description = day.weather[0].description;
        var iconUrl     = 'https://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';

        return `
            <div class="forecast-card">
                <p class="forecast-day">${dayName}</p>
                <img src="${iconUrl}" alt="${description}">
                <p class="forecast-temp">${temp}°C</p>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
    }).join('');

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
//  loadRecentSearches
// ─────────────────────────────────────────────
WeatherApp.prototype.loadRecentSearches = function () {
    var saved = localStorage.getItem('recentSearches');
    if (saved) {
        this.recentSearches = JSON.parse(saved);
    }
    this.displayRecentSearches();
};

// ─────────────────────────────────────────────
//  saveRecentSearch
// ─────────────────────────────────────────────
WeatherApp.prototype.saveRecentSearch = function (city) {
    // Remove duplicate if exists
    var index = this.recentSearches.indexOf(city);
    if (index > -1) {
        this.recentSearches.splice(index, 1);
    }

    // Add to front
    this.recentSearches.unshift(city);

    // Cap at maxRecentSearches
    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

// ─────────────────────────────────────────────
//  displayRecentSearches
// ─────────────────────────────────────────────
WeatherApp.prototype.displayRecentSearches = function () {
    this.recentSearchesContainer.innerHTML = '';

    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = 'none';
        return;
    }

    this.recentSearchesSection.style.display = 'block';

    this.recentSearches.forEach(function (city) {
        var btn = document.createElement('button');
        btn.className   = 'recent-search-btn';
        btn.textContent = city;

        btn.addEventListener('click', function () {
            this.cityInput.value = city;
            this.getWeather(city);
        }.bind(this));

        this.recentSearchesContainer.appendChild(btn);
    }.bind(this));
};

// ─────────────────────────────────────────────
//  loadLastCity
// ─────────────────────────────────────────────
WeatherApp.prototype.loadLastCity = function () {
    var lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        this.getWeather(lastCity);
    } else {
        this.showWelcome();
    }
};

// ─────────────────────────────────────────────
//  clearHistory
// ─────────────────────────────────────────────
WeatherApp.prototype.clearHistory = function () {
    if (confirm('Clear all recent searches?')) {
        this.recentSearches = [];
        localStorage.removeItem('recentSearches');
        localStorage.removeItem('lastCity');
        this.displayRecentSearches();
        this.showWelcome();
    }
};

// ─────────────────────────────────────────────
//  Create app instance
// ─────────────────────────────────────────────
var app = new WeatherApp('17fe9d4bc412d239db7c61ea07ad3df8');