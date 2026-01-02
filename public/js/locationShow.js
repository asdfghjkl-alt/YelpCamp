maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: "map", // container's id or the HTML element to render the map
    style: "outdoor-v2",
    center: [initLng, initLat], // starting position [lng, lat]
    zoom: 14, // starting zoom
});

const marker = new maptilersdk.Marker()
    .setLngLat([initLng, initLat])
    .addTo(map);
