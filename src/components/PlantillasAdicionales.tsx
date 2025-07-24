"use client"; // Indica que este componente se ejecuta en el cliente (Next.js)

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/plantillasAdicionales.css";
import Modal from "./Modal";

// Interfaz que representa una plantilla adicional
interface Plantilla {
  id: string;
  nombre: string;
  texto: string;
}

// ✅ Interfaz para props
interface PlantillasAdicionalesProps {
  torre: string;
}

const PlantillasAdicionales: React.FC<PlantillasAdicionalesProps> = ({ torre }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modo, setModo] = useState<"agregar" | "editar">("agregar");

  const [formData, setFormData] = useState<{
    id: string | null;
    nombre: string;
    texto: string;
  }>({ id: null, nombre: "", texto: "" });

  const API = `${process.env.NEXT_PUBLIC_API_URL}/api/notas`;

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

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const copiarPlantilla = (texto: string) => {
    navigator.clipboard.writeText(texto).catch((err) =>
      console.error("Error al copiar: ", err)
    );
  };

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
      cargarPlantillas();
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
    }
  };

  const abrirModalAgregar = () => {
    setModo("agregar");
    setFormData({ id: null, nombre: "", texto: "" });
    setModalOpen(true);
  };

  const abrirModalEditar = (plantilla: Plantilla) => {
    setModo("editar");
    setFormData({
      id: plantilla.id,
      nombre: plantilla.nombre,
      texto: plantilla.texto,
    });
    setModalOpen(true);
  };

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const guardarPlantilla = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    if (!token || !usuario?.id) return;

    try {
      if (modo === "agregar") {
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

  return (
    <div className="plantilla-container">
      <div className="plantilla-card">
        <h2 className="plantilla-title">📄 Plantillas Adicionales</h2>

        <button className="agregar-button" onClick={abrirModalAgregar}>
          ➕ Agregar Plantilla
        </button>

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
                >
                  📋 Copiar
                </button>
                <button
                  className="plantilla-button edit"
                  onClick={() => abrirModalEditar(plantilla)}
                  title="Modificar"
                >
                  ✏️ Modificar
                </button>
                <button
                  className="plantilla-button clear"
                  onClick={() => eliminarPlantilla(plantilla.id)}
                  title="Eliminar"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
