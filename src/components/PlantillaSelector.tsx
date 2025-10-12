"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/plantillas.css";
import Modal from "./Modal";

// Tipos
interface Plantilla {
  id: string; // ID de la relación
  plantilla_id: string; // ID de la plantilla base
  notaPublica: string;
  notaInterna: string;
}

interface PlantillaSelectorProps {
  torre: string;
  onSelect: (texto: string) => void;
}

const PlantillaSelector: React.FC<PlantillaSelectorProps> = ({ torre, onSelect }) => {
  const [plantillas, setPlantillas] = useState<Record<string, Plantilla>>({});
  const [notaSeleccionada, setNotaSeleccionada] = useState("");
  const [tipoNota, setTipoNota] = useState<"publica" | "interna">("publica");
  const [textoNota, setTextoNota] = useState("");
  const [textoModificado, setTextoModificado] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState<"agregar" | "modificar">("agregar");

  const [formData, setFormData] = useState({
    novedad: "",
    nota_publica: "",
    nota_interna: "",
  });

  const API = `${process.env.NEXT_PUBLIC_API_URL}/api/notas`;

  // Cargar plantillas desde la API
  const cargarPlantillas = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    if (!token || !usuario?.id) return;

    try {
      const res = await fetch(`${API}/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const agrupadas: Record<string, Plantilla> = {};
      data.forEach((row: any) => {
        if (!row.plantilla) {
          const novedad = row.novedad || "Sin título";
          agrupadas[novedad] = {
            id: row.id,
            plantilla_id: row.plantilla_id,
            notaPublica: row.nota_publica || "",
            notaInterna: row.nota_interna || "",
          };
        }
      });

      setPlantillas(agrupadas);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

  useEffect(() => {
    if (notaSeleccionada && plantillas[notaSeleccionada] && !textoModificado) {
      const encabezado = `Gestión-MOC-Torre ${torre}:`;
      const nota = tipoNota === "publica"
        ? plantillas[notaSeleccionada].notaPublica
        : `${encabezado}\n\n${plantillas[notaSeleccionada].notaInterna}`;
      setTextoNota(nota);
      onSelect(nota);
    }
  }, [notaSeleccionada, tipoNota, plantillas, torre, textoModificado, onSelect]);

  const handleNotaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNotaSeleccionada(e.target.value);
    setTextoModificado(false);
  };

  const handleTipoNotaChange = (tipo: "publica" | "interna") => {
    setTipoNota(tipo);
    setTextoModificado(false);
  };

  const handleTextoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextoNota(e.target.value);
    setTextoModificado(true);
  };

  const copiarTexto = () => navigator.clipboard.writeText(textoNota);
  const limpiarTexto = () => {
    setTextoNota("");
    setTextoModificado(true);
    onSelect("");
  };

  const abrirModalAgregar = () => {
    setModoModal("agregar");
    setFormData({ novedad: "", nota_publica: "", nota_interna: "" });
    setMostrarModal(true);
  };

  const abrirModalModificar = () => {
    if (!notaSeleccionada) return;
    const actual = plantillas[notaSeleccionada];
    setModoModal("modificar");
    setFormData({
      novedad: notaSeleccionada,
      nota_publica: actual.notaPublica,
      nota_interna: actual.notaInterna,
    });
    setMostrarModal(true);
  };

  const handleSubmitModal = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    if (!token || !usuario?.id) return;

    try {
      if (modoModal === "agregar") {
        await fetch(`${API}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: formData.novedad.trim(),
            nota_publica: formData.nota_publica.trim(),
            nota_interna: formData.nota_interna.trim(),
            usuario_id: usuario.id,
          }),
        });
      } else {
        const actual = plantillas[notaSeleccionada];
        await fetch(`${API}/plantilla/${actual.plantilla_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: formData.novedad.trim(),
            nota_publica: formData.nota_publica.trim(),
            nota_interna: formData.nota_interna.trim(),
            nota_avances: "",
            plantilla: ""
          }),
        });
        setNotaSeleccionada(formData.novedad.trim());
      }

      setMostrarModal(false);
      cargarPlantillas();
    } catch (error) {
      console.error("Error al guardar/editar:", error);
    }
  };

  const eliminarPlantilla = async () => {
    if (!notaSeleccionada) return;
    const id = plantillas[notaSeleccionada].id;
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm(`¿Eliminar plantilla "${notaSeleccionada}"?`)) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Plantilla eliminada:", result.mensaje);

      setNotaSeleccionada("");
      setTextoNota("");
      onSelect("");
      cargarPlantillas();
    } catch (error) {
      console.error("❌ Error al eliminar plantilla:", error);
      alert(`Error al eliminar plantilla: ${error.message}`);
    }
  };

  return (
    <div className="plantilla-container">
      <div className="plantilla-card">
        <h2 className="plantilla-title">Selecciona Nota</h2>

        <select value={notaSeleccionada} onChange={handleNotaChange} className="plantilla-select">
          <option value="">-- Selecciona una nota --</option>
          {Object.keys(plantillas).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <div className="plantilla-buttons">
          <button className="plantilla-button copy" onClick={abrirModalAgregar}>➕ Agregar</button>
          <button className="plantilla-button copy" onClick={abrirModalModificar}>✏️ Modificar</button>
          <button className="plantilla-button clear" onClick={eliminarPlantilla}>🗑️ Eliminar</button>
        </div>

        {notaSeleccionada && (
          <>
            <textarea
              rows={5}
              value={textoNota}
              onChange={handleTextoChange}
              className="plantilla-textarea"
            />

            <div className="plantilla-buttons">
              <button
                className={`plantilla-button publica ${tipoNota === "publica" ? "active" : ""}`}
                onClick={() => handleTipoNotaChange("publica")}
              >
                Nota Pública
              </button>
              <button
                className={`plantilla-button interna ${tipoNota === "interna" ? "active" : ""}`}
                onClick={() => handleTipoNotaChange("interna")}
              >
                Nota Interna
              </button>
            </div>

            <div className="plantilla-buttons">
              <button className="plantilla-button copy" onClick={copiarTexto}>📋 Copiar</button>
              <button className="plantilla-button clear" onClick={limpiarTexto}>🧹 Limpiar</button>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={mostrarModal} onClose={() => setMostrarModal(false)}>
        <h2>{modoModal === "agregar" ? "Agregar Plantilla" : "Modificar Plantilla"}</h2>

        <label>Novedad:</label>
        <input
          value={formData.novedad}
          onChange={(e) => setFormData({ ...formData, novedad: e.target.value })}
        />

        <label>Nota Pública:</label>
        <textarea
          rows={3}
          value={formData.nota_publica}
          onChange={(e) => setFormData({ ...formData, nota_publica: e.target.value })}
        />

        <label>Nota Interna:</label>
        <textarea
          rows={3}
          value={formData.nota_interna}
          onChange={(e) => setFormData({ ...formData, nota_interna: e.target.value })}
        />

        <div className="modal-buttons">
          <button onClick={handleSubmitModal} className="modal-save-button">
            {modoModal === "agregar" ? "💾 Guardar" : "Actualizar"}
          </button>

          {modoModal === "modificar" && (
            <button onClick={eliminarPlantilla} className="modal-delete-button">
              <FaTrash style={{ marginRight: "8px" }} /> Eliminar
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PlantillaSelector;
