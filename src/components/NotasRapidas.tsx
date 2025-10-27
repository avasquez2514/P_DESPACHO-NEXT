"use client";

import React, { useState, useEffect, useCallback } from "react";
import "../styles/notasRapidas.css";

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

const NotasRapidas: React.FC = () => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaActual, setNotaActual] = useState<Nota | null>(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [corrigiendoTodo, setCorrigiendoTodo] = useState(false);

  // Estado para controlar si ya se cargaron las notas inicialmente
  const [notasCargadas, setNotasCargadas] = useState(false);

  // Cargar notas del localStorage al montar el componente
  useEffect(() => {
    try {
      const notasGuardadas = localStorage.getItem("notasRapidas");
      if (notasGuardadas) {
        const notasParseadas = JSON.parse(notasGuardadas);
        if (Array.isArray(notasParseadas)) {
          setNotas(notasParseadas);
        }
      }
      setNotasCargadas(true);
    } catch (error) {
      console.error("Error al cargar notas del localStorage:", error);
      setNotas([]);
      setNotasCargadas(true);
    }
  }, []);

  // Guardar notas en localStorage cuando cambien (solo después de cargar inicialmente)
  useEffect(() => {
    if (notasCargadas) {
      try {
        localStorage.setItem("notasRapidas", JSON.stringify(notas));
      } catch (error) {
        console.error("Error al guardar notas en localStorage:", error);
      }
    }
  }, [notas, notasCargadas]);

  // Crear nueva nota
  const crearNuevaNota = () => {
    const nuevaNota: Nota = {
      id: Date.now().toString(),
      titulo: "Nueva Nota",
      contenido: "",
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
    };
    setNotaActual(nuevaNota);
    setTitulo("Nueva Nota");
    setContenido("");
  };

  // Guardar nota
  const guardarNota = useCallback(() => {
    if (!notaActual) return;

    const notaActualizada: Nota = {
      ...notaActual,
      titulo: titulo || "Sin título",
      contenido,
      fechaModificacion: new Date().toISOString(),
    };

    let nuevasNotas: Nota[];
    if (notas.find(n => n.id === notaActualizada.id)) {
      // Actualizar nota existente
      nuevasNotas = notas.map(n => n.id === notaActualizada.id ? notaActualizada : n);
    } else {
      // Agregar nueva nota
      nuevasNotas = [...notas, notaActualizada];
    }

    setNotas(nuevasNotas);
    setNotaActual(notaActualizada);
    
    // Guardar inmediatamente en localStorage
    try {
      localStorage.setItem("notasRapidas", JSON.stringify(nuevasNotas));
    } catch (error) {
      console.error("Error al guardar inmediatamente:", error);
    }
    
    // Mostrar confirmación de guardado
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2000); // Ocultar después de 2 segundos
  }, [notaActual, titulo, contenido, notas]);

  // Guardado automático cada 30 segundos
  useEffect(() => {
    if (notaActual && (titulo || contenido)) {
      const interval = setInterval(() => {
        guardarNota();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [notaActual, titulo, contenido, guardarNota]);

  // Seleccionar nota
  const seleccionarNota = (nota: Nota) => {
    setNotaActual(nota);
    setTitulo(nota.titulo);
    setContenido(nota.contenido);
  };

  // Eliminar nota
  const eliminarNota = (id: string) => {
    setNotas(prev => prev.filter(n => n.id !== id));
    if (notaActual?.id === id) {
      setNotaActual(null);
      setTitulo("");
      setContenido("");
    }
  };

  // Mejorar texto con IA
  const mejorarConIA = async () => {
    if (!contenido.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/mejorar-texto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto: contenido }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data.textoMejorado);
        setShowAIModal(true);
      } else {
        alert("Error al procesar el texto con IA");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servicio de IA");
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar sugerencia de IA
  const aplicarSugerenciaIA = () => {
    setContenido(aiSuggestion);
    setShowAIModal(false);
    setAiSuggestion("");
  };

  // Corregir ortografía automáticamente
  const corregirOrtografiaAutomatica = async () => {
    if (!contenido.trim()) return;

    setCorrigiendoTodo(true);
    try {
      const response = await fetch("/api/ai/mejorar-texto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto: contenido }),
      });

      if (response.ok) {
        const data = await response.json();
        setContenido(data.textoMejorado);
        setGuardadoExitoso(true);
        setTimeout(() => setGuardadoExitoso(false), 2000);
      } else {
        alert("Error al corregir la ortografía automáticamente");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión al corregir ortografía");
    } finally {
      setCorrigiendoTodo(false);
    }
  };

  // Exportar notas a archivo JSON
  const exportarNotas = () => {
    try {
      const dataStr = JSON.stringify(notas, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notas-rapidas-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar notas:", error);
      alert("Error al exportar las notas");
    }
  };

  // Importar notas desde archivo JSON
  const importarNotas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contenido = e.target?.result as string;
        const notasImportadas = JSON.parse(contenido);
        
        if (Array.isArray(notasImportadas)) {
          setNotas(prev => [...prev, ...notasImportadas]);
          alert(`Se importaron ${notasImportadas.length} notas exitosamente`);
        } else {
          alert("El archivo no contiene un formato válido de notas");
        }
      } catch (error) {
        console.error("Error al importar notas:", error);
        alert("Error al importar las notas. Verifica que el archivo sea válido.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Limpiar el input
  };

  // Limpiar todas las notas
  const limpiarTodasLasNotas = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todas las notas? Esta acción no se puede deshacer.")) {
      setNotas([]);
      setNotaActual(null);
      setTitulo("");
      setContenido("");
      localStorage.removeItem("notasRapidas");
    }
  };


  return (
    <div className="notas-rapidas-container">
      <div className="notas-header">
        <h2>📝 Notas Rápidas</h2>
        <div className="notas-actions">
          <button onClick={crearNuevaNota} className="btn-nueva-nota">
            + Nueva Nota
          </button>
          <button onClick={exportarNotas} className="btn-exportar" title="Exportar notas">
            📤 Exportar
          </button>
          <label className="btn-importar" title="Importar notas">
            📥 Importar
            <input
              type="file"
              accept=".json"
              onChange={importarNotas}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={limpiarTodasLasNotas} className="btn-limpiar" title="Limpiar todas las notas">
            🗑️ Limpiar
          </button>
          {guardadoExitoso && (
            <span className="guardado-indicator">✅ Guardado</span>
          )}
        </div>
      </div>

      <div className="notas-layout">
        {/* Panel lateral con lista de notas */}
        <div className="notas-lista">
          <h3>Mis Notas</h3>
          <div className="notas-list">
            {notas.map((nota) => (
              <div
                key={nota.id}
                className={`nota-item ${notaActual?.id === nota.id ? "active" : ""}`}
                onClick={() => seleccionarNota(nota)}
              >
                <div className="nota-titulo">{nota.titulo}</div>
                <div className="nota-fecha">
                  {new Date(nota.fechaModificacion).toLocaleDateString()}
                </div>
                <button
                  className="btn-eliminar"
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarNota(nota.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Panel principal de edición */}
        <div className="notas-editor">
          <h2>EDITOR DE NOTAS</h2>
          {notaActual ? (
            <div className="editor-container">
              <div className="editor-header">
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título de la nota..."
                  className="titulo-input"
                />
                <div className="editor-actions">
                  <button
                    onClick={mejorarConIA}
                    disabled={!contenido.trim() || isLoading}
                    className="btn-ia"
                  >
                    {isLoading ? "⏳" : "🤖"} Mejorar con IA
                  </button>
                  <button
                    onClick={corregirOrtografiaAutomatica}
                    disabled={!contenido.trim() || corrigiendoTodo}
                    className="btn-corregir-auto"
                  >
                    {corrigiendoTodo ? "⏳" : "✨"} Corregir Ortografía
                  </button>
                  <button onClick={guardarNota} className="btn-guardar">
                    💾 Guardar
                  </button>
                </div>
              </div>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribe tu nota aquí..."
                className="contenido-textarea"
                rows={15}
              />
            </div>
          ) : (
            <div className="no-nota-seleccionada">
              <p>Selecciona una nota existente o crea una nueva</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para sugerencias de IA */}
      {showAIModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🤖 Sugerencia de IA</h3>
              <button onClick={() => setShowAIModal(false)} className="btn-cerrar">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="texto-original">
                <h4>Texto original:</h4>
                <p>{contenido}</p>
              </div>
              <div className="texto-mejorado">
                <h4>Texto mejorado:</h4>
                <p>{aiSuggestion}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAIModal(false)} className="btn-cancelar">
                Cancelar
              </button>
              <button onClick={aplicarSugerenciaIA} className="btn-aplicar">
                Aplicar Sugerencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotasRapidas;
