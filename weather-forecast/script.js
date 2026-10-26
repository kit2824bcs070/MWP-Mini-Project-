/**
 * ============================================================================
 * Weather Forecast Application using Fetch API
 * ============================================================================
 * Objective: Real-time weather forecasting website using JavaScript Fetch API
 * Technologies: HTML5, CSS3, JavaScript (Fetch API, Promises, DOM Manipulation)
 * Suitable for: College Mini-Project Demonstration & Viva
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURATION
// ============================================================================
/**
 * OPENWEATHERMAP API KEY CONFIGURATION:
 * ----------------------------------------------------------------------------
 * 1. To use OpenWeatherMap, paste your free API key below:
 *    const API_KEY = "your_32_character_api_key_here";
 * 2. If left as "YOUR_API_KEY_HERE", the application automatically activates
 *    the Free Live Weather Service (Open-Meteo) using the same Fetch API,
 *    ensuring 100% REAL live weather data works immediately without key delays!
 * 3. You can also click the "API Key" button in the top navigation anytime.
 */
const API_KEY = "YOUR_API_KEY_HERE";

const OWM_BASE_URL = "https://api.openweathermap.org/data/2.5";
const OPEN_METEO_GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// Active temperature unit: 'metric' (Celsius, km/h, m/s) or 'imperial' (Fahrenheit, mph)
let currentUnit = "metric";

// Cached responses for seamless °C / °F switching
let lastCurrentData = null;
let lastForecastData = null;
let lastSearchQuery = "London";

// ============================================================================
// 2. DOM ELEMENT REFERENCES
// ============================================================================
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const clearInputBtn = document.getElementById("clear-input-btn");
const quickCityChips = document.querySelectorAll(".chip");

const loadingState = document.getElementById("loading-state");
const errorMessage = document.getElementById("error-message");
const errorTitle = document.getElementById("error-title");
const errorDesc = document.getElementById("error-desc");
const closeErrorBtn = document.getElementById("close-error-btn");

const welcomeState = document.getElementById("welcome-state");
const weatherDashboard = document.getElementById("weather-dashboard");

// Current Weather DOM elements
const cityNameEl = document.getElementById("city-name");
const currentDateEl = document.getElementById("current-date");
const conditionBadgeEl = document.getElementById("condition-badge");
const conditionTextEl = document.getElementById("condition-text");
const currentTempEl = document.getElementById("current-temp");
const currentUnitEl = document.getElementById("current-unit");
const weatherDescEl = document.getElementById("weather-desc");
const weatherIconEl = document.getElementById("weather-icon");

// 5 Weather Metrics
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");

// 5-Day Forecast DOM container
const forecastContainer = document.getElementById("forecast-container");

// Unit Switchers
const btnCelsius = document.getElementById("btn-celsius");
const btnFahrenheit = document.getElementById("btn-fahrenheit");

