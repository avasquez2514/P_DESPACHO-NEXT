"use client"; // Indica que este componente se ejecuta en el cliente (Next.js)

import React, { FormEvent, useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
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
    <div className="login-wrapper">
      <div className="login-form-container">
        <div className="form-section">
          <div className="avatar-circle">A</div>
          <h2>{esRegistro ? "Registro" : "INICIAR SESIÓN"}</h2>

          <form onSubmit={manejarEnvio}>
            <div className="input-group">
              <FaEnvelope />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {esRegistro && (
              <div className="input-group">
                <FaUser />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <FaLock />
              <input
                type="password"
                placeholder="Contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={cargando}>
              {cargando
                ? esRegistro
                  ? "Registrando..."
                  : "Iniciando..."
                : esRegistro
                ? "Registrarse"
                : "Entrar"}
            </button>
          </form>

          <p onClick={() => setEsRegistro(!esRegistro)} className="switch-link">
            {esRegistro
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </p>
        </div>

        <div className="info-section">
          <div className="marca-login"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegistro;
