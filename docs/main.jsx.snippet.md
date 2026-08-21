# Wire ScrollToTop (Phase 16)

In `client/src/main.jsx`, import and render inside `BrowserRouter`:

```jsx
import ScrollToTop from './components/common/ScrollToTop';

// ...
<BrowserRouter>
  <ScrollToTop />
  <ThemeProvider>
    ...
  </ThemeProvider>
</BrowserRouter>
```

Or inside `App.jsx` at the top of the tree under the router.
