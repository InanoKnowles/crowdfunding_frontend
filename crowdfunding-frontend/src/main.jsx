import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import FundraisersPage from "./pages/FundraisersPage.jsx";
import FundraiserPage from "./pages/FundraiserPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import "./styles/global.css";
import { AuthProvider } from "./components/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="appLayout">
          <NavBar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fundraisers" element={<FundraisersPage />} />
            <Route path="/fundraiser/:id" element={<FundraiserPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
