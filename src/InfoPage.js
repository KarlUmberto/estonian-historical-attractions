// src/InfoPage.js

import React from 'react';
import { useParams } from 'react-router-dom';

const InfoPage = () => {
  const { name, info } = useParams();
  const decodedName = decodeURIComponent(name);
  const decodedInfo = decodeURIComponent(info);

  return (
    <div style={{ padding: '20px' }}>
      <h1>{decodeURIComponent(name)}</h1>
      <p>{decodeURIComponent(info)}</p>
      <h2>Mängud</h2>
      <ul>
        <li><a href="#">Viktoriin</a></li>
        <li><a href="#">Ristsõna</a></li>
        <li><a href="#">Emakeele mäng</a></li>
      </ul>
    </div>
  );
};

export default InfoPage;
