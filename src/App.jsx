import { theme, App as AntApp } from "antd";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfettiProvider } from "./providers/Confetti";
import Project from "./screens/Project";
import { ApiProvider } from "./providers/Api";

function defineDocumentStyles() {
  const { colorBgBase } = theme.useToken().token;
  document.documentElement.style.setProperty("background-color", colorBgBase);
  document.body.style.margin = "0";
}

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ApiProvider>
          <Project />,
        </ApiProvider>
      ),
    },
    {
      path: "/:id",
      element: (
        <ApiProvider localID={window.location.pathname.split("/").pop()}>
          <Project />
        </ApiProvider>
      ),
    },
  ]);

  defineDocumentStyles();

  return (
    <AntApp>
      <ConfettiProvider>
        <RouterProvider router={router} />
      </ConfettiProvider>
    </AntApp>
  );
}

export default App;
