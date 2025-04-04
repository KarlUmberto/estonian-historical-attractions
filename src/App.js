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
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Phone:</strong> {phone}</p>
      <p><strong>Opening Hours:</strong> {openingHours}</p>
      <p><strong>Website:</strong> <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></p>
      <p><strong>Wheelchair Accessible:</strong> {wheelchairAccessible ? 'Yes' : 'No'}</p>
      <p><strong>Coordinates:</strong> Latitude: {coordinates[1]}, Longitude: {coordinates[0]}</p>
    </div>
  );
};

function App() {

  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("laura");
  useEffect(() =>{
    fetch('/geolocations.json')
    .then((response) => response.json())
    .then((data) =>{
      console.log(data);
      const markerList = data.features.map((item) => {
        const { properties, geometry} = item;
        console.log(item);
        const address = `${properties['addr:street']} ${properties['addr:housenumber']}, ${properties['addr:country']} ${properties['addr:postcode']}`;
        const coordinates = geometry.coordinates[0][0];

        return{ 
          name: properties.name,
          address,
          phone: properties.phone,
          openingHours: properties.opening_hours,
          website: properties.website,
          wheelchairAccessible: properties.wheelchair === 'yes',
          coordinates: [coordinates[1], coordinates[0]],
        };
      });
      setMarkers(markerList);
      setLoading(false);
    })
    .catch((error) => {
      console.log('error', error);
      setLoading(false);
    });
  }, []);





const markers2 = [
{
  geocode: [59.443475262102396, 24.79419282429169],
  name: "Russalka",
  description: "See on Russalkas",
  link: "",
},
{  geocode: [59.443475262102396, 24.79419282429169],
  name: "Russalka2",
  description: "See on Russalkas",
  link: "",}
];


const customIcon = new Icon({
  iconUrl: require("./markerkarl.png"),
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
