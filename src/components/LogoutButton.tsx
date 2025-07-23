"use client";

import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

const LogoutButton = () => {
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.reload(); // 🔁 recarga para aplicar cambios
  };

  return (
    <button onClick={cerrarSesion} className="logout-button">
      <FaSignOutAlt style={{ marginRight: "8px" }} />
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
