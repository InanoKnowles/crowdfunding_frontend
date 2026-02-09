import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar.jsx";
import HomePage from "./pages/HomePage.jsx";
import FundraisersPage from "./pages/FundraisersPage.jsx";
import FundraiserPage from "./pages/FundraiserPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

import "./styles/global.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fundraisers" element={<FundraisersPage />} />
        <Route path="/fundraiser/:id" element={<FundraiserPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);