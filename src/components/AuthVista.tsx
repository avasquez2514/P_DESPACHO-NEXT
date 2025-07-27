"use client";

import React, { useState } from "react";
import LoginRegistro from "./LoginRegistro";
import "../styles/loginregistro.css";

const AuthVista: React.FC = () => {
  const [mostrarLogin, setMostrarLogin] = useState(false);

  // Puedes agregar aquí la lógica de registro si lo necesitas
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const respuesta = await fetch(`${API_BASE}/api/auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, contraseña }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        alert(resultado.mensaje || "Error al registrar.");
        return;
      }
      alert(resultado.mensaje || "Usuario registrado correctamente.");
      setNombre("");
      setEmail("");
      setContraseña("");
      setMostrarLogin(true); // Ir al login después de registrar
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  if (mostrarLogin) {
    return <LoginRegistro onLogin={() => {}} />;
  }

  return (
    <div className="auth-vista-wrapper">
      <div className="auth-vista-col auth-vista-left">
        <h1>¡Hola!</h1>
        <p>
          Regístrese con sus datos personales para utilizar todas las funciones del sitio
        </p>
        <button
          className="auth-vista-btn"
          onClick={() => setMostrarLogin(true)}
        >
          Iniciar sesión
        </button>
      </div>
      <div className="auth-vista-col auth-vista-right">
        <h2>Registrarse</h2>
        <form className="auth-vista-form" onSubmit={manejarRegistro}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="login-disney-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-disney-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            className="login-disney-input"
          />
          <button type="submit" className="auth-vista-btn" disabled={cargando}>
            {cargando ? "Registrando..." : "REGISTRARSE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthVista;