import React, { useState } from "react";
import LoginRegistro from "./LoginRegistro";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import "../styles/loginregistro.css";

const PantallaInicio: React.FC = () => {
  const [mostrarLogin, setMostrarLogin] = useState(false);

  if (mostrarLogin) {
    return <LoginRegistro modoInicial="login" onLogin={(user) => console.log("Logeado:", user)} />;
  }

  return (
    <div className="pantalla-inicio">
      <div className="columna izquierda">
        <h1>Bienvenido a <span className="marca">DaniCodex</span></h1>
        <p>Si ya tienes una cuenta por favor inicia sesión aquí</p>
        <button onClick={() => setMostrarLogin(true)} className="btn-iniciar">
          Iniciar Sesión
        </button>
      </div>
      <div className="columna derecha">
        <div className="registro-box">
          <h2>Crear una cuenta</h2>
          <div className="iconos-sociales">
            <FaInstagram />
            <FaLinkedin />
            <FaFacebook />
          </div>
          <p className="registro-subtexto">Crear una cuenta gratis</p>
          <LoginRegistro modoInicial="registro" onLogin={(user) => console.log("Registrado:", user)} />
        </div>
      </div>
    </div>
  );
};

export default PantallaInicio;
