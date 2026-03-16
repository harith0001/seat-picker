import React, { useState } from 'react';
import { SeatmapInput } from 'react-svg-seatmap';
import 'react-svg-seatmap/style.css';

function ReactSvgSeatmapExample() {

  const [svgUrl, setSvgUrl] = useState('');
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [blockedSeats, setBlockedSeats] = useState([]); // user managed blocked seats
  const [seatSelector, setSeatSelector] = useState('circle[id], path[id], ellipse[id]');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        
        // Parse the SVG to extract probable seats
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        // Let's find all elements that have an ID and might be seats
        const elements = doc.querySelectorAll(seatSelector);
        
        const generatedSeats = [];
        let idCounter = 1;
        elements.forEach((el) => {
          const idStr = el.getAttribute('id');
          if (idStr && idStr !== 'svg' && idStr !== 'layer1' && idStr !== 'layer2') {
            generatedSeats.push({
              id: idCounter, // numeric ID required by component?
              originalId: idStr, // keeping original for reference
              cssSelector: `#${idStr}`, // using CSS selector
              displayGroup: 'General',
            });
            idCounter++;
          }
        });
        
        // Create an Object URL for the SeatmapInput
        // It might expect a URL instead of raw string.
        const blob = new Blob([text], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        setSvgUrl(url);
        console.log("generated seats:", generatedSeats)
        setSeats(generatedSeats);
        setSelectedSeats([]);
        setBlockedSeats([4,17]);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  const handleSeatChange = (newSelectedSeats) => {
    console.log("newSelectedSeats: ", newSelectedSeats)
    // Filter out blocked seats
    const validSelection = newSelectedSeats.filter(id => !blockedSeats.includes(id));
    setSelectedSeats(validSelection);
  };

  const toggleBlockedStatus = (seatId) => {
    setBlockedSeats(prev => 
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
    );
    // Also remove from selected if blocked
    if (!blockedSeats.includes(seatId) && selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    }
  };

  // The SeatmapInput component uses CSS selectors.
  // We want to pass the seats to the component.
  // We can filter out visually what's blocked or just handle click logic.
  // The react-svg-seatmap component doesn't seem to have a disabled state directly from the type
  // so we will just ignore clicks on blocked seats. In CSS we can define it?
  
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1>React Svg Seatmap Upload Example</h1>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input type="file" accept=".svg" onChange={handleFileUpload} />
        <div>
          <label htmlFor="css-selector" style={{ marginRight: '10px' }}>CSS Selector for auto-detecting seats:</label>
          <input 
            id="css-selector"
            type="text" 
            value={seatSelector} 
            onChange={(e) => setSeatSelector(e.target.value)} 
            style={{ width: '300px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1, minHeight: '500px', border: '1px solid #ccc', position: 'relative' }}>
          {svgUrl ? (
            <SeatmapInput
              seats={seats}
              value={selectedSeats}
              onChange={handleSeatChange}
              svg={svgUrl}
              withGroupSelection={false}
              withDragSelection={true}
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Upload an SVG file to see the seatmap here.
            </div>
          )}
        </div>

        <div style={{ width: '300px', border: '1px solid #ddd', padding: '1rem', height: '500px', overflowY: 'auto' }}>
          <h3>Seat Management</h3>
          <p>Total seats detected: {seats.length}</p>
          <p>Selected: {selectedSeats.length}</p>
          <p>Blocked: {blockedSeats.length}</p>
          
          <hr />
          <h4>All Seats:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {seats.map(seat => {
              const isSelected = selectedSeats.includes(seat.id);
              const isBlocked = blockedSeats.includes(seat.id);
              
              let rowBgColor = 'white';
              if (isBlocked) {
                rowBgColor = '#ffecec';
              } else if (isSelected) {
                rowBgColor = '#e6f7ff';
              }
              
              return (
                <li key={seat.id} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: rowBgColor }}>
                  <span>{seat.originalId}</span>
                  <div>
                    <button 
                      onClick={() => toggleBlockedStatus(seat.id)}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '0.8rem', 
                        cursor: 'pointer',
                        backgroundColor: isBlocked ? '#dc3545' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      {isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      {/* We need some styling for blocked/selected seats. */}
      {/* react-svg-seatmap uses active class probably for selected. Let's see. */}
      {seats.map(seat => {
        if (blockedSeats.includes(seat.id)) {
          return (
            <style key={`style-${seat.id}`}>
              {`
                ${seat.cssSelector} {
                  fill: #dc3545 !important;
                  cursor: not-allowed !important;
                  opacity: 0.5;
                }
              `}
            </style>
          );
        }
        return null;
      })}
    </div>
  );
}

export default ReactSvgSeatmapExample;
