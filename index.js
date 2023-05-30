require("dotenv").config();
const express = require("express");
const axios = require("axios");
const countries = require("node-countries");

const app = express();
const apiKey = process.env.GOOGLE_API_KEY;
const searchQuery = "tourist attractions in Nghe An";
const resultsPerPage = 20; // Số lượng kết quả trả về trên mỗi trang

app.get("/dulich", async (req, res) => {
  try {
    let allResults = [];

    let nextPageToken = "";
    do {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/textsearch/json",
        {
          params: {
            key: apiKey,
            query: searchQuery,
            pagetoken: nextPageToken,
          },
        }
      );

      const results = response.data.results;
      allResults = [...allResults, ...results];
      nextPageToken = response.data.next_page_token;

      // Delay a short period before requesting the next page (as per API guidelines)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } while (nextPageToken);

    const resultsWithImages = await Promise.all(
      allResults.map(async (result) => {
        const placeImages = await getPlacePhotos(result.place_id);
        const representImage = result.photos
          ? result.photos.length > 0
            ? getPhotoUrl(result.photos[0].photo_reference)
            : null
          : null;
        const relatedImages = placeImages
          ? placeImages.map((photo) => getPhotoUrl(photo.photo_reference))
          : null;
        return { ...result, representImage, relatedImages };
      })
    );

    const resultsWithIconUrls = resultsWithImages.map((result) => ({
      ...result,
    }));

    console.log(resultsWithIconUrls.length);

    res.json(resultsWithIconUrls);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Route để lấy danh sách tỉnh thành của quốc gia dựa trên mã quốc gia
app.get("/countries/:countryCode", (req, res) => {
  const { countryCode } = req.params;
  const provinces = countries.default[countryCode].provinces.map((x) => x.name);

  res.json({ provinces, length: provinces.length });
});

async function getPlacePhotos(placeId) {
  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/place/details/json",
    {
      params: {
        key: apiKey,
        place_id: placeId,
        fields: "photos",
      },
    }
  );

  const photos = response.data.result.photos;
  return photos;
}

function getPhotoUrl(photoReference) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${apiKey}`;
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
