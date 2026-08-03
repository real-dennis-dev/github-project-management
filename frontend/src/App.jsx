import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import AuthRoutes from "./routes/AuthRoutes";
// import GitHubRoutes from "./routes/GitHubRoutes";

// import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Home */}
          {/* <Route path="/" element={<Home />} /> */}

          {/* Authentication */}
          <Route path="/*" element={<AuthRoutes />} />

          {/* GitHub OAuth */}
          {/* <Route path="/github/*" element={<GitHubRoutes />} /> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
