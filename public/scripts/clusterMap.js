// Get the token from the script tag
mapboxgl.accessToken = document.currentScript.getAttribute("data-token");

// Create a new map
const map = new mapboxgl.Map({
    container: "cluster-map",
    style: "mapbox://styles/mapbox/light-v10",
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3,
});

// Add navigation control to the map
map.addControl(new mapboxgl.NavigationControl());

// Get the campgrounds from the script tag
const campgrounds = JSON.parse(document.currentScript.getAttribute("data-campgrounds"));

// Add the campgrounds to the map once it has loaded
map.on("load", () => {
    map.addSource("campgrounds", {
        type: "geojson",
        data: { features: campgrounds },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "campgrounds",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#00BCD4",
                10,
                "#2196F3",
                30,
                "#3F51B5",
            ],
            "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
        },
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "campgrounds",
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
        },
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "campgrounds",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#11b4da",
            "circle-radius": 5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
        },
    });

    map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource("campgrounds").getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
        });
    });

    map.on("click", "unclustered-point", function (e) {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup().setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
    });

    map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
    map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-point", () => (map.getCanvas().style.cursor = ""));
});
