import './App.css';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap } from 'react-leaflet/hooks'
import "leaflet/dist/leaflet.css";


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div id="box">
      <MapContainer center={[58.2667, 25.5844]} zoom={13} scrollWheelZoom={false} style={{ height: "50%", width: "50%" }}>
      <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
</MapContainer>
</div>
      </header>
    </div>
  );
}

export default App;
