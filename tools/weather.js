import fetch from "node-fetch";

export async function getWeather({ city }) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  if (!geoData.results || !geoData.results.length)
    return { city, temperature: "N/A", condition: "Unknown" };

  const { latitude, longitude } = geoData.results[0];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const res = await fetch(url);
  const data = await res.json();

  return {
    city,
    temperature: `${data.current_weather.temperature}°C`,
    condition:
      data.current_weather.weathercode === 0
        ? "Clear sky"
        : "Cloudy / variable",
  };
}
