maptilersdk.config.apiKey = maptilerApiKey;

const initLat = parseFloat(document.getElementById("lat").value);
const initLng = parseFloat(document.getElementById("lng").value);

const map = new maptilersdk.Map({
    container: "map", // container's id or the HTML element to render the map
    style: "outdoor-v2",
    center: [initLng, initLat], // starting position [lng, lat]
    zoom: 14, // starting zoom
});

const gc = new maptilersdkMaptilerGeocoder.GeocodingControl({ marker: false });

map.addControl(gc, "top-left");

// 2. Add a Draggable Marker
const marker = new maptilersdk.Marker({
    draggable: true, // <--- This is the key setting
})
    .setLngLat([initLng, initLat]) // Set this to match the map center
    .addTo(map);

// A. When a user SEARCHES a location:
gc.on("pick", async function (e) {
    // 1. Get the result coordinates
    if (!e.feature) {
        return;
    }
    const searchCoords = e.feature.center;

    // 2. Move the marker to the searched location
    marker.setLngLat(searchCoords);

    await updateLocation();
});

// B. When a user DRAGS the marker:
marker.on("dragend", updateLocation);
map.on("click", async (e) => {
    // 1. Get the coordinates of the click
    const { lng, lat } = e.lngLat;

    // 2. Move the existing marker to the clicked spot
    marker.setLngLat([lng, lat]);

    // 3. Update the form and search bar (Reuse your existing logic)
    await updateLocation([lng, lat]);
});

updateLocation();

async function updateLocation() {
    // 1. Get new coordinates
    const lngLat = marker.getLngLat();

    // 2. Reverse Geocode (Get name from coords)
    const response = await fetch(
        `https://api.maptiler.com/geocoding/${lngLat.lng},${lngLat.lat}.json?key=${maptilerApiKey}`,
    );
    const data = await response.json();

    if (data.features.length > 0) {
        const placeName = data.features[0].place_name;

        // 3. Update the HTML form input
        document.getElementById("location").value = placeName;

        // 4. Update the Geocoder search box text to match (Visual sync)
        // This makes the search bar show the new address
        const geocoderInput = document.querySelector(
            ".mapboxgl-ctrl-geocoder--input",
        );
        if (geocoderInput) geocoderInput.value = placeName;

        document.getElementById("lat").value = lngLat.lat;
        document.getElementById("lng").value = lngLat.lng;
    } else {
        // 3. Update the HTML form input
        document.getElementById("location").value = "No name found!";
        document.getElementById("lat").value = lngLat.lat;
        document.getElementById("lng").value = lngLat.lng;
    }
}
