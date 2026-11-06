import { createContext, useContext, useMemo, useState } from 'react';

/**
 * Shared app state used by several screens (Dashboard, Hydration).
 * Replace the local state with API calls when the backend is connected
 * (see src/api/index.js).
 */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [water, setWater] = useState(1250);
  const [goal, setGoal] = useState(2500);

  const value = useMemo(
    () => ({
      water,
      goal,
      addWater: (ml) => setWater((w) => Math.min(w + ml, 4500)),
      goalUp: () => setGoal((g) => Math.min(g + 250, 4500)),
      goalDown: () => setGoal((g) => Math.max(g - 250, 1000)),
    }),
    [water, goal]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};
