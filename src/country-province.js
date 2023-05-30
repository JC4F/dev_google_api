const countries = require("node-countries");

const handleGetAllProvincebyCountryCode = (req, res) => {
  const { countryCode } = req.params;
  const provinces = countries.default[countryCode].provinces.map((x) => x.name);

  res.json({ provinces, length: provinces.length });
};

module.exports = { handleGetAllProvincebyCountryCode };
