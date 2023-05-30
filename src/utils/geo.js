const Geocoder = require("node-geocoder");

const searchCoordinates = async function (place) {
  const options = {
    provider: "openstreetmap", // Có thể sử dụng 'google', 'mapquest', 'bing' và nhiều provider khác
  };
  const geocoder = Geocoder(options);

  try {
    const response = await geocoder.geocode({
      address: place,
      country: "Vietnam",
    });

    if (response.length > 0) {
      // const location = response[0].latitude + ", " + response[0].longitude;
      // console.log(`Coordinates for ${place}: ${location}`);
      return response[0];
    } else {
      console.log(`No results found for ${place}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Sử dụng hàm searchCoordinates để tìm kiếm tọa độ của địa điểm
// searchCoordinates("San Francisco");

module.exports = { searchCoordinates };
