const axios = require("axios");

async function getCoordinates(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    const response = await axios.get(url);
    const result = response.data[0];

    if (result) {
      const { lat, lon } = result;
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// Sử dụng hàm getCoordinates để tìm tọa độ của một địa điểm
// getCoordinates('New York, USA')
//   .then(coordinates => {
//     console.log('Coordinates:', coordinates);
//   })
//   .catch(error => {
//     console.error('Error:', error.message);
//   });

module.exports = { getCoordinates };
