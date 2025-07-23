"use client"; // 🧠 Indica que este componente debe ejecutarse en el cliente (Next.js)

import React, { useCallback, useEffect, useState } from "react";
import "../styles/notasAvances.css"; // Estilos CSS del componente
import Modal from "./Modal"; // Importa el componente Modal reutilizable

// 📘 Interfaz que define la forma de una nota
interface Nota {
  id: string;
  texto: string;
}

// 📘 Props del componente (recibe el nombre de la torre)
interface NotasAvancesProps {
  torre: string;
}

const NotasAvances: React.FC<NotasAvancesProps> = ({ torre }) => {
  // 🔧 Estados para controlar notas, modal y edición
  const [notasAvance, setNotasAvance] = useState<Nota[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [textoNota, setTextoNota] = useState("");
  const [modo, setModo] = useState<"agregar" | "modificar">("agregar");
  const [notaActual, setNotaActual] = useState<Nota | null>(null);

  // 🏷️ Prefijo que se antepone al texto copiado
  const prefijo = `Gestión-MOC-Torre ${torre}:\n\n`;

  // 🧾 Usuario y token extraídos del localStorage
  const usuario = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("usuario") || "null") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const usuario_id = usuario?.id;

  // 📥 Función para cargar notas desde el backend (filtra vacías)
  const cargarNotas = useCallback(async () => {
    if (!usuario_id || !token) return;

    try {
      const res = await fetch(`http://localhost:4000/api/notas/avances/${usuario_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const filtradas = data
        .filter((n: any) => n.nota_avances?.trim()) // elimina vacías
        .map((n: any) => ({ id: n.id, texto: n.nota_avances }));

      setNotasAvance(filtradas);
    } catch (error) {
      console.error("Error al cargar notas:", error);
    }
  }, [usuario_id, token]);

  // 📌 Cargar notas al montar el componente
  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  // 📋 Copiar nota con prefijo al portapapeles
  const copiarNota = (texto: string) => {
    navigator.clipboard.writeText(prefijo + texto)
      .catch((err) => console.error("Error al copiar: ", err));
  };

  // 🗑️ Eliminar nota del backend
  const eliminarNota = async (id: string) => {
    if (!token) return;
    if (!window.confirm("¿Deseas eliminar esta nota de avances?")) return;

    try {
      await fetch(`http://localhost:4000/api/notas/avances/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarNotas();
    } catch (error) {
      console.error("Error al eliminar nota:", error);
    }
  };

  // ➕ Abrir modal para agregar nota
  const abrirModalAgregar = () => {
    setTextoNota("");
    setModo("agregar");
    setModalOpen(true);
  };

  // ✏️ Abrir modal para editar una nota
  const abrirModalModificar = (nota: Nota) => {
    setTextoNota(nota.texto);
    setNotaActual(nota);
    setModo("modificar");
    setModalOpen(true);
  };

  // 💾 Guardar nota (nueva o modificada)
  const guardarNota = async () => {
    if (!textoNota.trim() || !token) return;

    try {
      if (modo === "agregar") {
        // Enviar nueva nota
        await fetch("http://localhost:4000/api/notas", {
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
        // Modificar nota existente
        await fetch(`http://localhost:4000/api/notas/${notaActual.id}`, {
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

  // 📦 Render del componente
  return (
    <div className="notas-avances-container">
      <h1 className="notas-avances-title">📌 Notas de Avances</h1>

      {/* Botón para agregar */}
      <button className="agregar-button" onClick={abrirModalAgregar}>
        ➕ Agregar Nota
      </button>

      {/* Lista de notas */}
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

      {/* Modal para agregar/modificar */}
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
