import './App.css';
import { MapContainer, Marker } from 'react-leaflet'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Icon } from 'leaflet';
import { Popup } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import { useState, useEffect} from 'react';

const MarkerInfo = ({ marker}) => {
  const { name, address, phone, openingHours, website, wheelchairAccessible, coordinates} = marker;

  
  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h2>{name}</h2>
      <p><strong>Aadress:</strong> {address}</p>
      <p><strong>Telefon:</strong> {phone}</p>
      <p><strong>Avamisajad:</strong> {openingHours}</p>
      <p><strong>Veebileht:</strong> <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></p>
      <p><strong>Koordinaadid:</strong> Latitude: {coordinates[1]}, Longitude: {coordinates[0]}</p>
    </div>
  );
};

function App() {

  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
    fetch('/data/geolocations.json')
    .then((response) => { 
    return  response.json()})
    .then((data) =>{
        const markerList = data.features.map((item) => {
        const { properties, geometry} = item;
        let coordinates;
        if (geometry && geometry.type === "Polygon") {
        coordinates = geometry.coordinates?.[0]?.[0];
      } else if ( geometry && geometry.type === "Point"){
        coordinates = geometry.coordinates;
      }

        return{ 
          name: properties.name,
          phone: properties.phone,
          openingHours: properties.opening_hours,
          website: properties.website,
          coordinates: [coordinates[1], coordinates[0]],
        };
      }); 
      const validMarkerList = markerList.filter(marker => marker.coordinates !== null);

      setMarkers(validMarkerList);
      setLoading(false);
    })
    .catch((error) => {
      console.log('error', error);
      setLoading(false);
    });
  }, []); 



const customIcon = new Icon({
  iconUrl: require("./marker.png"),
  iconSize: [38,38]
})



  return (
    <div className="App">
      <header className="App-header">
        <div id="box">
      <MapContainer center={[59.443475262102396, 24.79419282429169]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <MarkerClusterGroup>
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.coordinates} icon={customIcon}>
          <Popup>
            <MarkerInfo marker={marker} />
          </Popup>
        </Marker>
        ))}
    </MarkerClusterGroup>
  </MapContainer>
</div>
      </header>
    </div>
  );
}



export default App;
