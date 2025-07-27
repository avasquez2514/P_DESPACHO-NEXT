"use client";

import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/notasConciliacion.css";
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface NotasConciliacionProps {
  torre: string;
}

type Modo = "agregar" | "modificar" | "";

const STORAGE_KEY = "categoriasConciliacionOrden";

const categoriasIniciales = [
  "CONCILIACION EQUIPOS",
  "CONCILIACION MESA",
  "CONCILIACION METRAJE",
  "CONCILIACION HOTELES",
  "CONCILIACION N2/N3",
  "CONCILIACION INVENTARIO",
  "CONCILIACION TIGO",
  "CONCILIACION CLIENTE",
  "CONCILIACION INFRAESTRUCTURA",
  "CONCILIACION CENTROS COMERCIALES",
  "CONCILIACION BMC",
];

const NotasConciliacion: React.FC<NotasConciliacionProps> = ({ torre }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modo, setModo] = useState<Modo>("");
  const [textoTemporal, setTextoTemporal] = useState("");
  const [indexEditar, setIndexEditar] = useState<number | null>(null);

  // Cargar el orden desde localStorage al iniciar
  const [categorias, setCategorias] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const guardadas = localStorage.getItem(STORAGE_KEY);
      return guardadas ? JSON.parse(guardadas) : categoriasIniciales;
    }
    return categoriasIniciales;
  });

  // Guardar el orden en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categorias));
  }, [categorias]);

  const abrirModalAgregar = () => {
    setModo("agregar");
    setTextoTemporal("");
    setModalOpen(true);
  };

  const abrirModalModificar = (index: number) => {
    setModo("modificar");
    setTextoTemporal(categorias[index]);
    setIndexEditar(index);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setTextoTemporal("");
    setIndexEditar(null);
  };

  const guardarModal = () => {
    if (!textoTemporal.trim()) return;
    if (modo === "agregar") {
      setCategorias([...categorias, textoTemporal.trim()]);
    } else if (modo === "modificar" && indexEditar !== null) {
      const nuevas = [...categorias];
      nuevas[indexEditar] = textoTemporal.trim();
      setCategorias(nuevas);
    }
    cerrarModal();
  };

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto)
      .catch((err) => console.error("Error al copiar el texto:", err));
  };

  const eliminarCategoria = (index: number) => {
    const confirmado = window.confirm("¿Estás seguro de eliminar esta categoría?");
    if (!confirmado) return;
    const nuevas = categorias.filter((_, i) => i !== index);
    setCategorias(nuevas);
  };

  // Drag & drop: actualiza el orden y lo guarda
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(categorias);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCategorias(items);
  };

  return (
    <div className="notas-conciliacion-container">
      <div className="notas-conciliacion-card">
        <h2 className="notas-conciliacion-title">🧾 Notas de Conciliación</h2>
        <button className="agregar-button" onClick={abrirModalAgregar}>
          ➕ Agregar Categoría
        </button>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categorias-list">
            {(provided) => (
              <div
                className="notas-conciliacion-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categorias.map((categoria, index) => (
                  <Draggable key={categoria} draggableId={categoria} index={index}>
                    {(provided) => (
                      <div
                        className="conciliacion-item"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <p className="conciliacion-texto">{categoria}</p>
                        <div className="conciliacion-buttons">
                          <button
                            className="conciliacion-button"
                            onClick={() => copiarTexto(categoria)}
                            title="Copiar"
                          >
                            📋
                          </button>
                          <button
                            className="conciliacion-button eliminar"
                            onClick={() => eliminarCategoria(index)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                          <button
                            className="conciliacion-button modificar"
                            onClick={() => abrirModalModificar(index)}
                            title="Modificar"
                          >
                            ✏️
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
      <Modal isOpen={modalOpen} onClose={cerrarModal}>
        <h2>{modo === "agregar" ? "Agregar Categoría" : "Modificar Categoría"}</h2>
        <input
          type="text"
          value={textoTemporal}
          onChange={(e) => setTextoTemporal(e.target.value)}
          placeholder="Escribe la categoría"
        />
        <div className="modal-buttons">
          <button onClick={guardarModal} className="modal-save-button">
            {modo === "agregar" ? "💾 Guardar" : "Actualizar"}
          </button>
          {modo === "modificar" && (
            <button
              onClick={() => {
                if (indexEditar !== null) eliminarCategoria(indexEditar);
                cerrarModal();
              }}
              className="modal-delete-button"
            >
              <FaTrash style={{ marginRight: "8px" }} />
              🗑️ Eliminar
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NotasConciliacion;