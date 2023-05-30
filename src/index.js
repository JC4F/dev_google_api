const express = require("express");
const { handleCrawl } = require("./crawl");
const { handleSearchPlace } = require("./place-api");
const { handleGetAllProvincebyCountryCode } = require("./country-province");

const app = express();

app.get("/travel-crawl/:place", handleCrawl);
app.get("/travel-place-api/:place", handleSearchPlace);
app.get("/countries/:countryCode", handleGetAllProvincebyCountryCode);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
