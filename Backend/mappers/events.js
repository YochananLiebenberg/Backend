const config = require("config");

const mapper = (event) => {
  const baseUrl = config.get("assetsBaseUrl");
  const mapImage = (image) => ({
    url: `${baseUrl}${image.fileName}_full.jpg`,
    thumbnailUrl: `${baseUrl}${image.fileName}_thumb.jpg`,
  });

  return {
    ...event,
    images: event.images.map(mapImage),
  };
};

module.exports = mapper;
