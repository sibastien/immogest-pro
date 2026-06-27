import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';

function App() {
  // Validate the persisted token on startup; refreshes the user or signs out.
  useEffect(() => {
    useAuthStore.getState().loadMe();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
