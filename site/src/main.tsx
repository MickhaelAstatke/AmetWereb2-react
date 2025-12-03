//@ts-nochecks
import React from "react";
import ReactDOM from "react-dom/client";
import RootLayout from "./components/RootLayout.tsx";
import "./index.css";
import "./assets/AbyssinicaSIL-Regular.ttf";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import Editor, {
  loader as dataLoader,
  action as updateAction,
} from "./components/Editor.tsx";
import NotFound from "./components/NotFound.tsx";
import App from "./components/App.tsx";

const queryParams = new URLSearchParams(window.location.search);
const prod = !!queryParams.get("prod");

let isDev = false;
try {
  isDev = import.meta.env.MODE == "development" && !prod;
} catch (e) {
  /* empty */
}

// console.log("prod", prod);
// console.log("isDev", isDev);
const devRoutes = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/meskerem/1" replace />,
      },
      {
        path: ":week/:day",
        element: <Editor />,
        loader: dataLoader,
        action: updateAction,
        errorElement: <NotFound />,
        children: [
          {
            path: ":highlight",
            element: <Editor />,
            loader: dataLoader,
            action: updateAction,
            errorElement: <NotFound />,
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];

const prodRoutes = [
  {
    path: "/:week/:day/:highlight?",
    element: <App />,
  },
  { path: "/", element: <App /> },
  { path: "*", element: <NotFound /> },
];

const router = createBrowserRouter(isDev ? devRoutes : prodRoutes);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
