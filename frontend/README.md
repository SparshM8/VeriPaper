# VeriPaper Frontend

A modern React dashboard for analyzing research papers for authenticity, plagiarism, AI generation, citation validity, and statistical anomalies.

## Features

### 📊 Visual Analytics
- **Score Gauges**: Interactive semi-circular gauges for real-time score visualization
- **Credibility Dashboard**: Overall research authenticity score (0-100%)
- **Color-Coded Results**: Green (good), Amber (caution), Red (risk)

### 📥 Multi-Format Export
- **PDF Reports**: Download comprehensive analysis reports
- **CSV Export**: Structured tabular format for spreadsheet analysis
- **JSON Export**: Full data export for programmatic use

### 📋 Analysis History
- **Local Storage**: Persist last 10 analyses automatically
- **Quick Access**: Click to reload previous analyses
- **Timestamp Tracking**: Know when each analysis was performed

### 🎨 UI/UX Enhancements
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Mobile-friendly interface
- **Real-time Progress**: Visual loading indicators during analysis
- **Error Handling**: Clear error messages and validation feedback

### 📄 File Support
- PDF documents
- DOCX files
- TXT files (plain text)

## Installation

```bash
cd frontend
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` and connects to the backend API at `http://localhost:8000`.

## Build

Create a production build:

```bash
npm run build
```

## Project Structure

```
src/
├── App.jsx              # Main dashboard component
├── ScoreGauge.jsx       # Recharts-based score visualization
├── api.js               # Axios HTTP client for API communication
├── utils.js             # Export and history management utilities
├── index.css            # Tailwind + custom styles
└── main.jsx             # React entry point
```

## API Integration

The frontend communicates with the backend API via:

**Endpoint**: `POST /api/analyze`

**Request**: Multipart form with file upload
**Response**: Analysis results with scores, matches, and issues

## Data Export

### PDF Report
Downloads a comprehensive PDF report from the backend with all analysis details.

### CSV Export
Exports analysis results in CSV format:
- Metric name
- Score value
- Additional details

### JSON Export
Exports full analysis results as JSON for programmatic processing.

## History Management

Analysis results are automatically saved to browser's localStorage:
- Maximum 10 entries stored
- Includes timestamp for each analysis
- Clear history option to reset

## Theme Support

Toggle between dark mode (default) and light mode using the theme button in the header.

## Component Architecture

### App.jsx
- Main component managing state and API calls
- Handles file upload and analysis
- Theme management
- History modal

### ScoreGauge.jsx
- Recharts-based semi-circular gauge visualization
- Accepts score, label, and color props
- Responsive sizing

### utils.js
- `downloadPDF()`: Download PDF reports
- `downloadCSV()`: Export analysis as CSV
- `downloadJSON()`: Export analysis as JSON
- `saveToHistory()`: Save to localStorage
- `getHistory()`: Retrieve history
- `clearHistory()`: Clear all history

### api.js
- Axios instance configured for backend API
- `analyzePaper()`: Submit file for analysis

## Styling

Using Tailwind CSS with custom components:
- `.card`: Dark mode card styling
- `.card-light`: Light mode card styling
- `.btn-primary`: Primary button style
- `.badge-*`: Status badges

## Error Handling

- File validation (type and size)
- API error catching with user-friendly messages
- Network error handling with retry suggestions
- localStorage error fallback

## Performance Optimizations

- Code splitting via Vite
- Lazy component loading
- Optimized Recharts rendering
- Efficient state management

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Batch file upload
- [ ] Advanced filtering of history
- [ ] Custom scoring weights
- [ ] AI confidence explanation tooltips
- [ ] Citation validation details view
- [ ] Statistical risk breakdown
- [ ] Share analysis results via URL
- [ ] Real-time progress updates with WebSocket
