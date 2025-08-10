import './App.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Icon } from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';
import InfoPage from './InfoPage';
import Auth from './Auth';
import UserContext from './components/UserContext'
import PrivateRoute from './components/PrivateRoute';

const MarkerInfo = ({ marker }) => {
  const { name, info, address, phone, openingHours, website, coordinates } = marker;

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h2>{name}</h2>
      <p><strong>Aadress:</strong> {address}</p>
      <p><strong>Telefon:</strong> {phone}</p>
      <p><strong>Avamisajad:</strong> {openingHours}</p>
      <p><strong>Veebileht:</strong> <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></p>
      <p><strong>Koordinaadid:</strong> Laiuskraad: {coordinates[1]}, Pikkuskraad: {coordinates[0]}</p>
      <Link to={`/info/${encodeURIComponent(name)}/${encodeURIComponent(info)}`}>Vaata rohkem ja mängi mänge →</Link>
    </div>
  );
};

const LogoutButton = ({ onLogout, user }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onLogout();        
    navigate("/");     
  };

  return (
    <button 
      onClick={handleClick}
      style={{
        color: 'white',
        textDecoration: 'none',
        padding: '8px 15px',
        borderRadius: '4px',
        backgroundColor: '#3498db',
        transition: 'background-color 0.3s'
      }}
    >
      Logi välja {user?.name}
    </button>
  );
};

function App() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); 

  const handleLogin = (userData) => setUser(userData);  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!user;

  useEffect(() => {
    fetch('/data/geolocations.json')
      .then((response) => response.json())
      .then((data) => {
        const markerList = data.features.map((item) => {
          const { properties, geometry } = item;
          let coordinates;

          if (geometry && geometry.type === "Polygon") {
            coordinates = geometry.coordinates?.[0]?.[0];
          } else if (geometry && geometry.type === "Point") {
            coordinates = geometry.coordinates;
          }
          return {
            name: properties.name,
            info: properties.info,
            address: properties.address,
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
    iconSize: [38, 38]
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <nav style={{
          backgroundColor: '#2c3e50',
          padding: '15px 30px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}>
          <Link 
            to="/kaart" 
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              transition: 'background-color 0.3s'
            }}
          >
            Eesti Ajaloolised Vaatamisväärsused
          </Link>

          {user && (<p>{user.name}, {user.role}</p>)}
          {!isLoggedIn ? 
          <Link 
            to="/" 
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              backgroundColor: '#3498db',
              transition: 'background-color 0.3s'
            }}
          >
            Logi sisse
          </Link>
          :
          <LogoutButton onLogout={handleLogout} />
          }
        </nav>

        <Routes>
          <Route path="/kaart" element={
            <PrivateRoute allowedRoles={["õpilane","õpetaja"]}>
            <div className="App">
              <header className="App-header" style={{ marginTop: '60px' }}>
                <div id="box">
                  <MapContainer 
                    center={[59.443475262102396, 24.79419282429169]} 
                    zoom={13} 
                    scrollWheelZoom={true} 
                    style={{ height: "calc(100vh - 60px)", width: "100%" }}
                  >
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
            </PrivateRoute>
          } />
          <Route path="/info/:name/:info" element={
            <PrivateRoute allowedRoles={["õpilane","õpetaja"]}>
              <InfoPage />
            </PrivateRoute>
            } />
          <Route path="/" element={<Auth onLogin={handleLogin} />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
