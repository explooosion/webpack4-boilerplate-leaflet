import './scss/main.scss';

import L from 'leaflet';
import LeafletMap from './lib/leaflet-map';
import LayersData from './database/LayersData';

const zoom = 15;
const lat = 24.150454187636008;
const lng = 120.68294763565065;
const points = [
    [24.1524414988713, 120.68220734596254],
    [24.14929898759014, 120.68087697029115],
    [24.148349366172614, 120.68336606025697],
    [24.151501690513733, 120.68475008010866],
];

const leafletMap = new LeafletMap();

window.onload = () => {
    leafletMap.init(lat, lng, zoom, false);
    leafletMap.addCircle(lat, lng, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 100,
    });
    leafletMap.addPolygon(points, {
        color: 'blue',
        fillColor: '#33f',
        fillOpacity: 0.2,
    });

    const URL = './assets/gwjs_3.json';
    fetch(URL).then(response => response.json())
        .then(({ retVal }) => {
            Object.keys(retVal).forEach((key, index) => {
                const { lat, lng, ar, sna, sarea } = retVal[key];

                // Custom Marker
                // eslint-disable-next-line no-unused-vars
                const icon = {
                    icon: L.icon({
                        iconUrl: './assets/bike.png',
                        iconSize: [70, 70], // size of the icon
                        // shadowSize: [50, 64], // size of the shadow
                        iconAnchor: [30, 10], // point of the icon which will correspond to marker's location
                        // shadowAnchor: [4, 62],  // the same for the shadow
                        // popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                    })
                };

                const popup = `
                <div class="popup">
                    <span class="title">站名：${sna}</span>
                    <span class="area">地區：${sarea}</span>
                    <span class="addr">地址：${ar}</span>
                </div> 
                `;
                if (index > -1) leafletMap.addMarker(Number(lat), Number(lng), {}, popup);
            });
        }).catch(err => console.log(err));


    // Styles
    // mapbox://styles/mapbox/streets-v10
    // mapbox://styles/mapbox/outdoors-v10
    // mapbox://styles/mapbox/light-v9
    // mapbox://styles/mapbox/dark-v9
    // mapbox://styles/mapbox/satellite-v9
    // mapbox://styles/mapbox/satellite-streets-v10
    // mapbox://styles/mapbox/navigation-preview-day-v4
    // mapbox://styles/mapbox/navigation-preview-night-v4
    // mapbox://styles/mapbox/navigation-guidance-day-v4
    // mapbox://styles/mapbox/navigation-guidance-night-v4

    const maps = [];
    document.querySelectorAll('.tree input[type=checkbox]').forEach(node => {
        let layer = null;
        let id = node.value;
        let status = node.checked;
        if (status) layer = AddLayer(node.name, id);

        maps.push({ id, status, layer });

        node.addEventListener('click', e => {
            const map = maps.find(map => map.id === e.target.value);
            if (e.target.checked) {
                const { id } = map;
                map.layer = AddLayer(node.name, id);
            } else {
                leafletMap.removeTileLayer(map.layer);
            }
        });
    });
};

/**
 * Add Map Layer
 * @param {string} mapType Element Name
 * @param {string} id Map Styles
 */
function AddLayer(group, id) {
    const accessToken = 'pk.eyJ1IjoidGE3MzgyIiwiYSI6ImNqb2NvMXc0cjAwMWUza2tjZ2ducjlld2oifQ.CNYQV63IvyS-wzL7cNS0Pg';
    const { url, option } = LayersData.find(layer => layer.id === id);
    switch (group) {
        case 'googlemap':
            return leafletMap.addGoogleMapLayer(option);
        case 'openstreet':
            return leafletMap.addOpenStreetLayer(url, option);
        case 'mapbox':
            return leafletMap.addMapBoxLayer(`${url}?access_token=${accessToken}`, option);
        case 'stamen':
        case 'wmts':
            return leafletMap.addTileLayer(url, option);
        case 'wms':
            return leafletMap.addWMSLayer(url, option);
        default:
            return null;
    }
}