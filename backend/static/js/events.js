// Initialize map
const coordinate = [12.988754577439247, 80.23507761724024];

const bounds = [
[12.952753, 80.188374], // Southwest corner (lat, lng)
[13.028954, 80.266165]  // Northeast corner (lat, lng)
];

const map = L.map('map', {
maxBounds: bounds,
maxBoundsViscosity: 1.0,
}).setView(coordinate, 16);

let userMovedMap = false;

map.on('dragstart', function() {
userMovedMap = true;
});

map.on('zoomstart', function() {
userMovedMap = true;
});

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
}).addTo(map);

// Load KML layer
const kmlLayer = omnivore.kml('/static/eventsmap.kml')
.on('ready', function() {
    map.fitBounds(kmlLayer.getBounds());
    
    kmlLayer.eachLayer(function(layer) {
    if (layer instanceof L.Marker) {
        const name = layer.feature?.properties?.name || "Unnamed Place";
        const description = layer.feature?.properties?.description || "No description";
        
        layer.setIcon(L.divIcon({
        html: '<i class="fas fa-map-pin" style="color: #ff0000; font-size:25px";></i>',
        className: 'custom-leaflet-icon',
        iconSize: [24, 24], // Adjusted to match FA icon size
        iconAnchor: [12, 12], // Center the icon
        popupAnchor: [0, -12] // Adjust popup position
        }));
        
        // Inside the kmlLayer.eachLayer function where markers are processed
        layer.on('click', function() {
            if (!window.userLatLng) {
                alert("Please enable geolocation and wait for your location to be detected.");
                return;
            }
            
            const origin = `${window.userLatLng[0]},${window.userLatLng[1]}`;
            const destination = `${layer.getLatLng().lat},${layer.getLatLng().lng}`;
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
            
            // Create popup content
            const popupContent = `
                <b>${name}</b><br>
                <p>${description}</p>
                <a href="${googleMapsUrl}" target="_blank" class="btn btn-primary btn-sm mt-2" style="color: #ffffff">
                <i class="fas fa-walking mr-1"></i> Get Walking Directions
                </a>
            `;
            
            // Always unbind any existing popup first to ensure fresh binding
            if (layer.getPopup()) {
                layer.unbindPopup();
            }
            
            // Bind and open a new popup
            layer.bindPopup(popupContent, {
                autoClose: false,
                closeOnClick: false
            }).openPopup();
            
            // Keep tooltip behavior
            layer.on('mouseover', function() {
                this.openTooltip();
            });
            
            layer.on('mouseout', function() {
                this.closeTooltip();
            });
        });
    }
    
    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        layer.setStyle({
        color: '#3388ff',
        weight: 3,
        opacity: 0.7,
        fillOpacity: 0.2
        });
    }
    });
})
.on('error', function(e) {
    console.error("KML Error:", e.error);
    alert("Failed to load map data. Please try again later.");
})
.addTo(map);

// Geolocation
let userLatLng = null;
if ("geolocation" in navigator) {
navigator.geolocation.watchPosition(
    (position) => {
    userLatLng = [position.coords.latitude, position.coords.longitude];
    window.userLatLng = userLatLng;

    const userIcon = L.divIcon({
        html: '<i class="fas fa-male" style="color: #000000; font-size:30px;"></i>',
        className: 'custom-leaflet-icon',
        iconSize: [24, 24], // Adjusted to match FA icon size
        iconAnchor: [12, 12], // Center the icon
        popupAnchor: [0, -12] // Adjust popup position
    });
    
    if (window.userMarker) {
        window.userMarker.setLatLng(userLatLng);
    } else {
        window.userMarker = L.marker(userLatLng, {
            icon: userIcon  // This is what makes it different
        })
        .addTo(map)
        .bindPopup(`
            <div class="text-center">
            <p>You're here!</p>
            </div>
        `, {
            autoClose: false,
            closeOnClick: false,
            closeButton: false
        })
        .openPopup();
    }
    if (!userMovedMap) {
        map.setView(userLatLng, 16);
    }
    },
    (error) => {
    console.error("Geolocation error:", error.message);
    alert("Unable to get your location. Please enable geolocation for directions.");
    },
    {
    enableHighAccuracy: true,
    }
);
}