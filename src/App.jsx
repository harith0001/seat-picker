import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ReactSeatPickerExample from './pages/ReactSeatPickerExample';
import SeatPickerExample from './pages/SeatPickerExample';
import ReactSvgSeatmapExample from './pages/ReactSvgSeatmapExample';
import './App.css';

function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', backgroundColor: '#333', color: '#fff', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {/* <Link to="/react-seat-picker" style={{ color: '#fff', textDecoration: 'none' }}>
          react-seat-picker (Old)
        </Link>
        <Link to="/seat-picker" style={{ color: '#fff', textDecoration: 'none' }}>
          seat-picker (New)
        </Link> */}
        <Link to="/react-svg-seatmap" style={{ color: '#fff', textDecoration: 'none' }}>
          react-svg-seatmap (Upload)
        </Link>
      </nav>
      
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/react-svg-seatmap" />} />
          {/* <Route path="/react-seat-picker" element={<ReactSeatPickerExample />} />
          <Route path="/seat-picker" element={<SeatPickerExample />} /> */}
          <Route path="/react-svg-seatmap" element={<ReactSvgSeatmapExample />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
