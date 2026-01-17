/**
 * Centralized PDF configuration constants
 */
export const PDF_CONFIG = {
  // Logo configuration
  logo: {
    path: '/deliveroo-pdf-logo.png',
    position: {
      x: 20,
      y: 10,
      width: 40,
      height: 15
    },
    small: {
      x: 15,
      y: 15,
      width: 15,
      height: 15
    }
  },

  // Page dimensions and margins
  page: {
    margin: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    },
    footerHeight: 25,
    headerHeight: 30,
    contentStartY: 40
  },

  // Font sizes
  fontSize: {
    title: 18,
    section: 14,
    body: 10,
    footer: 8,
    watermark: 50,
    small: 9
  },

  // Font families
  font: {
    family: 'helvetica',
    weight: {
      normal: 'normal',
      bold: 'bold'
    }
  },

  // Colors (RGB values)
  colors: {
    text: {
      primary: [0, 0, 0],
      secondary: [100, 100, 100],
      watermark: [200, 200, 200]
    },
    background: {
      section: [248, 250, 252]
    },
    border: {
      default: [200, 200, 200]
    },
    timeline: {
      active: [33, 150, 243], // blue
      completed: [34, 197, 94] // green
    }
  },

  // Line widths
  lineWidth: {
    default: 0.5
  },

  // Footer content
  footer: {
    lines: [
      'Deliveroo Logistics | ul. Logistyczna 123, 00-001 Warsaw, Poland',
      'Phone: +48 123 456 789 | Email: contact@deliveroo.pl'
    ],
    pageNumberOffset: {
      x: 170,
      y: 12
    }
  },

  // Company info
  company: {
    name: 'Deliveroo TMS Sp. z o.o.',
    systemName: 'Transport Management System'
  },

  // Field rendering
  field: {
    labelOffset: 20,
    valueOffset: 60,
    lineHeight: 4,
    spacing: 6,
    minSpacing: 6
  },

  // Section rendering
  section: {
    height: 8,
    spacing: 15,
    padding: 2
  }
} as const
