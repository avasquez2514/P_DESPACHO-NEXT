"use client";

import React, { useCallback, useEffect, useState } from "react";
import "../styles/notasAvances.css";
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Nota {
  id: string; // ID de la relación (notas_despacho_rel)
  plantilla_id: string; // ID de la plantilla base
  texto: string;
}

interface NotasAvancesProps {
  torre: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const STORAGE_KEY = "notasAvancesOrden";

const NotasAvances: React.FC<NotasAvancesProps> = ({ torre }) => {
  const [notasAvance, setNotasAvance] = useState<Nota[]>([]);
  const [ordenNotas, setOrdenNotas] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [textoNota, setTextoNota] = useState("");
  const [modo, setModo] = useState<"agregar" | "modificar">("agregar");
  const [notaActual, setNotaActual] = useState<Nota | null>(null);
  const [cargando, setCargando] = useState(false); // 🔄 NUEVO ESTADO DE CARGA

  const prefijo = `Gestión-MOC-Torre ${torre}:\n\n`;

  const usuario = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("usuario") || "null") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const usuario_id = usuario?.id;

  const cargarNotas = useCallback(async () => {
    if (!usuario_id || !token) return;

    setCargando(true); // 🔄 INICIA CARGA

    try {
      const res = await fetch(`${API_URL}/api/notas/avances/${usuario_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const filtradas: Nota[] = data
        .filter((n: any) => n.nota_avances?.trim())
        .map((n: any) => ({ 
          id: n.id, 
          plantilla_id: n.plantilla_id,
          texto: n.nota_avances 
        }));

      setNotasAvance(filtradas);

      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const ordenGuardada = JSON.parse(guardado) as string[];
        const nuevasIds = filtradas.map((n) => n.id).filter((id) => !ordenGuardada.includes(id));
        setOrdenNotas([...ordenGuardada, ...nuevasIds]); // ✅ AGREGA NUEVAS NOTAS
      } else {
        setOrdenNotas(filtradas.map((n: Nota) => n.id));
      }

    } catch (error) {
      console.error("Error al cargar notas:", error);
    } finally {
      setCargando(false); // 🔄 TERMINA CARGA
    }
  }, [usuario_id, token]);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  useEffect(() => {
    if (ordenNotas.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenNotas));
    }
  }, [ordenNotas]);

  const copiarNota = (texto: string) => {
    navigator.clipboard.writeText(prefijo + texto).catch((err) => console.error("Error al copiar: ", err));
  };

  const eliminarNota = async (id: string) => {
    if (!token) return;
    if (!window.confirm("¿Deseas eliminar esta nota de avances?")) return;

    try {
      await fetch(`${API_URL}/api/notas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarNotas();
    } catch (error) {
      console.error("Error al eliminar nota:", error);
    }
  };

  const abrirModalAgregar = () => {
    setTextoNota("");
    setModo("agregar");
    setModalOpen(true);
  };

  const abrirModalModificar = (nota: Nota) => {
    setTextoNota(nota.texto);
    setNotaActual(nota);
    setModo("modificar");
    setModalOpen(true);
  };

  const guardarNota = async () => {
    if (!textoNota.trim() || !token) return;

    try {
      if (modo === "agregar") {
        await fetch(`${API_URL}/api/notas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: `Nota de Avance - ${new Date().toLocaleDateString()}`,
            nota_avances: textoNota.trim(),
            usuario_id,
          }),
        });
      } else if (modo === "modificar" && notaActual) {
        await fetch(`${API_URL}/api/notas/plantilla/${notaActual.plantilla_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            novedad: `Nota de Avance - ${new Date().toLocaleDateString()}`,
            nota_publica: "",
            nota_interna: "",
            nota_avances: textoNota.trim(),
            plantilla: ""
          }),
        });
      }

      setModalOpen(false);
      cargarNotas();
    } catch (error) {
      console.error("Error al guardar nota:", error);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(ordenNotas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setOrdenNotas(items);
  };

  const notasOrdenadas = ordenNotas
    .map(id => notasAvance.find((n: Nota) => n.id === id))
    .filter(Boolean) as Nota[];

  return (
    <div className="notas-avances-container">
      <h1 className="notas-avances-title">📌 Notas de Avances</h1>

      <button className="agregar-button" onClick={abrirModalAgregar}>
        ➕ Agregar Nota
      </button>

      {cargando && <p style={{ marginTop: "10px", fontWeight: "bold" }}>⏳ Cargando notas...</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="notas-list">
          {(provided) => (
            <div
              className="notas-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {notasOrdenadas.map((nota, index) => (
                <Draggable key={nota.id} draggableId={nota.id} index={index}>
                  {(provided) => (
                    <div
                      className="nota-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <p className="nota-texto">{nota.texto}</p>
                      <div className="nota-botones">
                        <button onClick={() => copiarNota(nota.texto)} className="copy" title="Copiar">
                          📋
                        </button>
                        <button onClick={() => abrirModalModificar(nota)} className="edit" title="Modificar">
                          ✏️
                        </button>
                        <button onClick={() => eliminarNota(nota.id)} className="delete" title="Eliminar">
                          🗑️
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2>{modo === "agregar" ? "Agregar Nota" : "Modificar Nota"}</h2>
        <textarea
          rows={4}
          value={textoNota}
          onChange={(e) => setTextoNota(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button onClick={guardarNota} className="modal-save-button">
          💾 Guardar Nota
        </button>
      </Modal>
    </div>
  );
};

export default NotasAvances;
