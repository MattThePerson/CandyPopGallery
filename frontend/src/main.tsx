import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
    redirect,
} from "react-router-dom";
import "./index.css";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Setup from "./pages/Setup";

const router = createBrowserRouter([
    {
        path: "/setup",
        element: <Setup />,
    },
    {
        path: "/",
        element: <RootLayout />,
        loader: async () => {
            const res = await fetch("/admin/setup-complete");
            const { done } = await res.json();
            if (!done) return redirect("/setup");
            return null;
        },
        children: [
            { index: true, element: <Home /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "settings", element: <Settings /> },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
