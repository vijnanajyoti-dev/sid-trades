# Specification

## Summary
**Goal:** Fix three issues in the Sid Trades app: replace the Result column with Stop Loss in the Trade List table, integrate Alpha Vantage delayed price display across Trade List and Trade Detail pages, and repair the admin field visibility toggles so they correctly load, save, and persist.

**Planned changes:**
- Remove the "Result" column from the Trade List table header and rows; add a "Stop Loss" column that reads and formats the `stopLoss` field from each trade (Result field remains in Trade type, backend, and Trade Detail page)
- Create `frontend/src/hooks/useMarketPrice.ts` that fetches delayed price data from Alpha Vantage GLOBAL_QUOTE endpoint, caches responses in localStorage per ticker for 60 minutes, and exposes `currentPrice`, `lastUpdated`, and `isLoading`
- In the Trade List page, display "Current Price (Delayed)" and "Last Updated" per trade row using `useMarketPrice`, with a loading indicator, N/A fallback, and a single disclaimer below the table styled with gold/amber accent colors
- In the Trade Detail page Pricing section, display "Current Price (Delayed)" and "Last Updated" using `useMarketPrice`, with loading state, N/A fallback, and the same disclaimer
- Add `VITE_ALPHA_VANTAGE_API_KEY=demo` to the `.env` file (and `.env.example` if present) with a comment to replace with a real key for production
- Rewrite the Field Visibility Settings panel in AdminPage.tsx so toggles load their state from `getFieldVisibilityConfig` on mount, call `setFieldVisibility` on change, restore persisted values on refresh, show a loading/saving indicator, and surface errors gracefully — without affecting User Role Management or trade CRUD sections

**User-visible outcome:** The Trade List now shows Stop Loss instead of Result, each trade row and the Trade Detail page display a delayed current market price from Alpha Vantage, and admin field visibility toggles correctly save and restore their state.
