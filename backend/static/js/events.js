// Initialize map
const coordinate = [12.988754577439247, 80.23507761724024];

const bounds = [
    [12.952753, 80.188374],
    [13.028954, 80.266165]
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
            
            // Improved icon implementation
            const markerIcon = L.divIcon({
                html: `
                    <div style="
                        position: relative;
                        width: 24px;
                        height: 24px;
                        color: #ff0000;
                        font-size: 24px;
                        text-align: center;
                        line-height: 24px;
                    ">
                        <i class="fas fa-map-pin" style="color: #ff0000; font-size:25px";></i>
                    </div>
                `,
                className: '', // Empty to prevent Leaflet interference
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -24]
            });
            
            layer.setIcon(markerIcon);
            
            layer.bindTooltip(name, { 
                permanent: true, 
                direction: 'top',
                className: 'kml-label',
                offset: [0, -20]
            }).openTooltip();
            
            // Create popup content without the URL initially
            layer.bindPopup(`
                <b>${name}</b><br>
                <a href="#" class="btn btn-primary btn-sm mt-2" style="color: #ffffff" id="directionBtn" data-location="${name}">
                    <i class="fas fa-walking mr-1"></i> Get Walking Directions
                </a>
            `, {
                maxWidth: 300,
                minWidth: 200
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

    // Close popup when clicking on the map
    map.on('click', function() {
        map.closePopup();
    });
    
    // Use event delegation for direction buttons
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'directionBtn') {
            e.preventDefault();
            const locationName = e.target.dataset.location;
            
            // Find the layer with this location name
            kmlLayer.eachLayer(layer => {
                if (layer.feature?.properties?.name === locationName) {
                    const destination = `${layer.getLatLng().lat},${layer.getLatLng().lng}`;
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
                    window.open(googleMapsUrl);
                }
            });
        }
    });
})
.on('error', function(e) {
    console.error("KML Error:", e.error);
    alert("Failed to load map data. Please try again later.");
})
.addTo(map);

document.querySelectorAll('.event-item').forEach(item => {
    item.addEventListener('click', function() {
        const locationName = this.dataset.location;
        
        kmlLayer.eachLayer(layer => {
            if (layer.feature?.properties?.name === locationName) {
                map.setView(layer.getLatLng(), 16);
                layer.openPopup();
            }
        });
    });
});