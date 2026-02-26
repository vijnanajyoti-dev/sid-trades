import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TradeListPage } from './pages/TradeListPage';
import { TradeDetailPage } from './pages/TradeDetailPage';
import { AdminPage } from './pages/AdminPage';

// Layout component
function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DisclaimerBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TradeListPage,
});

const tradeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trade/$id',
  component: TradeDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([indexRoute, tradeDetailRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
