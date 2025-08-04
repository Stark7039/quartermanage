const { useState, useEffect } = React;
const { RefreshCw, MapPin, Home, AlertCircle } = lucide;

const QuarterVacancyApp = () => {
  // Replace these with your actual credentials
  const SPREADSHEET_ID = '1CUe-rvS2JQYFsyMG8T3t5vQ0vu_uOuySVe_G7ejfEX0';
  const API_KEY = 'AIzaSyAtt2w_DmREy_Io04NR9SqkllNR6J-eZb8';
  
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [quarterData, setQuarterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(true);

  // Mock data for demonstration - only vacant quarters (replace location names with your actual ones)
  const mockData = {
    'North Campus': [
      { quarterNumber: 'Q-101', buildingNumber: 'B-1', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-103', buildingNumber: 'B-1', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-202', buildingNumber: 'B-2', vacancyStatus: 'Vacant' },
    ],
    'South Campus': [
      { quarterNumber: 'Q-301', buildingNumber: 'B-3', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-302', buildingNumber: 'B-3', vacancyStatus: 'Vacant' },
    ],
    'East Campus': [
      { quarterNumber: 'Q-402', buildingNumber: 'B-4', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-404', buildingNumber: 'B-4', vacancyStatus: 'Vacant' },
    ],
    'West Campus': [
      { quarterNumber: 'Q-501', buildingNumber: 'B-5', vacancyStatus: 'Vacant' },
    ],
    'Central Campus': [
      { quarterNumber: 'Q-602', buildingNumber: 'B-6', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-603', buildingNumber: 'B-6', vacancyStatus: 'Vacant' },
      { quarterNumber: 'Q-605', buildingNumber: 'B-6', vacancyStatus: 'Vacant' },
    ]
  };

  // Initialize locations - replace with your actual location names
  useEffect(() => {
    const locationNames = ['North Campus', 'South Campus', 'East Campus', 'West Campus', 'Central Campus'];
    setLocations(locationNames);
    setSelectedLocation(locationNames[0]);
    
    // Fetch data for first location
    if (SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE' && API_KEY !== 'YOUR_GOOGLE_SHEETS_API_KEY_HERE') {
      fetchGoogleSheetData(locationNames[0]);
    } else {
      setQuarterData(mockData[locationNames[0]] || []);
    }
  }, []);

  const fetchGoogleSheetData = async (sheetName) => {
    if (!SPREADSHEET_ID || !API_KEY || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || API_KEY === 'YOUR_GOOGLE_SHEETS_API_KEY_HERE') {
      // Use mock data if credentials not configured
      setQuarterData(mockData[sheetName] || []);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const range = `${sheetName}!A:C`;
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
          React.createElement(Home, { className: "text-blue-600" }),
          "Quarter Vacancy Checker"
        ),
        React.createElement('p', { className: "text-gray-600" }, "Check available quarters across different locations")
      ),

      // Configuration Panel
      (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || API_KEY === 'YOUR_GOOGLE_SHEETS_API_KEY_HERE') &&
        React.createElement('div', { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6" },
          React.createElement('h2', { className: "text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-800" },
            React.createElement(AlertCircle, { className: "text-yellow-600" }),
            "Demo Mode"
          ),
          React.createElement('p', { className: "text-yellow-700" },
            "Currently showing demo data. To connect to your Google Spreadsheet, update the SPREADSHEET_ID and API_KEY variables in the code."
          )
        ),

      // Location Selection
      React.createElement('div', { className: "bg-white rounded-lg shadow-md p-6 mb-6" },
        React.createElement('h2', { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
          React.createElement(MapPin, { className: "text-green-600" }),
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
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-1 gap-4 mb-6" },
          React.createElement('div', { className: "bg-white rounded-lg shadow-md p-6" },
            React.createElement('div', { className: "text-3xl font-bold text-green-600" }, stats.vacant),
            React.createElement('div', { className: "text-gray-600" }, "Available Vacant Quarters")
          )
        ),

      // Quarter Data
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
              React.createElement(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }),
              "Refresh"
            )
          ),

          error &&
            React.createElement('div', { className: "bg-red-50 border border-red-200 rounded-md p-4 mb-4" },
              React.createElement('div', { className: "text-red-700" }, error)
            ),

          loading
            ? React.createElement('div', { className: "flex justify-center items-center py-8" },
                React.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-blue-600" }),
                React.createElement('span', { className: "ml-2 text-gray-600" }, "Loading...")
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
          React.createElement('p', null, "1. Create a Google Spreadsheet with worksheets named: North Campus, South Campus, East Campus, West Campus, Central Campus"),
          React.createElement('p', null, "2. Each worksheet should have columns: Quarter Number, Building Number, Vacancy Status"),
          React.createElement('p', null, "3. Get a Google Sheets API key from Google Cloud Console"),
          React.createElement('p', null, "4. Make your spreadsheet publicly readable"),
          React.createElement('p', null, "5. Replace SPREADSHEET_ID and API_KEY variables in the code with your actual values"),
          React.createElement('p', null, "6. Deploy to a free hosting service like Netlify, Vercel, or GitHub Pages")
        )
      )
    )
  );
};

ReactDOM.render(React.createElement(QuarterVacancyApp), document.getElementById('root'));