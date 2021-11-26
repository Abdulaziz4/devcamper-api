const Gecoder = require("node-geocoder");

const options = {
  provider: process.env.GECODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GECODER_API_KEY,
  formatter: null,
};

const gecoder = Gecoder(options);

module.exports = gecoder;
