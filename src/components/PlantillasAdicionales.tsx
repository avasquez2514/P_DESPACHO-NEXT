"use client"; // Indica que este componente se ejecuta en el cliente (Next.js)

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/plantillasAdicionales.css";
import Modal from "./Modal";

// Interfaz que representa una plantilla adicional
interface Plantilla {
  id: string;
  nombre: string; // Nombre o título visible de la plantilla
  texto: string;  // Contenido del texto de la plantilla
}

const PlantillasAdicionales: React.FC = () => {
  // Lista de plantillas adicionales obtenidas del backend
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);

  // Estado para mostrar u ocultar el modal
  const [modalOpen, setModalOpen] = useState(false);

  // Estado para saber si se está agregando o editando una plantilla
  const [modo, setModo] = useState<"agregar" | "editar">("agregar");

  // Datos del formulario para agregar o editar
  const [formData, setFormData] = useState<{
    id: string | null;
    nombre: string;
    texto: string;
  }>({ id: null, nombre: "", texto: "" });

  // Ruta base del backend (ajustar si cambias de servidor)
  const API = `${process.env.NEXT_PUBLIC_API_URL}/api/notas`;

  /**
   * Función para cargar las plantillas del backend.
   * Filtra las plantillas que solo contienen campo `plantilla`,
   * excluyendo aquellas que tienen notas públicas, internas o de avances.
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

      // Se filtran solo las plantillas puras
      const filtradas = data
        .filter(
          (nota: any) =>
            nota.plantilla?.trim() &&
            !nota.nota_publica?.trim() &&
            !nota.nota_interna?.trim() &&
            !nota.nota_avances?.trim()
        )
        .map((nota: any) => ({
          id: nota.id,
          nombre: nota.novedad || "Sin título",
          texto: nota.plantilla,
        }));

      setPlantillas(filtradas);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    }
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarPlantillas();
  }, []);

  /**
   * Copia el texto de una plantilla al portapapeles.
   */
  const copiarPlantilla = (texto: string) => {
    navigator.clipboard.writeText(texto)
      .catch((err) => console.error("Error al copiar: ", err));
  };

  /**
   * Elimina una plantilla específica por su ID.
   */
  const eliminarPlantilla = async (id: string | null) => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("¿Estás seguro de eliminar esta plantilla?")) return;

    try {
      await fetch(`${API}/plantilla/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarPlantillas(); // Recarga después de eliminar
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
    }
  };

  /**
   * Abre el modal para agregar nueva plantilla.
   */
  const abrirModalAgregar = () => {
    setModo("agregar");
    setFormData({ id: null, nombre: "", texto: "" });
    setModalOpen(true);
  };

  /**
   * Abre el modal para editar una plantilla existente.
   */
  const abrirModalEditar = (plantilla: Plantilla) => {
    setModo("editar");
    setFormData({
      id: plantilla.id,
      nombre: plantilla.nombre,
      texto: plantilla.texto,
    });
    setModalOpen(true);
  };

  /**
   * Maneja el cambio de los campos del formulario.
   */
  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Guarda los datos del formulario: crea o actualiza una plantilla.
   */
  const guardarPlantilla = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    if (!token || !usuario?.id) return;

    try {
      if (modo === "agregar") {
        // Crear nueva plantilla
        await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: formData.nombre,
            plantilla: formData.texto,
            usuario_id: usuario.id,
          }),
        });
      } else if (modo === "editar" && formData.id) {
        // Modificar plantilla existente
        await fetch(`${API}/${formData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: formData.nombre,
            plantilla: formData.texto,
          }),
        });
      }

      setModalOpen(false);
      cargarPlantillas();
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
    }
  };

  // Render principal
  return (
    <div className="plantilla-container">
      <div className="plantilla-card">
        <h2 className="plantilla-title">📄 Plantillas Adicionales</h2>

        {/* Botón para agregar nueva plantilla */}
        <button className="agregar-button" onClick={abrirModalAgregar}>
          ➕ Agregar Plantilla
        </button>

        {/* Lista de plantillas */}
        <div className="plantilla-list">
          {plantillas.map((plantilla) => (
            <div key={plantilla.id} className="plantilla-item">
              <div className="plantilla-contenido">
                <h3 className="plantilla-nombre">{plantilla.nombre}</h3>
                <p className="plantilla-texto">{plantilla.texto}</p>
              </div>
        <div className="plantilla-buttons">
          <button
            className="plantilla-button copy"
            onClick={() => copiarPlantilla(plantilla.texto)}
            title="Copiar"
          >📋Copiar
          </button>
          <button
            className="plantilla-button edit"
            onClick={() => abrirModalEditar(plantilla)}
            title="Modificar"
          >✏️Modificar
          </button>
          <button
            className="plantilla-button clear"
            onClick={() => eliminarPlantilla(plantilla.id)}
            title="Eliminar"
          >🗑️Eliminar
          </button>
        </div>

            </div>
          ))}
        </div>
      </div>

      {/* Modal para agregar o editar plantilla */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2>{modo === "agregar" ? "Agregar Plantilla" : "Modificar Plantilla"}</h2>

        <label>Título</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={manejarCambio}
        />

        <label>Contenido</label>
        <textarea
          rows={5}
          name="texto"
          value={formData.texto}
          onChange={manejarCambio}
        />

        <div className="modal-buttons">
          <button onClick={guardarPlantilla} className="modal-save-button">
            {modo === "agregar" ? "💾 Guardar" : "Actualizar"}
          </button>

          {modo === "editar" && (
            <button
              onClick={() => eliminarPlantilla(formData.id)}
              className="modal-delete-button"
            >
              <FaTrash style={{ marginRight: "6px" }} />
              Eliminar
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PlantillasAdicionales;
