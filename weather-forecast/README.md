# Weather Forecast Application using Fetch API

A modern, responsive, and beginner-friendly weather forecasting web application built using **HTML5**, **CSS3**, and **Vanilla JavaScript** utilizing the modern **Fetch API**.

---

## 📁 Project Structure

```text
weather-forecast/
│
├── index.html       # Semantic HTML5 markup, glassmorphism dashboard layout
├── style.css        # Modern CSS3 styling, glassmorphism, animations, responsive design
├── script.js        # Vanilla JS, Fetch API integration, DOM manipulation
├── README.md        # Documentation, API setup guide, and viva preparation
└── run.bat          # 1-Click launcher to open the application in your browser
```

---

## 🚀 Key Features

1. **Search by City Name**:
   - Live query without page reload using `fetch()`.
   - Supports keyboard `Enter` and button click.
   - Quick-select chips for popular global cities (London, Tokyo, New York, etc.).

2. **Real-Time Current Weather**:
   - City name and country badge.
   - Live local formatted date and time.
   - Large temperature display with interactive **°C / °F unit toggle**.
   - Official weather icon and detailed weather condition description.
   - 5 essential meteorological metrics:
     - **Feels-Like** temperature
     - **Humidity** (%)
     - **Wind Speed** (m/s and km/h or mph)
     - **Atmospheric Pressure** (hPa)
     - **Visibility** (km or miles)

3. **5-Day Weather Forecast**:
   - Clean, representative daily weather forecasts grouped by date.
   - Formatted day and date (e.g., `Thu, Oct 23`).
   - Forecast weather icon, temperature, condition, humidity, and wind speed.
   - Responsive horizontal 5-card layout on desktop, transforming gracefully on tablets and mobile screens.

4. **Dynamic Weather Backgrounds**:
   - Automatically adapts background gradients and atmospheric theme based on current weather condition:
     - ☀️ **Clear / Sunny**: Warm azure sky and golden amber gradient.
     - ☁️ **Clouds**: Cool slate and overcast silver-grey gradient.
     - 🌧️ **Rain / Drizzle**: Moody deep blue and atmospheric rainy gradient.
     - ❄️ **Snow**: Frosty arctic cyan and pale ice gradient.
     - ⚡ **Thunderstorm**: Electric violet, dark indigo, and deep purple gradient.
     - 🌙 **Night**: Deep midnight navy and cosmic starry gradient.

5. **Browser Geolocation ("Use My Location")**:
   - One-click GPS location detection using `navigator.geolocation.getCurrentPosition()`.
   - Reverse coordinates query via OpenWeatherMap coordinates endpoint (`lat` and `lon`).

6. **Clean Loading & Friendly Error Handling**:
   - Animated spinner with `"Fetching weather data..."` during asynchronous requests.
   - Clear, user-friendly error messages when a city is not found or when network connectivity drops.

---

## 🔑 How to Get and Configure an OpenWeatherMap API Key

This project connects to **OpenWeatherMap** (the global standard for open meteorological data).

### Step 1: Sign up for a free OpenWeatherMap account
1. Visit [https://openweathermap.org/](https://openweathermap.org/).
2. Click **Sign In** &rarr; **Create an Account**.
3. Fill in your email and password. Confirm your email address via the verification link sent to your inbox.

### Step 2: Copy your API Key
1. Once logged in, click your username in the top right corner and select **My API Keys**.
2. You will find a 32-character hexadecimal key (e.g., `d1a2b3c4e5f6...`).
3. Copy this key.

> **Note on Activation**: Newly generated OpenWeatherMap keys typically take **10 to 60 minutes** to activate on their global CDN servers.

### Step 3: Insert your API Key
You can add your API key in **either of two convenient ways**:

- **Method A (Direct in Code)**:
  Open `script.js` and paste your key on line 18:
  ```javascript
  const DEFAULT_API_KEY = "your_actual_32_character_api_key_here";
  ```

- **Method B (Directly in the Web UI)**:
  1. Open `index.html` in your browser.
  2. Click the **"API Key"** button in the top-right navigation bar.
  3. Paste your key and click **"Save Key"**.
  4. It is safely stored in your browser's `localStorage` and will persist across reloads!

---

## 💻 How to Run the Project

### Option 1: Double-Click (Zero Setup)
Simply double-click `run.bat` or double-click `index.html` to open it directly in Chrome, Edge, Firefox, or Safari.

### Option 2: VS Code Live Server
1. Open the `weather-forecast` folder in VS Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` and select **"Open with Live Server"**.

### Option 3: Python Local Web Server
Open a terminal in the `weather-forecast` directory and run:
```bash
python -m http.server 3000
```
Then visit: `http://localhost:3000`

---

## 🎓 Viva & Technical Interview Guide

### 1. What is the Fetch API and why is it preferred over XMLHttpRequest?
**Answer**:
The **Fetch API** is a modern, native browser JavaScript interface for making asynchronous HTTP network requests.
- Unlike the older `XMLHttpRequest` (which relied on complex event callbacks), Fetch is built on JavaScript **Promises**.
- It provides cleaner syntax, better chaining with `.then()` and `.catch()`, easier error propagation, and native support for modern features like `async/await` and Streams.

### 2. How does the Fetch API handle HTTP error status codes (like 404 or 500)?
**Answer**:
A very common interview trap: `fetch()` **does not reject** a Promise on HTTP error status codes like 404 (Not Found) or 500 (Internal Server Error). It only rejects on actual network failures (e.g., DNS failure, offline network).
To properly handle HTTP errors, we inspect the boolean property `response.ok`:
```javascript
fetch(url)
  .then(response => {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found.");
      }
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  })
```

### 3. What does `response.json()` do?
**Answer**:
`response.json()` reads the response stream to completion and parses the response body as JSON. Since reading the incoming data stream over the network is an asynchronous operation, `response.json()` returns a **Promise** that resolves to the parsed JavaScript object.

### 4. How did you process the 5-day forecast from 40 raw data points?
**Answer**:
OpenWeatherMap’s free 5-day forecast API returns data in **3-hour intervals** (8 records per day $\times$ 5 days = 40 records).
To present a clean, daily forecast:
1. In `script.js`, we group the entries by calendar date (`entry.dt_txt.split(' ')[0]`).
2. For each unique date, we select the entry closest to **12:00:00 (midday)**.
3. This guarantees exactly 5 distinct cards representing the daytime conditions for each upcoming day.

### 5. How does the dynamic background work?
**Answer**:
When the API returns weather data, `script.js` extracts the primary condition string (`data.weather[0].main`) and checks whether it is day or night using the weather icon code suffix (`'d'` vs `'n'`) or sunrise/sunset timestamps (`data.sys.sunrise`, `data.sys.sunset`).
The function `updateWeatherBackground()` then dynamically toggles CSS theme classes (e.g., `.weather-clear`, `.weather-rain`, `.weather-clouds`, `.weather-night`) on `document.body`. CSS transitions smoothly animate the background gradient.

### 6. What is Glassmorphism and how is it implemented?
**Answer**:
Glassmorphism is a modern UI design trend that simulates translucent, frosted glass. It is achieved in CSS using:
1. Semi-transparent background: `background: rgba(255, 255, 255, 0.14)`
2. Background blur: `backdrop-filter: blur(18px)` and `-webkit-backdrop-filter: blur(18px)`
3. Translucent highlight border: `border: 1px solid rgba(255, 255, 255, 0.22)`
4. Soft ambient drop shadow: `box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25)`
