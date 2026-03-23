import { RouterProvider, createHashRouter } from "react-router-dom";
import { LibraryProvider } from "@/context/LibraryContext";
import AppShell from "@/components/layout/AppShell";
import PlaceholderDetail from "@/routes/PlaceholderDetail";
import Dashboard from "@/routes/Dashboard";
import CategoryPage from "@/routes/CategoryPage";
import SystemDetail from "@/routes/SystemDetail";
import IconographyDetail from "@/routes/IconographyDetail";
import MotionDetail from "@/routes/MotionDetail";
import PalettesDetail from "@/routes/PalettesDetail";
import PatternsDetail from "@/routes/PatternsDetail";
import SettingsPage from "@/routes/SettingsPage";

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
      { path: "iconography/:slug", element: <IconographyDetail /> },
      { path: "motion", element: <CategoryPage kind="motion" /> },
      { path: "motion/:slug", element: <MotionDetail /> },
      { path: "palettes", element: <CategoryPage kind="palettes" /> },
      { path: "palettes/:slug", element: <PalettesDetail /> },
      { path: "patterns", element: <CategoryPage kind="patterns" /> },
      { path: "patterns/:slug", element: <PatternsDetail /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
