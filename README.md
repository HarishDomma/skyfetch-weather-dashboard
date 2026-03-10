# 🌤️ SkyFetch - Weather Dashboard

A beautiful, interactive weather dashboard that provides real-time weather data and 5-day forecasts for any city in the world.

## ✨ Features

- 🔍 Search weather for any city worldwide
- 🌡️ Current temperature, feels like, humidity, and wind speed
- 📊 5-day weather forecast with daily predictions
- 💾 Recent searches saved locally (up to 5)
- 🔄 Auto-loads last searched city on page refresh
- 🗑️ Clear search history with one click
- 📱 Fully responsive design for all devices
- ⚡ Fast parallel API calls with Promise.all()

## 🛠️ Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript ES6+
- Axios for HTTP requests
- OpenWeatherMap API
- localStorage for data persistence

## 🎯 Concepts Demonstrated

- Prototypal Inheritance (OOP with Constructor Functions)
- Async/Await & Promises
- Promise.all() for concurrent API calls
- DOM Manipulation & Event Handling
- Error Handling with try/catch/finally
- localStorage API & JSON serialization
- CSS Grid responsive layout
- Mobile-first responsive design

## 🚀 Live Demo

[Add your Vercel URL here after deployment]

## 📸 Screenshots

[Add screenshots here after deployment]

## 💻 Local Setup

1. Clone the repository:
```bash
   git clone https://github.com/HarishDomma/skyfetch-weather-dashboard.git
```

2. Navigate to the project directory:
```bash
   cd skyfetch-weather-dashboard
```

3. Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)

4. Replace `YOUR_API_KEY` in `app.js` with your actual API key

5. Open `index.html` in your browser — no build step needed!

## 📁 Project Structure
```
skyfetch-weather-dashboard/
├── index.html      # App structure & layout
├── style.css       # All styles, animations, responsive design
├── app.js          # WeatherApp OOP logic
└── README.md       # Project documentation
```

## 🧠 Architecture

The app is built around a single `WeatherApp` constructor function with all logic attached to its prototype:
```
WeatherApp
├── init()                   → Wire up events, load saved data
├── handleSearch()           → Validate input, trigger fetch
├── getWeather()             → Promise.all() for both APIs
├── getForecast()            → Fetch 5-day forecast
├── displayWeather()         → Render current weather
├── displayForecast()        → Render forecast cards
├── processForecastData()    → Filter 40 points → 5 days
├── saveRecentSearch()       → Save & deduplicate
├── loadRecentSearches()     → Load from localStorage
├── displayRecentSearches()  → Render clickable pills
├── loadLastCity()           → Auto-load on startup
├── clearHistory()           → Wipe localStorage
├── showLoading()            → Loading spinner
├── showError()              → Error card
└── showWelcome()            → Welcome screen
```

## 🗂️ Built In 4 Sessions

|Session | Focus | Key Concepts |
|--------|-------|-------------|
| Part 1 | Foundation & First API Call | Axios, Promises, DOM manipulation |
| Part 2 | Interactivity & Async/Await | async/await, try/catch, event listeners |
| Part 3 | OOP & 5-Day Forecast | Prototypal inheritance, Promise.all(), CSS Grid |
| Part 4 | Storage & Deployment | localStorage, JSON, Vercel deployment |

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Harish Domma**

- GitHub: [@HarishDomma](https://github.com/HarishDomma)
- LinkedIn: [Harish Domma](https://www.linkedin.com/in/harish-domma-a51621382/)

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org)
- Built as part of Frontend Web Development Advanced Course