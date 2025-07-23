"use client";

// Importaciones necesarias
import React, { useEffect, useState } from "react";
import "../styles/envioCorreos.css";

// ✅ Propiedades opcionales del componente
interface EnvioCorreosProps {
  tipo?: "envioInicio" | "envioCierre" | "envioApertura";
}

// ✅ Componente principal
const EnvioCorreos: React.FC<EnvioCorreosProps> = ({ tipo = "envioInicio" }) => {
  // 📥 Estados para campos del correo
  const [para, setPara] = useState<string>("");
  const [cc, setCc] = useState<string>("");
  const [asunto, setAsunto] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");
  const [titulo, setTitulo] = useState<string>("");

  // 📆 Estados para fechas
  const [fechaHoyGuiones, setFechaHoyGuiones] = useState<string>("");
  const [fechaHoyGuionesBajo, setFechaHoyGuionesBajo] = useState<string>("");
  const [fechaMananaGuiones, setFechaMananaGuiones] = useState<string>("");
  const [fechaMananaGuionesBajo, setFechaMananaGuionesBajo] = useState<string>("");

  // 🗓️ Al montar el componente, genera las fechas actual y de mañana en distintos formatos
  useEffect(() => {
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    // Ej: 18-07-2025
    const formatGuiones = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };

    // Ej: 2025_07_18
    const formatGuionesBajo = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${y}_${m}_${d}`;
    };

    setFechaHoyGuiones(formatGuiones(hoy));
    setFechaHoyGuionesBajo(formatGuionesBajo(hoy));
    setFechaMananaGuiones(formatGuiones(manana));
    setFechaMananaGuionesBajo(formatGuionesBajo(manana));
  }, []);

  // 🧠 Actualiza el título dinámicamente según el tipo de envío
  useEffect(() => {
    switch (tipo) {
      case "envioInicio":
        setTitulo("📤 Envío de Correos - Inicio");
        break;
      case "envioCierre":
        setTitulo("📤 Envío de Correos - Cierre");
        break;
      case "envioApertura":
        setTitulo("📤 Envío de Correos - Apertura");
        break;
      default:
        setTitulo("📤 Envío de Correos");
    }
  }, [tipo]);

  // 📨 Lógica para generar automáticamente el asunto y el mensaje
  useEffect(() => {
    if (!fechaHoyGuiones || !fechaHoyGuionesBajo || !fechaMananaGuiones || !fechaMananaGuionesBajo) return;

    if (tipo === "envioApertura") {
      setAsunto(`Asignación Nacional ${fechaMananaGuiones} Logística de Campo B2B - EIA`);
      setMensaje(
        `Buen día,

Se anexa tabla con la apertura de despacho reparación con la Asignación Nacional ${fechaMananaGuiones}

En las zonas donde falte completar la ratio de órdenes a los técnicos y tecnólogos en el transcurso de la mañana se les estarán asignando las demás órdenes.`
      );
    }

    if (tipo === "envioCierre") {
      setAsunto(`[Mesa de Despacho] – Informe diario de actualización día de hoy_ ${fechaHoyGuionesBajo}_EIA`);
      setMensaje(
        `Cordial saludo.

Nos permitimos anexar la programación del día de hoy ${fechaHoyGuionesBajo} debidamente actualizado (estados). De igual manera ya se encuentra disponible en la ruta compartida.

Cualquier inquietud, quedamos atentos.`
      );
    }

    if (tipo === "envioInicio") {
      setAsunto(`[Mesa de Despacho] – Informe diario de programación_${fechaMananaGuionesBajo}_ EIA`);
      setMensaje(
        `Cordial saludo,

Nos permitimos anexar la programación para el día de mañana ${fechaMananaGuionesBajo}. De igual manera ya se encuentra disponible en la ruta compartida.

Cualquier inquietud, quedamos atentos.`
      );
    }
  }, [tipo, fechaHoyGuiones, fechaHoyGuionesBajo, fechaMananaGuiones, fechaMananaGuionesBajo]);

  // 📋 Copiar un solo campo al portapapeles
  const copiarTexto = (texto: string) => navigator.clipboard.writeText(texto);

  // 📋 Copiar todo el contenido del correo al portapapeles
  const copiarTodo = () => {
    const textoCompleto = `Para:\n${para}\n\nCC:\n${cc}\n\nAsunto:\n${asunto}\n\n${mensaje}`;
    navigator.clipboard.writeText(textoCompleto);
  };

  // 💾 Guardar en localStorage
  const guardarTodo = () => {
    const data = { para, cc, asunto, mensaje };
    localStorage.setItem(`correos_${tipo}`, JSON.stringify(data));
    alert("Información guardada");
  };

  return (
    <div className="envio-container">
      <h2 className="envio-titulo">{titulo}</h2>

      <label className="envio-label">Para:</label>
      <textarea
        className="envio-textarea"
        value={para}
        onChange={(e) => setPara(e.target.value)}
        placeholder="Direcciones de correo para..."
      />
      <button className="btn-mini" onClick={() => copiarTexto(para)}>Copiar Para</button>

      <label className="envio-label">CC:</label>
      <textarea
        className="envio-textarea"
        value={cc}
        onChange={(e) => setCc(e.target.value)}
        placeholder="Direcciones en copia..."
      />
      <button className="btn-mini" onClick={() => copiarTexto(cc)}>Copiar CC</button>

      <label className="envio-label">Asunto:</label>
      <input
        className="envio-input"
        type="text"
        value={asunto}
        onChange={(e) => setAsunto(e.target.value)}
        placeholder="Asunto del correo..."
      />
      <button className="btn-mini" onClick={() => copiarTexto(asunto)}>Copiar Asunto</button>

      <label className="envio-label">Mensaje:</label>
      <textarea
        className="envio-textarea"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Cuerpo del mensaje..."
        style={{ minHeight: "150px" }}
      />
      <button className="btn-mini" onClick={() => copiarTexto(mensaje)}>Copiar Mensaje</button>

      <div className="envio-botones">
        <button className="btn" onClick={copiarTodo}>📋 Copiar Todo</button>
        <button className="btn" onClick={guardarTodo}>💾 Guardar</button>
      </div>
    </div>
  );
};

export default EnvioCorreos;
