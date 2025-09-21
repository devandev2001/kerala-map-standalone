# Kerala Map Standalone

A focused, standalone application that provides interactive Kerala political map visualization.

## Features

- Interactive Kerala political map
- Hierarchical navigation (zones → org districts → ACs → mandals → local bodies)
- Performance, target, and leadership data visualization
- Mobile-responsive design
- PWA support for offline functionality
- PDF export capabilities

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Testing

```bash
npm run test
```

## Project Structure

```
src/
├── components/          # React components
├── utils/              # Utility functions and data loaders
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling files

public/
├── data/               # CSV data files
├── map/                # GeoJSON map files
└── csv/                # Additional CSV files
```

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Leaflet (for maps)
- Supabase (for authentication)
- jsPDF (for PDF generation)