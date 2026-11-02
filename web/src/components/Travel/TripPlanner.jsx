const { useState, useEffect, useMemo, useCallback } = React;

const PACKING_TEMPLATES = {
  'Beach': ['Sunscreen SPF 50+', 'Swimwear', 'Sunglasses', 'Flip-flops', 'Beach towel', 'Waterproof phone pouch', 'Hat / Cap', 'Light cotton clothes', 'After-sun lotion'],
  'Mountain / Trek': ['Trekking shoes', 'Warm jacket / Fleece', 'Raincoat / Poncho', 'Headlamp / Torch', 'First-aid kit', 'Energy bars / Snacks', 'Water bottle (1L+)', 'Trekking pole', 'Thermal innerwear', 'Gloves & Beanie'],
  'City': ['Comfortable walking shoes', 'Power bank', 'Light backpack / Daypack', 'City map / Offline maps', 'Umbrella', 'Casual smart clothing', 'Reusable water bottle'],
  'Pilgrimage': ['Modest / Traditional clothing', 'Comfortable footwear', 'Prayer items / Offerings', 'Small towel', 'Water bottle', 'Light shawl / Dupatta'],
  'Party / Event': ['Formal / Party wear', 'Accessories & Watch', 'Grooming kit', 'Perfume / Deo', 'Dress shoes', 'Power bank'],
  'Road Trip': ['Driving license & Documents', 'Car charger', 'Snacks & Water', 'First-aid kit', 'Sunglasses', 'Music playlist (downloaded)', 'Spare tire check', 'Cash for tolls'],
  'Other': ['Clothing (3-4 sets)', 'Toiletries', 'Charger & Power bank', 'ID & Documents', 'Medicines', 'Water bottle', 'Snacks']
};

const COMMON_ITEMS = ['Phone charger & Cable', 'ID proof / Passport', 'Cash & Cards', 'Basic medicines', 'Toiletries bag'];

const generatePackingList = (tripType) => {
  const specificItems = PACKING_TEMPLATES[tripType] || PACKING_TEMPLATES['Other'];
  const allItems = [...new Set([...COMMON_ITEMS, ...specificItems])];
  return allItems.map((item, index) => ({
    id: Date.now() + index,
    item,
    checked: false
  }));
};

const generateItinerary = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [{ day: 1, date: startDate, places: [], notes: '' }];
  }

  let currentDate = new Date(start);
  let dayNum = 1;

  while (currentDate <= end) {
    days.push({
      day: dayNum,
      date: currentDate.toISOString().split('T')[0],
      places: [],
      notes: ''
    });
    currentDate.setDate(currentDate.getDate() + 1);
    dayNum++;
  }

  return days;
};

const determineStatus = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (today > end) return 'completed';
    if (today >= start && today <= end) return 'ongoing';
    return 'planned';
};

const getCountdownText = (startDate, endDate, status) => {
    if (status === 'completed') return 'Completed';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (status === 'ongoing') {
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalTime = Math.abs(end - start);
        const totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24)) + 1;
        return `Day ${diffDays} of ${totalDays}`;
    }

    if (status === 'planned') {
        const diffTime = start - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Starts today!';
        if (diffDays === 1) return 'In 1 day!';
        return `In ${diffDays} days`;
    }
    return '';
};

const getTripIcon = (type) => {
    switch(type) {
        case 'Beach': return 'ph-umbrella';
        case 'Mountain / Trek': return 'ph-mountains';
        case 'City': return 'ph-buildings';
        case 'Pilgrimage': return 'ph-hands-praying';
        case 'Party / Event': return 'ph-confetti';
        case 'Road Trip': return 'ph-car';
        default: return 'ph-suitcase';
    }
};

