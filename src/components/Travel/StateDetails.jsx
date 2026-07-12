(function () {
    console.log("Loading StateDetails.jsx v10 (Generalized Add Form)...");

    const { useState, useEffect, useRef } = React;

    const SECTIONS = [
        { id: 'highlights', label: 'Highlights', icon: 'ph-star' },
        { id: 'placesVisited', label: 'Places Visited', icon: 'ph-map-pin' },
        { id: 'bucketList', label: 'Bucket List', icon: 'ph-binoculars' },
        { id: 'restaurants', label: 'Restaurants', icon: 'ph-fork-knife' },
        { id: 'food', label: 'Food to Try', icon: 'ph-pizza' },
        { id: 'treks', label: 'Treks', icon: 'ph-mountains' },
        { id: 'stays', label: 'Stays', icon: 'ph-bed' }
    ];

    const CUISINE_OPTIONS = ['Snacks', 'Local Meals', 'Curries', 'Western', 'Mixed', 'Asian', 'Pizza & Pasta', 'Coffee & Tea', 'Sweets', 'Chats'];
    const AMBIENCE_OPTIONS = ['Casual', 'Posh', 'Grab & Go', 'Family', 'Romantic', 'Rooftop', 'Bar', 'Late Night'];
    
    const TRIP_TYPE_OPTIONS = ['Nature & Lakes', 'High Peaks', 'Wildlife', 'Heritage Sites', 'Beaches', 'Waterfalls', 'City Tour'];
    const SEASON_OPTIONS = ['Monsoon', 'Winter', 'Post-Monsoon', 'Summer', 'All Year'];
    const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

    const STAY_TYPE_OPTIONS = ['Hotel', 'Resort', 'Service Apartment', 'Villa', 'Transit Stay', 'Hostel', 'Homestay'];
    const AMENITY_OPTIONS = ['🏊 Pool', '📶 Wi-Fi', '🍳 Kitchen', '🅿️ Parking', '❄️ AC', '☕ Breakfast'];

    // Check for localhost
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '';

    const StateDetails = ({ stateName, onBack }) => {
        const [data, setData] = useState(null);
        const [activeTab, setActiveTab] = useState('highlights');

        // Add Item Form State
        const [newItem, setNewItem] = useState('');
        const [newCity, setNewCity] = useState('');
        const [newRemarks, setNewRemarks] = useState(''); // Unified: Remarks/Notes/Restaurant

        // Image Upload State (Global for Add)
        const [uploading, setUploading] = useState(false);
        const [uploadedImagePath, setUploadedImagePath] = useState('');

        const [searchTerm, setSearchTerm] = useState('');

        // Edit State
        const [editingIndex, setEditingIndex] = useState(-1);
        const [editItem, setEditItem] = useState({ name: '', city: '', remarks: '', image: '', mapLink: '', dishes: [] });
        const [editUploading, setEditUploading] = useState(false);
        const [newDishName, setNewDishName] = useState('');
        const [newDishRating, setNewDishRating] = useState('good');

        // Add Form Extended State
        const [newDishes, setNewDishes] = useState([]);
        const [newAddDishName, setNewAddDishName] = useState('');
        const [newAddDishRating, setNewAddDishRating] = useState('good');
        const [newMapLink, setNewMapLink] = useState('');
        const [newCuisines, setNewCuisines] = useState([]);
        const [newAmbiences, setNewAmbiences] = useState([]);
        const [newTripTypes, setNewTripTypes] = useState([]);
        const [newSeason, setNewSeason] = useState('All Year');
        const [newTravelDuration, setNewTravelDuration] = useState('');
        const [newPriority, setNewPriority] = useState('Medium');
        const [newDistance, setNewDistance] = useState('');
        const [newAltitude, setNewAltitude] = useState('');
        const [newDifficulty, setNewDifficulty] = useState('Beginner');
        const [newBestTime, setNewBestTime] = useState('');
        const [newPermit, setNewPermit] = useState('No');
        const [newTimeTaken, setNewTimeTaken] = useState('');
        const [newTerrain, setNewTerrain] = useState('');
        const [newSafetyAlerts, setNewSafetyAlerts] = useState(false);
        const [newIsVisited, setNewIsVisited] = useState(false);
        const [newStayType, setNewStayType] = useState('Hotel');
        const [newCheckIn, setNewCheckIn] = useState('');
        const [newCheckOut, setNewCheckOut] = useState('');
        const [newAmenities, setNewAmenities] = useState([]);

        useEffect(() => {
            if (stateName) {
                loadData();
            }
        }, [stateName]);

        // Clear inputs when tab changes
        useEffect(() => {
            setNewItem('');
            setNewCity('');
            setNewRemarks('');
            setUploadedImagePath('');
            setNewDishName('');
            setNewDishRating('good');
            setNewDishes([]);
            setNewAddDishName('');
            setNewAddDishRating('good');
            setNewMapLink('');
            setNewDistance('');
            setNewAltitude('');
            setNewDifficulty('Beginner');
            setNewBestTime('');
            setNewPermit('No');
            setNewTimeTaken('');
            setNewTerrain('');
            setNewSafetyAlerts(false);
            setNewIsVisited(false);
            setNewCuisines([]);
            setNewAmbiences([]);
            setNewTripTypes([]);
            setNewSeason('All Year');
            setNewTravelDuration('');
            setNewPriority('Medium');
            cancelEdit();
        }, [activeTab]);

        const loadData = () => {
            const allStates = window.TravelData.getStatesData();
            const countryData = window.TravelData.getCountriesData();

            let current = allStates.find(s => s.name === stateName);
            if (!current) {
                current = countryData.find(s => s.name === stateName);
            }
            setData(current || null);
        };

        const handleSave = (updatedData) => {
            window.TravelData.saveStateData(stateName, updatedData);
            setData(prev => ({ ...prev, ...updatedData }));
        };

        const toggleVisited = () => {
            if (!data) return;
            handleSave({ visited: !data.visited });
        };

        const uploadFile = async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Data = reader.result;
                    const result = await window.api.uploadImage({
                        image: base64Data,
                        name: file.name
                    });
                    resolve(result);
                };
                reader.readAsDataURL(file);
            });
        };

        const handleAddFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            const result = await uploadFile(file);

            if (result && result.success) {
                setUploadedImagePath(result.path);
            } else {
                alert("Image upload failed.");
            }
            setUploading(false);
        };

        const handleEditFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setEditUploading(true);
            const result = await uploadFile(file);

            if (result && result.success) {
                setEditItem(prev => ({ ...prev, image: result.path }));
            } else {
                alert("Image upload failed during edit.");
            }
            setEditUploading(false);
        };

        const addItem = (e) => {
            e.preventDefault();
            if (!newItem.trim() || !data) return;

            const list = data[activeTab] || [];

            // Should current view support full objects?
            // Yes, user wants City/Notes for all.

            // For backward compatibility:
            // Existing data might be strings.
            // We will push new items as objects.

            const isGridView = activeTab === 'food' && isLocalhost;

            const itemToAdd = {
                name: newItem.trim(),
                city: newCity.trim() || '-',
                remarks: newRemarks.trim() || '-',
                image: isGridView ? uploadedImagePath : undefined,
                mapLink: (activeTab === 'restaurants' || activeTab === 'treks') ? newMapLink.trim() : undefined,
                dishes: activeTab === 'restaurants' ? [...newDishes] : undefined,
                cuisines: activeTab === 'restaurants' ? [...newCuisines] : undefined,
                ambiences: activeTab === 'restaurants' ? [...newAmbiences] : undefined,
                tripTypes: activeTab === 'bucketList' ? [...newTripTypes] : undefined,
                season: activeTab === 'bucketList' ? newSeason : undefined,
                travelDuration: activeTab === 'bucketList' ? newTravelDuration.trim() : undefined,
                priority: activeTab === 'bucketList' ? newPriority : undefined,
                distance: activeTab === 'treks' ? newDistance.trim() : undefined,
                altitude: activeTab === 'treks' ? newAltitude.trim() : undefined,
                difficulty: activeTab === 'treks' ? newDifficulty : undefined,
                bestTime: activeTab === 'treks' ? newBestTime.trim() : undefined,
                permit: activeTab === 'treks' ? newPermit : undefined,
                timeTaken: activeTab === 'treks' ? newTimeTaken.trim() : undefined,
                terrain: activeTab === 'treks' ? newTerrain.trim() : undefined,
                safetyAlerts: activeTab === 'treks' ? newSafetyAlerts : undefined,
                isVisited: activeTab === 'treks' ? newIsVisited : undefined,
                stayType: activeTab === 'stays' ? newStayType : undefined,
                checkIn: activeTab === 'stays' ? newCheckIn : undefined,
                checkOut: activeTab === 'stays' ? newCheckOut : undefined,
                amenities: activeTab === 'stays' ? [...newAmenities] : undefined
            };

            const updatedList = [...list, itemToAdd];
            handleSave({ [activeTab]: updatedList });

            // Reset fields
            setNewItem('');
            setNewCity('');
            setNewRemarks('');
            setNewDishes([]);
            setNewAddDishName('');
            setNewAddDishRating('good');
            setNewMapLink('');
            setNewDistance('');
            setNewAltitude('');
            setNewDifficulty('Beginner');
            setNewBestTime('');
            setNewPermit('No');
            setNewTimeTaken('');
            setNewTerrain('');
            setNewSafetyAlerts(false);
            setNewIsVisited(false);
            setNewCuisines([]);
            setNewAmbiences([]);
            setNewTripTypes([]);
            setNewSeason('All Year');
            setNewTravelDuration('');
            setNewPriority('Medium');
            setNewStayType('Hotel');
            setNewCheckIn('');
            setNewCheckOut('');
            setNewAmenities([]);

            if (isGridView) {
                setUploadedImagePath('');
                const fileInput = document.getElementById('add-image-upload');
                if (fileInput) fileInput.value = '';
            }
        };

        const removeItem = (e, index) => {
            if (e && e.stopPropagation) e.stopPropagation();

            if (!window.confirm("Are you sure you want to delete this item?")) return;

            if (!data) return;
            const list = data[activeTab] || [];
            const updatedList = list.filter((_, i) => i !== index);
            handleSave({ [activeTab]: updatedList });

            if (editingIndex === index) {
                cancelEdit();
            }
        };

        const toggleHighlight = (e, item) => {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!data) return;

            const highlightsList = [...(data.highlights || [])];
            const itemName = typeof item === 'object' ? item.name : item;
            const isObj = typeof item === 'object' && item !== null;
            
            const existingIndex = highlightsList.findIndex(h => (typeof h === 'object' ? h.name : h) === itemName);
            
            if (existingIndex >= 0) {
                highlightsList.splice(existingIndex, 1);
            } else {
                highlightsList.push(isObj ? { ...item } : { name: itemName });
            }
            
            handleSave({ highlights: highlightsList });
        };

        const moveToVisited = (e, index, targetTab) => {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!data) return;
            
            const bucketList = data.bucketList || [];
            const itemToMove = bucketList[index];
            if (!itemToMove) return;

            // Make sure we carry over name and city natively, and mark as visited for Treks
            const transferredItem = { ...itemToMove };
            if (targetTab === 'treks') {
                transferredItem.isVisited = true;
            }

            const updatedBucketList = bucketList.filter((_, i) => i !== index);
            const targetList = data[targetTab] || [];
            const updatedTargetList = [...targetList, transferredItem];

            handleSave({ 
                bucketList: updatedBucketList,
                [targetTab]: updatedTargetList 
            });
        };

        const startEdit = (index, item) => {
            setEditingIndex(index);
            if (typeof item === 'object' && item !== null) {
                setEditItem({
                    ...item,
                    name: item.name || '',
                    city: item.city || '',
                    remarks: item.remarks || '',
                    image: item.image || '',
                    mapLink: item.mapLink || '',
                    dishes: item.dishes || [],
                    cuisines: item.cuisines || [],
                    ambiences: item.ambiences || [],
                    tripTypes: item.tripTypes || [],
                    season: item.season || 'All Year',
                    travelDuration: item.travelDuration || '',
                    priority: item.priority || 'Medium',
                    distance: item.distance || '',
                    altitude: item.altitude || '',
                    difficulty: item.difficulty || 'Beginner',
                    bestTime: item.bestTime || '',
                    permit: item.permit || 'No',
                    timeTaken: item.timeTaken || '',
                    terrain: item.terrain || '',
                    safetyAlerts: item.safetyAlerts || false,
                    isVisited: item.isVisited || false
                });
            } else {
                setEditItem({ name: item, city: '', remarks: '', image: '', mapLink: '', dishes: [], cuisines: [], ambiences: [], tripTypes: [], season: 'All Year', travelDuration: '', priority: 'Medium', distance: '', altitude: '', difficulty: 'Beginner', bestTime: '', permit: 'No', timeTaken: '', terrain: '', safetyAlerts: false, isVisited: false });
            }
            setNewDishName('');
            setNewDishRating('good');
        };

        const cancelEdit = () => {
            setEditingIndex(-1);
            setEditItem({ name: '', city: '', remarks: '', image: '', mapLink: '', dishes: [], cuisines: [], ambiences: [], tripTypes: [], season: 'All Year', travelDuration: '', priority: 'Medium', distance: '', altitude: '', difficulty: 'Beginner', bestTime: '', permit: 'No', timeTaken: '', terrain: '', safetyAlerts: false, isVisited: false });
            setNewDishName('');
            setNewDishRating('good');
        };

        const saveEdit = (index) => {
            if (!editItem.name.trim()) return;

            const list = [...(data[activeTab] || [])];

            const updatedItem = {
                name: editItem.name.trim(),
                city: editItem.city.trim() || '-',
                remarks: editItem.remarks.trim() || '-',
                image: editItem.image
            };
            
            if (activeTab === 'restaurants') {
                if (editItem.mapLink) {
                    updatedItem.mapLink = editItem.mapLink.trim();
                }
                if (editItem.dishes && editItem.dishes.length > 0) {
                    updatedItem.dishes = editItem.dishes;
                }
                if (editItem.cuisines && editItem.cuisines.length > 0) {
                    updatedItem.cuisines = editItem.cuisines;
                }
                if (editItem.ambiences && editItem.ambiences.length > 0) {
                    updatedItem.ambiences = editItem.ambiences;
                }
            }
            if (activeTab === 'bucketList') {
                if (editItem.tripTypes && editItem.tripTypes.length > 0) {
                    updatedItem.tripTypes = editItem.tripTypes;
                }
                if (editItem.season) updatedItem.season = editItem.season;
                if (editItem.travelDuration) updatedItem.travelDuration = editItem.travelDuration.trim();
                if (editItem.priority) updatedItem.priority = editItem.priority;
            }
            if (activeTab === 'treks') {
                if (editItem.distance) updatedItem.distance = editItem.distance.trim();
                if (editItem.altitude) updatedItem.altitude = editItem.altitude.trim();
                if (editItem.difficulty) updatedItem.difficulty = editItem.difficulty;
                if (editItem.bestTime) updatedItem.bestTime = editItem.bestTime.trim();
                updatedItem.permit = editItem.permit;
                if (editItem.timeTaken) updatedItem.timeTaken = editItem.timeTaken.trim();
                if (editItem.terrain) updatedItem.terrain = editItem.terrain.trim();
                updatedItem.safetyAlerts = editItem.safetyAlerts;
                updatedItem.isVisited = editItem.isVisited;
                if (editItem.mapLink) updatedItem.mapLink = editItem.mapLink.trim();
            }
            if (activeTab === 'stays') {
                if (editItem.stayType) updatedItem.stayType = editItem.stayType;
                if (editItem.checkIn) updatedItem.checkIn = editItem.checkIn;
                if (editItem.checkOut) updatedItem.checkOut = editItem.checkOut;
                if (editItem.amenities && editItem.amenities.length > 0) {
                    updatedItem.amenities = editItem.amenities;
                }
            }

            list[index] = updatedItem;

            handleSave({ [activeTab]: list });
            cancelEdit();
        };

        const addDishToEdit = (e) => {
            e.preventDefault();
            if (!newDishName.trim()) return;
            setEditItem(prev => ({
                ...prev,
                dishes: [...(prev.dishes || []), { name: newDishName.trim(), rating: newDishRating }]
            }));
            setNewDishName('');
            setNewDishRating('good');
        };

        const removeDishFromEdit = (dishIndex) => {
            setEditItem(prev => ({
                ...prev,
                dishes: (prev.dishes || []).filter((_, i) => i !== dishIndex)
            }));
        };

        if (!data) return <div className="p-8 text-center text-text-muted">Loading...</div>;

        const activeSection = SECTIONS.find(s => s.id === activeTab);
        const currentList = data[activeTab] || [];

        const filteredList = currentList
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const text = (typeof item === 'object' && item !== null) ? ((item.name || '') + (item.city || '') + (item.remarks || '')) : (item || '');
                return String(text).toLowerCase().includes(String(searchTerm).toLowerCase());
            });

        const isGridView = activeTab === 'food' && isLocalhost;

        // Dynamic placeholder logic
        const getPlaceholder = () => {
            // e.g. "Add place name...", "Add restaurant name..."
            const base = activeSection.label;
            // simple heuristic: remove 's' or specific tweaks
            if (activeTab === 'placesVisited') return 'Place Name...';
            if (activeTab === 'food') return 'Dish Name...';
            if (activeTab === 'restaurants') return 'Restaurant Name...';
            return `Add ${base.toLowerCase().replace(/s$/, '')} name...`;
        };

        // Calculate Total Kms for visited treks
        let totalTrekKms = 0;
        if (activeTab === 'treks' && currentList.length > 0) {
            totalTrekKms = currentList.reduce((sum, item) => {
                if (item && typeof item === 'object' && item.isVisited && item.distance) {
                    const match = item.distance.match(/[\d.]+/);
                    if (match) return sum + parseFloat(match[0]);
                }
                return sum;
            }, 0);
        }

        return (
            <div className="state-details-container fade-in">
                {/* Hero Header */}
                <div className="details-hero">
                    <div className="hero-content">
                        <button onClick={onBack} className="back-btn group">
                            <div className="icon-circle bg-white/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                <i className="ph-bold ph-arrow-left"></i>
                            </div>
                            <span>Back to Dashboard</span>
                        </button>

                        <div className="title-row">
                            <h1 className="state-title">{stateName}</h1>
                            <button
                                onClick={toggleVisited}
                                className={`visited-toggle ${data.visited ? 'is-visited' : ''}`}
                            >
                                <i className={data.visited ? "ph-fill ph-check-circle" : "ph-bold ph-circle"}></i>
                                {data.visited ? "Visited" : "Mark Visited"}
                            </button>
                        </div>
                    </div>
                    <div className="hero-bg-gradient"></div>
                </div>

                {/* Tabs Bar */}
                <div className="tabs-sticky-wrapper">
                    <div className="tabs-container">
                        {SECTIONS.map(section => {
                            const count = (data[section.id] || []).length;
                            const isActive = activeTab === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => { setActiveTab(section.id); }}
                                    className={`tab-item ${isActive ? 'active' : ''}`}
                                >
                                    <i className={`ph ${isActive ? 'ph-fill' : 'ph-bold'} ${section.icon}`}></i>
                                    <span>{section.label}</span>
                                    {count > 0 && <span className="tab-badge">{count}</span>}
                                    {isActive && <div className="active-indicator"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="content-area container mx-auto">

                    {/* Treks Global Stats */}
                    {activeTab === 'treks' && (
                        <div className="flex justify-between items-center bg-background-alt p-3 rounded-lg border border-border/50 mb-4 shadow-sm">
                            <div className="flex items-center gap-2 text-text">
                                <i className="ph-fill ph-mountains text-xl text-primary"></i>
                                <span className="font-semibold">Total Kms Covered:</span>
                                <span className="text-sm text-text-muted">
                                    {totalTrekKms.toFixed(1).replace(/\.0$/, '')} km from {currentList.filter(i => i && typeof i === 'object' && i.isVisited).length} visited treks
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="toolbar-row">
                        <div className="search-wrapper">
                            <i className="ph-bold ph-magnifying-glass"></i>
                            <input
                                type="text"
                                placeholder={`Search in ${activeSection.label}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Enhanced Add Form (Universal) */}
                        <form onSubmit={addItem} className={`add-input-wrapper ${isGridView ? 'grid-mode-extended' : 'universal-extended'} ${(activeTab === 'restaurants' || activeTab === 'treks' || activeTab === 'bucketList') ? 'column-extended' : ''}`}>
                            <div className="form-main-row">
                                <div className="inputs-group">
                                    <input
                                        type="text"
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        placeholder={getPlaceholder()}
                                        className="main-input"
                                    />
                                    <React.Fragment>
                                        <input
                                            type="text"
                                            value={newRemarks}
                                            onChange={(e) => setNewRemarks(e.target.value)}
                                            placeholder={activeTab === 'food' ? "Restaurant..." : "Notes..."}
                                            className="sub-input"
                                        />
                                        <input
                                            type="text"
                                            value={newCity}
                                            onChange={(e) => setNewCity(e.target.value)}
                                            placeholder="City..."
                                            className="sub-input"
                                        />
                                        {activeTab === 'restaurants' && (
                                            <input
                                                type="text"
                                                value={newMapLink}
                                                onChange={(e) => setNewMapLink(e.target.value)}
                                                placeholder="Maps Link (URL)..."
                                                className="sub-input"
                                            />
                                        )}
                                        {activeTab === 'treks' && (
                                            <div className="flex items-center ml-2">
                                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-muted hover:text-text">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={newIsVisited}
                                                        onChange={(e) => setNewIsVisited(e.target.checked)}
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                                                    />
                                                    Visited?
                                                </label>
                                            </div>
                                        )}
                                    </React.Fragment>
                                </div>

                                {/* File Upload for Grid Mode */}
                                {isGridView && (
                                    <div className="file-upload-container">
                                        <label htmlFor="add-image-upload" className={`upload-label ${uploadedImagePath ? 'uploaded' : ''}`}>
                                            <i className={`ph-bold ${uploading ? 'ph-spinner ph-spin' : uploadedImagePath ? 'ph-check' : 'ph-image'}`}></i>
                                        </label>
                                        <input
                                            type="file"
                                            id="add-image-upload"
                                            accept="image/*"
                                            onChange={handleAddFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}

                                <button type="submit" disabled={!newItem.trim() || uploading} className="add-btn">
                                    <i className="ph-bold ph-plus"></i>
                                </button>
                            </div>

                            {/* Dish Manager inside Add Form */}
                            {activeTab === 'restaurants' && (
                                <div className="dish-manager-container">
                                    <div className="dish-manager-label">Add Dishes (Optional)</div>
                                    <div className="dish-inputs">
                                        <input 
                                            type="text" 
                                            className="edit-input" 
                                            placeholder="Dish Name" 
                                            value={newAddDishName} 
                                            onChange={(e) => setNewAddDishName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newAddDishName.trim()) {
                                                        setNewDishes(prev => [...prev, { name: newAddDishName.trim(), rating: newAddDishRating }]);
                                                        setNewAddDishName('');
                                                    }
                                                }
                                            }}
                                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.9rem' }}
                                        />
                                        <select 
                                            className="edit-input"
                                            value={newAddDishRating}
                                            onChange={(e) => setNewAddDishRating(e.target.value)}
                                            style={{ width: '120px', padding: '0.6rem', fontSize: '0.9rem' }}
                                        >
                                            <option value="good">Good</option>
                                            <option value="avg">Avg</option>
                                            <option value="bad">Bad</option>
                                            <option value="others">Others</option>
                                        </select>
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (newAddDishName.trim()) {
                                                    setNewDishes(prev => [...prev, { name: newAddDishName.trim(), rating: newAddDishRating }]);
                                                    setNewAddDishName('');
                                                }
                                            }} 
                                            className="action-btn success"
                                            style={{ 
                                                width: 'auto', 
                                                height: 'auto', 
                                                padding: '0.5rem 1rem', 
                                                borderRadius: '4px',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                display: 'flex',
                                                gap: '0.3rem'
                                            }}
                                        >
                                            <i className="ph-bold ph-plus"></i> <span>Add</span>
                                        </button>
                                    </div>
                                    {newDishes.length > 0 && (
                                        <div className="dish-list" style={{ marginTop: '0.5rem' }}>
                                            {newDishes.map((dish, i) => (
                                                <div key={i} className={`dish-badge rating-${dish.rating}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <span>{dish.name}</span>
                                                    <i className="ph-bold ph-x" style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setNewDishes(prev => prev.filter((_, idx) => idx !== i))}></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Cuisines & Ambience Multi-select */}
                                    <div className="mt-4 border-t border-dashed border-border pt-3">
                                        <div className="mb-3">
                                            <div className="dish-manager-label mb-2">Cuisine</div>
                                            <div className="flex flex-wrap gap-2">
                                                {CUISINE_OPTIONS.map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setNewCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]) }}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newCuisines.includes(c) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/50'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="dish-manager-label mb-2">Ambience</div>
                                            <div className="flex flex-wrap gap-2">
                                                {AMBIENCE_OPTIONS.map(a => (
                                                    <button
                                                        key={a}
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setNewAmbiences(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]) }}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newAmbiences.includes(a) ? 'bg-secondary text-white border-secondary' : 'bg-background border-border text-text-secondary hover:border-secondary/50'}`}
                                                    >
                                                        {a}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Trek Extra Details inside Add Form */}
                            {activeTab === 'treks' && (
                                <div className="dish-manager-container mt-3 p-4 bg-background-alt rounded-lg border border-border/50">
                                    <div className="dish-manager-label text-sm font-semibold mb-3 flex justify-between items-center">
                                        <span>Trek Specifications</span>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-red-400 hover:text-red-500">
                                            <input 
                                                type="checkbox" 
                                                checked={newSafetyAlerts}
                                                onChange={(e) => setNewSafetyAlerts(e.target.checked)}
                                                className="w-4 h-4 rounded border-border text-red-500 focus:ring-red-500 bg-background"
                                            />
                                            ⚠️ Leech/Safety Alert
                                        </label>
                                    </div>
                                    <div className="trek-specs-grid">
                                        <input
                                            type="text"
                                            value={newDistance}
                                            onChange={(e) => setNewDistance(e.target.value)}
                                            placeholder="Distance (km)"
                                            className="edit-input"
                                        />
                                        <input
                                            type="text"
                                            value={newAltitude}
                                            onChange={(e) => setNewAltitude(e.target.value)}
                                            placeholder="Altitude (ft)"
                                            className="edit-input"
                                        />
                                        <input
                                            type="text"
                                            value={newTimeTaken}
                                            onChange={(e) => setNewTimeTaken(e.target.value)}
                                            placeholder="Time (e.g. 4 hrs)"
                                            className="edit-input"
                                        />
                                        <select
                                            value={newDifficulty}
                                            onChange={(e) => setNewDifficulty(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        
                                        <select
                                            value={newTerrain}
                                            onChange={(e) => setNewTerrain(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            <option value="">Select Terrain</option>
                                            <option value="Forest & Mud Paths">Forest & Mud Paths</option>
                                            <option value="Rocky Paths & Big Stones">Rocky Paths & Big Stones</option>
                                            <option value="Steep Climbs">Steep Climbs</option>
                                            <option value="Stone Steps">Stone Steps</option>
                                            <option value="Snow & Ice Trails">Snow & Ice Trails</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newBestTime}
                                            onChange={(e) => setNewBestTime(e.target.value)}
                                            placeholder="Best Time (e.g. Sep-Feb)"
                                            className="edit-input"
                                        />
                                        <select
                                            value={newPermit}
                                            onChange={(e) => setNewPermit(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            <option value="No">No Permit Required</option>
                                            <option value="Yes">Permit Required</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newMapLink}
                                            onChange={(e) => setNewMapLink(e.target.value)}
                                            placeholder="Maps Link (URL)"
                                            className="edit-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Bucket List Details inside Add Form */}
                            {activeTab === 'bucketList' && (
                                <div className="dish-manager-container mt-3 p-4 bg-background-alt rounded-lg border border-border/50">
                                    <div className="dish-manager-label text-sm font-semibold mb-3">Bucket List Specifications</div>
                                    <div className="trek-specs-grid mb-4">
                                        <input
                                            type="text"
                                            value={newTravelDuration}
                                            onChange={(e) => setNewTravelDuration(e.target.value)}
                                            placeholder="Travel Duration (e.g. 2 hrs)"
                                            className="edit-input"
                                        />
                                        <select
                                            value={newSeason}
                                            onChange={(e) => setNewSeason(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <select
                                            value={newPriority}
                                            onChange={(e) => setNewPriority(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <div className="dish-manager-label mb-2">Trip Type / Category</div>
                                        <div className="flex flex-wrap gap-2">
                                            {TRIP_TYPE_OPTIONS.map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setNewTripTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]) }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newTripTypes.includes(t) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/50'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stays Details inside Add Form */}
                            {activeTab === 'stays' && (
                                <div className="dish-manager-container mt-3 p-4 bg-background-alt rounded-lg border border-border/50">
                                    <div className="dish-manager-label text-sm font-semibold mb-3">Stay Details</div>
                                    <div className="trek-specs-grid mb-4">
                                        <select
                                            value={newStayType}
                                            onChange={(e) => setNewStayType(e.target.value)}
                                            className="edit-input bg-background"
                                        >
                                            {STAY_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-muted">In:</span>
                                            <input
                                                type="date"
                                                value={newCheckIn}
                                                onChange={(e) => setNewCheckIn(e.target.value)}
                                                className="edit-input w-full"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-muted">Out:</span>
                                            <input
                                                type="date"
                                                value={newCheckOut}
                                                onChange={(e) => setNewCheckOut(e.target.value)}
                                                className="edit-input w-full"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="dish-manager-label mb-2">Amenities</div>
                                        <div className="flex flex-wrap gap-2">
                                            {AMENITY_OPTIONS.map(a => (
                                                <button
                                                    key={a}
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setNewAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]) }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newAmenities.includes(a) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/50'}`}
                                                >
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Content View */}
                    {isGridView ? (
                        <div className="food-grid-view">
                            {filteredList.length === 0 ? (
                                <div className="empty-state-card">
                                    <i className="ph-duotone ph-pizza"></i>
                                    <p>No food items to try yet.</p>
                                </div>
                            ) : (
                                <div className="food-grid">
                                    {filteredList.map(({ item, index }) => {
                                        const isEditing = editingIndex === index;
                                        const isObj = typeof item === 'object';
                                        const name = isObj ? item.name : item;
                                        const image = (isObj && item.image) ? item.image : null;
                                        const city = (isObj && item.city) ? item.city : '-';
                                        const restaurant = (isObj && item.remarks) ? item.remarks : '-';

                                        if (isEditing) {
                                            return (
                                                <div key={index} className="food-card editing fade-in">
                                                    <div className="card-image-area edit-mode">
                                                        {/* Edit Image Upload */}
                                                        {editItem.image ? (
                                                            <img src={editItem.image} alt="Preview" />
                                                        ) : (
                                                            <div className="placeholder-icon"><i className="ph-duotone ph-image"></i></div>
                                                        )}
                                                        <label htmlFor={`edit-upload-${index}`} className="edit-image-overlay">
                                                            <i className={`ph-bold ${editUploading ? 'ph-spinner ph-spin' : 'ph-camera'}`}></i>
                                                            <span>Change</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id={`edit-upload-${index}`}
                                                            accept="image/*"
                                                            onChange={handleEditFileChange}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </div>
                                                    <div className="card-info edit-form">
                                                        <input
                                                            value={editItem.name}
                                                            onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                                            placeholder="Dish Name"
                                                            className="edit-field name"
                                                            autoFocus
                                                        />
                                                        <input
                                                            value={editItem.remarks}
                                                            onChange={e => setEditItem({ ...editItem, remarks: e.target.value })}
                                                            placeholder="Restaurant"
                                                            className="edit-field"
                                                        />
                                                        <input
                                                            value={editItem.city}
                                                            onChange={e => setEditItem({ ...editItem, city: e.target.value })}
                                                            placeholder="City"
                                                            className="edit-field"
                                                        />
                                                        <div className="edit-actions">
                                                            <button onClick={() => saveEdit(index)} className="save-btn"><i className="ph-bold ph-check"></i> Save</button>
                                                            <button onClick={cancelEdit} className="cancel-btn"><i className="ph-bold ph-x"></i></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div key={index} className="food-card fade-in-up" style={{ animationDelay: index * 0.05 + 's' }}>
                                                <div className="card-image-area">
                                                    {image ? (
                                                        <img src={image} alt={name} onError={(e) => e.target.style.display = 'none'} />
                                                    ) : (
                                                        <div className="placeholder-icon">
                                                            <i className="ph-duotone ph-fork-knife"></i>
                                                        </div>
                                                    )}
                                                    <div className="card-overlay">
                                                        <button onClick={() => startEdit(index, item)} className="icon-btn-overlay" title="Edit">
                                                            <i className="ph-bold ph-pencil-simple"></i>
                                                        </button>
                                                        <button onClick={(e) => removeItem(e, index)} className="icon-btn-overlay delete" title="Remove">
                                                            <i className="ph-bold ph-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="card-info">
                                                    <h3>{name}</h3>
                                                    {(restaurant !== '-' || city !== '-') && (
                                                        <div className="card-details">
                                                            {restaurant !== '-' && <div className="detail-row"><i className="ph-fill ph-storefront"></i> <span>{restaurant}</span></div>}
                                                            {city !== '-' && <div className="detail-row"><i className="ph-fill ph-map-pin"></i> <span>{city}</span></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Table View (Default) */
                        <div className="table-card">
                            <table className="details-table">
                                <thead>
                                    <tr>
                                        <th className="col-name">Name / Item</th>
                                        <th className="col-city">Location</th>
                                        <th className="col-remarks">Notes</th>
                                        {activeTab === 'restaurants' && <th className="col-dishes">Dishes</th>}
                                        {activeTab === 'treks' && <th className="col-trek-details">Trek Details</th>}
                                        {activeTab === 'bucketList' && <th className="col-bucket-details">Bucket Details</th>}
                                        {activeTab === 'stays' && <th className="col-stay-details">Stay Details</th>}
                                        <th className="col-actions text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan={(activeTab === 'restaurants' || activeTab === 'treks') ? 5 : 4}>
                                                <div className="empty-table-state">
                                                    <i className={`ph-duotone ${activeSection.icon}`}></i>
                                                    <p>No items added yet. Start exploring!</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredList.map(({ item, index }) => {
                                            const isEditing = editingIndex === index;

                                            if (isEditing) {
                                                return (
                                                    <tr key={index} className="edit-row">
                                                        <td className="col-name">
                                                            <input
                                                                type="text"
                                                                className="edit-input mb-2"
                                                                value={editItem.name}
                                                                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                                                                placeholder="Name"
                                                                autoFocus
                                                            />
                                                            {(activeTab === 'restaurants' || activeTab === 'treks') && (
                                                                <input
                                                                    type="text"
                                                                    className="edit-input text-sm"
                                                                    value={editItem.mapLink || ''}
                                                                    onChange={(e) => setEditItem({ ...editItem, mapLink: e.target.value })}
                                                                    placeholder="Google Maps Link"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="col-city">
                                                            <input
                                                                type="text"
                                                                className="edit-input"
                                                                value={editItem.city}
                                                                onChange={(e) => setEditItem({ ...editItem, city: e.target.value })}
                                                                placeholder="City/Location"
                                                            />
                                                        </td>
                                                        <td className="col-remarks">
                                                            <input
                                                                type="text"
                                                                className="edit-input"
                                                                value={editItem.remarks}
                                                                onChange={(e) => setEditItem({ ...editItem, remarks: e.target.value })}
                                                                placeholder="Notes/Remarks"
                                                            />
                                                        </td>
                                                        {activeTab === 'treks' && (
                                                            <td className="col-trek-details">
                                                                <div className="grid grid-cols-2 gap-1 bg-background-alt p-2 rounded border border-border/30">
                                                                    <input type="text" className="edit-input text-xs w-full" value={editItem.distance || ''} onChange={(e) => setEditItem({ ...editItem, distance: e.target.value })} placeholder="Dist (km)" />
                                                                    <input type="text" className="edit-input text-xs w-full" value={editItem.altitude || ''} onChange={(e) => setEditItem({ ...editItem, altitude: e.target.value })} placeholder="Alt (ft)" />
                                                                    <select className="edit-input text-xs w-full bg-background" value={editItem.difficulty || 'Beginner'} onChange={(e) => setEditItem({ ...editItem, difficulty: e.target.value })}>
                                                                        <option value="Beginner">Beg</option>
                                                                        <option value="Medium">Med</option>
                                                                        <option value="Hard">Hard</option>
                                                                    </select>
                                                                    <input type="text" className="edit-input text-xs w-full" value={editItem.timeTaken || ''} onChange={(e) => setEditItem({ ...editItem, timeTaken: e.target.value })} placeholder="Time" />
                                                                    <select className="edit-input text-xs w-full bg-background" value={editItem.terrain || ''} onChange={(e) => setEditItem({ ...editItem, terrain: e.target.value })}>
                                                                        <option value="">Select Terrain</option>
                                                                        <option value="Forest & Mud Paths">Forest & Mud Paths</option>
                                                                        <option value="Rocky Paths & Big Stones">Rocky Paths & Big Stones</option>
                                                                        <option value="Steep Climbs">Steep Climbs</option>
                                                                        <option value="Stone Steps">Stone Steps</option>
                                                                        <option value="Snow & Ice Trails">Snow & Ice Trails</option>
                                                                    </select>
                                                                    <input type="text" className="edit-input text-xs w-full" value={editItem.bestTime || ''} onChange={(e) => setEditItem({ ...editItem, bestTime: e.target.value })} placeholder="Season" />
                                                                    <select className="edit-input text-xs w-full bg-background" value={editItem.permit || 'No'} onChange={(e) => setEditItem({ ...editItem, permit: e.target.value })}>
                                                                        <option value="No">No Permit</option>
                                                                        <option value="Yes">Permit Reqd</option>
                                                                    </select>
                                                                    <label className="flex items-center gap-1 text-xs text-red-500 whitespace-nowrap overflow-hidden">
                                                                        <input type="checkbox" checked={editItem.safetyAlerts || false} onChange={(e) => setEditItem({ ...editItem, safetyAlerts: e.target.checked })} />
                                                                        Alert
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'restaurants' && (
                                                            <td className="col-dishes">
                                                                <div className="dish-manager mb-2">
                                                                    <div className="dish-inputs flex gap-1 mb-2">
                                                                        <input 
                                                                            type="text" 
                                                                            className="edit-input flex-1 p-1 text-sm" 
                                                                            placeholder="Dish" 
                                                                            value={newDishName} 
                                                                            onChange={(e) => setNewDishName(e.target.value)}
                                                                            onKeyDown={(e) => e.key === 'Enter' && addDishToEdit(e)}
                                                                        />
                                                                        <select 
                                                                            className="edit-input w-20 p-1 text-sm bg-transparent"
                                                                            value={newDishRating}
                                                                            onChange={(e) => setNewDishRating(e.target.value)}
                                                                        >
                                                                            <option value="good">Good</option>
                                                                            <option value="avg">Avg</option>
                                                                            <option value="bad">Bad</option>
                                                                            <option value="others">Others</option>
                                                                        </select>
                                                                        <button type="button" onClick={addDishToEdit} className="action-btn success w-8 h-8"><i className="ph-bold ph-plus"></i></button>
                                                                    </div>
                                                                    <div className="dish-list flex flex-wrap gap-1">
                                                                        {(editItem.dishes || []).map((dish, i) => (
                                                                            <div key={i} className={`dish-badge rating-${dish.rating} flex items-center gap-1`}>
                                                                                <span>{dish.name}</span>
                                                                                <i className="ph-bold ph-x cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeDishFromEdit(i)}></i>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="border-t border-border/50 pt-2 mb-2">
                                                                    <div className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Cuisines</div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {CUISINE_OPTIONS.map(c => (
                                                                            <button
                                                                                key={c}
                                                                                type="button"
                                                                                onClick={(e) => { e.preventDefault(); setEditItem(prev => ({ ...prev, cuisines: (prev.cuisines || []).includes(c) ? (prev.cuisines || []).filter(x => x !== c) : [...(prev.cuisines || []), c] })) }}
                                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${(editItem.cuisines || []).includes(c) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary'}`}
                                                                            >
                                                                                {c}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="border-t border-border/50 pt-2">
                                                                    <div className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Ambiences</div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {AMBIENCE_OPTIONS.map(a => (
                                                                            <button
                                                                                key={a}
                                                                                type="button"
                                                                                onClick={(e) => { e.preventDefault(); setEditItem(prev => ({ ...prev, ambiences: (prev.ambiences || []).includes(a) ? (prev.ambiences || []).filter(x => x !== a) : [...(prev.ambiences || []), a] })) }}
                                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${(editItem.ambiences || []).includes(a) ? 'bg-secondary text-white border-secondary' : 'bg-background border-border text-text-secondary'}`}
                                                                            >
                                                                                {a}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'bucketList' && (
                                                            <td className="col-bucket-details">
                                                                <div className="grid grid-cols-2 gap-1 bg-background-alt p-2 rounded border border-border/30 mb-2">
                                                                    <input type="text" className="edit-input text-xs w-full" value={editItem.travelDuration || ''} onChange={(e) => setEditItem({ ...editItem, travelDuration: e.target.value })} placeholder="Duration (e.g. 2 hrs)" />
                                                                    <select className="edit-input text-xs w-full bg-background" value={editItem.season || 'All Year'} onChange={(e) => setEditItem({ ...editItem, season: e.target.value })}>
                                                                        {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                                    </select>
                                                                    <select className="edit-input text-xs w-full bg-background" value={editItem.priority || 'Medium'} onChange={(e) => setEditItem({ ...editItem, priority: e.target.value })}>
                                                                        {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {TRIP_TYPE_OPTIONS.map(t => (
                                                                        <button
                                                                            key={t}
                                                                            type="button"
                                                                            onClick={(e) => { e.preventDefault(); setEditItem(prev => ({...prev, tripTypes: (prev.tripTypes || []).includes(t) ? prev.tripTypes.filter(x => x !== t) : [...(prev.tripTypes||[]), t]})) }}
                                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${(editItem.tripTypes||[]).includes(t) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary'}`}
                                                                        >
                                                                            {t}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        )}
                                                        {activeTab === 'stays' && (
                                                            <td className="col-stay-details">
                                                                <div className="grid grid-cols-2 gap-1 bg-background-alt p-2 rounded border border-border/30 mb-2">
                                                                    <select className="edit-input text-xs w-full bg-background" value={editItem.stayType || 'Hotel'} onChange={(e) => setEditItem({ ...editItem, stayType: e.target.value })}>
                                                                        {STAY_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                                    </select>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[10px] text-text-muted">In:</span>
                                                                        <input type="date" className="edit-input text-xs w-full" value={editItem.checkIn || ''} onChange={(e) => setEditItem({ ...editItem, checkIn: e.target.value })} />
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[10px] text-text-muted">Out:</span>
                                                                        <input type="date" className="edit-input text-xs w-full" value={editItem.checkOut || ''} onChange={(e) => setEditItem({ ...editItem, checkOut: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {AMENITY_OPTIONS.map(a => (
                                                                        <button
                                                                            key={a}
                                                                            type="button"
                                                                            onClick={(e) => { e.preventDefault(); setEditItem(prev => ({...prev, amenities: (prev.amenities || []).includes(a) ? prev.amenities.filter(x => x !== a) : [...(prev.amenities||[]), a]})) }}
                                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${(editItem.amenities||[]).includes(a) ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary'}`}
                                                                        >
                                                                            {a}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className="text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <button onClick={() => saveEdit(index)} className="action-btn success" title="Save">
                                                                    <i className="ph-bold ph-check"></i>
                                                                </button>
                                                                <button onClick={cancelEdit} className="action-btn cancel" title="Cancel">
                                                                    <i className="ph-bold ph-x"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            const isObj = typeof item === 'object' && item !== null;
                                            const name = isObj ? item.name : item;
                                            const city = isObj ? item.city : '-';
                                            const remarks = isObj ? item.remarks : '-';
                                            const dishes = (isObj && item.dishes) ? item.dishes : [];
                                            const distance = isObj ? item.distance : '';
                                            const altitude = isObj ? item.altitude : '';
                                            const difficulty = isObj ? item.difficulty : 'Beginner';
                                            const bestTime = isObj ? item.bestTime : '';
                                            const timeTaken = isObj ? item.timeTaken : '';
                                            const terrain = isObj ? item.terrain : '';
                                            const permit = isObj ? item.permit : 'No';
                                            const safetyAlerts = isObj ? item.safetyAlerts : false;
                                            const isVisited = isObj ? item.isVisited : false;

                                            return (
                                                <tr key={index} className="fade-in-up">
                                                    <td className="col-name">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-lg">{name}</span>
                                                            {isObj && item.mapLink && (
                                                                <a href={item.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center p-1 rounded-full hover:bg-blue-500/10" title="View on Google Maps">
                                                                    <i className="ph-fill ph-map-pin text-xl"></i>
                                                                </a>
                                                            )}
                                                            {activeTab === 'treks' && (
                                                                <div className="flex items-center">
                                                                    <i className={`ph-fill ${isVisited ? 'ph-check-circle text-green-500' : 'ph-circle text-text-muted/50'} text-xl cursor-pointer hover:opacity-80 transition-opacity`} 
                                                                       onClick={() => {
                                                                           const list = [...(data[activeTab] || [])];
                                                                           const currentItem = list[index];
                                                                           if (typeof currentItem === 'string') {
                                                                               list[index] = { name: currentItem, isVisited: true };
                                                                           } else {
                                                                               list[index] = { ...currentItem, isVisited: !currentItem.isVisited };
                                                                           }
                                                                           handleSave({ [activeTab]: list });
                                                                       }} 
                                                                       title={isVisited ? "Mark as Not Visited" : "Mark as Visited"}></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="col-city">
                                                        <div className="cell-wrapper">
                                                            {city !== '-' && <i className="ph-fill ph-map-pin text-primary/60"></i>}
                                                            <span className={city === '-' ? 'text-disabled' : ''}>{city}</span>
                                                        </div>
                                                    </td>
                                                    <td className="col-remarks">
                                                        <span className={remarks === '-' ? 'text-disabled' : 'text-secondary'}>{remarks}</span>
                                                    </td>
                                                    {activeTab === 'restaurants' && (
                                                        <td className="col-dishes">
                                                            <div className="dish-list flex flex-wrap gap-1 mb-1">
                                                                {dishes.map((dish, i) => (
                                                                    <span key={i} className={`dish-badge rating-${dish.rating}`}>
                                                                        {dish.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                {(isObj && item.cuisines ? item.cuisines : []).map((c, i) => (
                                                                    <span key={'c'+i} className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                        <i className="ph-bold ph-bowl-food"></i> {c}
                                                                    </span>
                                                                ))}
                                                                {(isObj && item.ambiences ? item.ambiences : []).map((a, i) => (
                                                                    <span key={'a'+i} className="dish-badge" style={{ backgroundColor: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>
                                                                        <i className="ph-bold ph-sparkle"></i> {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {activeTab === 'treks' && (
                                                        <td className="col-trek-details">
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                <span className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                    <i className="ph-bold ph-ruler"></i> {distance ? (String(distance).toLowerCase().includes('km') ? distance : `${distance} km`) : '-'}
                                                                </span>
                                                                <span className="dish-badge" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                                                    <i className="ph-bold ph-mountains"></i> {altitude ? (String(altitude).toLowerCase().includes('ft') ? altitude : `${altitude} ft`) : '-'}
                                                                </span>
                                                                {timeTaken && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                                                        <i className="ph-bold ph-clock"></i> {timeTaken}
                                                                    </span>
                                                                )}
                                                                <span className="dish-badge" style={{
                                                                    backgroundColor: difficulty === 'Hard' ? 'rgba(239,68,68,0.2)' : difficulty === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                                                                    color: difficulty === 'Hard' ? '#ef4444' : difficulty === 'Medium' ? '#f59e0b' : '#10b981'
                                                                }}>
                                                                    <i className="ph-bold ph-barbell"></i> {difficulty}
                                                                </span>
                                                                {bestTime && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                                        <i className="ph-bold ph-calendar"></i> {bestTime}
                                                                    </span>
                                                                )}
                                                                {terrain && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(168,162,158,0.2)', color: '#78716c' }}>
                                                                        <i className="ph-bold ph-tree"></i> {terrain}
                                                                    </span>
                                                                )}
                                                                {permit === 'Yes' && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(217,119,6,0.15)', color: '#d97706' }}>
                                                                        <i className="ph-bold ph-ticket"></i> Permit Reqd
                                                                    </span>
                                                                )}
                                                                {safetyAlerts && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', animation: 'pulse 2s infinite' }}>
                                                                        <i className="ph-fill ph-warning"></i> Alert
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {activeTab === 'bucketList' && (
                                                        <td className="col-bucket-details">
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                {isObj && item.priority && (
                                                                    <span className="dish-badge" style={{
                                                                        backgroundColor: item.priority === 'High' ? 'rgba(239,68,68,0.2)' : item.priority === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                                                                        color: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#10b981'
                                                                    }}>
                                                                        <i className="ph-bold ph-flag"></i> {item.priority}
                                                                    </span>
                                                                )}
                                                                {isObj && item.travelDuration && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                        <i className="ph-bold ph-car"></i> {item.travelDuration}
                                                                    </span>
                                                                )}
                                                                {isObj && item.season && item.season !== 'All Year' && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                                        <i className="ph-bold ph-cloud-sun"></i> {item.season}
                                                                    </span>
                                                                )}
                                                                {(isObj && item.tripTypes ? item.tripTypes : []).map((t, i) => (
                                                                    <span key={'t'+i} className="dish-badge" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                                                        <i className="ph-bold ph-tag"></i> {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {activeTab === 'stays' && (
                                                        <td className="col-stay-details">
                                                            <div className="dish-list flex flex-wrap gap-1">
                                                                {isObj && item.stayType && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                                                        <i className="ph-bold ph-bed"></i> {item.stayType}
                                                                    </span>
                                                                )}
                                                                {isObj && item.checkIn && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                                        <i className="ph-bold ph-calendar-plus"></i> {item.checkIn}
                                                                    </span>
                                                                )}
                                                                {isObj && item.checkOut && (
                                                                    <span className="dish-badge" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                                                                        <i className="ph-bold ph-calendar-minus"></i> {item.checkOut}
                                                                    </span>
                                                                )}
                                                                {(isObj && item.amenities ? item.amenities : []).map((a, i) => (
                                                                    <span key={'a'+i} className="dish-badge" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                                                        {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="text-right">
                                                        <div className="action-group">
                                                            {activeTab === 'bucketList' && (
                                                                <React.Fragment>
                                                                    <button
                                                                        onClick={(e) => moveToVisited(e, index, 'placesVisited')}
                                                                        className="action-btn"
                                                                        style={{ color: 'var(--primary)', background: 'var(--primary-light)' }}
                                                                        title="Move to Places Visited"
                                                                    >
                                                                        <i className="ph-bold ph-map-pin"></i>
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => moveToVisited(e, index, 'treks')}
                                                                        className="action-btn"
                                                                        style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}
                                                                        title="Move to Treks"
                                                                    >
                                                                        <i className="ph-bold ph-mountains"></i>
                                                                    </button>
                                                                </React.Fragment>
                                                            )}
                                                            <button
                                                                onClick={(e) => toggleHighlight(e, item)}
                                                                className="action-btn"
                                                                style={{ 
                                                                    color: (data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? '#eab308' : 'var(--text-muted)', 
                                                                    background: (data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? 'rgba(234,179,8,0.1)' : 'var(--background-alt)' 
                                                                }}
                                                                title={(data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? "Remove from Highlights" : "Add to Highlights"}
                                                            >
                                                                <i className={(data.highlights || []).some(h => (typeof h === 'object' ? h.name : h) === name) ? "ph-fill ph-star" : "ph-bold ph-star"}></i>
                                                            </button>
                                                            <button
                                                                onClick={() => startEdit(index, item)}
                                                                className="action-btn edit"
                                                                title="Edit Item"
                                                            >
                                                                <i className="ph-bold ph-pencil-simple"></i>
                                                            </button>
                                                            <button
                                                                onClick={(e) => removeItem(e, index)}
                                                                className="action-btn delete"
                                                                title="Delete Item"
                                                            >
                                                                <i className="ph-bold ph-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <style>{`
                    .state-details-container {
                        min-height: 100vh;
                        background: var(--bg-app);
                        display: flex;
                        flex-direction: column;
                    }
                    /* ... (Styles omitted for brevity, keeping same styles) ... */
                    /* Reincluding previous styles to ensure consistency if file overwrite happened */
                    
                    /* Hero Section */
                    .details-hero {
                        position: relative;
                        padding: 2rem 2rem 1rem;
                        background: var(--bg-surface);
                        border-bottom: 1px solid var(--border);
                        overflow: hidden;
                    }

                    .hero-content {
                        position: relative;
                        z-index: 2;
                        max-width: 1200px;
                        margin: 0 auto;
                    }

                    .hero-bg-gradient {
                        position: absolute;
                        top: -50%;
                        right: -10%;
                        width: 600px;
                        height: 600px;
                        background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(0,0,0,0) 70%);
                        z-index: 1;
                        pointer-events: none;
                    }

                    .back-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        background: none;
                        border: none;
                        color: var(--text-muted);
                        cursor: pointer;
                        font-family: inherit;
                        font-size: 0.9rem;
                        margin-bottom: 1.5rem;
                        transition: color 0.2s;
                    }

                    .back-btn:hover {
                        color: var(--text-primary);
                    }

                    .icon-circle {
                        width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                    }

                    .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }

                    .state-title {
                        font-size: 3rem; font-weight: 800; letter-spacing: -0.05em;
                        background: linear-gradient(to right, #fff, #bfdbfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;
                    }

                    .visited-toggle {
                        background: var(--bg-surface-hover); border: 1px solid var(--border); color: var(--text-secondary); padding: 0.6rem 1.25rem;
                        border-radius: 100px; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; font-weight: 500;
                    }
                    .visited-toggle:hover { background: var(--bg-accent); color: var(--text-primary); }
                    .visited-toggle.is-visited { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }

                    /* Sticky Tabs */
                    .tabs-sticky-wrapper {
                        position: sticky; top: 0; z-index: 50; background: rgba(24, 27, 33, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 1rem;
                    }
                    .tabs-container { max-width: 1200px; margin: 0 auto; display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; }
                    .tabs-container::-webkit-scrollbar { display: none; }

                    .tab-item {
                        background: none; border: none; padding: 1.25rem 1rem; color: var(--text-muted); font-weight: 500; cursor: pointer;
                        display: flex; align-items: center; gap: 0.6rem; position: relative; white-space: nowrap; transition: color 0.2s;
                    }
                    .tab-item:hover { color: var(--text-primary); }
                    .tab-item.active { color: var(--primary); }
                    .active-indicator { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; box-shadow: 0 -2px 10px rgba(124, 58, 237, 0.5); }
                    .tab-badge { background: var(--bg-surface-hover); color: var(--text-primary); font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 10px; min-width: 1.5em; text-align: center; }
                    .tab-item.active .tab-badge { background: var(--primary); color: white; }

                    /* Content */
                    .content-area { padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
                    .toolbar-row { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
                    
                    .search-wrapper { flex: 1; min-width: 250px; position: relative; }
                    .search-wrapper i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                    .search-wrapper input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); color: var(--text-primary); transition: all 0.2s; }
                    .search-wrapper input:focus { outline: none; border-color: var(--primary); background: var(--bg-app); box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1); }

                    /* Layout for Add Form */
                    .add-input-wrapper {
                        display: flex; gap: 0.5rem; background: var(--bg-surface); padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius-lg);
                        align-items: center;
                        min-width: 400px;
                    }
                    .add-input-wrapper.grid-mode-extended { flex: 2; }
                    .add-input-wrapper.universal-extended { flex: 2; } /* Make wider normally too */
                    .add-input-wrapper.column-extended {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 1.25rem;
                        gap: 1rem;
                    }

                    .form-main-row { display: flex; width: 100%; gap: 0.5rem; align-items: center; }

                    .dish-manager-container {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        border-top: 1px dashed var(--border);
                        padding-top: 1rem;
                    }
                    .dish-manager-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 0.25rem; }
                    .dish-inputs { display: flex; gap: 0.5rem; }
                    
                    .trek-specs-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                        gap: 0.75rem;
                    }

                    .inputs-group { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; flex: 1; }
                    .add-input-wrapper input { background: transparent; border: none; color: var(--text-primary); }
                    .add-input-wrapper .main-input { width: 100%; font-weight: 500; font-size: 1rem; border-bottom: 1px dashed var(--border); padding-bottom: 0.5rem; }
                    .add-input-wrapper .sub-input { flex: 1; min-width: 120px; font-size: 0.9rem; padding-top: 0.2rem; color: var(--text-secondary); }
                    .add-input-wrapper input:focus { outline: none; }

                    .file-upload-container { padding: 0 0.5rem; border-left: 1px solid var(--border); }
                    .upload-label { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface-hover); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                    .upload-label:hover { background: var(--bg-accent); color: var(--text-primary); }
                    .upload-label.uploaded { background: rgba(16, 185, 129, 0.15); color: #10b981; }

                    .add-btn { background: var(--primary); color: white; border: none; border-radius: var(--radius-md); width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: background 0.2s; }
                    .add-btn:hover { background: var(--primary-hover); }
                    .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                    /* Table Styles */
                    .table-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg); }
                    .details-table { width: 100%; border-collapse: collapse; }
                    .details-table th, .details-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); text-align: left; }
                    .details-table th { background: rgba(255,255,255,0.02); color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
                    .details-table tr:hover td { background: rgba(255,255,255,0.03); }
                    .details-table input { background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.4rem; border-radius: 4px; width: 100%; }
                    .text-right { text-align: right; }
                    .col-name { width: 30%; } .col-city { width: 15%; } .col-remarks { width: 20%; } .col-dishes { width: 25%; } .col-actions { width: 10%; }
                    .cell-wrapper { display: flex; align-items: center; gap: 0.5rem; }
                    
                    .dish-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.35rem;
                    }
                    .dish-badge {
                        font-size: 0.75rem;
                        padding: 0.2rem 0.5rem;
                        border-radius: 12px;
                        white-space: nowrap;
                        color: #fff;
                        font-weight: 500;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.25rem;
                    }
                    .rating-good { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
                    .rating-avg { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
                    .rating-bad { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
                    .rating-others { background: rgba(148, 163, 184, 0.2); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }
                    
                    .dish-manager select option {
                        background: var(--bg-surface);
                        color: var(--text-primary);
                    }
                    .text-disabled { color: var(--text-muted); opacity: 0.5; font-style: italic; }
                    .text-secondary { color: var(--text-secondary); }

                    /* Action Buttons */
                    .action-group { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; opacity: 0; transform: translateX(10px); transition: all 0.2s; }
                    .details-table tr:hover .action-group { opacity: 1; transform: translateX(0); }
                    .action-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
                    .action-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
                    .action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                    .action-btn.edit:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                    .action-btn.success { color: #10b981; } .action-btn.success:hover { background: rgba(16, 185, 129, 0.1); }
                    .action-btn.cancel { color: #94a3b8; } .action-btn.cancel:hover { background: rgba(255,255,255,0.1); }

                    .edit-row { background: rgba(255, 255, 255, 0.02); }
                    .edit-input { width: 100%; background: var(--bg-app); border: 1px solid var(--primary); padding: 0.5rem; border-radius: var(--radius-sm); color: var(--text-primary); font-family: inherit; font-size: 1rem; }
                    .edit-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); }
                    
                    .empty-table-state { padding: 6rem 2rem; text-align: center; color: var(--text-muted); }
                    .empty-table-state i { font-size: 3.5rem; margin-bottom: 1.5rem; opacity: 0.3; }
                    .empty-table-state p { font-size: 1.1rem; }

                    /* Grid View Styles */
                    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                    .food-card { background: var(--bg-surface); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
                    .food-card:not(.editing):hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
                    
                    .card-image-area { aspect-ratio: 4/3; background: #1e1e24; position: relative; overflow: hidden; }
                    .card-image-area img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
                    .food-card:hover .card-image-area img { transform: scale(1.05); }
                    .placeholder-icon { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem; color: var(--text-muted); opacity: 0.3; }
                    
                    .card-overlay { position: absolute; top: 0; right: 0; padding: 0.5rem; display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; z-index: 2; }
                    .food-card:hover .card-overlay { opacity: 1; }
                    .icon-btn-overlay { background: rgba(0,0,0,0.6); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: 0.2s; }
                    .icon-btn-overlay:hover { background: var(--primary); } .icon-btn-overlay.delete:hover { background: #ef4444; }
                    
                    .card-info { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
                    .card-info h3 { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
                    .card-details { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--text-secondary); }
                    .detail-row { display: flex; align-items: center; gap: 0.5rem; }
                    .detail-row i { color: var(--primary); opacity: 0.8; }
                    
                    .food-card.editing { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); }
                    .card-image-area.edit-mode .edit-image-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
                    .card-image-area.edit-mode:hover .edit-image-overlay { opacity: 1; }
                    
                    .edit-form { gap: 0.5rem; }
                    .edit-field { background: var(--bg-app); border: 1px solid var(--border); color: var(--text-primary); padding: 0.5rem; border-radius: 4px; width: 100%; }
                    .edit-field:focus { outline: none; border-color: var(--primary); }
                    .edit-field.name { font-weight: 600; }
                    .edit-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
                    .save-btn, .cancel-btn { flex: 1; padding: 0.5rem; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
                    .save-btn { background: var(--primary); color: white; } .cancel-btn { background: var(--bg-surface-hover); color: var(--text-muted); }

                    .empty-state-card { grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
                    .empty-state-card i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; display: block; }
                    
                    /* Utility */
                    .fade-in { animation: fadeIn 0.4s ease-out; }
                    .fade-in-up { animation: fadeInUp 0.4s ease-out backwards; }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                    @media (max-width: 768px) {
                        .toolbar-row { flex-direction: column; }
                        .inputs-group { flex-direction: column; }
                        .add-input-wrapper { width: 100%; min-width: 0; }
                        .sub-input { border-left: none !important; border-top: 1px solid var(--border); }
                        .col-city, .col-remarks { display: none; } .col-name { width: 80%; }
                        .table-card { overflow-x: auto; }
                    }
                `}</style>
            </div>
        );
    };

    window.StateDetails = StateDetails;
    console.log("StateDetails component registered on window (v10 - Generalized Add)");
})();
