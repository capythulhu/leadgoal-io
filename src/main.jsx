import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { ConfigProvider, theme } from "antd";

function Root() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: "#0E0E0E",
          colorPrimary: "#36BECE",
          colorInfo: "#36BECE",
          colorWarning: "#fad014",
          colorTextBase: "#ebebeb",
          fontSize: 18,
          borderRadius: 16,
        },
        algorithm: [theme.darkAlgorithm],
      }}
    >
      <App />
    </ConfigProvider>
  );
}

export default Root;

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
