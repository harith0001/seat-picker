import React, { useState } from 'react';
import { SeatPicker } from 'seat-picker';
import 'seat-picker/dist/index.css';

const SeatPickerExample = () => {
  const [currentLayout, setCurrentLayout] = useState(null);

  const handleChange = (layout) => {
    console.log('Layout updated:', layout);
  };

  const handleSave = (layout) => {
    console.log('Saving layout:', layout);
    alert('Output layout saved to console!');
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Seat Picker Component</h1>
      <SeatPicker
        onChange={(layout) => {
          handleChange(layout);
          setCurrentLayout(layout);
        }}
        onSave={(layout) => {
          handleSave(layout);
          setCurrentLayout(layout);
        }}
        style={{
          width: 800,
          height: 600,
          backgroundColor: '#f8fafc',
          showSeatNumbers: true,
          seatNumberStyle: {
            fontSize: 14,
            fill: '#222',
            fontWeight: 'bold',
          },
          seatStyle: {
            fill: 'transparent',
            stroke: 'black',
            strokeWidth: 1,
            radius: 10,
          },
        }}
        labels={{
          buyButton: 'Buy Seat',
          cancelButton: 'Cancel',
          seatNumber: 'Seat Number',
          category: 'Category',
          price: 'Price',
          status: 'Status',
        }}
      />
      {currentLayout && (
        <pre style={{ marginTop: '20px', background: '#ccc', padding: '10px', width: '800px', overflowX: 'auto' }}>
          {JSON.stringify(currentLayout, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default SeatPickerExample;
