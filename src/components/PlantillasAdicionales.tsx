"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/plantillasAdicionales.css";
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Plantilla {
  id: string;
  nombre: string;
  texto: string;
}

interface PlantillasAdicionalesProps {
  torre: string;
}

const STORAGE_KEY = "plantillasAdicionalesOrden";

const PlantillasAdicionales: React.FC<PlantillasAdicionalesProps> = ({ torre }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [ordenPlantillas, setOrdenPlantillas] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modo, setModo] = useState<"agregar" | "editar">("agregar");

  const [formData, setFormData] = useState<{
    id: string | null;
    nombre: string;
    texto: string;
  }>({ id: null, nombre: "", texto: "" });

  const API = `${process.env.NEXT_PUBLIC_API_URL}/api/notas`;

  // Cargar plantillas y orden desde la API y localStorage
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

      const filtradas: Plantilla[] = data
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

      // Cargar el orden guardado si existe
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const ordenGuardada = JSON.parse(guardado) as string[];
        setOrdenPlantillas(ordenGuardada.filter((id) => filtradas.some((p: Plantilla) => p.id === id)));
      } else {
        setOrdenPlantillas(filtradas.map((p: Plantilla) => p.id));
      }
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

  // Guardar el orden en localStorage cada vez que cambie
  useEffect(() => {
    if (ordenPlantillas.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenPlantillas));
    }
  }, [ordenPlantillas]);

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

  // Drag & drop: actualiza el orden y lo guarda
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(ordenPlantillas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setOrdenPlantillas(items);
  };

  // Obtener las plantillas en el orden actual
  const plantillasOrdenadas = ordenPlantillas
    .map(id => plantillas.find((p: Plantilla) => p.id === id))
    .filter(Boolean) as Plantilla[];

  return (
    <div className="plantilla-container">
      <div className="plantilla-card">
        <h2 className="plantilla-title">📄 Plantillas Adicionales</h2>

        <button className="agregar-button" onClick={abrirModalAgregar}>
          ➕ Agregar Plantilla
        </button>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="plantillas-list">
            {(provided) => (
              <div
                className="plantilla-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {plantillasOrdenadas.map((plantilla, index) => (
                  <Draggable key={plantilla.id} draggableId={plantilla.id} index={index}>
                    {(provided) => (
                      <div
                        className="plantilla-item"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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