"use client";

import React, { useEffect, useState } from "react";
import "../styles/envioCorreos.css";

interface EnvioCorreosProps {
  tipo: "envioInicio" | "envioCierre" | "envioApertura";
}

const EnvioCorreos: React.FC<EnvioCorreosProps> = ({ tipo }) => {
  const [para, setPara] = useState("");
  const [cc, setCc] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [titulo, setTitulo] = useState("");

  const [fechaHoyGuiones, setFechaHoyGuiones] = useState("");
  const [fechaHoyGuionesBajo, setFechaHoyGuionesBajo] = useState("");
  const [fechaMananaGuiones, setFechaMananaGuiones] = useState("");
  const [fechaMananaGuionesBajo, setFechaMananaGuionesBajo] = useState("");

  // 👉 Cargar datos guardados en localStorage
  useEffect(() => {
    const dataGuardada = localStorage.getItem(`correos_${tipo}`);
    if (dataGuardada) {
      try {
        const { para, cc, asunto, mensaje } = JSON.parse(dataGuardada);
        setPara(para || "");
        setCc(cc || "");
        setAsunto(asunto || "");
        setMensaje(mensaje || "");
      } catch (e) {
        console.error("❌ Error cargando datos de localStorage:", e);
      }
    }
  }, [tipo]);

  // 📅 Fechas de hoy y mañana en varios formatos
  useEffect(() => {
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    const formatGuiones = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };

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

  // 🔤 Título del componente
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
    }
  }, [tipo]);

  // 📝 Contenido predeterminado según el tipo
  useEffect(() => {
    if (!fechaHoyGuiones || !fechaHoyGuionesBajo || !fechaMananaGuiones || !fechaMananaGuionesBajo) return;

    switch (tipo) {
      case "envioApertura":
        setAsunto(`Asignación Nacional ${fechaMananaGuiones} Logística de Campo B2B - EIA`);
        setMensaje(`Buen día,

Se anexa tabla con la apertura de despacho reparación con la Asignación Nacional ${fechaMananaGuiones}

En las zonas donde falte completar la ratio de órdenes a los técnicos y tecnólogos en el transcurso de la mañana se les estarán asignando las demás órdenes.`);
        break;

      case "envioCierre":
        setAsunto(`[Mesa de Despacho] – Informe diario de actualización día de hoy_ ${fechaHoyGuionesBajo}_EIA`);
        setMensaje(`Cordial saludo.

Nos permitimos anexar la programación del día de hoy ${fechaHoyGuionesBajo} debidamente actualizado (estados). De igual manera ya se encuentra disponible en la ruta compartida.

Cualquier inquietud, quedamos atentos.`);
        break;

      case "envioInicio":
        setAsunto(`[Mesa de Despacho] – Informe diario de programación_${fechaMananaGuionesBajo}_ EIA`);
        setMensaje(`Cordial saludo,

Nos permitimos anexar la programación para el día de mañana ${fechaMananaGuionesBajo}. De igual manera ya se encuentra disponible en la ruta compartida.

Cualquier inquietud, quedamos atentos.`);
        break;
    }
  }, [tipo, fechaHoyGuiones, fechaHoyGuionesBajo, fechaMananaGuiones, fechaMananaGuionesBajo]);

  // ✂️ Funciones para copiar y guardar
  const copiarTexto = (texto: string) => navigator.clipboard.writeText(texto);
  const copiarTodo = () => {
    const textoCompleto = `Para:\n${para}\n\nCC:\n${cc}\n\nAsunto:\n${asunto}\n\n${mensaje}`;
    navigator.clipboard.writeText(textoCompleto);
  };
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
