import { RouterProvider, createHashRouter } from "react-router-dom";
import { LibraryProvider } from "@/context/LibraryContext";
import AppShell from "@/components/layout/AppShell";
import SystemsPage from "@/routes/SystemsPage";
import TypographyPage from "@/routes/TypographyPage";
import IconographyPage from "@/routes/IconographyPage";
import MotionPage from "@/routes/MotionPage";
import PalettesPage from "@/routes/PalettesPage";
import PatternsPage from "@/routes/PatternsPage";
import PlaceholderDetail from "@/routes/PlaceholderDetail";
import Dashboard from "@/routes/Dashboard";

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
      { path: "systems", element: <SystemsPage /> },
      { path: "systems/:slug", element: <PlaceholderDetail /> },
      { path: "typography", element: <TypographyPage /> },
      { path: "typography/:slug", element: <PlaceholderDetail /> },
      { path: "iconography", element: <IconographyPage /> },
      { path: "iconography/:slug", element: <PlaceholderDetail /> },
      { path: "motion", element: <MotionPage /> },
      { path: "motion/:slug", element: <PlaceholderDetail /> },
      { path: "palettes", element: <PalettesPage /> },
      { path: "palettes/:slug", element: <PlaceholderDetail /> },
      { path: "patterns", element: <PatternsPage /> },
      { path: "patterns/:slug", element: <PlaceholderDetail /> },
      { path: "settings", element: <SettingsPlaceholder /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