window.TripPlanner = ({ trips = [], onSaveTrips, statesData = [] }) => {
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' or 'packing'

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    tripType: 'Beach',
    notes: ''
  });

  const selectedTrip = useMemo(() => trips.find(t => t.id === selectedTripId), [trips, selectedTripId]);

  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      const statusOrder = { 'ongoing': 1, 'planned': 2, 'completed': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (a.status === 'planned') {
          return new Date(a.startDate) - new Date(b.startDate); // Nearest first
      }
      return new Date(b.startDate) - new Date(a.startDate); // Most recent completed first
    });
  }, [trips]);

  const handleOpenModal = (trip = null) => {
    if (trip) {
      setEditingTripId(trip.id);
      setFormData({
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        tripType: trip.tripType,
        notes: trip.notes || ''
      });
    } else {
      setEditingTripId(null);
      setFormData({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        budget: '',
        tripType: 'Beach',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTripId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTrip = (e) => {
    e.preventDefault();
    const status = determineStatus(formData.startDate, formData.endDate);
    
    if (editingTripId) {
      const updatedTrips = trips.map(t => {
        if (t.id === editingTripId) {
           return {
             ...t,
             ...formData,
             status,
             // Note: We don't auto-regenerate itinerary/packing on edit to avoid destroying user data
           };
        }
        return t;
      });
      onSaveTrips(updatedTrips);
    } else {
      const newTrip = {
        id: Date.now(),
        ...formData,
        status,
        itinerary: generateItinerary(formData.startDate, formData.endDate),
        packingList: generatePackingList(formData.tripType)
      };
      onSaveTrips([...trips, newTrip]);
    }
    handleCloseModal();
  };

  const handleDeleteTrip = (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this trip?')) {
      const updatedTrips = trips.filter(t => t.id !== id);
      onSaveTrips(updatedTrips);
      if (selectedTripId === id) {
        setView('list');
        setSelectedTripId(null);
      }
    }
  };

  const updateSelectedTrip = (updatedTrip) => {
      const updatedTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
      onSaveTrips(updatedTrips);
  };

  // Itinerary Actions
  const handleAddDay = () => {
      if (!selectedTrip) return;
      const lastDay = selectedTrip.itinerary[selectedTrip.itinerary.length - 1];
      const nextDate = new Date(lastDay ? lastDay.date : selectedTrip.startDate);
      if (lastDay) nextDate.setDate(nextDate.getDate() + 1);
      
      const newDay = {
          day: lastDay ? lastDay.day + 1 : 1,
          date: nextDate.toISOString().split('T')[0],
          places: [],
          notes: ''
      };
      updateSelectedTrip({ ...selectedTrip, itinerary: [...selectedTrip.itinerary, newDay] });
  };

  const handleRemoveDay = (dayIndex) => {
      if (!selectedTrip) return;
      const newItinerary = selectedTrip.itinerary.filter((_, idx) => idx !== dayIndex);
      // Re-index days
      const reindexed = newItinerary.map((d, idx) => ({ ...d, day: idx + 1 }));
      updateSelectedTrip({ ...selectedTrip, itinerary: reindexed });
  };

  const handleAddPlace = (dayIndex, placeName) => {
      if (!selectedTrip || !placeName.trim()) return;
      const newItinerary = [...selectedTrip.itinerary];
      newItinerary[dayIndex].places.push(placeName.trim());
      updateSelectedTrip({ ...selectedTrip, itinerary: newItinerary });
  };

  const handleRemovePlace = (dayIndex, placeIndex) => {
      if (!selectedTrip) return;
      const newItinerary = [...selectedTrip.itinerary];
      newItinerary[dayIndex].places.splice(placeIndex, 1);
      updateSelectedTrip({ ...selectedTrip, itinerary: newItinerary });
  };

  const handleDayNotesChange = (dayIndex, notes) => {
      if (!selectedTrip) return;
      const newItinerary = [...selectedTrip.itinerary];
      newItinerary[dayIndex].notes = notes;
      updateSelectedTrip({ ...selectedTrip, itinerary: newItinerary });
  };

  // Packing List Actions
  const handleToggleItem = (itemId) => {
      if (!selectedTrip) return;
      const newPackingList = selectedTrip.packingList.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      updateSelectedTrip({ ...selectedTrip, packingList: newPackingList });
  };

  const handleAddPackingItem = (itemName) => {
      if (!selectedTrip || !itemName.trim()) return;
      const newItem = { id: Date.now(), item: itemName.trim(), checked: false };
      updateSelectedTrip({ ...selectedTrip, packingList: [newItem, ...selectedTrip.packingList] });
  };

  const handleRemovePackingItem = (itemId) => {
      if (!selectedTrip) return;
      const newPackingList = selectedTrip.packingList.filter(item => item.id !== itemId);
      updateSelectedTrip({ ...selectedTrip, packingList: newPackingList });
  };

  const destinationOptions = statesData.map(s => s.state || s.name || s).filter(Boolean);

  return (
    <div className="trip-planner-container">
      {/* HEADER */}
      <div className="tp-header">
        <div className="tp-header-title">
          {view === 'detail' && (
            <button className="tp-back-btn" onClick={() => setView('list')}>
              <i className="ph-bold ph-arrow-left"></i>
            </button>
          )}
          <h2>
            <i className="ph-fill ph-airplane-tilt"></i> 
            {view === 'list' ? 'Trip Planner' : selectedTrip?.name}
          </h2>
        </div>
        {view === 'list' && (
          <button className="tp-primary-btn" onClick={() => handleOpenModal()}>
            <i className="ph-bold ph-plus"></i> Plan a Trip
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="tp-list-view">
          {sortedTrips.length === 0 ? (
            <div className="tp-empty-state">
              <i className="ph-fill ph-map-trifold"></i>
              <h3>No trips planned yet</h3>
              <p>Start planning your next adventure and keep track of your itinerary and packing list!</p>
              <button className="tp-primary-btn" onClick={() => handleOpenModal()}>
                <i className="ph-bold ph-plus"></i> Plan a Trip
              </button>
            </div>
          ) : (
            <div className="tp-grid">
              {sortedTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className={`tp-card status-${trip.status}`} 
                  onClick={() => { setSelectedTripId(trip.id); setView('detail'); }}
                >
                  <div className="tp-card-header">
                    <div className="tp-card-title">
                      <i className={`ph-fill ${getTripIcon(trip.tripType)}`}></i>
                      <h3>{trip.name}</h3>
                    </div>
                    <div className="tp-card-actions">
                      <button className="tp-icon-btn" onClick={(e) => { e.stopPropagation(); handleOpenModal(trip); }}>
                        <i className="ph-fill ph-pencil-simple"></i>
                      </button>
                      <button className="tp-icon-btn delete" onClick={(e) => handleDeleteTrip(trip.id, e)}>
                        <i className="ph-fill ph-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="tp-card-body">
                    <div className="tp-info-row">
                      <i className="ph-fill ph-map-pin"></i> <span>{trip.destination}</span>
                    </div>
                    <div className="tp-info-row">
                      <i className="ph-fill ph-calendar-blank"></i> 
                      <span>{new Date(trip.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(trip.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    {trip.budget && (
                      <div className="tp-info-row">
                        <i className="ph-fill ph-wallet"></i> <span>₹{Number(trip.budget).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="tp-card-footer">
                    <span className={`tp-badge status-${trip.status}`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                    <span className="tp-countdown">
                      {getCountdownText(trip.startDate, trip.endDate, trip.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && selectedTrip && (
        <div className="tp-detail-view">
          <div className="tp-tabs">
            <button 
              className={`tp-tab ${activeTab === 'itinerary' ? 'active' : ''}`}
              onClick={() => setActiveTab('itinerary')}
            >
              <i className="ph-fill ph-map-trifold"></i> Itinerary
            </button>
            <button 
              className={`tp-tab ${activeTab === 'packing' ? 'active' : ''}`}
              onClick={() => setActiveTab('packing')}
            >
              <i className="ph-fill ph-suitcase"></i> Packing List
            </button>
          </div>

          <div className="tp-tab-content">
            {/* ITINERARY TAB */}
            {activeTab === 'itinerary' && (
              <div className="tp-itinerary">
                <div className="tp-timeline">
                  {selectedTrip.itinerary?.map((day, dayIndex) => (
                    <div key={dayIndex} className="tp-day-block">
                      <div className="tp-day-marker"></div>
                      <div className="tp-day-content">
                        <div className="tp-day-header">
                          <h4>Day {day.day} <span>• {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span></h4>
                          <button className="tp-icon-btn delete-day" onClick={() => handleRemoveDay(dayIndex)}>
                             <i className="ph-bold ph-x"></i>
                          </button>
                        </div>
                        
                        <div className="tp-places-list">
                          {day.places.map((place, pIndex) => (
                            <div key={pIndex} className="tp-place-item">
                              <i className="ph-fill ph-map-pin"></i>
                              <span>{place}</span>
                              <button className="tp-icon-btn small" onClick={() => handleRemovePlace(dayIndex, pIndex)}>
                                <i className="ph-bold ph-x"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="tp-add-place">
                          <input 
                            type="text" 
                            placeholder="Add a place..." 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddPlace(dayIndex, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button className="tp-add-btn" onClick={(e) => {
                            const input = e.target.previousSibling;
                            handleAddPlace(dayIndex, input.value);
                            input.value = '';
                          }}>
                            <i className="ph-bold ph-plus"></i> Add
                          </button>
                        </div>
                        
                        <textarea 
                          className="tp-day-notes" 
                          placeholder="Notes for this day..."
                          value={day.notes || ''}
                          onChange={(e) => handleDayNotesChange(dayIndex, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="tp-secondary-btn add-day-btn" onClick={handleAddDay}>
                  <i className="ph-bold ph-plus"></i> Add Day
                </button>
              </div>
            )}

            {/* PACKING TAB */}
            {activeTab === 'packing' && (() => {
              const totalItems = selectedTrip.packingList?.length || 0;
              const packedItems = selectedTrip.packingList?.filter(i => i.checked).length || 0;
              const progressPercentage = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

              return (
                <div className="tp-packing">
                  <div className="tp-progress-container">
                    <div className="tp-progress-header">
                      <span>Packing Progress</span>
                      <span>{packedItems} / {totalItems} items ({progressPercentage}%)</span>
                    </div>
                    <div className="tp-progress-bar-bg">
                      <div className="tp-progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>

                  <div className="tp-add-packing-item">
                    <input 
                      type="text" 
                      placeholder="Add an item to pack..." 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddPackingItem(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button className="tp-add-btn" onClick={(e) => {
                       const input = e.target.previousSibling;
                       handleAddPackingItem(input.value);
                       input.value = '';
                    }}>
                      <i className="ph-bold ph-plus"></i> Add
                    </button>
                  </div>

                  <div className="tp-packing-list">
                    {selectedTrip.packingList?.map(item => (
                      <div key={item.id} className={`tp-packing-item ${item.checked ? 'checked' : ''}`}>
                        <label className="tp-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={item.checked} 
                            onChange={() => handleToggleItem(item.id)}
                          />
                          <span className="tp-checkmark"></span>
                          <span className="tp-item-text">{item.item}</span>
                        </label>
                        <button className="tp-icon-btn small delete" onClick={() => handleRemovePackingItem(item.id)}>
                          <i className="ph-bold ph-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="tp-modal-overlay" onClick={handleCloseModal}>
          <div className="tp-modal" onClick={e => e.stopPropagation()}>
            <div className="tp-modal-header">
              <h3>{editingTripId ? 'Edit Trip' : 'Plan a New Trip'}</h3>
              <button className="tp-icon-btn" onClick={handleCloseModal}>
                <i className="ph-bold ph-x"></i>
              </button>
            </div>
            <form className="tp-form" onSubmit={handleSaveTrip}>
              <div className="tp-form-group">
                <label>Trip Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleFormChange} placeholder="e.g. Summer Vacation" />
              </div>
              <div className="tp-form-row">
                <div className="tp-form-group">
                  <label>Destination</label>
                  <input type="text" name="destination" list="destinations" required value={formData.destination} onChange={handleFormChange} placeholder="Where to?" />
                  <datalist id="destinations">
                    {destinationOptions.map((opt, idx) => <option key={idx} value={opt} />)}
                  </datalist>
                </div>
                <div className="tp-form-group">
                  <label>Trip Type</label>
                  <select name="tripType" value={formData.tripType} onChange={handleFormChange}>
                    {Object.keys(PACKING_TEMPLATES).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="tp-form-row">
                <div className="tp-form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" required value={formData.startDate} onChange={handleFormChange} />
                </div>
                <div className="tp-form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" required value={formData.endDate} onChange={handleFormChange} />
                </div>
              </div>
              <div className="tp-form-group">
                <label>Budget (₹)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleFormChange} placeholder="15000" />
              </div>
              <div className="tp-form-group">
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Any general notes about the trip?"></textarea>
              </div>
              <div className="tp-form-actions">
                <button type="button" className="tp-cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="tp-primary-btn">Save Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .trip-planner-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          color: var(--text-primary);
        }

        .tp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .tp-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tp-header-title h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .tp-header-title h2 i {
          color: var(--primary);
        }

        .tp-back-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-primary);
          border-radius: var(--radius-md);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .tp-back-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .tp-primary-btn {
          background: var(--primary, #3b82f6);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tp-primary-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .tp-secondary-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tp-secondary-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .tp-icon-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tp-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
        }

        .tp-icon-btn.delete:hover {
          color: var(--danger, #ef4444);
          background: rgba(239, 68, 68, 0.1);
        }
        
        .tp-icon-btn.small {
          width: 24px;
          height: 24px;
          font-size: 0.85rem;
        }

        /* List View */
        .tp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .tp-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 16px;
          backdrop-filter: blur(10px);
        }

        .tp-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        
        .tp-card.status-ongoing {
          border-left: 4px solid var(--success, #10b981);
        }
        .tp-card.status-planned {
          border-left: 4px solid var(--primary, #3b82f6);
        }
        .tp-card.status-completed {
          border-left: 4px solid var(--text-muted, #64748b);
          opacity: 0.8;
        }

        .tp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .tp-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tp-card-title i {
          font-size: 1.5rem;
          color: var(--text-secondary);
        }

        .tp-card-title h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tp-card-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .tp-card:hover .tp-card-actions {
          opacity: 1;
        }

        .tp-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tp-info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .tp-info-row i {
          color: var(--text-muted);
        }

        .tp-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .tp-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .tp-badge.status-planned {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }
        .tp-badge.status-ongoing {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          animation: pulse 2s infinite;
        }
        .tp-badge.status-completed {
          background: rgba(100, 116, 139, 0.15);
          color: #94a3b8;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .tp-countdown {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .tp-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: var(--radius-lg);
          color: var(--text-secondary);
        }

        .tp-empty-state i {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .tp-empty-state h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }
        
        .tp-empty-state p {
          margin: 0 0 24px 0;
          max-width: 400px;
        }

        /* Detail View */
        .tp-detail-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tp-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 2px;
        }

        .tp-tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px 16px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          transition: color 0.2s;
        }

        .tp-tab:hover {
          color: var(--text-primary);
        }

        .tp-tab.active {
          color: var(--primary, #3b82f6);
        }

        .tp-tab.active::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary, #3b82f6);
          border-radius: 2px 2px 0 0;
        }

        .tp-tab-content {
          padding: 10px 0;
        }

        /* Itinerary */
        .tp-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }

        .tp-timeline::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: rgba(255,255,255,0.1);
        }

        .tp-day-block {
          display: flex;
          gap: 20px;
          padding-bottom: 30px;
          position: relative;
        }

        .tp-day-marker {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--bg-surface, #1e293b);
          border: 2px solid var(--primary, #3b82f6);
          position: relative;
          z-index: 2;
          margin-top: 4px;
        }

        .tp-day-content {
          flex: 1;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .tp-day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tp-day-header h4 {
          margin: 0;
          color: var(--primary, #3b82f6);
          font-size: 1.1rem;
        }

        .tp-day-header h4 span {
          color: var(--text-muted);
          font-weight: normal;
          font-size: 0.9rem;
        }
        
        .delete-day {
           opacity: 0;
        }
        .tp-day-block:hover .delete-day {
           opacity: 1;
        }

        .tp-places-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .tp-place-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }

        .tp-place-item i {
          color: var(--text-muted);
        }

        .tp-place-item span {
          flex: 1;
        }

        .tp-add-place {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .tp-add-place input, .tp-add-packing-item input {
          flex: 1;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          outline: none;
        }
        
        .tp-add-place input:focus, .tp-add-packing-item input:focus {
           border-color: rgba(255,255,255,0.3);
        }

        .tp-add-btn {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
          border: none;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .tp-add-btn:hover {
          background: rgba(255,255,255,0.15);
        }

        .tp-day-notes {
          width: 100%;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.1);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: var(--radius-sm);
          resize: vertical;
          min-height: 60px;
          font-family: inherit;
        }

        .tp-day-notes:focus {
          outline: none;
          border-color: rgba(255,255,255,0.3);
          color: var(--text-primary);
        }

        .add-day-btn {
          align-self: flex-start;
          margin-left: 36px;
        }

        /* Packing List */
        .tp-packing {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 600px;
        }

        .tp-progress-container {
          background: rgba(255,255,255,0.03);
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .tp-progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .tp-progress-bar-bg {
          height: 8px;
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          overflow: hidden;
        }

        .tp-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary, #3b82f6), var(--success, #10b981));
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .tp-add-packing-item {
          display: flex;
          gap: 8px;
        }

        .tp-packing-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tp-packing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-md);
          transition: all 0.2s;
        }
        
        .tp-packing-item:hover {
           background: rgba(255,255,255,0.05);
        }

        .tp-packing-item.checked {
          opacity: 0.6;
        }

        .tp-checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          flex: 1;
        }

        .tp-checkbox-label input {
          display: none;
        }

        .tp-checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid var(--text-muted);
          border-radius: 4px;
          position: relative;
          transition: all 0.2s;
        }

        .tp-checkbox-label input:checked ~ .tp-checkmark {
          background: var(--primary, #3b82f6);
          border-color: var(--primary, #3b82f6);
        }

        .tp-checkmark::after {
          content: '';
          position: absolute;
          display: none;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .tp-checkbox-label input:checked ~ .tp-checkmark::after {
          display: block;
        }

        .tp-item-text {
          transition: all 0.2s;
        }

        .tp-checkbox-label input:checked ~ .tp-item-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        /* Modal */
        .tp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .tp-modal {
          background: var(--bg-surface, #1e293b);
          border: 1px solid var(--border, rgba(255,255,255,0.1));
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 500px;
          padding: 24px;
          box-shadow: var(--shadow-xl, 0 25px 50px -12px rgba(0,0,0,0.5));
          max-height: 90vh;
          overflow-y: auto;
        }

        .tp-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .tp-modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        .tp-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tp-form-row {
          display: flex;
          gap: 16px;
        }

        .tp-form-row > div {
          flex: 1;
        }

        .tp-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tp-form-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .tp-form-group input, 
        .tp-form-group select, 
        .tp-form-group textarea {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-primary);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-family: inherit;
        }

        .tp-form-group input:focus, 
        .tp-form-group select:focus, 
        .tp-form-group textarea:focus {
          outline: none;
          border-color: var(--primary, #3b82f6);
        }

        .tp-form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .tp-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .tp-cancel-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
        }
        
        .tp-cancel-btn:hover {
           background: rgba(255,255,255,0.05);
        }

        @media (max-width: 600px) {
          .tp-form-row {
            flex-direction: column;
            gap: 16px;
          }
          
          .tp-day-block {
             gap: 12px;
          }
          .tp-timeline::before {
             left: 6px;
          }
          .tp-day-marker {
             width: 14px;
             height: 14px;
             margin-top: 6px;
          }
        }
      `}</style>
    </div>
  );
};
