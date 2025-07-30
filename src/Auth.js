import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './components/UserContext'
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Paroolid ei kattu');
      return;
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const bodyData = {
        email: formData.email,
        password: formData.password,
      };
      if (!isLogin) {
        bodyData.name = formData.name;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);    
        onLogin(data.user);
        navigate('/kaart');
      } else {
        setError(data.message || 'Registreerimine ebaõnnestus');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Logi sisse' : 'Registreeri'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Nimi:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={!isLogin}
            />
          </div>
        )}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Parool:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {!isLogin && (
          <div className="form-group">
            <label>Kinnita parool:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <button type="submit" className="auth-button">
          {isLogin ? 'Logi sisse' : 'Registreeri'}
        </button>
      </form>
      <button
        className="toggle-auth"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Pole kontot? Registreeri!' : 'Oled juba kasutaja? Logi sisse!'}
      </button>
    </div>
  );
};

export default Auth;