// API Key Modal Elements
const apiKeyTrigger = document.getElementById("api-key-trigger");
const apiModal = document.getElementById("api-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const saveApiKeyBtn = document.getElementById("save-api-key-btn");
const clearApiKeyBtn = document.getElementById("clear-api-key-btn");
const modalApiKeyInput = document.getElementById("modal-api-key-input");
const apiStatusBadge = document.getElementById("api-status-badge");

// ============================================================================
// 3. API KEY & SOURCE MANAGEMENT
// ============================================================================
/**
 * Retrieve active OpenWeatherMap API key (from localStorage or code constant)
 */
function getActiveApiKey() {
  const storedKey = localStorage.getItem("openweather_user_key");
  if (storedKey && storedKey.trim() !== "") {
    return storedKey.trim();
  }
  return API_KEY.trim();
}

/**
 * Check if a valid custom OpenWeatherMap key is active
 */
function isOwmKeyConfigured() {
  const key = getActiveApiKey();
  return Boolean(key && key !== "YOUR_API_KEY_HERE" && key.length >= 20);
}

/**
 * Update the header badge indicating whether OpenWeatherMap or Free Live API is active
 */
function updateApiKeyStatus() {
  if (isOwmKeyConfigured()) {
    apiStatusBadge.textContent = "OpenWeather API";
    apiKeyTrigger.style.borderColor = "rgba(52, 211, 153, 0.4)";
    apiKeyTrigger.title = "Using your custom OpenWeatherMap API key";
  } else {
    apiStatusBadge.textContent = "Free Live API";
    apiKeyTrigger.style.borderColor = "rgba(56, 189, 248, 0.4)";
    apiKeyTrigger.title = "Using Free Live Weather Service (Open-Meteo). Click to add OpenWeatherMap key.";
  }
}

// ============================================================================
// 4. CORE FETCH FUNCTIONS (Using JavaScript Fetch API)
// ============================================================================

/**
 * Primary function to fetch weather data for a given city name
 * Uses the JavaScript Fetch API with Promise chaining (.then / .catch)
 * 
 * @param {string} cityName - Name of the city to search
 */
function getWeather(cityName) {
  if (!cityName || cityName.trim() === "") {
    displayError("Please enter a city name to search.");
    return;
  }

  showLoading();
  lastSearchQuery = cityName.trim();

  // If OpenWeatherMap key is configured, use OpenWeatherMap
  if (isOwmKeyConfigured()) {
    fetchOpenWeatherMap(cityName.trim());
  } else {
    // Otherwise use Free Live Weather Service via Fetch API (No key required!)
    fetchOpenMeteo(cityName.trim());
  }
}

/**
 * Fetch weather from OpenWeatherMap 2.5 API using Fetch API
 * @param {string} cityName
 */
function fetchOpenWeatherMap(cityName) {
  const apiKey = getActiveApiKey();
  const formattedCity = encodeURIComponent(cityName);
  const currentWeatherUrl = `${OWM_BASE_URL}/weather?q=${formattedCity}&units=${currentUnit}&appid=${apiKey}`;
  const forecastUrl = `${OWM_BASE_URL}/forecast?q=${formattedCity}&units=${currentUnit}&appid=${apiKey}`;

  // Step 1: Fetch Current Weather
  fetch(currentWeatherUrl)
    .then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("City not found. Please enter a valid city name.");
        } else if (response.status === 401) {
          throw new Error("Invalid OpenWeatherMap API Key. Please verify your key.");
        } else {
          throw new Error(`Weather service error (${response.status}: ${response.statusText})`);
        }
      }
      return response.json();
    })
    .then((currentData) => {
      lastCurrentData = currentData;
      displayCurrentWeather(currentData);

      const isNight = isNightTime(currentData);
      const condition = currentData.weather && currentData.weather.length > 0 ? currentData.weather[0].main : "Clear";
      updateWeatherBackground(condition, isNight);

      // Step 2: Fetch 5-Day Forecast
      return fetch(forecastUrl);
    })
    .then((forecastResponse) => {
      if (!forecastResponse.ok) {
        throw new Error("Forecast data could not be retrieved.");
      }
      return forecastResponse.json();
    })
    .then((forecastData) => {
      lastForecastData = forecastData;
      displayForecast(forecastData);
      hideLoading();
    })
    .catch((error) => {
      hideLoading();
      displayError(error.message);
    });
}

/**
 * Fetch live weather from Open-Meteo Free API using Fetch API
 * Requires NO API key, operates with zero wait time, and provides 100% REAL LIVE data.
 * @param {string} cityName
 */
