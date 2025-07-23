"use client"; // 🧠 Indica que este componente debe ejecutarse en el cliente (Next.js)

import React, { useCallback, useEffect, useState } from "react";
import "../styles/notasAvances.css";
import Modal from "./Modal";

// 📘 Interfaz de una nota
interface Nota {
  id: string;
  texto: string;
}

// 📘 Props del componente
interface NotasAvancesProps {
  torre: string;
}

// ✅ URL base del backend desde variable de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const NotasAvances: React.FC<NotasAvancesProps> = ({ torre }) => {
  const [notasAvance, setNotasAvance] = useState<Nota[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [textoNota, setTextoNota] = useState("");
  const [modo, setModo] = useState<"agregar" | "modificar">("agregar");
  const [notaActual, setNotaActual] = useState<Nota | null>(null);

  const prefijo = `Gestión-MOC-Torre ${torre}:\n\n`;

  const usuario = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("usuario") || "null") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const usuario_id = usuario?.id;

  const cargarNotas = useCallback(async () => {
    if (!usuario_id || !token) return;

    try {
      const res = await fetch(`${API_URL}/notas/avances/${usuario_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const filtradas = data
        .filter((n: any) => n.nota_avances?.trim())
        .map((n: any) => ({ id: n.id, texto: n.nota_avances }));

      setNotasAvance(filtradas);
    } catch (error) {
      console.error("Error al cargar notas:", error);
    }
  }, [usuario_id, token]);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  const copiarNota = (texto: string) => {
    navigator.clipboard.writeText(prefijo + texto)
      .catch((err) => console.error("Error al copiar: ", err));
  };

  const eliminarNota = async (id: string) => {
    if (!token) return;
    if (!window.confirm("¿Deseas eliminar esta nota de avances?")) return;

    try {
      await fetch(`${API_URL}/notas/avances/${id}`, {
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
        await fetch(`${API_URL}/notas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: "AVANCE",
            nota_avances: textoNota.trim(),
            usuario_id,
          }),
        });
      } else if (modo === "modificar" && notaActual) {
        await fetch(`${API_URL}/notas/${notaActual.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nota_avances: textoNota.trim() }),
        });
      }

      setModalOpen(false);
      cargarNotas();
    } catch (error) {
      console.error("Error al guardar nota:", error);
    }
  };

  return (
    <div className="notas-avances-container">
      <h1 className="notas-avances-title">📌 Notas de Avances</h1>

      <button className="agregar-button" onClick={abrirModalAgregar}>
        ➕ Agregar Nota
      </button>

      <div className="notas-list">
        {notasAvance.map((nota) => (
          <div key={nota.id} className="nota-item">
            <p className="nota-texto">{nota.texto}</p>
            <div className="nota-botones">
              <button
                onClick={() => copiarNota(nota.texto)}
                className="copy"
                title="Copiar"
              >
                📋
              </button>
              <button
                onClick={() => abrirModalModificar(nota)}
                className="edit"
                title="Modificar"
              >
                ✏️
              </button>
              <button
                onClick={() => eliminarNota(nota.id)}
                className="delete"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

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
