// Get the token and campground data from the script tag
mapboxgl.accessToken = document.currentScript.getAttribute("data-token");
const campground = JSON.parse(document.currentScript.getAttribute("data-campground"));

// Create a new map centered on the campground
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
    projection: "globe", // display the map as a 3D globe
});

// Add navigation control to the map
map.addControl(new mapboxgl.NavigationControl());

// Set the default atmosphere style
map.on("style.load", () => map.setFog({}));

// Add the campground marker to the map
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h5 class="card-title">${campground.title}</h5>
            <h6 class="card-subtitle text-muted">${campground.location}</h6>`,
        ),
    )
    .addTo(map);
