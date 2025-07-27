"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/aplicativos.css";
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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

const STORAGE_KEY = "aplicativosOrden";

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

  // Orden por categoría
  const [ordenPorCategoria, setOrdenPorCategoria] = useState<Record<string, number[]>>({});

  const getUsuario = () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  };

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  useEffect(() => {
    fetchAplicativos();
  }, []);

  useEffect(() => {
    // Guardar el orden en localStorage cada vez que cambie
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenPorCategoria));
  }, [ordenPorCategoria]);

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

      // Cargar el orden guardado por categoría
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const ordenes = JSON.parse(guardado) as Record<string, number[]>;
        setOrdenPorCategoria(ordenes);
      } else {
        // Inicializar el orden por categoría
        const inicial: Record<string, number[]> = {};
        categorias.forEach(cat => {
          inicial[cat] = data.filter(a => a.categoria === cat).map(a => a.id);
        });
        setOrdenPorCategoria(inicial);
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
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevo, usuario_id: usuario.id }),
      });

      const added: Aplicativo = await res.json();
      resetFormulario();
      fetchAplicativos();
      // Actualiza el orden agregando el nuevo id al final
      setOrdenPorCategoria(prev => ({
        ...prev,
        [added.categoria]: [...(prev[added.categoria] || []), added.id]
      }));
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
      await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchAplicativos();
      setOrdenPorCategoria(prev => {
        const nuevo = { ...prev };
        Object.keys(nuevo).forEach(cat => {
          nuevo[cat] = nuevo[cat].filter(appId => appId !== id);
        });
        return nuevo;
      });
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const eliminarCategoria = (cat: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat}" y todos sus aplicativos?`)) return;
    setAplicativos(aplicativos.filter((a) => a.categoria !== cat));
    const nuevas = categoriasDisponibles.filter((c) => c !== cat);
    setCategoriasDisponibles(nuevas);
    setOrdenPorCategoria(prev => {
      const nuevo = { ...prev };
      delete nuevo[cat];
      return nuevo;
    });
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
    setNuevo({ nombre: "", url: "", categoria: categoriaSeleccionada || "" });
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

  // Agrupa aplicativos por categoría
  const agrupados = aplicativos.reduce((acc: Record<string, Aplicativo[]>, a) => {
    const cat = a.categoria || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  // Ordena los aplicativos según el orden guardado
  const aplicativosOrdenados = (
    agrupados[categoriaSeleccionada] || []
  ).slice().sort((a, b) => {
    const orden = ordenPorCategoria[categoriaSeleccionada] || [];
    return orden.indexOf(a.id) - orden.indexOf(b.id);
  });

  // Drag & drop handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const ordenActual = ordenPorCategoria[categoriaSeleccionada] || [];
    const items = Array.from(ordenActual);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setOrdenPorCategoria(prev => ({
      ...prev,
      [categoriaSeleccionada]: items
    }));
  };

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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="aplicativos-list">
            {(provided) => (
              <div
                className="lista-aplicativos"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {aplicativosOrdenados.map((a, index) => (
                  <Draggable key={a.id} draggableId={a.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        className="item-aplicativo-boton"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <button
                          className="aplicativo-boton"
                          onClick={() => window.open(a.url, "_blank")}
                        >
                          {a.nombre}
                        </button>
                        <div className="acciones-botones">
                          <button className="btn-editar" onClick={() => abrirEditar(a)}>
                            <FaEdit /> Modificar
                          </button>
                          <button className="btn-eliminar" onClick={() => eliminarAplicativo(a.id)}>
                            <FaTrash /> Borrar
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
                  setOrdenPorCategoria(prev => ({
                    ...prev,
                    [otraCategoria]: []
                  }));
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