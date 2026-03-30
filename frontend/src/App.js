import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PredictionProvider } from "./context/PredictionContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import PredictPage from "./pages/PredictPage";
import ResultPage from "./pages/ResultPage";
import DashboardPage from "./pages/DashboardPage";
import ModelInfoPage from "./pages/ModelInfoPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <PredictionProvider>
      <Router>
        <Routes>
          {/* Layout wraps all pages via Outlet */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/model-info" element={<ModelInfoPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </Router>
    </PredictionProvider>
  );
}

export default App;
