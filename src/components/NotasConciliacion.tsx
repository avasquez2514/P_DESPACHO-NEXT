"use client"; // 🧠 Obligatorio en Next.js para componentes que usan interactividad del cliente

import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/notasConciliacion.css";
import Modal from "./Modal"; // Componente Modal reutilizable

interface NotasConciliacionProps {
  torre: string;
}

// 📘 Tipo para el estado del modo actual del modal
type Modo = "agregar" | "modificar" | "";

// 📘 Lista inicial de categorías predefinidas
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

  // 🔧 Estados del modal y edición
  const [modalOpen, setModalOpen] = useState(false);
  const [modo, setModo] = useState<Modo>("");
  const [textoTemporal, setTextoTemporal] = useState("");
  const [indexEditar, setIndexEditar] = useState<number | null>(null);

  // 📂 Estado principal de las categorías
  const [categorias, setCategorias] = useState<string[]>(categoriasIniciales);

  // ➕ Abrir modal para agregar
  const abrirModalAgregar = () => {
    setModo("agregar");
    setTextoTemporal("");
    setModalOpen(true);
  };

  // ✏️ Abrir modal para modificar una categoría existente
  const abrirModalModificar = (index: number) => {
    setModo("modificar");
    setTextoTemporal(categorias[index]);
    setIndexEditar(index);
    setModalOpen(true);
  };

  // ❌ Cierra el modal y limpia estados temporales
  const cerrarModal = () => {
    setModalOpen(false);
    setTextoTemporal("");
    setIndexEditar(null);
  };

  // 💾 Guarda una nueva categoría o modifica una existente
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

  // 📋 Copia el texto de una categoría al portapapeles
  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto)
      .catch((err) => console.error("Error al copiar el texto:", err));
  };

  // 🗑️ Elimina una categoría de la lista
  const eliminarCategoria = (index: number) => {
    const confirmado = window.confirm("¿Estás seguro de eliminar esta categoría?");
    if (!confirmado) return;

    const nuevas = categorias.filter((_, i) => i !== index);
    setCategorias(nuevas);
  };

  return (
    <div className="notas-conciliacion-container">
      <div className="notas-conciliacion-card">
        <h2 className="notas-conciliacion-title">🧾 Notas de Conciliación</h2>

        <button className="agregar-button" onClick={abrirModalAgregar}>
          ➕ Agregar Categoría
        </button>

        <div className="notas-conciliacion-list">
          {categorias.map((categoria, index) => (
            <div key={index} className="conciliacion-item">
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
          ))}
        </div>
      </div>

      {/* Modal para agregar/modificar categoría */}
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
