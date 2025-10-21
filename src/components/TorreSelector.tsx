"use client"; // Este archivo es un componente del cliente. Necesario en Next.js para usar interactividad (como onClick).

import React from "react"; // Importamos React para usar JSX y crear componentes.
import "../styles/plantillas.css"; // Importamos los estilos desde un archivo CSS externo (puede renombrarse si es específico para torres).

// Definimos la interfaz de props para el componente.
// onSelect: función que se ejecutará cuando se seleccione una torre.
interface TorreSelectorProps {
  onSelect: (torre: string) => void;
}

// Componente funcional que muestra una lista de torres como botones.
// Al hacer clic en una torre, se ejecuta la función onSelect pasándole el nombre de la torre.
const TorreSelector: React.FC<TorreSelectorProps> = ({ onSelect }) => {
  // Lista de torres disponibles (puede expandirse si se agregan más regiones).
  const torres: string[] = [
    "ANTIOQUIA CENTRO",
    "ANTIOQUIA ORIENTE",
    "EDATEL",
    "BOGOTA",
    "OPC_BASIC",
    "SANTANDER",
    "COSTA"
  ];

  return (
    <div className="torre-selector-container">
      {/* Título del componente */}
      <h2 className="torre-selector-title">SELECCIONA TU TORRE:</h2>

      {/* Contenedor de botones de torres */}
      <div className="torre-buttons">
        {/* Recorremos el array de torres y generamos un botón por cada una */}
        {torres.map((torre) => (
          <button
            key={torre} // clave única para React
            className="torre-button" // clase CSS para aplicar estilos
            onClick={() => onSelect(torre)} // ejecutamos la función onSelect con el nombre de la torre seleccionada
          >
            {torre} {/* Nombre visible del botón */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TorreSelector; // Exportamos el componente para poder usarlo en otras partes de la app.
