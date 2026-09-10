// All page copy lives here. Edit text, not templates.
// Strings in [square brackets] are placeholders to fill before publishing.

export const home = {
  title: 'Digital design and verification for image sensors, ASICs and FPGAs.',
  lede:
    'Image sensor and ROIC controllers, video bridges, FPGA design and verification, and the low-noise analog and camera hardware around them.',
  ctaPrimary: { label: 'What we do', href: '/services/' },
  ctaSecondary: { label: 'Start a conversation' },
  contact: {
    title: 'Have an image-processing or sensor-digital problem?',
    body: 'The usual first step is a one-hour call about the problem, followed by a short written proposal with scope, deliverables and a schedule.',
  },
};

export const services = {
  intro: 'FPGA & ASIC digital design',
  items: [
    {
      slug: 'sensor-controller',
      title: 'Digital controller design for image sensors and ROICs',
      short: 'On-chip digital for global- and rolling-shutter CMOS sensors and infrared ROICs: timing generation, readout sequencing, exposure and mode control, register interfaces.',
      bullets: [
        'Global and rolling shutter timing, row and column sequencing, multi-mode operation',
        'Exposure, gain and windowing control; test patterns; SPI or I²C register access with SystemRDL maps',
        'Cycle-exact timing definitions the analog and layout teams can review, kept as the single source for RTL and documentation',
      ],
    },
    {
      slug: 'video-bridging',
      title: 'Video bridging',
      short: 'Format conversion and aggregation between video interfaces: MIPI CSI-2 and DSI, SDI, parallel, USB, LVDS and SLVS-EC, HDMI.',
      bullets: [
        'Sensor-to-processor and camera-to-display bridges, usually on small FPGAs',
        'Multi-sensor aggregation, virtual channels, pixel-format and bit-depth conversion, frame-rate adaptation',
        'Physical-layer timing, constraints and bring-up on the target link',
      ],
    },
    {
      slug: 'fpga',
      title: 'FPGA design, verification and bring-up',
      short: 'RTL design, self-checking testbenches with reference models, timing closure, and support on the bench until the board works.',
      bullets: [
        'SystemVerilog and Verilog RTL for AMD, Intel and Lattice devices',
        'Reference models and bit-exact regressions under Verilator or commercial simulators',
        'Debug, timing closure and bring-up on the target hardware; reviews of existing designs',
      ],
    },
    {
      slug: 'image-processing',
      title: 'Real-time image processing',
      short: 'Fixed-latency processing on FPGA and ASIC: scaling, non-uniformity and defect correction, statistics, overlays and on-screen display.',
      bullets: [
        'Streaming architectures with a stated latency and no more buffering than the function needs',
        'Correction and calibration pipelines for infrared and CMOS imagers',
        'On-screen display and menu overlays generated as verified RTL',
      ],
    },
    {
      slug: 'analog-pcb',
      title: 'Low-power, low-noise analog PCB design',
      short: 'Sensor front-end and mixed-signal boards: power trees, references, biasing and clocking, with the layout discipline that keeps noise out of the image.',
      bullets: [
        'Power sequencing and low-noise regulation for sensors and ROICs',
        'ADC and clock distribution, grounding and stack-up for imaging boards',
        'Bring-up with measurements that tie back to the sensor specification',
      ],
    },
    {
      slug: 'camera-hw',
      title: 'Camera hardware design',
      short: 'From sensor board to interface board: architecture, schematics, layout supervision, and design packages a partner or manufacturer can build from.',
      bullets: [
        'Sensor, processing and interface boards; flex, connector and mechanical interface planning',
        'Power and thermal budgets, interface control documents between sensor, FPGA, processor and display',
        'Design packages with requirements, pinouts, sequencing and test plans',
      ],
    },
  ],
  engagements: {
    title: 'Engagements',
    items: [
      { title: 'Fixed-scope block or board', body: 'One controller, bridge, pipeline stage or board: specified, designed, verified, handed over.' },
      { title: 'Verification of existing RTL', body: 'A model and testbench for a design you already have, with a report.' },
      { title: 'Specification phase', body: 'The document set that lets your team or a partner build the rest.' },
      { title: 'Retained days', body: 'An engineer on call, a fixed number of days per month.' },
    ],
  },
};

