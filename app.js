const { useState, useEffect } = React;

// Simple icon components (replacing Lucide)
const RefreshIcon = () => React.createElement('svg', {
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2
}, React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }), React.createElement('path', { d: 'M21 3v5h-5' }), React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }), React.createElement('path', { d: 'M3 21v-5h5' }));

const MapIcon = () => React.createElement('svg', {
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2
}, React.createElement('path', { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91-6.91a6 6 0 0 1 7.94-7.94l3.77 3.77z' }));

const HomeIcon = () => React.createElement('svg', {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2
}, React.createElement('path', { d: 'M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9' }), React.createElement('path', { d: 'M9 22V12h6v10M2 10.6L12 2l10 8.6' }));

const AlertIcon = () => React.createElement('svg', {
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2
}, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 12, y1: 8, x2: 12, y2: 12 }), React.createElement('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 }));

const QuarterVacancyApp = () => {
  // Configuration - Replace with your actual credentials
  const SPREADSHEET_ID = '1CUe-rvS2JQYFsyMG8T3t5vQ0vu_uOuySVe_G7ejfEX0';
  const API_KEY = 'AIzaSyAtt2w_DmREy_Io04NR9SqkllNR6J-eZb8';
  
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [quarterData, setQuarterData] = useState([]);
  const [caretakerData, setCaretakerData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock caretaker data
  const mockCaretakerData = {
    'Akshaya': { name: 'Rajesh Kumar', number: '+91-9876543210', meetingPlace: 'Main Gate' },
    'Kormangala': { name: 'Suresh Babu', number: '+91-9876543211', meetingPlace: 'Reception' },
    'Madavara': { name: 'Ganesh Reddy', number: '+91-9876543212', meetingPlace: 'Admin Block' },
    'Yehalanka': { name: 'Ramesh Singh', number: '+91-9876543213', meetingPlace: 'Club House' },
    'Jayamahal': { name: 'Mahesh Gowda', number: '+91-9876543214', meetingPlace: 'Garden Area' }
  };

  // Mock data for demonstration - only vacant quarters
  const mockData = {
    'Akshaya': [
      { quarterNumber: 'Q-101', buildingNumber: 'B-1', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-103', buildingNumber: 'B-1', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-202', buildingNumber: 'B-2', vacancyStatus: 'Vacant' },
    ],
    'Kormangala': [
      { quarterNumber: 'Q-301', buildingNumber: 'B-3', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-302', buildingNumber: 'B-3', vacancyStatus: 'Vacant' },
    ],
    'Madavara': [
      { quarterNumber: 'Q-402', buildingNumber: 'B-4', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-404', buildingNumber: 'B-4', vacancyStatus: 'Vacant' },
    ],
    'Yehalanka': [
      { quarterNumber: 'Q-501', buildingNumber: 'B-5', vacancyStatus: 'Vacant' },
    ],
    'Jayamahal': [
      { quarterNumber: 'Q-602', buildingNumber: 'B-6', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-603', buildingNumber: 'B-6', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-605', buildingNumber: 'B-6', vacancyStatus: 'Vacant' },
    ]
  };

  // Initialize locations - fetch from Google Sheets
  useEffect(() => {
    fetchWorksheetNames();
  }, []);

  const fetchCaretakerData = async () => {
    try {
      const range = `Caretakers!A:D`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch caretaker data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.values && data.values.length > 1) {
        const caretakers = {};
        data.values.slice(1).forEach(row => {
          const place = row[0];
          if (place) {
            caretakers[place] = {
              name: row[1] || 'N/A',
              number: row[2] || 'N/A',
              meetingPlace: row[3] || 'N/A'
            };
          }
        });
        setCaretakerData(caretakers);
      }
    } catch (err) {
      console.error('Error fetching caretaker data:', err);
      // Fallback to mock caretaker data
      setCaretakerData(mockCaretakerData);
    }
  };

  const fetchWorksheetNames = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch spreadsheet info: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.sheets && data.sheets.length > 0) {
        const sheetNames = data.sheets
          .map(sheet => sheet.properties.title)
          .filter(name => name !== 'Caretakers'); // Exclude Caretakers sheet from locations
        
        setLocations(sheetNames);
        setSelectedLocation(sheetNames[0]);
        
        // Fetch caretaker data first, then quarter data
        await fetchCaretakerData();
        fetchGoogleSheetData(sheetNames[0]);
      } else {
        throw new Error('No worksheets found in the spreadsheet');
      }
    } catch (err) {
      setError(`Error fetching worksheet names: ${err.message}`);
      console.error('Error fetching worksheet names:', err);
      
      // Fallback to mock data
      const locationNames = ['Akshaya', 'Kormangala', 'Madavara', 'Yehalanka', 'Jayamahal'];
      setLocations(locationNames);
      setSelectedLocation(locationNames[0]);
      setCaretakerData(mockCaretakerData);
      setQuarterData(mockData[locationNames[0]] || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogleSheetData = async (sheetName) => {
    setLoading(true);
    setError(null);

    try {
      const range = `${sheetName}!A:C`; // Back to A:C since caretaker info is separate
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.values && data.values.length > 1) {
        const quarters = data.values.slice(1)
          .map(row => ({
            quarterNumber: row[0] || '',
            buildingNumber: row[1] || '',
            vacancyStatus: row[2] || 'Unknown'
          }))
          .filter(quarter => quarter.vacancyStatus.toLowerCase() === 'vacant');
        
        setQuarterData(quarters);
      } else {
        setQuarterData([]);
      }
    } catch (err) {
      setError(`Error fetching data: ${err.message}`);
      console.error('Error fetching Google Sheets data:', err);
      // Fallback to mock data on error
      setQuarterData(mockData[sheetName] || []);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    fetchGoogleSheetData(location);
  };

  const handleRefresh = () => {
    if (selectedLocation) {
      fetchGoogleSheetData(selectedLocation);
    }
  };

  const getVacancyStats = () => {
    const vacant = quarterData.length;
    return { vacant };
  };

  const stats = getVacancyStats();

  return React.createElement('div', { className: "min-h-screen bg-gray-50 p-4" },
    React.createElement('div', { className: "max-w-6xl mx-auto" },
      // Header
      React.createElement('div', { className: "bg-white rounded-lg shadow-md p-6 mb-6" },
        React.createElement('h1', { className: "text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2" },
          React.createElement(HomeIcon),
          "Quarter Vacancy Checker"
        ),
        React.createElement('p', { className: "text-gray-600" }, "Check available quarters across different locations")
      ),

      // Demo mode notice - removed since API key is now configured

      // Location Selection
      React.createElement('div', { className: "bg-white rounded-lg shadow-md p-6 mb-6" },
        React.createElement('h2', { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
          React.createElement(MapIcon),
          "Select Location"
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-5 gap-3" },
          locations.map((location) =>
            React.createElement('button', {
              key: location,
              onClick: () => handleLocationChange(location),
              className: `p-3 rounded-lg border-2 transition-all ${
                selectedLocation === location
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`
            },
              React.createElement('div', { className: "font-medium" }, location)
            )
          )
        )
      ),

      // Statistics
      selectedLocation &&
        React.createElement('div', { className: "grid grid-cols-1 gap-4 mb-6" },
          React.createElement('div', { className: "bg-white rounded-lg shadow-md p-6 text-center" },
            React.createElement('div', { className: "text-3xl font-bold text-green-600" }, stats.vacant),
            React.createElement('div', { className: "text-gray-600" }, "Available Vacant Quarters")
          )
        ),

      // Quarter Data with Caretaker Info
      selectedLocation &&
        React.createElement('div', { className: "bg-white rounded-lg shadow-md p-6" },
          React.createElement('div', { className: "flex justify-between items-center mb-4" },
            React.createElement('h2', { className: "text-xl font-semibold" },
              `Available Vacant Quarters in ${selectedLocation}`
            ),
            React.createElement('button', {
              onClick: handleRefresh,
              disabled: loading,
              className: "flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            },
              React.createElement(RefreshIcon),
              "Refresh"
            )
          ),

          // Caretaker Info Section
          caretakerData[selectedLocation] &&
            React.createElement('div', { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6" },
              React.createElement('h3', { className: "text-lg font-semibold text-blue-800 mb-3" }, "Contact Information"),
              React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-700" },
                React.createElement('div', null,
                  React.createElement('div', { className: "font-medium text-sm text-blue-600" }, "Caretaker"),
                  React.createElement('div', { className: "text-lg" }, caretakerData[selectedLocation].name)
                ),
                React.createElement('div', null,
                  React.createElement('div', { className: "font-medium text-sm text-blue-600" }, "Phone Number"),
                  React.createElement('a', { 
                    href: `tel:${caretakerData[selectedLocation].number}`,
                    className: "text-lg underline hover:text-blue-900"
                  }, caretakerData[selectedLocation].number)
                ),
                React.createElement('div', null,
                  React.createElement('div', { className: "font-medium text-sm text-blue-600" }, "Meeting Place"),
                  React.createElement('div', { className: "text-lg" }, caretakerData[selectedLocation].meetingPlace)
                )
              )
            ),

          error &&
            React.createElement('div', { className: "bg-red-50 border border-red-200 rounded-md p-4 mb-4" },
              React.createElement('div', { className: "text-red-700" }, error)
            ),

          loading
            ? React.createElement('div', { className: "flex justify-center items-center py-8" },
                React.createElement('div', { className: "text-blue-600" }, "Loading..."),
              )
            : quarterData.length > 0
            ? React.createElement('div', { className: "overflow-x-auto" },
                React.createElement('table', { className: "w-full border-collapse" },
                  React.createElement('thead', null,
                    React.createElement('tr', { className: "bg-gray-50" },
                      React.createElement('th', { className: "border border-gray-200 px-4 py-3 text-left font-semibold" }, "Quarter Number"),
                      React.createElement('th', { className: "border border-gray-200 px-4 py-3 text-left font-semibold" }, "Building Number")
                    )
                  ),
                  React.createElement('tbody', null,
                    quarterData.map((quarter, index) =>
                      React.createElement('tr', { key: index, className: "hover:bg-gray-50" },
                        React.createElement('td', { className: "border border-gray-200 px-4 py-3" }, quarter.quarterNumber),
                        React.createElement('td', { className: "border border-gray-200 px-4 py-3" }, quarter.buildingNumber)
                      )
                    )
                  )
                )
              )
            : React.createElement('div', { className: "text-center py-8 text-gray-500" },
                "No vacant quarters available at this location."
              )
        ),

      // Instructions
      React.createElement('div', { className: "bg-blue-50 rounded-lg p-6 mt-6" },
        React.createElement('h3', { className: "text-lg font-semibold text-blue-800 mb-2" }, "Setup Instructions:"),
        React.createElement('div', { className: "text-blue-700 space-y-2" },
          React.createElement('p', null, "✅ App is configured and ready to use!"),
          React.createElement('p', null, "✅ Worksheet names are automatically detected from your Google Sheet"),
          React.createElement('p', null, "✅ Each location worksheet should have: Quarter Number | Building Number | Vacancy Status"),
          React.createElement('p', null, "✅ Create a 'Caretakers' worksheet with: Place | Caretaker | Numbers | Meeting Place"),
          React.createElement('p', null, "✅ Make sure your spreadsheet is publicly readable (Anyone with link → Viewer)"),
          React.createElement('p', null, "🔄 Add/remove/rename worksheets in Google Sheets and the app will adapt automatically!")
        )
      )
    )
  );
};

ReactDOM.render(React.createElement(QuarterVacancyApp), document.getElementById('root'));
