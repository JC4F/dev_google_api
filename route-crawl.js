const express = require("express");
const crawlWebsite = require("./crawl");

const app = express();

app.get("/dulich/:province", async (req, res) => {
  const { province } = req.params;
  const result = await crawlWebsite(province);

  res.json(result);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