export const process = {
  title: 'How we work',
  steps: [
    {
      title: 'The specification comes first and stays ahead of the code.',
      body: 'Numbered requirements with open questions and owners. Every deliverable traces back to it.',
    },
    {
      title: 'A reference model sits beside the RTL.',
      body: 'The testbench compares hardware and model bit for bit, frame by frame. "It works" is a measurement.',
    },
    {
      title: 'You own what is delivered.',
      body: 'RTL, testbenches, models, documents and the tools that generated them. No dependence on a vendor flow or on us.',
    },
  ],
};

// Client names are withheld. Review every item for confidentiality before publishing.
export const work = {
  intro:
    'A few representative projects. Client names are withheld; details are available under NDA.',
  items: [
    {
      title: 'Sensor-to-eyepiece video path for a hand-held infrared imager',
      body:
        'An infrared camera core feeding a micro-display through an FPGA: capture, scaling, frame-rate conversion, a fixed-latency on-screen display with a button-driven menu, and panel timing. Interface definitions and a design package let the partner build the electronics in parallel.',
      delivered: ['Architecture and interface documents', 'Overlay and timing RTL, verified against golden frames', 'Hardware design package for the partner team'],
    },
    {
      title: 'CMOS image sensor to MIPI CSI-2 on a bridge FPGA',
      body:
        'A parallel-output CMOS sensor brought onto MIPI CSI-2 on a small bridge FPGA: RAW12 packing, lane management, several resolutions and frame rates, verified against a reference model before the board existed.',
      delivered: ['Bridge RTL and constraints', 'Self-checking testbench', 'Bench bring-up'],
    },
    {
      title: 'Timing and register infrastructure for image-sensor digital',
      body:
        'Clock-cycle-exact timing definitions for an image sensor’s digital, a SystemRDL register map, and the generated timing and register logic. The editors written to keep spec, model and RTL consistent became Timing Studio and Register Studio.',
      delivered: ['Timing specification and register map', 'Generated RTL and headers', 'The editing tools, kept in step with the spec'],
    },
  ],
};

