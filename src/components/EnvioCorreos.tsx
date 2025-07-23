"use client";

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import "../styles/aplicativos.css";
import Modal from "./Modal";

// ✅ Interfaces de datos
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

// ✅ URL base desde variable de entorno o fallback a localhost
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/aplicativos";

const Aplicativos: React.FC = () => {
  const [usuario, setUsuario] = useState<any>({});
  const [token, setToken] = useState<string>("");

  const [aplicativos, setAplicativos] = useState<Aplicativo[]>([]);
  const [nuevo, setNuevo] = useState<NuevoAplicativo>({
    nombre: "",
    url: "",
    categoria: "",
  });
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>(
    []
  );
  const [otraCategoria, setOtraCategoria] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [modoModal, setModoModal] = useState<"aplicativo" | "categoria">(
    "aplicativo"
  );

  // ✅ Obtener usuario y token desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("usuario");
      const storedToken = localStorage.getItem("token");

      if (storedUser) setUsuario(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
    }
  }, []);

  // 📥 Cargar aplicativos cuando el usuario esté disponible
  useEffect(() => {
    if (usuario.id) {
      fetchAplicativos();
    }
  }, [usuario]);

  const fetchAplicativos = async () => {
    try {
      const res = await fetch(`${API_URL}?usuario_id=${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: Aplicativo[] = await res.json();
      setAplicativos(data);

      const categorias = [...new Set(data.map((app) => app.categoria))];
      setCategoriasDisponibles(categorias);

      if (!categoriaSeleccionada && categorias.length > 0) {
        setCategoriaSeleccionada(categorias[0]);
      }
    } catch (error) {
      console.error("❌ Error al cargar:", error);
    }
  };

  const agregarAplicativo = async () => {
    if (!nuevo.nombre || !nuevo.url || !nuevo.categoria) {
      return alert("Completa todos los campos");
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevo, usuario_id: usuario.id }),
      });

      resetFormulario();
      fetchAplicativos();
    } catch (error) {
      console.error("❌ Error al agregar:", error);
    }
  };

  const guardarEdicion = async () => {
    try {
      await fetch(`${API_URL}/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevo, usuario_id: usuario.id }),
      });

      resetFormulario();
      fetchAplicativos();
    } catch (error) {
      console.error("❌ Error al editar:", error);
    }
  };

  const eliminarAplicativo = async (id: number) => {
    if (!window.confirm("¿Eliminar este aplicativo?")) return;

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchAplicativos();
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
    }
  };

  const eliminarCategoria = (categoria: string) => {
    const confirmacion = window.confirm(
      `¿Eliminar la categoría "${categoria}" y todos sus aplicativos?`
    );
    if (!confirmacion) return;

    const nuevosApps = aplicativos.filter((app) => app.categoria !== categoria);
    setAplicativos(nuevosApps);

    const nuevasCategorias = categoriasDisponibles.filter(
      (cat) => cat !== categoria
    );
    setCategoriasDisponibles(nuevasCategorias);

    if (categoriaSeleccionada === categoria) {
      setCategoriaSeleccionada(nuevasCategorias[0] || "");
    }
  };

  const abrirEditar = (app: Aplicativo) => {
    setNuevo({
      nombre: app.nombre,
      url: app.url,
      categoria: app.categoria,
    });
    setEditando(true);
    setEditandoId(app.id);
    setModoModal("aplicativo");
    setModalOpen(true);
  };

  const abrirModalAplicativo = () => {
    setModoModal("aplicativo");
    setNuevo({ nombre: "", url: "", categoria: "" });
    setEditando(false);
    setEditandoId(null);
    setModalOpen(true);
  };

  const abrirModalCategoria = () => {
    setModoModal("categoria");
    setOtraCategoria("");
    setModalOpen(true);
  };

  const resetFormulario = () => {
    setNuevo({ nombre: "", url: "", categoria: "" });
    setOtraCategoria("");
    setModalOpen(false);
    setEditando(false);
    setEditandoId(null);
  };

  const agrupados = aplicativos.reduce(
    (acc: Record<string, Aplicativo[]>, app) => {
      const cat = app.categoria || "Sin categoría";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(app);
      return acc;
    },
    {}
  );

  return (
    <div className="aplicativos-container">
      <div className="panel-categorias">
        <h3 className="letra">CATEGORIAS</h3>

        {categoriasDisponibles.map((cat) => (
          <div key={cat} className="categoria-opcion">
            <button
              className={
                cat === categoriaSeleccionada
                  ? "categoria-btn activa"
                  : "categoria-btn"
              }
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat}
              <span className="contador">{agrupados[cat]?.length ?? 0}</span>
            </button>
            <button
              className="btn-eliminar-categoria"
              title="Eliminar categoría"
              onClick={() => eliminarCategoria(cat)}
            >
              ❌
            </button>
          </div>
        ))}

        <button className="plantilla-button copy" onClick={abrirModalCategoria}>
          + Agregar Categoría
        </button>
      </div>

      <div className="contenido-aplicativos">
        <h1 className="titulo">{categoriaSeleccionada}</h1>

        <div className="lista-aplicativos">
          {(agrupados[categoriaSeleccionada] || []).map((app) => (
            <div key={app.id} className="item-aplicativo">
              <a href={app.url} target="_blank" rel="noreferrer">
                <img
                  src={`${new URL(app.url).origin}/favicon.ico`}
                  alt={`Logo de ${app.nombre}`}
                  width={40}
                  height={40}
                  className="logo-aplicativo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/icono-app.png";
                  }}
                />
              </a>
              <span className="nombre-app">{app.nombre}</span>

              <div className="acciones">
                <button className="btn-editar" onClick={() => abrirEditar(app)}>
                  ✏️
                </button>
                <button
                  className="btn-eliminar"
                  onClick={() => eliminarAplicativo(app.id)}
                >
                  🗑️
                </button>
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
            <input
              type="text"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              placeholder="Nombre del aplicativo"
            />
            <label>URL</label>
            <input
              type="text"
              value={nuevo.url}
              onChange={(e) => setNuevo({ ...nuevo, url: e.target.value })}
              placeholder="https://..."
            />
            <label>Categoría</label>
            <select
              value={nuevo.categoria}
              onChange={(e) =>
                setNuevo({ ...nuevo, categoria: e.target.value })
              }
            >
              <option value="">Selecciona categoría</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              className="plantilla-button copy"
              onClick={editando ? guardarEdicion : agregarAplicativo}
            >
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
