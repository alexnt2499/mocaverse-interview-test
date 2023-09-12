const axios = require("axios");

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_API_KEY_SECRET;

async function pinFileToIPFS(metadata) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const metadataJson = JSON.stringify(metadata);

  const response = await axios.post(url, metadataJson, {
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    },
  });
  return response.data.IpfsHash;
}

module.exports = pinFileToIPFS;