export const tools = {
  intro:
    'Built for problems that kept coming back, client after client. Each tool solves one of them once, exactly.',
  byName: {
    'osd-design-studio': {
      options: [
        { title: 'Browser', body: 'Free. Design the overlay, run the menu and check the design rules, nothing to install. Projects stay in browser storage until you save them as a file. Export is reserved for the licensed versions.', label: 'Open in the browser', href: 'app' },
        { title: 'Desktop', body: 'Licensed. A native window with real file dialogs for Linux and Windows, full RTL and testbench export, works offline.', label: 'Ask for a licence', mail: 'OSD Design Studio desktop licence' },
        { title: 'Command line', body: 'Licensed. Headless export, render, verify, info and validate; runs the generated testbench under Verilator, so it fits a regression flow.', label: 'Ask for a licence', mail: 'OSD Design Studio CLI licence' },
      ],
      io: {
        title: 'What the generated module connects to',
        notes: [
          ['Video stream in', 'Parallel video or AXI4-Stream, grayscale or RGB, at the resolution set in the project.'],
          ['Bindings', 'The live values the OSD shows: readouts, enumerated states, visibility flags and the menu buttons. Delivered as plain top-level ports, or written through an AXI4-Lite register map that the export generates and documents.'],
          ['Video stream out', 'The same stream, same format and timing, a fixed number of clock cycles later, with the OSD drawn on it. No frame or line buffer, so latency is constant and memory is not needed.'],
        ],
      },
      summary: 'Design an on-screen-display menu on a canvas and export a verified, fixed-latency Verilog overlay module with its testbench.',
      lede: 'Design an on-screen display visually, try it live, and export it as verified RTL.',
      paragraphs: [
        'Design the overlay on a canvas the size of your video’s active area, with text, readouts, markers, bars, icons and a menu, and run the menu with on-screen buttons on the same state machine the RTL is generated from.',
        'Export a synthesizable Verilog or SystemVerilog overlay: video in, the same stream out with the OSD on it, fixed latency, no frame or line buffer. A self-checking testbench, with golden frames from the same renderer, comes with it.',
      ],
      features: [
        ['Designer', 'Canvas over a sample frame (PNG, PGM, PPM or a test pattern), element list with z-order, inspector, direct manipulation, screens, pixel grid and zoom.'],
        ['Elements', 'Static text, numeric readout, enumerated text, rectangle, line, crosshair, bitmap and icon, bar, and the menu list; blend modes opaque, keyed, invert and half; visibility conditions with blink; grayscale or RGB.'],
        ['Menu', 'Pages and items (sub-page, back, action, confirm, toggle, enum, number, value, separator, exit), a fixed navigation state machine with debounce, long-press repeat and acceleration, timeouts and shortcuts.'],
        ['Run-time state', 'Set every binding, press the buttons, and watch the same state machine the RTL is generated from.'],
        ['Export', 'SystemVerilog or Verilog RTL for parallel video or AXI4-Stream, optional simple or AXI4-Lite register interface, package or header, ROM images, testbench with golden frames, summary and register map.'],
        ['Verification', 'The generated testbench compares every output frame with the renderer’s golden image; the command-line version runs it under Verilator.'],
      ],
      availability:
        'The browser version is free for designing and simulating. Export, the desktop application and the command line are licensed; write for pricing and a trial.',
    },
    'timing-studio': {
      summary: 'A clock-cycle-exact timing editor for image-sensor digital: counters, signals, modes and target blocks, in one HTML file.',
      lede:
        'A timing editor for image-sensor digital: counters with offsets and wait slots, signals with clock-cycle-precise edges, target blocks and imaging modes. Written for analog designers who have to specify digital timing, it runs entirely in the browser as one HTML file.',
      features: [
        ['Visualizer', 'Counters and placed signals on a clock-cycle time axis, with zoom, pan, an optional fine grid and edge time labels.'],
        ['Direct editing', 'Drag edges and wait handles, click to add edges, nudge with the keyboard, all with clock-cycle precision; a read-only Inspect mode for reviews.'],
        ['Signal library and groups', 'Every defined signal, whether placed or not; named, collapsible groups in the visualizer.'],
        ['List view', 'A sortable, searchable, per-column-filterable table with click-to-edit cells.'],
        ['Modes and targets', 'Imaging modes that switch counter and signal definitions; target blocks that receive the timing.'],
      ],
      availability: 'Available on request.',
    },
    'register-studio': {
      summary: 'A SystemRDL register map editor with an address-map tree, a bit-field diagram, design-rule checks and .rdl round-trip.',
      lede:
        'A SystemRDL register map editor for ASIC digital design: address maps, register files, registers and fields, edited through an address map tree and a bit-field diagram. It imports and exports .rdl files, checks the map against a set of design rules, and supports per-mode reset defaults.',
      features: [
        ['Map view', 'An address map tree beside a bit-field diagram; registers drawn MSB-left and wrapped onto lanes, reserved bits hatched, fields coloured by software access.'],
        ['List view', 'A flat table of registers or fields, sortable, searchable and filterable per column.'],
        ['Project view', 'Project settings, system modes, enumerations and the design-rule checks.'],
        ['SystemRDL', 'Round-trips .rdl files, so the map stays the single source for RTL, headers and documentation.'],
      ],
      availability: 'Available on request.',
    },
  },
};

export const about = {
  title: 'About',
  paragraphs: [
    'Linebuffer is the design practice of Semih Genç: image sensor and camera electronics, from the digital inside the sensor to the boards around it.',
    'Semih has spent his career in image-sensor and camera electronics: digital design for CMOS and infrared imagers, FPGA video systems, and the verification that goes with them.',
    'The practice is based in Türkiye and works with teams across Europe and beyond, remote by default and on site when the bench needs it.',
  ],
  name: {
    title: 'Why the name',
    body:
      'A line buffer holds exactly one line of an image, processes it and passes it on. It is the smallest structure that makes streaming image processing possible, and a fair description of how we like to build: no more memory than the job needs, and a latency you can state in cycles.',
  },
  contact: {
    title: 'Contact',
    body: 'The usual first step is a one-hour call about the problem, followed by a short written proposal.',
  },
};
