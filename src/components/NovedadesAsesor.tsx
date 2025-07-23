"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import "../styles/novedadesAsesor.css";
import Modal from "./Modal"; // Asegúrate de que Modal.tsx esté en la misma carpeta

// 📝 Estructura que representa una novedad del asesor
interface Novedad {
  id: number;
  texto: string;
  imagen: string | null;
  fechaHora: string;
}

const NovedadesAsesor: React.FC = () => {
  // 📌 Estados locales
  const [texto, setTexto] = useState<string>("");              // Texto de la novedad actual
  const [imagen, setImagen] = useState<string | null>(null);   // Imagen adjunta (como base64)
  const [novedades, setNovedades] = useState<Novedad[]>([]);   // Lista de novedades
  const [modalAbierto, setModalAbierto] = useState<boolean>(false); // Estado del modal
  const [cargado, setCargado] = useState<boolean>(false);      // Control para evitar sobrescribir localStorage prematuramente

  // 📦 Cargar novedades desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const guardadas = localStorage.getItem("novedadesAsesor");
      if (guardadas) {
        try {
          setNovedades(JSON.parse(guardadas));
        } catch (error) {
          console.error("Error al parsear las novedades:", error);
        }
      }
      setCargado(true); // ✅ Marcamos como cargado para activar el guardado posterior
    }
  }, []);

  // 💾 Guardar novedades en localStorage cada vez que cambian, una vez cargadas
  useEffect(() => {
    if (cargado && typeof window !== "undefined") {
      localStorage.setItem("novedadesAsesor", JSON.stringify(novedades));
    }
  }, [novedades, cargado]);

  // 📸 Manejo del cambio de imagen
  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagen(reader.result as string);
    };
    reader.readAsDataURL(file); // Convertimos imagen a base64
  };

  // ➕ Agregar una nueva novedad
  const agregarNovedad = () => {
    if (texto.trim() === "") return;

    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-CO");
    const hora = ahora.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const nuevaNovedad: Novedad = {
      id: Date.now(),
      texto,
      imagen,
      fechaHora: `${fecha} ${hora}`,
    };

    setNovedades([nuevaNovedad, ...novedades]); // Añade al inicio
    setTexto("");       // Limpia textarea
    setImagen(null);    // Limpia imagen
    setModalAbierto(false); // Cierra el modal
  };

  // 🗑️ Eliminar una novedad por ID
  const eliminarNovedad = (id: number) => {
    setNovedades(novedades.filter((n) => n.id !== id));
  };

  return (
    <div className="novedades-container">
      <h2 className="novedades-titulo">📝 Novedades del Asesor</h2>

      <button className="btn" onClick={() => setModalAbierto(true)}>
        ➕ Agregar Novedad
      </button>

      <hr className="novedades-divider" />

      <h3>📋 Historial de Novedades</h3>

      {novedades.length === 0 ? (
        <p className="novedades-vacio">No hay novedades aún.</p>
      ) : (
        <ul className="novedades-lista">
          {novedades.map((n) => (
            <li key={n.id} className="novedades-item">
              <p><strong>{n.fechaHora}</strong></p>
              <p>{n.texto}</p>
              {n.imagen && (
                <div className="novedades-preview-mini">
                  <img src={n.imagen} alt="novedad" />
                </div>
              )}
              <button className="btn eliminar" onClick={() => eliminarNovedad(n.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 📦 Modal para crear novedad */}
      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} onSave={agregarNovedad}>
        <h3>🆕 Nueva Novedad</h3>

        <textarea
          className="novedades-textarea"
          rows={4}
          placeholder="Escribe la novedad..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <label className="novedades-imagen-label">
          📷 Adjuntar imagen:
          <input type="file" accept="image/*" onChange={handleImagenChange} />
        </label>

        {imagen && (
          <div className="novedades-preview">
            <img src={imagen} alt="preview" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NovedadesAsesor;
