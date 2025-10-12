"use client";

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import "../styles/aplicativos.css";
import Modal from "./Modal";

interface Aplicativo {
  id: number;
  nombre: string;
  url: string;
  categoria: string;
}

interface NuevoAplicativo {
  nombre: string;
  url: string;
  categoria: string;
}

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/aplicativos`;

const Aplicativos: React.FC = () => {
  const [aplicativos, setAplicativos] = useState<Aplicativo[]>([]);
  const [nuevo, setNuevo] = useState<NuevoAplicativo>({ nombre: "", url: "", categoria: "" });
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([]);
  const [otraCategoria, setOtraCategoria] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [modoModal, setModoModal] = useState<"aplicativo" | "categoria">("aplicativo");

  const getUsuario = () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  };

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  useEffect(() => {
    fetchAplicativos();
  }, []);

  const fetchAplicativos = async () => {
    const token = getToken();
    const usuario = getUsuario();
    if (!token || !usuario?.id) return;

    try {
      const res = await fetch(`${API}?usuario_id=${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: Aplicativo[] = await res.json();
      setAplicativos(data);

      const categorias = [...new Set(data.map((a) => a.categoria))];
      setCategoriasDisponibles(categorias);
      if (!categoriaSeleccionada && categorias.length > 0) {
        setCategoriaSeleccionada(categorias[0]);
      }
    } catch (err) {
      console.error("Error al cargar aplicativos:", err);
    }
  };

  const agregarAplicativo = async () => {
    const token = getToken();
    const usuario = getUsuario();
    if (!token || !usuario?.id) return;
    if (!nuevo.nombre || !nuevo.url || !nuevo.categoria) return alert("Completa todos los campos");

    try {
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevo, usuario_id: usuario.id }),
      });

      resetFormulario();
      fetchAplicativos();
    } catch (err) {
      console.error("Error al agregar:", err);
    }
  };

  const guardarEdicion = async () => {
    const token = getToken();
    const usuario = getUsuario();
    if (!token || !usuario?.id || !editandoId) return;

    try {
      await fetch(`${API}/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevo, usuario_id: usuario.id }),
      });

      resetFormulario();
      fetchAplicativos();
    } catch (err) {
      console.error("Error al editar:", err);
    }
  };

  const eliminarAplicativo = async (id: number) => {
    const token = getToken();
    if (!token) return;
    if (!window.confirm("¿Eliminar este aplicativo?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Aplicativo eliminado:", result.mensaje);
      fetchAplicativos();
    } catch (err) {
      console.error("❌ Error al eliminar aplicativo:", err);
      alert(`Error al eliminar aplicativo: ${err.message}`);
    }
  };

  const eliminarCategoria = (cat: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat}" y todos sus aplicativos?`)) return;
    setAplicativos(aplicativos.filter((a) => a.categoria !== cat));
    const nuevas = categoriasDisponibles.filter((c) => c !== cat);
    setCategoriasDisponibles(nuevas);
    if (categoriaSeleccionada === cat) {
      setCategoriaSeleccionada(nuevas[0] || "");
    }
  };

  const abrirEditar = (a: Aplicativo) => {
    setNuevo({ nombre: a.nombre, url: a.url, categoria: a.categoria });
    setEditando(true);
    setEditandoId(a.id);
    setModoModal("aplicativo");
    setModalOpen(true);
  };

  const abrirModalAplicativo = () => {
    setNuevo({ nombre: "", url: "", categoria: "" });
    setEditando(false);
    setEditandoId(null);
    setModoModal("aplicativo");
    setModalOpen(true);
  };

  const abrirModalCategoria = () => {
    setOtraCategoria("");
    setModoModal("categoria");
    setModalOpen(true);
  };

  const resetFormulario = () => {
    setNuevo({ nombre: "", url: "", categoria: "" });
    setEditando(false);
    setEditandoId(null);
    setModalOpen(false);
  };

  const agrupados = aplicativos.reduce((acc: Record<string, Aplicativo[]>, a) => {
    const cat = a.categoria || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="aplicativos-container">
      <div className="panel-categorias">
        <h3 className="letra">CATEGORIAS</h3>
        {categoriasDisponibles.map((cat) => (
          <div key={cat} className="categoria-opcion">
            <button
              className={cat === categoriaSeleccionada ? "categoria-btn activa" : "categoria-btn"}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat}
              <span className="contador">{agrupados[cat]?.length || 0}</span>
            </button>
            <button className="btn-eliminar-categoria" onClick={() => eliminarCategoria(cat)}>❌</button>
          </div>
        ))}
        <button className="plantilla-button copy" onClick={abrirModalCategoria}>+ Agregar Categoría</button>
      </div>

      <div className="contenido-aplicativos">
        <h1 className="titulo">{categoriaSeleccionada}</h1>
        <div className="lista-aplicativos">
          {(agrupados[categoriaSeleccionada] || []).map((a) => (
            <div key={a.id} className="item-aplicativo">
              <a href={a.url} target="_blank" rel="noreferrer">
                <img
                  src={`${new URL(a.url).origin}/favicon.ico`}
                  alt={`Logo de ${a.nombre}`}
                  width={40}
                  height={40}
                  className="logo-aplicativo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/icono-app.png";
                  }}
                />
              </a>
              <span className="nombre-app">{a.nombre}</span>
              <div className="acciones">
                <button className="btn-editar" onClick={() => abrirEditar(a)}>✏️</button>
                <button className="btn-eliminar" onClick={() => eliminarAplicativo(a.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
        <button className="plantilla-button copy" onClick={abrirModalAplicativo}>
          <FaPlus style={{ marginRight: 6 }} />
          Agregar Aplicativo
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={resetFormulario}>
        {modoModal === "aplicativo" ? (
          <>
            <h2>{editando ? "Editar Aplicativo" : "Agregar Aplicativo"}</h2>
            <label>Nombre</label>
            <input type="text" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
            <label>URL</label>
            <input type="text" value={nuevo.url} onChange={(e) => setNuevo({ ...nuevo, url: e.target.value })} />
            <label>Categoría</label>
            <select value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}>
              <option value="">Selecciona categoría</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="plantilla-button copy" onClick={editando ? guardarEdicion : agregarAplicativo}>
              💾 {editando ? "Guardar Cambios" : "Guardar"}
            </button>
          </>
        ) : (
          <>
            <h2>Nueva Categoría</h2>
            <label>Nombre de la categoría</label>
            <input
              type="text"
              value={otraCategoria}
              onChange={(e) => setOtraCategoria(e.target.value)}
              placeholder="Ej: Utilidades"
            />
            <button
              className="plantilla-button copy"
              onClick={() => {
                if (!otraCategoria) return alert("Ingresa un nombre");
                if (!categoriasDisponibles.includes(otraCategoria)) {
                  setCategoriasDisponibles((prev) => [...prev, otraCategoria]);
                }
                setCategoriaSeleccionada(otraCategoria);
                setModalOpen(false);
              }}
            >
              💾 Guardar Categoría
            </button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Aplicativos;
