"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/plantillasAdicionales.css";
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Plantilla {
  id: string; // plantilla_id
  relacionId?: string; // ID de la relación notas_despacho_rel
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
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<{
    id: string | null;
    relacionId: string | null;
    nombre: string;
    texto: string;
  }>({ id: null, relacionId: null, nombre: "", texto: "" });

  const API = `${process.env.NEXT_PUBLIC_API_URL}/api/notas`;

  const cargarPlantillas = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    if (!token || !usuario?.id) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token expirado o inválido
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Verificar que data es un array antes de usar filter
      if (!Array.isArray(data)) {
        console.error("Error: La respuesta de la API no es un array:", data);
        setPlantillas([]);
        setOrdenPlantillas([]);
        return;
      }

      const filtradas: Plantilla[] = data
        .filter(
          (nota: any) =>
            nota.plantilla?.trim() &&
            !nota.nota_publica?.trim() &&
            !nota.nota_interna?.trim() &&
            !nota.nota_avances?.trim()
        )
        .map((nota: any) => ({
          id: nota.plantilla_id, // Usar plantilla_id para las operaciones de plantilla base
          relacionId: nota.id, // Guardar el ID de la relación para referencia
          nombre: nota.novedad || "Sin título",
          texto: nota.plantilla,
        }));

      setPlantillas(filtradas);

      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const ordenGuardada = JSON.parse(guardado) as string[];

        const nuevasPlantillas = filtradas
          .map((p) => p.id)
          .filter((id) => !ordenGuardada.includes(id));

        setOrdenPlantillas([...ordenGuardada, ...nuevasPlantillas]);
      } else {
        setOrdenPlantillas(filtradas.map((p: Plantilla) => p.id));
      }
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
      setPlantillas([]);
      setOrdenPlantillas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

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

  const eliminarPlantilla = async (plantillaId: string | null) => {
    if (!plantillaId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("¿Estás seguro de eliminar esta plantilla?")) return;

    try {
      const response = await fetch(`${API}/plantilla/${plantillaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expirado o inválido
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          window.location.href = "/login";
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Plantilla eliminada:", result.mensaje);
      await cargarPlantillas();
    } catch (error) {
      console.error("❌ Error al eliminar plantilla:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al eliminar plantilla: ${errorMessage}`);
    }
  };

  const abrirModalAgregar = () => {
    setModo("agregar");
    setFormData({ id: null, relacionId: null, nombre: "", texto: "" });
    setModalOpen(true);
  };

  const abrirModalEditar = (plantilla: Plantilla) => {
    setModo("editar");
    setFormData({
      id: plantilla.id,
      relacionId: plantilla.relacionId || null,
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
      let response;
      
      if (modo === "agregar") {
        response = await fetch(API, {
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
        response = await fetch(`${API}/plantilla/${formData.id}`, {
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

      if (response && !response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expirado o inválido
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          window.location.href = "/login";
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      setModalOpen(false);
      await cargarPlantillas();
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al guardar plantilla: ${errorMessage}`);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(ordenPlantillas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setOrdenPlantillas(items);
  };

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

        {loading ? (
          <p style={{ textAlign: "center", padding: "1rem" }}>⏳ Cargando plantillas...</p>
        ) : (
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
        )}
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
