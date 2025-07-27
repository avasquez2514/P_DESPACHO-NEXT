'use client';

import React from "react";
import { useRouter } from "next/navigation";
import LoginRegistro from "@/components/LoginRegistro";

const PantallaInicio: React.FC = () => {
  const router = useRouter();

  return (
    <div className="pantalla-inicio">
      <div className="columna-izquierda">
        <h2>Bienvenido a <span style={{ color: "#fff" }}>DaniCodex</span></h2>
        <p>Si ya tienes una cuenta por favor inicia sesión aquí</p>
        <button className="btn-iniciar" onClick={() => router.push("/login")}>
          Iniciar Sesión
        </button>
      </div>

      <div className="columna-derecha">
        <h2>Crear una cuenta</h2>
        <div className="redes-sociales">
          <button>📷</button>
          <button>💼</button>
          <button>📘</button>
        </div>
        <p>Crear una cuenta gratis</p>
        <LoginRegistro modoInicial="registro" onLogin={() => {}} />
      </div>
    </div>
  );
};

export default PantallaInicio;
