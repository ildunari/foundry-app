import { RouterProvider, createHashRouter } from "react-router-dom";
import { LibraryProvider } from "@/context/LibraryContext";
import AppShell from "@/components/layout/AppShell";
import PlaceholderDetail from "@/routes/PlaceholderDetail";
import Dashboard from "@/routes/Dashboard";
import CategoryPage from "@/routes/CategoryPage";
import SystemDetail from "@/routes/SystemDetail";

function SettingsPlaceholder() {
  return <div className="text-shell-text-secondary">Settings coming soon.</div>;
}

const router = createHashRouter([
  {
    path: "/",
    element: (
      <LibraryProvider>
        <AppShell />
      </LibraryProvider>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "systems", element: <CategoryPage kind="systems" /> },
      { path: "systems/:slug", element: <SystemDetail /> },
      { path: "typography", element: <CategoryPage kind="typography" /> },
      { path: "typography/:slug", element: <PlaceholderDetail /> },
      { path: "iconography", element: <CategoryPage kind="iconography" /> },
      { path: "iconography/:slug", element: <PlaceholderDetail /> },
      { path: "motion", element: <CategoryPage kind="motion" /> },
      { path: "motion/:slug", element: <PlaceholderDetail /> },
      { path: "palettes", element: <CategoryPage kind="palettes" /> },
      { path: "palettes/:slug", element: <PlaceholderDetail /> },
      { path: "patterns", element: <CategoryPage kind="patterns" /> },
      { path: "patterns/:slug", element: <PlaceholderDetail /> },
      { path: "settings", element: <SettingsPlaceholder /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
