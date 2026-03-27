import React, { useState, useRef, useEffect } from 'react';
import { SeatmapInput } from 'react-svg-seatmap';
import 'react-svg-seatmap/style.css';

/**
 * Converts an SVG string to be compatible with React Svg Seatmap
 */
function normalizeSeatSvg(svgString) {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // Look for any element that might be a seat (groups, rects, circles, paths)
  const seatElements = doc.querySelectorAll('[data-seat-id]');

  seatElements.forEach((el) => {
    const seatId = el.getAttribute("data-seat-id");
    if (!seatId) return;

    // Ensure the element is interactive and identifiable
    el.classList.add("seat-map__seat");
    el.classList.add("seat");
    el.dataset.seat = seatId;
    el.id = seatId;
    el.setAttribute("pointer-events", "all");
    el.style.cursor = "pointer";

    // Use regex to extract row and number for metadata (optional but helpful)
    const match = /^([A-Za-z]+)(\d+)$/.exec(seatId);
    if (match) {
      el.dataset.row = match[1];
      el.dataset.number = match[2];
    }
  });

  return serializer.serializeToString(doc);
}

function ReactSvgSeatmapExample() {
  const [svgUrl, setSvgUrl] = useState('');
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [blockedSeats, setBlockedSeats] = useState([]);
  const containerRef = useRef(null);

  const toggleSeatSelection = (numericId) => {
    if (blockedSeats.includes(numericId)) return;

    setSelectedSeats(prev => 
      prev.includes(numericId) 
        ? prev.filter(id => id !== numericId) 
        : [...prev, numericId]
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const rawText = await file.text();
      const normalizedSvgText = normalizeSeatSvg(rawText);

      const parser = new DOMParser();
      const doc = parser.parseFromString(normalizedSvgText, "image/svg+xml");
      const elements = doc.querySelectorAll("[data-seat]");

      const generatedSeats = [];
      let idCounter = 1;

      elements.forEach((el) => {
        const seatId = el.dataset.seat;
        if (!seatId) return;

        generatedSeats.push({
          id: idCounter,
          originalId: seatId,
          cssSelector: `[data-seat="${seatId}"]`, // Using attribute selector for better compatibility
          displayGroup: "General",
        });

        idCounter++;
      });

      const blob = new Blob([normalizedSvgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      setSvgUrl(url);
      setSeats(generatedSeats);
      setSelectedSeats([]);
      setBlockedSeats([]);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handleSeatChange = (newSelectedSeats) => {
    return;
    const validSelection = newSelectedSeats.filter(id => !blockedSeats.includes(id));
    setSelectedSeats(validSelection);
  };

  const toggleBlockedStatus = (seatId) => {
    setBlockedSeats(prev => {
      const isBlocked = prev.includes(seatId);
      const nextBlocked = isBlocked ? prev.filter(id => id !== seatId) : [...prev, seatId];
      if (!isBlocked && selectedSeats.includes(seatId)) {
        setSelectedSeats(curr => curr.filter(id => id !== seatId));
      }
      return nextBlocked;
    });
  };

  useEffect(() => {
    const handleManualClick = (e) => {
      // Attempt to find the seat element by looking up from the target
      const seatEl = e.target.closest('[data-seat]');
      
      if (seatEl) {
        const seatId = seatEl.getAttribute('data-seat');
        const foundSeat = seats.find(s => s.originalId === seatId);
        
        if (foundSeat) {
          console.log('Capture click on seat:', seatId);
          toggleSeatSelection(foundSeat.id);
        }
      }
    };

    /**
     * Prevents panning/dragging when the user is interacting with a seat.
     * We stop the event in the capture phase so the library's pan handler never sees it.
     */
    const preventDragOnSeats = (e) => {
      if (e.target.closest('[data-seat]')) {
        // Stop propagation so the library's pan/drag logic is not triggered
        e.stopPropagation();
      }
    };

    const container = containerRef.current;
    if (container) {
      // Use capture to ensure we see these events before the library.
      container.addEventListener('click', handleManualClick, true);
      container.addEventListener('mousedown', preventDragOnSeats, true);
      container.addEventListener('touchstart', preventDragOnSeats, true);
    }
    return () => {
      if (container) {
        container.removeEventListener('click', handleManualClick, true);
        container.removeEventListener('mousedown', preventDragOnSeats, true);
        container.removeEventListener('touchstart', preventDragOnSeats, true);
      }
    };
  }, [seats, blockedSeats, selectedSeats]);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#333' }}>
      <h1 style={{ textAlign: 'center' }}>SVG Seatmap Viewer</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
        <strong>Upload Seat Map:</strong>
        <input type="file" accept=".svg" onChange={handleFileUpload} style={{ padding: '5px' }} />
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div ref={containerRef} style={{ flex: 1, minHeight: '600px', border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', position: 'relative' }}>
          {svgUrl ? (
            <SeatmapInput
              seats={seats}
              value={selectedSeats}
              onChange={handleSeatChange}
              svg={svgUrl}
              withGroupSelection={false}
              withDragSelection={false}
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Upload an SVG file to start selecting seats.
            </div>
          )}
        </div>

        <div style={{ width: '380px', border: '1px solid #ddd', padding: '1.5rem', height: '600px', overflowY: 'auto', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Control Panel</h3>
          
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            <strong>Last Selected:</strong> {selectedSeats.length > 0 ? selectedSeats.map(id => seats.find(s => s.id === id)?.originalId).join(', ') : 'None'}
          </div>

          <div style={{ margin: '1rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{seats.length}</div>
              <div style={{ fontSize: '0.8rem' }}>Total Seats</div>
            </div>
            <div style={{ padding: '0.5rem', background: '#e6f7ff', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedSeats.length}</div>
              <div style={{ fontSize: '0.8rem' }}>Selected</div>
            </div>
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '1rem 0' }} />
          
          <h4>Seat List</h4>
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
                <li key={seat.id} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #eee', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: rowBgColor }}>
                  <span style={{ fontWeight: '500' }}>{seat.originalId}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSeatSelection(seat.id); }}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '0.75rem', 
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#1890ff' : '#eee',
                        color: isSelected ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      {isSelected ? 'Deselect' : 'Select'}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleBlockedStatus(seat.id); }}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '0.75rem', 
                        cursor: 'pointer',
                        backgroundColor: isBlocked ? '#f5222d' : '#eee',
                        color: isBlocked ? 'white' : '#666',
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
      
      <style>
        {`
          .seat {
            transition: all 0.2s ease;
            cursor: pointer !important;
          }
          .seat:hover {
            filter: brightness(0.8) contrast(1.2);
            transform: scale(1.05);
            z-index: 10;
          }
        `}
        {seats.map(seat => {
          if (blockedSeats.includes(seat.id)) {
            return `
              ${seat.cssSelector} {
                fill: #f5222d !important;
                stroke: #cf1322 !important;
                cursor: not-allowed !important;
                opacity: 0.5;
              }
            `;
          }
          if (selectedSeats.includes(seat.id)) {
            return `
              ${seat.cssSelector} {
                fill: #1890ff !important;
                stroke: #096dd9 !important;
                opacity: 1 !important;
                stroke-width: 2.5px !important;
              }
            `;
          }
          return null;
        }).join('\n')}
      </style>
    </div>
  );
}

export default ReactSvgSeatmapExample;
