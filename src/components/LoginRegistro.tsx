"use client";

import React, { useState, FormEvent, useEffect } from "react";
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

  // 👉 Para cambiar contraseña
  const [modoCambio, setModoCambio] = useState(false);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setUsuarioAutenticado(!!token);
  }, []);

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
      setUsuarioAutenticado(true);
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarContraseña = async (e: FormEvent) => {
    e.preventDefault();

    if (nueva !== confirmar) {
      alert("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No estás autenticado.");
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const respuesta = await fetch(`${API_BASE}/api/auth/cambiar-contraseña`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actual, nueva }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.mensaje || "Error al cambiar la contraseña.");
        return;
      }

      alert(resultado.mensaje);
      setModoCambio(false);
      setActual("");
      setNueva("");
      setConfirmar("");
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="login-disney-wrapper">
      <div className="login-disney-card">
        <img src="/icono01.png" alt="Logo A" className="login-disney-logo" />
        <h2 className="login-disney-title">
          {modoCambio
            ? "Cambiar contraseña"
            : esRegistro
            ? "Registro"
            : "Ingresa tu contraseña"}
        </h2>

        {/* ✅ FORMULARIO CAMBIO CONTRASEÑA */}
        {modoCambio ? (
          <form onSubmit={cambiarContraseña} className="login-disney-form">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
              className="login-disney-input"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
              className="login-disney-input"
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              className="login-disney-input"
            />
            <button type="submit" className="login-disney-btn">
              Guardar nueva contraseña
            </button>
            <button
              type="button"
              onClick={() => setModoCambio(false)}
              className="login-disney-btn login-disney-btn-register"
              style={{
                marginTop: "0.7rem",
                background: "linear-gradient(135deg, #3e3e3e, #d84747)",
              }}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <>
            {/* 🔐 FORMULARIO LOGIN/REGISTRO */}
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

            {/* 👉 Botón para cambiar contraseña solo si hay sesión */}
            {usuarioAutenticado && (
              <button
                type="button"
                className="login-disney-link"
                style={{ marginTop: "0.5rem", textDecoration: "underline", background: "none", border: "none" }}
                onClick={() => setModoCambio(true)}
              >
                Cambiar contraseña
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginRegistro;
