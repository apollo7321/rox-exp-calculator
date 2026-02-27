# ROX EXP Calculator

A lightweight, purely client-side web application for calculating precise monster experience points (EXP) yield in Ragnarok X: Next Generation (ROX).

## Project Overview

This project provides an accurate EXP calculator that mirrors the in-game mathematical formulas, specifically accounting for:
- Base and Job EXP values per monster.
- World Level bonuses and penalties.
- Level gap penalties between the player and the monster.
- Party size and unique class bonuses.
- Odin's Blessing multipliers.

The application is built using vanilla web technologies (HTML, CSS, JavaScript) without heavy framework dependencies, making it fast, portable, and easy to maintain.

## Architecture

The project is logically divided into clean, decoupled responsibilities to maintain a high level of testability and readability.

### Core Files
- `index.html`: The main user interface, defining the input forms, SVG icons, and the structure for the results grid.
- `style.css`: All styling, utilizing a modern dark-theme aesthetic, CSS variables for theming, and CSS Grid/Flexbox for responsive layouts.
- `app.js`: The frontend interface logic. It binds DOM elements, reacts to user inputs (including visual clamping for valid ranges), filters the monster database, invokes the calculation logic, and renders the results to the DOM.
- `math.js`: The central math engine. Contains all the pure functions for calculating multipliers (World Level, Level Penalty, Party Bonus) and the final EXP yielding formula. This file is executed by both the browser environment and the Node.js test suites.

### Data
- `monsters.json`: The database of monsters containing their base/job EXP, level, size, element, and location.

### Build and Test System
- `build.js`: A Node.js build script that bundles `index.html`, `style.css`, `math.js`, `app.js`, and `monsters.json` into a single, minified, highly portable `docs/index.html` file using `clean-css`, `terser`, and `html-minifier-terser`.
- `tests.js`: A fast Node.js unit test script that verifies the mathematical logic in `math.js` against known, verified in-game data points.
- `ui_test.js`: An automated UI testing script utilizing `puppeteer`. It launches a headless Chromium browser, manipulates the DOM inputs exactly as a user would, and verifies that the front-end correctly renders the expected EXP values in the HTML layout.
- `test_cases.js`: A shared registry of verified test cases used by both `tests.js` and `ui_test.js` to ensure the core logic and the UI presentation are always tested against the exactly identical conditions.

## How to Run Locally

### Prerequisites
- Node.js (v14+ recommended)
- npm

### Installation
1. Clone the repository.
2. Run `npm install` to install development dependencies (Puppeteer, minifiers, local server).

### Development
Start the local development server:
`npm start`

This will serve the application at `http://localhost:8080`. The application will dynamically fetch `monsters.json` and load the separate JS/CSS files for easy debugging.

### Testing
Run the complete test suite (Unit Tests + UI Tests):
`npm test`

To run only the unit tests:
`npm run test:unit`

To run only the Puppeteer UI tests (requires Chromium installation, handled by `npm install`):
`npm run test:ui`

### Build (Production)
Generate a single-file distribution:
`npm run build`

This will output a minified `docs/index.html` file containing all code, CSS, and data. This single file can be deployed anywhere without needing a backend server to host the JSON payload or CSS files.

## Architecture decisions

For Language Models working on this codebase:
- All core calculations **must** reside in `math.js` to ensure they are testable in isolation and shared natively between the UI and the Node.js test runners.
- Any new features affecting EXP yields must include corresponding test cases appended to `test_cases.js`.
- The `index.html` relies on vanilla JavaScript DOM manipulation in `app.js`. Avoid introducing modern UI frameworks (React, Vue, Alpine) unless a complete rewrite is explicitly requested by the user.
- Ensure any new input fields in `index.html` have corresponding value clamping in `app.js` (using `Math.max`/`Math.min`) to prevent invalid data from crashing the calculation loops.
- When formatting output EXP in `app.js`, use `toLocaleString()` for readability, but remember to strip formatting characters before `parseInt` extraction in the `ui_test.js` script.
- The build script (`build.js`) relies on specific script inclusion orders. Be careful when adding new `.js` modules to ensure they are read and minified correctly for the `docs/` bundle.
