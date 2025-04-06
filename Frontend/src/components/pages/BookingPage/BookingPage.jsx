import React, { useState, useEffect } from 'react';

const BookingFacilityPage = () => {
  // State for facility data
  const [facilities, setFacilities] = useState([
    { id: 1, name: 'Conference Room A', capacity: 20, equipment: ['Projector', 'Whiteboard', 'Video Conference'], image: '/api/placeholder/300/180' },
    { id: 2, name: 'Meeting Room B', capacity: 8, equipment: ['Whiteboard', 'TV Screen'], image: '/api/placeholder/300/180' },
    { id: 3, name: 'Workshop Space', capacity: 30, equipment: ['Workstations', 'Projector', 'Audio System'], image: '/api/placeholder/300/180' },
    { id: 4, name: 'Private Office', capacity: 4, equipment: ['Desk', 'Whiteboard'], image: '/api/placeholder/300/180' },
    { id: 5, name: 'Auditorium', capacity: 100, equipment: ['Stage', 'Projector', 'Sound System'], image: '/api/placeholder/300/180' },
  ]);

  // State for selected facility and booking details
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendees, setAttendees] = useState('');
  const [purpose, setPurpose] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([
    { facilityId: 1, date: '2025-03-30', startTime: '09:00', endTime: '11:00' },
    { facilityId: 1, date: '2025-03-30', startTime: '14:00', endTime: '16:00' },
    { facilityId: 2, date: '2025-03-30', startTime: '10:00', endTime: '12:00' },
    { facilityId: 3, date: '2025-03-31', startTime: '13:00', endTime: '17:00' },
  ]);
  
  // State for the modal
  const [showModal, setShowModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  // Current date for minimum date selection
  const today = new Date().toISOString().split('T')[0];
  
  // All available equipment for filtering
  const allEquipment = ['Projector', 'Whiteboard', 'Video Conference', 'TV Screen', 'Workstations', 'Audio System', 'Desk', 'Stage', 'Sound System'];

  // Filter facilities based on search and equipment
  const filteredFacilities = facilities.filter(facility => {
    // Search by name
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by selected equipment
    const hasAllEquipment = selectedEquipment.length === 0 || 
      selectedEquipment.every(eq => facility.equipment.includes(eq));
    
    return matchesSearch && hasAllEquipment;
  });

  // Check if a time slot is available
  const isTimeSlotAvailable = (facilityId, date, start, end) => {
    const conflictingBooking = bookedSlots.find(booking => 
      booking.facilityId === facilityId && 
      booking.date === date && 
      ((booking.startTime <= start && booking.endTime > start) || 
       (booking.startTime < end && booking.endTime >= end) ||
       (booking.startTime >= start && booking.endTime <= end))
    );
    
    return !conflictingBooking;
  };

  // Handle facility selection
  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility);
    setShowModal(true);
    setBookingDate('');
    setStartTime('');
    setEndTime('');
    setAttendees('');
    setPurpose('');
    setBookingConfirmed(false);
    setBookingError('');
  };

  // Toggle equipment selection
  const toggleEquipment = (equipment) => {
    if (selectedEquipment.includes(equipment)) {
      setSelectedEquipment(selectedEquipment.filter(eq => eq !== equipment));
    } else {
      setSelectedEquipment([...selectedEquipment, equipment]);
    }
  };
  
  // Handle booking submission
  const handleBooking = () => {
    // Input validation
    if (!bookingDate || !startTime || !endTime || !attendees || !purpose) {
      setBookingError('Please fill in all fields');
      return;
    }
    
    // Check if end time is after start time
    if (startTime >= endTime) {
      setBookingError('End time must be after start time');
      return;
    }
    
    // Check if the slot is available
    if (!isTimeSlotAvailable(selectedFacility.id, bookingDate, startTime, endTime)) {
      setBookingError('This time slot is already booked');
      return;
    }
    
    // Add the booking
    const newBooking = {
      facilityId: selectedFacility.id,
      date: bookingDate,
      startTime,
      endTime,
      attendees: parseInt(attendees, 10),
      purpose
    };
    
    setBookedSlots([...bookedSlots, newBooking]);
    setBookingConfirmed(true);
    setBookingError('');
    
    // In a real application, you would send this data to your backend
    console.log('Booking confirmed:', newBooking);
  };
  
  // Close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          marginBottom: '8px',
          color: '#111827'
        }}>Facility Booking</h1>
        <p style={{ 
          color: '#6b7280', 
          margin: 0 
        }}>Book meeting rooms, conference spaces, and more.</p>
      </header>
      
      {/* Search and Filter Section */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <label 
              htmlFor="search" 
              style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563'
              }}
            >
              Search Facilities
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                transitionProperty: 'border-color, box-shadow',
                transitionDuration: '150ms',
                transitionTimingFunction: 'ease-in-out'
              }}
            />
          </div>
          
          <div style={{ flex: '1 1 300px' }}>
            <label 
              style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563'
              }}
            >
              Filter by Equipment
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {allEquipment.map(equipment => (
                <button
                  key={equipment}
                  onClick={() => toggleEquipment(equipment)}
                  style={{
                    backgroundColor: selectedEquipment.includes(equipment) ? '#2563eb' : '#e5e7eb',
                    color: selectedEquipment.includes(equipment) ? 'white' : '#4b5563',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-in-out, color 150ms ease-in-out'
                  }}
                >
                  {equipment}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Facilities Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {filteredFacilities.map(facility => (
          <div key={facility.id} style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            transition: 'transform 150ms ease-in-out, box-shadow 150ms ease-in-out',
            cursor: 'pointer',
          }}
          onClick={() => handleSelectFacility(facility)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
          }}
          >
            <img 
              src={facility.image} 
              alt={facility.name}
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '16px' }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: '600',
                marginTop: 0,
                marginBottom: '8px'
              }}>{facility.name}</h3>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                <span role="img" aria-label="capacity">👥</span>
                <span>Capacity: {facility.capacity}</span>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4b5563'
                }}>Equipment:</span>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '8px'
                }}>
                  {facility.equipment.map(item => (
                    <span key={item} style={{
                      backgroundColor: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#4b5563'
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                style={{
                  display: 'block',
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 0',
                  marginTop: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease-in-out'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFacility(facility);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* No results message */}
      {filteredFacilities.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}>
          <span role="img" aria-label="search" style={{ fontSize: '32px', marginBottom: '16px', display: 'block' }}>🔍</span>
          <h3 style={{ margin: '0 0 8px', color: '#374151' }}>No facilities found</h3>
          <p style={{ color: '#6b7280', margin: 0 }}>Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Booking Modal */}
      {showModal && selectedFacility && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
            
            {!bookingConfirmed ? (
              <>
                <h2 style={{ 
                  fontSize: '20px',
                  fontWeight: '600',
                  marginTop: 0,
                  marginBottom: '24px'
                }}>Book {selectedFacility.name}</h2>
                
                {bookingError && (
                  <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    {bookingError}
                  </div>
                )}
                
                <div style={{ marginBottom: '16px' }}>
                  <label 
                    htmlFor="booking-date" 
                    style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563'
                    }}
                  >
                    Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    min={today}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ 
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <label 
                      htmlFor="start-time" 
                      style={{ 
                        display: 'block', 
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4b5563'
                      }}
                    >
                      Start Time
                    </label>
                    <input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label 
                      htmlFor="end-time" 
                      style={{ 
                        display: 'block', 
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4b5563'
                      }}
                    >
                      End Time
                    </label>
                    <input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label 
                    htmlFor="attendees" 
                    style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563'
                    }}
                  >
                    Number of Attendees (Max: {selectedFacility.capacity})
                  </label>
                  <input
                    id="attendees"
                    type="number"
                    min="1"
                    max={selectedFacility.capacity}
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label 
                    htmlFor="purpose" 
                    style={{ 
                      display: 'block', 
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4b5563'
                    }}
                  >
                    Purpose of Booking
                  </label>
                  <textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly describe the purpose of your booking"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}>
                  <button
                    onClick={closeModal}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleBooking}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '16px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '32px'
                }}>
                  ✓
                </div>
                
                <h2 style={{ 
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 8px'
                }}>Booking Confirmed!</h2>
                
                <p style={{ 
                  color: '#6b7280',
                  marginBottom: '16px'
                }}>
                  You have successfully booked {selectedFacility.name} for {bookingDate} from {startTime} to {endTime}.
                </p>
                
                <button
                  onClick={closeModal}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Bookings Timeline - Can be expanded in the future */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        marginBottom: '24px'
      }}>
        <div style={{ 
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '18px',
            fontWeight: 700,
            margin: 0
          }}>Your Upcoming Bookings</h2>
        </div>
        
        <div style={{ padding: '16px' }}>
          {bookedSlots.length > 0 ? (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {bookedSlots.slice(0, 3).map((booking, index) => {
                const facility = facilities.find(f => f.id === booking.facilityId);
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      🗓️
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px'
                      }}>{facility?.name}</h4>
                      
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>
                    
                    <button style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: '#6b7280'
            }}>
              <p>You don't have any upcoming bookings</p>
            </div>
          )}
          
          {bookedSlots.length > 3 && (
            <div style={{
              textAlign: 'center',
              marginTop: '16px'
            }}>
              <button style={{
                backgroundColor: 'transparent',
                color: '#2563eb',
                border: 'none',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                View All Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFacilityPage;