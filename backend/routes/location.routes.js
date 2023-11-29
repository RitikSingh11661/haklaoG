const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const axios = require("axios");
const locationRoutes = express.Router();

locationRoutes.use(verifyToken);

locationRoutes.post("/", async (req, res) => {
  console.log('req.body', req.body)
  try {
    let { data } = await axios.get(`https://www.mapquestapi.com/geocoding/v1/reverse?key=cKIIj771aohCH86h9Jjqj7yosswI4FvL&location=21.271869431141372,79.22087386250496&includeRoadMetadata=true&includeNearestIntersection=true`);
    const { adminArea3: state, adminArea1: country } = data?.results?.[0]?.locations[0];
    const { data: data2 } = await axios.get(`https://www.mapquestapi.com/geocoding/v1/address?key=cKIIj771aohCH86h9Jjqj7yosswI4FvL&location=${state},${country}`);
    const latLng = data2?.results?.[0]?.locations[0]?.latLng;
    const locationObj = { latitude: latLng?.lat, longitude: latLng?.lng };
    res.status(200).send({ data: locationObj, status: "success" });
  } catch (e) {
    res.status(400).send({ msg: e.message })
  }
})

module.exports = { locationRoutes };