"use client"; // Este componente se ejecuta en el cliente (Next.js)

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa"; // Icono para eliminar
import "../styles/plantillas.css";
import Modal from "./Modal"; // Componente modal reutilizable

// Tipo para una plantilla cargada desde la API
interface Plantilla {
  id: string;
  notaPublica: string;
  notaInterna: string;
}

// Props esperadas por el componente
interface PlantillaSelectorProps {
  torre: string;                    // Torre actual (para personalizar encabezados)
  onSelect: (texto: string) => void; // Función que devuelve el texto seleccionado
}

const PlantillaSelector: React.FC<PlantillaSelectorProps> = ({ torre, onSelect }) => {
  // Estado que contiene todas las plantillas organizadas por novedad
  const [plantillas, setPlantillas] = useState<Record<string, Plantilla>>({});
  
  // Novedad seleccionada en el dropdown
  const [notaSeleccionada, setNotaSeleccionada] = useState<string>("");

  // Tipo de nota activa: pública o interna
  const [tipoNota, setTipoNota] = useState<"publica" | "interna">("publica");

  // Contenido mostrado en el textarea
  const [textoNota, setTextoNota] = useState<string>("");

  // Bandera para saber si el usuario modificó el texto manualmente
  const [textoModificado, setTextoModificado] = useState<boolean>(false);

  // Estados para controlar el modal
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [modoModal, setModoModal] = useState<"agregar" | "modificar">("agregar");

  // Datos del formulario del modal
  const [formData, setFormData] = useState({
    novedad: "",
    nota_publica: "",
    nota_interna: "",
  });

  const API = "http://localhost:4000/api/notas"; // URL de la API

  /**
   * Carga las plantillas del backend según el usuario autenticado.
   */
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

      // Agrupamos las plantillas que no son "plantilla adicional"
      data.forEach((row: any) => {
        if (!row.plantilla) {
          const novedad = row.novedad || "Sin título";
          agrupadas[novedad] = {
            id: row.id,
            notaPublica: row.nota_publica || "",
            notaInterna: row.nota_interna || "",
          };
        }
      });

      setPlantillas(agrupadas);
    } catch (error) {
      console.error("Error cargando plantillas:", error);
    }
  };

  // Al cargar el componente
  useEffect(() => {
    cargarPlantillas();
  }, []);

  // Cada vez que cambia el tipo o novedad, se actualiza el contenido
  useEffect(() => {
    if (notaSeleccionada && plantillas[notaSeleccionada] && !textoModificado) {
      const encabezado = `Gestión-MOC-Torre ${torre}:`;
      const nota =
        tipoNota === "publica"
          ? plantillas[notaSeleccionada].notaPublica
          : plantillas[notaSeleccionada].notaInterna;
      const textoCompleto = tipoNota === "publica" ? nota : `${encabezado}\n\n${nota}`;

      setTextoNota(textoCompleto);
      onSelect(textoCompleto);
    }
  }, [tipoNota, notaSeleccionada, plantillas, torre, onSelect, textoModificado]);

  // Maneja el cambio de novedad en el <select>
  const handleNotaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNotaSeleccionada(e.target.value);
    setTextoModificado(false);
  };

  // Cambia entre pública o interna
  const handleTipoNotaChange = (tipo: "publica" | "interna") => {
    setTipoNota(tipo);
    setTextoModificado(false);
  };

  // Cambios en el textarea
  const handleTextoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextoNota(e.target.value);
    setTextoModificado(true);
  };

  // Copia el contenido al portapapeles
  const copiarTexto = () => navigator.clipboard.writeText(textoNota);

  // Limpia el texto y notifica al padre
  const limpiarTexto = () => {
    setTextoNota("");
    setTextoModificado(true);
    onSelect("");
  };

  // Abre el modal para agregar plantilla
  const abrirModalAgregar = () => {
    setModoModal("agregar");
    setFormData({ novedad: "", nota_publica: "", nota_interna: "" });
    setMostrarModal(true);
  };

  // Abre el modal para modificar plantilla existente
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

  // Envía el formulario del modal
  const handleSubmitModal = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    if (!token || !usuario?.id) return;

    try {
      if (modoModal === "agregar") {
        await fetch(API, {
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
        await fetch(`${API}/${actual.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: formData.novedad.trim(),
            nota_publica: formData.nota_publica.trim(),
            nota_interna: formData.nota_interna.trim(),
          }),
        });
        setNotaSeleccionada(formData.novedad.trim());
      }

      setMostrarModal(false);
      cargarPlantillas();
    } catch (error) {
      console.error("Error en el modal:", error);
    }
  };

  // Elimina una plantilla
  const eliminarPlantilla = async () => {
    if (!notaSeleccionada) return;
    const id = plantillas[notaSeleccionada].id;
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm(`¿Eliminar plantilla "${notaSeleccionada}"?`)) return;

    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotaSeleccionada("");
      setTextoNota("");
      onSelect("");
      cargarPlantillas();
    } catch (error) {
      console.error("Error al eliminar la plantilla:", error);
    }
  };

  // Render del componente principal
  return (
    <div className="plantilla-container">
      <div className="plantilla-card">
        <h2 className="plantilla-title">Selecciona Nota</h2>

        {/* Dropdown de novedades */}
        <select
          value={notaSeleccionada}
          onChange={handleNotaChange}
          className="plantilla-select"
        >
          <option value="">-- Selecciona una nota --</option>
          {Object.keys(plantillas).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        {/* Botones de acción */}
        <div className="plantilla-buttons">
          <button className="plantilla-button copy" onClick={abrirModalAgregar}>➕ Agregar</button>
          <button className="plantilla-button copy" onClick={abrirModalModificar}>✏️ Modificar</button>
          <button className="plantilla-button clear" onClick={eliminarPlantilla}>🗑️ Eliminar</button>
        </div>

        {/* Textarea y opciones si hay nota seleccionada */}
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

      {/* Modal para agregar o modificar plantilla */}
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
            {modoModal === "agregar" ? "💾Guardar" : "Actualizar"}
          </button>

          {modoModal === "modificar" && (
            <button onClick={eliminarPlantilla} className="modal-delete-button">
              <FaTrash style={{ marginRight: "8px" }} />
              Eliminar
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PlantillaSelector;
