"use client"; // Indica que este componente se ejecuta en el cliente (Next.js)

import React, { FormEvent, useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import "../styles/loginregistro.css";

// 📘 Interface para tipar las props del componente
interface LoginRegistroProps {
  onLogin: (usuario: any) => void; // Función que se ejecuta cuando el usuario inicia sesión o se registra exitosamente
}

// 🧠 Componente principal
const LoginRegistro: React.FC<LoginRegistroProps> = ({ onLogin }) => {
  // 🔐 Estados del formulario
  const [esRegistro, setEsRegistro] = useState(false);         // Controla si estamos en modo registro o login
  const [email, setEmail] = useState("");                      // Email del usuario
  const [nombre, setNombre] = useState("");                    // Nombre (solo se usa en registro)
  const [contraseña, setContraseña] = useState("");            // Contraseña
  const [cargando, setCargando] = useState(false);             // Estado de carga para evitar múltiples envíos

  // 💾 Guardar sesión en localStorage
  const guardarSesionEnLocalStorage = (token: string, usuario: any) => {
    localStorage.setItem("token", token);                      // Guarda el token
    localStorage.setItem("usuario", JSON.stringify(usuario)); // Guarda el objeto usuario
  };

  // 📤 Manejo del formulario
  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault(); // Previene recarga

    // Determina si estamos en login o registro
    const ruta = esRegistro ? "registro" : "login";
    const datos = esRegistro
      ? { email, nombre, contraseña }
      : { email, contraseña };

    try {
      setCargando(true); // Activa estado de carga

      const respuesta = await fetch(`http://localhost:4000/api/auth/${ruta}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.mensaje || "Error al iniciar sesión o registrarse.");
        return;
      }

      // Éxito: guarda sesión y ejecuta onLogin
      guardarSesionEnLocalStorage(resultado.token, resultado.usuario);
      alert(resultado.mensaje || "Sesión iniciada correctamente.");
      onLogin(resultado.usuario);
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false); // Finaliza estado de carga
    }
  };

  // 🖼️ Render del componente
  return (
    <div className="login-wrapper">
      <div className="login-form-container">
        {/* 🧾 Sección del formulario */}
        <div className="form-section">
          <div className="avatar-circle">A</div>
          <h2>{esRegistro ? "Registro" : "INICIAR SESIÓN"}</h2>

          <form onSubmit={manejarEnvio}>
            {/* Campo de email */}
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

            {/* Campo de nombre (solo en modo registro) */}
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

            {/* Campo de contraseña */}
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

            {/* Botón de enviar */}
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

          {/* Enlace para alternar entre login y registro */}
          <p onClick={() => setEsRegistro(!esRegistro)} className="switch-link">
            {esRegistro
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </p>
        </div>

        {/* 🌐 Sección adicional (puede contener una marca, imagen, etc.) */}
        <div className="info-section">
          <div className="marca-login"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegistro;
