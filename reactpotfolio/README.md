# Portfolio Manager Application

## 1. Project Overview

The Portfolio Manager is a comprehensive React-based web application designed to track and manage financial assets. It provides users with a centralized dashboard to monitor their portfolio's performance, view detailed asset information, and simulate buying and selling actions.

**Key Use Cases:**
*   **Track Holdings:** Visualize current asset allocations across stocks, mutual funds, commodities, and crypto.
*   **View Performance:** Monitor total portfolio value and historical performance trends.
*   **Asset Management:** Simulate buying new assets and liquidating existing positions.
*   **Market Analysis:** Access detailed price history and market data for individual assets.

## 2. Tech Stack

*   **Frontend Framework:** React (Functional Components, Hooks)
*   **Routing:** React Router DOM
*   **Data Visualization:** Recharts for responsive and interactive charts
*   **Styling:** Custom CSS with a dedicated design system (CSS variables, utility classes). No external UI component libraries (like Bootstrap or Material UI) were used to ensure full control over the design.
*   **State Management:** React `useState` and `useEffect` hooks for local state and data flow.
*   **Data Layer:** Mock API layer using JavaScript objects and promises to simulate asynchronous data fetching.

## 3. Application Architecture

The application follows a standard, scalable React folder structure:

*   **`src/api`**: Contains mock data services (`portfolioApi.js`, `marketApi.js`) that simulate backend responses.
*   **`src/components`**: Reusable UI building blocks.
    *   `cards/`: Presentation components for assets and summary statistics.
    *   `charts/`: Recharts wrappers for visualizing data.
    *   `modals/`: Complex overlay components for user interactions (Buy/Sell).
*   **`src/layouts`**: Global layout components like the `Header`.
*   **`src/pages`**: Top-level page components (`Home.jsx`, `Holdings.jsx`) that manage page-specific state and layout.
*   **`src/styles`**: Global stylesheets (`index.css`) and component-specific styles (`components.css`).

## 4. Pages Overview

### a. Home Page
 The central hub of the application, providing a high-level view of the user's financial health.
*   **Portfolio Summary:** Displays the total portfolio value and current balance.
*   **Performance Chart:** A large area graph showing portfolio value trends over time.
*   **Top/Lowest Performers:** Interactive cards highlighting the best and worst-performing assets. Clicking these cards navigates directly to the asset details.

### b. Holdings Page
A detailed inventory of all assets owned by the user.
*   **Categorized View:** Assets are grouped by type (Stocks, Mutual Funds, Commodities, etc.).
*   **Grid Layout:** Assets are displayed in a responsive grid using `AssetCard` components.
*   **Buy Action:** A prominent "Buy Asset" button allows users to add new positions.
*   **Interaction:** Clicking any asset card opens the **Asset Details Modal**.

## 5. Core Components

*   **`PerformanceCard`**: Displays a key metric (e.g., "Top Performer") with the asset's name, return percentage, and a trend indicator.
*   **`SummaryCard`**: Shows a primary financial figure (e.g., Total Balance) with a label.
*   **`PortfolioChart`**: A substantial line/area chart component used on the Home page to visualize total portfolio growth.
*   **`AssetCard`**: A reusable card component displaying an asset's ticker, name, current value, and holdings. It serves as the primary entry point for asset details.
*   **`AssetDetailsModal`**: A comprehensive modal showing deep insights into an asset, including a price history chart and statistics.
*   **`BuyAssetModal`**: A form-based modal for inputting purchase details (Ticker, Quantity, Price).

## 6. Modals

The application uses custom-built modals for critical user interactions.

*   **Buy Asset Modal:**
    *   Features a form for Company Name, Ticker, Category, Quantity, and Price.
    *   Calculates "Total Buying Value" dynamically as the user types.
    *   Uses strict input validation and visual feedback.

*   **Asset Details Modal:**
    *   Displays a two-column layout: stats on the left, chart on the right.
    *   Shows Current Price, Average Buy Price, Holdings Value, and Total Return.
    *   Includes a "Liquidate Position" button for selling.

**Design Approach:** Modals use a rigid design system (`modal-strict`) with dark gradients, backdrop blurs, and specific animations (`fade-in`, `scale-up`) to ensure a premium feel.

## 7. Charts & Data Visualization

All charts are implemented using **Recharts**.

*   **Portfolio Performance:** Uses `AreaChart` with gradients to show wealth accumulation.
*   **Asset Price History:** Uses `LineChart` inside the details modal to show individual stock trends.
*   **Responsiveness:** Charts are wrapped in `ResponsiveContainer` to adapt to modal and page widths.
*   **Data Format:** Charts expect arrays of objects (e.g., `{ date: '2023-01-01', value: 150 }`).

## 8. Mock API / Data Layer

To facilitate rapid frontend development without a live backend, the app uses a **Mock API Layer**.

*   **`portfolioApi.js`**: Simulates fetching user holdings and portfolio summary data.
*   **`marketApi.js`**: Simulates fetching historical price data for assets.
*   **Usage:** Components call these functions (e.g., `fetchPortfolioData()`) which return Promises that resolve with realistic sample data after a short artificial delay. This structure allows for easy replacement with real REST or GraphQL endpoints in the future.

## 9. Styling & Design System

The application enforces a **Strict Dark Theme**.

*   **Global Variables:** Colors and spacing are defined in `:root` (e.g., `--bg-primary`, `--text-secondary`).
*   **Accent Color:** A custom red (`#DB292D`) is used consistently for primary actions, positive/negative indicators, and focus states.
*   **Strict Classes:** Utility classes like `.btn-pill-strict`, `.modal-strict`, and `.input-strict` enforce pixel-perfect consistencies across buttons and inputs without relying on inline styles.
*   **Typography:** Uses a clean, modern sans-serif stack suitable for financial data.

## 10. State Management & Data Flow

*   **Page-Level State:** Pages (Home, Holdings) simulate fetching data on mount and serve as the source of truth for the UI.
*   **Prop Drilling:** Data is passed down from simple pages to display components (`AssetCard`, `Chart`).
*   **Modal State:** `useState` is used to track which modal is open and which asset is currently selected for viewing.
*   **Form State:** Local state within `BuyAssetModal` manages input values and validation before "submission".

## 11. Error Handling & Defensive Coding

*   **Conditional Rendering:** Components check if data exists before attempting to render charts or lists to prevent runtime crashes.
*   **Safe Access:** Optional chaining (`?.`) represents nested object access.
*   **Null Checks:** Fallback UI elements (e.g., "Loading chart data...") are displayed when asynchronous data is still pending or fails to load.

## 12. How to Run the Project Locally

**Prerequisites:** Node.js (v14+) and npm/yarn.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd <project-folder>
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the development server:**
    ```bash
    npm start
    ```

The application will open in your browser at `http://localhost:3000`.

## 13. Future Enhancements

*   **Backend Integration:** Connect `src/api` to a real Node.js/Express backend.
*   **Authentication:** Add user login/signup using JWT or OAuth.
*   **Real-time Data:** Integrate with a financial data provider (e.g., Alpha Vantage, CoinGecko) for live pricing.
*   **Data Persistence:** Store transactions in a database (MongoDB/PostgreSQL).
*   **Mobile Optimization:** Further refine layouts for mobile devices.

## 14. Project Status

This project is currently in a **Functional Prototype** state. It demonstrates the complete frontend architecture, UI/UX design, and interaction flows of a professional portfolio management system. It is ready for backend integration.
