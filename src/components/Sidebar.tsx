"use client"; // Indicamos que este componente se ejecuta del lado del cliente (Next.js).

import React, { useState } from "react";
import "../styles/sidebar.css"; // Importamos estilos específicos del sidebar.

// Props esperadas por el componente Sidebar
interface SidebarProps {
  onSelectTipoNota: (tipo: string) => void;     // Función que se ejecuta al seleccionar tipo de nota (ej. "DESPACHO B2B").
  isOpen: boolean;                              // Estado que indica si el sidebar está abierto.
  onClose: () => void;                          // Función para cerrar el sidebar.
  onVistaEspecial: (vista: string) => void;     // Cambia la vista mostrada en pantalla según el botón presionado.
  torreSeleccionada: string | null;             // Torre actualmente seleccionada (si hay).
  onVolverInicio: () => void;                   // Función para volver a la vista de inicio.
  cerrarSesion: () => void;                     // Función que cierra sesión del usuario.
  modoB2B: boolean;
}

// Componente principal del sidebar con submenús interactivos
const Sidebar: React.FC<SidebarProps> = ({
  onSelectTipoNota,
  isOpen,
  onClose,
  onVistaEspecial,
  torreSeleccionada,
  onVolverInicio,
  cerrarSesion,
}) => {
  // Estado interno para abrir/cerrar submenú "Notas de Despacho"
  const [isNotasDespachoOpen, setNotasDespachoOpen] = useState<boolean>(false);
  
  // Estados para mostrar submenús laterales al pasar el mouse
  const [hoverNotasSeguimiento, setHoverNotasSeguimiento] = useState<boolean>(false);
  const [hoverEnvioCorreos, setHoverEnvioCorreos] = useState<boolean>(false);

  // Al hacer clic en "DESPACHO B2B"
  const handleDespachoClick = () => {
    setNotasDespachoOpen(!isNotasDespachoOpen);   // Abrimos o cerramos submenú
    onSelectTipoNota("DESPACHO B2B");             // Activamos tipo de nota principal
  };

  // Vuelve a la vista principal de la aplicación
  const handleInicioClick = () => {
    onVolverInicio();
  };

  return (
    <div className={`container ${isOpen ? "sidebar-open" : ""}`}>
      {/* Botón para abrir o cerrar el sidebar */}
      <button className={`menu-button ${isOpen ? "open" : ""}`} onClick={onClose}>
        Aplicaciones
      </button>

      {/* Contenedor del sidebar y sus menús */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <ul className="menu">
          <li>
            {/* Botón de inicio */}
            <button className="menu-title" onClick={handleInicioClick}>
              INICIO
            </button>

            {/* Botón principal del módulo despacho */}
            <button className="menu-title" onClick={handleDespachoClick}>
              • DESPACHO B2B
            </button>

            {/* Submenús del módulo "DESPACHO B2B", mostrados solo si hay torre seleccionada */}
            {isNotasDespachoOpen && torreSeleccionada && (
              <ul className="submenu">
                <li className="submenu-item">
                  <button onClick={() => onVistaEspecial("alarma")}>Alarma</button>
                </li>

                <li className="submenu-item">
                  <button onClick={() => onVistaEspecial("aplicativos")}>Aplicativos</button>
                </li>

                {/* Submenú lateral para "Envío de correos" */}
                <li
                  onMouseEnter={() => setHoverEnvioCorreos(true)}
                  onMouseLeave={() => setHoverEnvioCorreos(false)}
                  className="submenu-item"
                >
                  <button>Envío de Correos</button>
                  {hoverEnvioCorreos && (
                    <ul className="submenu-lateral">
                      <li>
                        <button onClick={() => onVistaEspecial("envioApertura")}>
                          Envío Apertura
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("envioCierre")}>
                          Envío Cierre
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("envioInicio")}>
                          Envío Inicio
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("envioPermisos")}>
                          Envío Permisos
                        </button>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Submenú lateral para "Notas de campo" */}
                <li
                  onMouseEnter={() => setHoverNotasSeguimiento(true)}
                  onMouseLeave={() => setHoverNotasSeguimiento(false)}
                  className="submenu-item"
                >
                  <button>Notas de campo</button>
                  {hoverNotasSeguimiento && (
                    <ul className="submenu-lateral">
                      <li>
                        <button onClick={() => onVistaEspecial("notasAvances")}>
                          Notas de Avances
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("notasConciliacion")}>
                          Notas de Conciliación
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("notasSeguimiento")}>
                          Notas de Seguimiento
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("plantillasAdicionales")}>
                          Plantillas
                        </button>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Opción de novedades del asesor */}
                <li className="submenu-item">
                  <button onClick={() => onVistaEspecial("novedadesAsesor")}>
                    Novedades Asesor
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>

        {/* Botón para cerrar sesión */}
        <div className="logout-section">
          <button className="menu-title logout-button" onClick={cerrarSesion}>
            🔒 Cerrar sesión
          </button>
        </div>
      </div>

      {/* Capa gris de fondo al estar abierto el sidebar */}
      {isOpen && <div className="overlay" onClick={onClose}></div>}
    </div>
  );
};

export default Sidebar; // Exportamos el componente para su uso en la app.
