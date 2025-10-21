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
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // 🔧 Recuperar contraseña sin sesión
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const guardarSesionEnLocalStorage = (token: string, usuario: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  };

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    const ruta = esRegistro ? "registro" : "login";
    const datos = esRegistro ? { email, nombre, contraseña } : { email, contraseña };

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
        alert(resultado.mensaje || "Error en la autenticación");
        return;
      }

      guardarSesionEnLocalStorage(resultado.token, resultado.usuario);
      alert(resultado.mensaje);
      onLogin(resultado.usuario);
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  const recuperarContraseña = async (e: FormEvent) => {
    e.preventDefault();

    if (nueva !== confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const respuesta = await fetch(`${API_BASE}/api/auth/recuperar-contrasena`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, actual, nueva }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.mensaje || "Error al recuperar contraseña");
        return;
      }

      alert(resultado.mensaje);
      setModoRecuperar(false);
      setEmail("");
      setActual("");
      setNueva("");
      setConfirmar("");
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-disney-wrapper">
      <div className="login-disney-card">
        <img src="/icono01.png" alt="Logo A" className="login-disney-logo" />
        <h2 className="login-disney-title">
          {modoRecuperar
            ? "Recuperar contraseña"
            : esRegistro
            ? "Registro"
            : "Ingresa tu contraseña"}
        </h2>

        {modoRecuperar ? (
          <form onSubmit={recuperarContraseña} className="login-disney-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-disney-input"
            />

            {/* Contraseña actual */}
            <div className="login-disney-password-group">
              <input
                type={mostrarActual ? "text" : "password"}
                placeholder="Contraseña actual"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                required
                className="login-disney-input"
              />
              <span
                className="login-disney-eye"
                onClick={() => setMostrarActual((v) => !v)}
              >
                {mostrarActual ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Nueva contraseña */}
            <div className="login-disney-password-group">
              <input
                type={mostrarNueva ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                required
                className="login-disney-input"
              />
              <span
                className="login-disney-eye"
                onClick={() => setMostrarNueva((v) => !v)}
              >
                {mostrarNueva ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Confirmar nueva contraseña */}
            <div className="login-disney-password-group">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                placeholder="Confirmar nueva contraseña"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                className="login-disney-input"
              />
              <span
                className="login-disney-eye"
                onClick={() => setMostrarConfirmar((v) => !v)}
              >
                {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="login-disney-btn">
              Guardar nueva contraseña
            </button>
            <button
              type="button"
              onClick={() => setModoRecuperar(false)}
              className="login-disney-btn login-disney-btn-register"
              style={{ marginTop: "0.7rem", background: "#c62828" }}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <>
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
                >
                  {mostrar ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <small className="login-disney-case">
                (distingue mayúsculas y minúsculas)
              </small>
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
              style={{
                marginTop: "0.7rem",
                background: "linear-gradient(135deg, #050709, #88d700ab)",
              }}
            >
              {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </button>

            <button
              type="button"
              className="login-disney-link"
              style={{
                marginTop: "0.5rem",
                textDecoration: "underline",
                background: "none",
                border: "none",
                color: "#a4baf1ff",
                cursor: "pointer",
              }}
              onClick={() => setModoRecuperar(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginRegistro;
