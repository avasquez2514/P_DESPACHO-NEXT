"use client";

import React, { useEffect, useState } from "react";

const Tema = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Al cargar, verifica si hay un usuario guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem("tema") === "oscuro";
    const user = localStorage.getItem("usuario");

    setDarkMode(savedTheme);
    setIsLoggedIn(!!user); // true si hay un usuario

    if (savedTheme) {
      document.body.classList.add("dark-theme");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("tema", "oscuro");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("tema", "claro");
    }
  }, [darkMode]);

  // Si no hay usuario, no mostrar el botón
  if (!isLoggedIn) return null;

  return (
    <button onClick={() => setDarkMode(!darkMode)} className="tema-toggle">
      {darkMode ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
    </button>
  );
};

export default Tema;
