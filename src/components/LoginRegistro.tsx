"use client";

import React, { useState, FormEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/loginregistro.css";

interface LoginRegistroProps {
  onLogin: (usuario: any) => void;
}

const LoginRegistro: React.FC<LoginRegistroProps> = ({ onLogin }) => {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  const guardarSesionEnLocalStorage = (token: string, usuario: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  };

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();

    const ruta = esRegistro ? "registro" : "login";
    const datos = esRegistro
      ? { email, nombre, contraseña }
      : { email, contraseña };

    try {
      setCargando(true);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const respuesta = await fetch(`${API_BASE}/api/auth/${ruta}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.mensaje || "Error al iniciar sesión o registrarse.");
        return;
      }

      guardarSesionEnLocalStorage(resultado.token, resultado.usuario);
      alert(resultado.mensaje || "Sesión iniciada correctamente.");
      onLogin(resultado.usuario);
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-disney-wrapper">
      <div className="login-disney-card">
        <img src="/icono01.png" alt="Logo A" className="login-disney-logo" />
        <h2 className="login-disney-title">
          {esRegistro ? "Registro" : "Ingresa tu contraseña"}
        </h2>
        <form onSubmit={manejarEnvio} className="login-disney-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-disney-input"
            autoComplete="username"
          />
          {esRegistro && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="login-disney-input"
              autoComplete="name"
            />
          )}
          <div className="login-disney-password-group">
            <input
              type={mostrar ? "text" : "password"}
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
              className="login-disney-input"
              autoComplete={esRegistro ? "new-password" : "current-password"}
            />
            <span
              className="login-disney-eye"
              onClick={() => setMostrar((v) => !v)}
              tabIndex={0}
              role="button"
              aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrar ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <small className="login-disney-case">(distingue mayúsculas y minúsculas)</small>
          <button type="submit" className="login-disney-btn" disabled={cargando}>
            {cargando
              ? esRegistro
                ? "Registrando..."
                : "Ingresando..."
              : esRegistro
              ? "Registrarse"
              : "Ingresar"}
          </button>
        </form>
        <button
          type="button"
          className="login-disney-btn login-disney-btn-register"
          onClick={() => setEsRegistro((v) => !v)}
          style={{ marginTop: "0.7rem", background: "linear-gradient(135deg, #050709, #88d700ab)" }}
        >
          {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
        {!esRegistro && (
          <a href="#" className="login-disney-link">
            ¿Olvidaste tu contraseña?
          </a>
        )}
      </div>
    </div>
  );
};

export default LoginRegistro;