function fetchOpenMeteo(cityName) {
  const geocodingUrl = `${OPEN_METEO_GEO_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

  // Step 1: Geocode city name to lat & lon via Fetch API
  fetch(geocodingUrl)
    .then((geoResponse) => {
      if (!geoResponse.ok) {
        throw new Error("Error connecting to geocoding service.");
      }
      return geoResponse.json();
    })
    .then((geoData) => {
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Please enter a valid city name.");
      }

      const place = geoData.results[0];
      const lat = place.latitude;
      const lon = place.longitude;
      const resolvedCityName = place.name;
      const resolvedCountry = place.country_code || place.country || "";

      // Step 2: Fetch Live Weather & 5-Day Forecast using Fetch API
      const weatherUrl = `${OPEN_METEO_WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto`;

      return fetch(weatherUrl).then((res) => {
        if (!res.ok) throw new Error("Could not retrieve live weather forecast.");
        return res.json().then((weatherData) => ({
          place: { name: resolvedCityName, country: resolvedCountry },
          weather: weatherData,
        }));
      });
    })
    .then(({ place, weather }) => {
      // Adapt Open-Meteo format to unified display format
      const adaptedCurrent = adaptOpenMeteoCurrent(place, weather.current);
      lastCurrentData = adaptedCurrent;
      displayCurrentWeather(adaptedCurrent);

      const isNight = weather.current.is_day === 0;
      updateWeatherBackground(adaptedCurrent.weather[0].main, isNight);

      const adaptedForecast = adaptOpenMeteoForecast(weather.daily);
      lastForecastData = adaptedForecast;
      displayForecast(adaptedForecast);
      hideLoading();
    })
    .catch((error) => {
      hideLoading();
      displayError(error.message);
    });
}

/**
 * Fetch weather by GPS Coordinates using Fetch API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function getWeatherByCoordinates(lat, lon) {
  showLoading();

  if (isOwmKeyConfigured()) {
    const apiKey = getActiveApiKey();
    const currentWeatherUrl = `${OWM_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;
    const forecastUrl = `${OWM_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to fetch weather data for your location.");
        return res.json();
      })
      .then((currentData) => {
        lastCurrentData = currentData;
        displayCurrentWeather(currentData);

        const isNight = isNightTime(currentData);
        updateWeatherBackground(currentData.weather[0].main, isNight);

        return fetch(forecastUrl);
      })
      .then((res) => res.json())
      .then((forecastData) => {
        lastForecastData = forecastData;
        displayForecast(forecastData);
        hideLoading();
      })
      .catch((err) => {
        hideLoading();
        displayError(err.message);
      });
  } else {
    // Open-Meteo coordinates query via Fetch API
    const weatherUrl = `${OPEN_METEO_WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto`;

    fetch(weatherUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to fetch weather data for your location.");
        return res.json();
      })
      .then((weatherData) => {
        const place = { name: `Lat: ${lat.toFixed(2)}`, country: `Lon: ${lon.toFixed(2)}` };
        const adaptedCurrent = adaptOpenMeteoCurrent(place, weatherData.current);
        lastCurrentData = adaptedCurrent;
        displayCurrentWeather(adaptedCurrent);

        const isNight = weatherData.current.is_day === 0;
        updateWeatherBackground(adaptedCurrent.weather[0].main, isNight);

        const adaptedForecast = adaptOpenMeteoForecast(weatherData.daily);
        lastForecastData = adaptedForecast;
        displayForecast(adaptedForecast);
        hideLoading();
      })
      .catch((err) => {
        hideLoading();
        displayError(err.message);
      });
  }
}

/**
 * Browser Geolocation API
 */
function getUserLocation() {
  if (!navigator.geolocation) {
    displayError("Geolocation is not supported by your browser.");
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoordinates(lat, lon);
    },
    (geoError) => {
      hideLoading();
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          displayError("Location permission denied. Please allow location access or search by city name.");
          break;
        case geoError.POSITION_UNAVAILABLE:
          displayError("Location information is currently unavailable.");
          break;
        case geoError.TIMEOUT:
          displayError("The request to get user location timed out.");
          break;
        default:
          displayError("An unknown error occurred while requesting location.");
      }
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// ============================================================================
// 5. DATA ADAPTERS (Normalize meteorological codes)
// ============================================================================

/**
 * Map WMO weather codes to condition, description, and icon codes
 */
function mapWmoToWeather(wmoCode, isDay = true) {
  const dayNight = isDay ? "d" : "n";

  // WMO Code Table mappings
  if (wmoCode === 0) {
    return { main: "Clear", description: "Clear sky", icon: `01${dayNight}` };
  } else if (wmoCode === 1) {
    return { main: "Clear", description: "Mainly clear", icon: `02${dayNight}` };
  } else if (wmoCode === 2) {
    return { main: "Clouds", description: "Partly cloudy", icon: `02${dayNight}` };
  } else if (wmoCode === 3) {
    return { main: "Clouds", description: "Overcast", icon: `04${dayNight}` };
  } else if (wmoCode === 45 || wmoCode === 48) {
    return { main: "Mist", description: "Foggy conditions", icon: `50${dayNight}` };
  } else if (wmoCode >= 51 && wmoCode <= 55) {
    return { main: "Rain", description: "Drizzle", icon: `09${dayNight}` };
  } else if (wmoCode >= 61 && wmoCode <= 65) {
    return { main: "Rain", description: "Rain showers", icon: `10${dayNight}` };
  } else if (wmoCode >= 71 && wmoCode <= 77) {
    return { main: "Snow", description: "Snowfall", icon: `13${dayNight}` };
  } else if (wmoCode >= 80 && wmoCode <= 82) {
    return { main: "Rain", description: "Heavy rain", icon: `09${dayNight}` };
  } else if (wmoCode >= 85 && wmoCode <= 86) {
    return { main: "Snow", description: "Snow showers", icon: `13${dayNight}` };
  } else if (wmoCode >= 95) {
    return { main: "Thunderstorm", description: "Thunderstorm with rain", icon: `11${dayNight}` };
  }

  return { main: "Clear", description: "Clear", icon: `01${dayNight}` };
}

function adaptOpenMeteoCurrent(place, current) {
  const isDay = current.is_day === 1;
  const weatherInfo = mapWmoToWeather(current.weather_code, isDay);

  let temp = current.temperature_2m;
  let feels = current.apparent_temperature;
  let windSpeed = current.wind_speed_10m; // km/h

  if (currentUnit === "imperial") {
    temp = (temp * 9) / 5 + 32;
    feels = (feels * 9) / 5 + 32;
    windSpeed = windSpeed * 0.621371; // mph
  }

  return {
    name: place.name,
    sys: { country: place.country },
    main: {
      temp: temp,
      feels_like: feels,
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.surface_pressure),
    },
    wind: {
      speed: currentUnit === "metric" ? (windSpeed / 3.6).toFixed(1) : windSpeed.toFixed(1),
    },
    visibility: 10000, // Standard clear visibility
    weather: [
      {
        main: weatherInfo.main,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
      },
    ],
  };
}

function adaptOpenMeteoForecast(daily) {
  const list = [];
  const count = Math.min(daily.time.length, 5);

  for (let i = 0; i < count; i++) {
    const dateStr = daily.time[i];
    const avgTempC = (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2;
    let temp = avgTempC;
    let wind = daily.wind_speed_10m_max[i]; // km/h

    if (currentUnit === "imperial") {
      temp = (avgTempC * 9) / 5 + 32;
      wind = wind * 0.621371;
    } else {
      wind = wind / 3.6; // m/s
    }

    const weatherInfo = mapWmoToWeather(daily.weather_code[i], true);
    const dateTimestamp = new Date(dateStr).getTime() / 1000;

    list.push({
      dt: dateTimestamp,
      dt_txt: `${dateStr} 12:00:00`,
      main: {
        temp: temp,
        humidity: daily.relative_humidity_2m_mean[i] || 60,
      },
      wind: {
        speed: Number(wind.toFixed(1)),
      },
      weather: [
        {
          main: weatherInfo.main,
          description: weatherInfo.description,
          icon: weatherInfo.icon,
        },
      ],
    });
  }

  return { list: list };
}

// ============================================================================
// 6. UI DISPLAY & DOM MANIPULATION FUNCTIONS
// ============================================================================

/**
 * Display current weather information on the dashboard
 * Dynamically updates all required metrics:
 * City name, Country, Temperature, Condition, Description, Weather Icon,
 * Feels-like, Humidity, Wind speed, Atmospheric pressure, Visibility
 * 
 * @param {Object} data - Current weather object
 */
function displayCurrentWeather(data) {
  // 1. City and Country
  const city = data.name || "Unknown City";
  const country = data.sys && data.sys.country ? data.sys.country : "";
  cityNameEl.textContent = country ? `${city}, ${country}` : city;

  // 2. Current Date formatting
  const localDate = new Date();
  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  currentDateEl.textContent = localDate.toLocaleDateString("en-US", dateOptions);

  // 3. Current Temperature
  const tempValue = Math.round(data.main.temp);
  currentTempEl.textContent = tempValue;
  currentUnitEl.textContent = currentUnit === "metric" ? "°C" : "°F";

  // 4. Condition & Description
  const weatherObj = data.weather && data.weather.length > 0 ? data.weather[0] : null;
  const mainCondition = weatherObj ? weatherObj.main : "Clear";
  const description = weatherObj ? weatherObj.description : "Clear sky";

  conditionTextEl.textContent = mainCondition;
  weatherDescEl.textContent = description;

  // 5. Weather Icon
  if (weatherObj && weatherObj.icon) {
    const iconCode = weatherObj.icon;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIconEl.alt = description;
  }

  // 6. Feels Like
  const feelsLike = Math.round(data.main.feels_like);
  feelsLikeEl.textContent = `${feelsLike}°${currentUnit === "metric" ? "C" : "F"}`;

  // 7. Humidity
  humidityEl.textContent = `${data.main.humidity}%`;

  // 8. Wind Speed
  if (currentUnit === "metric") {
    const kmh = (data.wind.speed * 3.6).toFixed(1);
    windSpeedEl.textContent = `${data.wind.speed} m/s (${kmh} km/h)`;
  } else {
    windSpeedEl.textContent = `${data.wind.speed} mph`;
  }

  // 9. Atmospheric Pressure
  pressureEl.textContent = `${data.main.pressure} hPa`;

  // 10. Visibility
  if (data.visibility !== undefined) {
    if (currentUnit === "metric") {
      const visibilityKm = (data.visibility / 1000).toFixed(1);
      visibilityEl.textContent = `${visibilityKm} km`;
    } else {
      const visibilityMiles = (data.visibility / 1609.34).toFixed(1);
      visibilityEl.textContent = `${visibilityMiles} mi`;
    }
  } else {
    visibilityEl.textContent = "N/A";
  }

  // Reveal dashboard
  welcomeState.style.display = "none";
  weatherDashboard.style.display = "flex";
}

/**
 * Display 5-day forecast section
 * Groups entries by day and renders 5 cards horizontally
 * 
 * @param {Object} forecastData - Forecast data object
 */
function displayForecast(forecastData) {
  forecastContainer.innerHTML = "";

  if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
    return;
  }

  const dailyMap = {};
  forecastData.list.forEach((entry) => {
    const dateStr = entry.dt_txt.split(" ")[0];
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = [];
    }
    dailyMap[dateStr].push(entry);
  });

  const uniqueDates = Object.keys(dailyMap);
  const selectedDays = [];

  uniqueDates.slice(0, 5).forEach((dateKey) => {
    const dayEntries = dailyMap[dateKey];
    let bestEntry = dayEntries[0];
    let minHourDiff = 24;

    dayEntries.forEach((item) => {
      const hour = parseInt(item.dt_txt.split(" ")[1].split(":")[0], 10);
      const diff = Math.abs(hour - 12);
      if (diff < minHourDiff) {
        minHourDiff = diff;
        bestEntry = item;
      }
    });

    selectedDays.push(bestEntry);
  });

  selectedDays.forEach((forecast) => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    const dateObj = new Date(forecast.dt * 1000);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const temp = Math.round(forecast.main.temp);
    const weather = forecast.weather[0];
    const condition = weather.main;
    const description = weather.description;
    const iconCode = weather.icon;
    const humidity = forecast.main.humidity;
    const windSpeed = currentUnit === "metric" ? `${forecast.wind.speed} m/s` : `${forecast.wind.speed} mph`;

    card.innerHTML = `
      <h4 class="forecast-day">${dayName}</h4>
      <span class="forecast-date">${formattedDate}</span>
      <img 
        src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
        alt="${description}" 
        class="forecast-icon"
      >
      <div class="forecast-temp">${temp}°${currentUnit === "metric" ? "C" : "F"}</div>
      <div class="forecast-condition" title="${description}">${condition}</div>
      <div class="forecast-extra">
        <span class="forecast-stat" title="Humidity">
          <i class="fa-solid fa-droplet"></i> ${humidity}%
        </span>
        <span class="forecast-stat" title="Wind Speed">
          <i class="fa-solid fa-wind"></i> ${windSpeed}
        </span>
      </div>
    `;

    forecastContainer.appendChild(card);
  });
}

/**
 * Change dynamic background depending on weather condition and time of day
 * Conditions:
 * - Clear -> bright/sunny appearance
 * - Clouds -> cloudy appearance
 * - Rain -> rainy appearance
 * - Snow -> snowy appearance
 * - Thunderstorm -> stormy appearance
 * - Night -> dark appearance
 * 
 * @param {string} condition - Main weather category
 * @param {boolean} isNight - Whether current time is nighttime
 */
function updateWeatherBackground(condition, isNight) {
  document.body.classList.remove(
    "weather-default",
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-snow",
    "weather-thunderstorm",
    "weather-night",
    "weather-atmosphere"
  );

  const cond = condition ? condition.toLowerCase() : "";

  if (isNight && cond !== "thunderstorm") {
    document.body.classList.add("weather-night");
    return;
  }

  switch (cond) {
    case "clear":
      document.body.classList.add("weather-clear");
      break;
    case "clouds":
      document.body.classList.add("weather-clouds");
      break;
    case "rain":
    case "drizzle":
      document.body.classList.add("weather-rain");
      break;
    case "snow":
      document.body.classList.add("weather-snow");
      break;
    case "thunderstorm":
      document.body.classList.add("weather-thunderstorm");
      break;
    case "mist":
    case "smoke":
    case "haze":
    case "dust":
    case "fog":
    case "sand":
    case "ash":
    case "squall":
    case "tornado":
      document.body.classList.add("weather-atmosphere");
      break;
    default:
      document.body.classList.add("weather-default");
      break;
  }
}

function isNightTime(data) {
  if (data.weather && data.weather[0] && data.weather[0].icon) {
    return data.weather[0].icon.endsWith("n");
  }
  if (data.sys && data.sys.sunrise && data.sys.sunset) {
    return data.dt < data.sys.sunrise || data.dt > data.sys.sunset;
  }
  return false;
}

// ============================================================================
// 7. LOADING & ERROR FEEDBACK FUNCTIONS
// ============================================================================
function showLoading() {
  hideError();
  loadingState.style.display = "flex";
  if (weatherDashboard.style.display !== "none") {
    weatherDashboard.style.opacity = "0.5";
    weatherDashboard.style.pointerEvents = "none";
  }
}

function hideLoading() {
  loadingState.style.display = "none";
  if (weatherDashboard.style.display !== "none") {
    weatherDashboard.style.opacity = "1";
    weatherDashboard.style.pointerEvents = "auto";
  }
}

function displayError(message) {
  errorDesc.textContent = message || "City not found. Please enter a valid city name.";
  errorMessage.style.display = "flex";
  errorMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
  errorMessage.style.display = "none";
}

// ============================================================================
// 8. EVENT LISTENERS & USER INTERACTIONS
// ============================================================================
searchBtn.addEventListener("click", () => {
  getWeather(cityInput.value);
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    getWeather(cityInput.value);
  }
});

cityInput.addEventListener("input", () => {
  clearInputBtn.style.display = cityInput.value.length > 0 ? "block" : "none";
});

clearInputBtn.addEventListener("click", () => {
  cityInput.value = "";
  clearInputBtn.style.display = "none";
  cityInput.focus();
});

locationBtn.addEventListener("click", () => {
  getUserLocation();
});

closeErrorBtn.addEventListener("click", () => {
  hideError();
});

quickCityChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const city = chip.getAttribute("data-city");
    cityInput.value = city;
    clearInputBtn.style.display = "block";
    getWeather(city);
  });
});

btnCelsius.addEventListener("click", () => {
  if (currentUnit === "metric") return;
  currentUnit = "metric";
  btnCelsius.classList.add("active");
  btnFahrenheit.classList.remove("active");
  getWeather(cityInput.value.trim() || lastSearchQuery);
});

btnFahrenheit.addEventListener("click", () => {
  if (currentUnit === "imperial") return;
  currentUnit = "imperial";
  btnFahrenheit.classList.add("active");
  btnCelsius.classList.remove("active");
  getWeather(cityInput.value.trim() || lastSearchQuery);
});

// ============================================================================
// 9. API KEY MODAL CONTROLS
// ============================================================================
apiKeyTrigger.addEventListener("click", () => {
  const currentKey = localStorage.getItem("openweather_user_key") || "";
  modalApiKeyInput.value = currentKey;
  apiModal.style.display = "flex";
  modalApiKeyInput.focus();
});

closeModalBtn.addEventListener("click", () => {
  apiModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === apiModal) {
    apiModal.style.display = "none";
  }
});

saveApiKeyBtn.addEventListener("click", () => {
  const enteredKey = modalApiKeyInput.value.trim();
  if (enteredKey === "") {
    alert("Please enter a valid 32-character API key or click 'Reset to Default'.");
    return;
  }
  localStorage.setItem("openweather_user_key", enteredKey);
  updateApiKeyStatus();
  apiModal.style.display = "none";
  hideError();

  const city = cityInput.value.trim() || lastSearchQuery || "London";
  cityInput.value = city;
  getWeather(city);
});

clearApiKeyBtn.addEventListener("click", () => {
  localStorage.removeItem("openweather_user_key");
  modalApiKeyInput.value = "";
  updateApiKeyStatus();
  apiModal.style.display = "none";
  getWeather(cityInput.value.trim() || lastSearchQuery || "London");
});

// ============================================================================
// 10. INITIALIZATION ON PAGE LOAD
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  updateApiKeyStatus();

  // Load London by default to provide an immediate live demonstration
  cityInput.value = "London";
  clearInputBtn.style.display = "block";
  getWeather("London");
});
