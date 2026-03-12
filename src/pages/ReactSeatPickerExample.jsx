import React, { useState } from 'react';
import SeatPicker from 'react-seat-picker';

const ReactSeatPickerExample = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  const rows = [
    [
      { id: 1, number: 1, isReserved: true, tooltip: 'Reserved by Alice' },
      { id: 2, number: 2, tooltip: 'Cost: $15' },
      null,
      { id: 3, number: 3, isReserved: true, tooltip: 'Reserved by Bob' },
      { id: 4, number: 4, tooltip: 'Cost: $15' }
    ],
    [
      { id: 5, number: 1, tooltip: 'Cost: $15' },
      { id: 6, number: 2, tooltip: 'Cost: $15' },
      null,
      { id: 7, number: 3, tooltip: 'Cost: $15' },
      { id: 8, number: 4, tooltip: 'Cost: $15' }
    ],
    [
      { id: 9, number: 1, tooltip: 'Cost: $15' },
      { id: 10, number: 2, tooltip: 'Cost: $15' },
      null,
      { id: 11, number: 3, tooltip: 'Cost: $15' },
      { id: 12, number: 4, tooltip: 'Cost: $15' }
    ],
    [
      { id: 13, number: 1, tooltip: 'Cost: $15' },
      { id: 14, number: 2, tooltip: 'Cost: $15' },
      null,
      { id: 15, number: 3, tooltip: 'Cost: $15' },
      { id: 16, number: 4, tooltip: 'Cost: $15' }
    ]
  ];

  const addSeatCallback = ({ row, number, id }, addCb) => {
    setLoading(true);
    setTimeout(() => {
      console.log(`Added seat ${number}, row ${row}, id ${id}`);
      setSelectedSeats((prev) => [...prev, id]);
      addCb(row, number, id, null);
      setLoading(false);
    }, 1000); // Simulate API call
  };

  const removeSeatCallback = ({ row, number, id }, removeCb) => {
    setLoading(true);
    setTimeout(() => {
      console.log(`Removed seat ${number}, row ${row}, id ${id}`);
      setSelectedSeats((prev) => prev.filter((seatId) => seatId !== id));
      removeCb(row, number);
      setLoading(false);
    }, 1000); // Simulate API call
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>React Seat Picker Demo</h1>
      <SeatPicker
        addSeatCallback={addSeatCallback}
        removeSeatCallback={removeSeatCallback}
        rows={rows}
        maxReservableSeats={3}
        alpha
        visible
        selectedByDefault
        loading={loading}
        tooltipProps={{ multiline: true }}
      />
      <div style={{ marginTop: '2rem' }}>
        <h3>Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</h3>
      </div>
    </div>
  );
};

export default ReactSeatPickerExample;
