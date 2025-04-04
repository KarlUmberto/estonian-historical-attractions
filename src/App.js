import './App.css';
import { MapContainer, Marker } from 'react-leaflet'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Icon } from 'leaflet';
import { Popup } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";


function App() {

const markers = [
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

{markers.map((marker) => (
  <Marker position={marker.geocode} icon={customIcon}>
  <Popup>{marker.popUp}</Popup>
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
