// src/hooks/useNavegacion.js
import { useState } from "react";

/**
 * 🔁 Hook personalizado para gestionar:
 * - el tipo de nota seleccionada
 * - la torre seleccionada
 * - vistas especiales (como aplicativos, alarmas, correos)
 * - control de vista en blanco y modo B2B
 */
export function useNavegacion() {
  // Estado del tipo de nota actual (ej. 'NOTAS DE AVANCE', 'DESPACHO B2B')
  const [tipoNota, setTipoNota] = useState("");

  // Estado de la torre seleccionada (ej. 'ANTIOQUIA', 'VALLE')
  const [torre, setTorre] = useState("");

  // Si está activa una pantalla blanca temporal mientras se selecciona una opción
  const [pantallaBlanca, setPantallaBlanca] = useState(false);

  // Si se está trabajando en modo B2B
  const [modoB2B, setModoB2B] = useState(false);

  // Vista principal actual del sistema (ej. 'inicio', '', 'notas')
  const [vista, setVista] = useState("inicio");

  // Vista especial activa (ej. 'alarmas', 'envio-correos', 'aplicativos')
  const [vistaEspecial, setVistaEspecial] = useState("");

  /**
   * ✅ Maneja la selección del tipo de nota
   * - Limpia vista especial si la hay
   * - Si se elige "DESPACHO B2B", activa el modo B2B
   * - En otros casos, desactiva el modo B2B
   */
  const handleSelectTipoNota = (nota) => {
    setTipoNota(nota);
    setVistaEspecial("");
    setPantallaBlanca(false);

    if (nota === "DESPACHO B2B") {
      setModoB2B(true);
      setTorre(""); // Reinicia selección de torre
    } else {
      setModoB2B(false);
    }

    setVista(""); // Limpia la vista para que se actualice dinámicamente
  };

  /**
   * ✅ Maneja la selección de una torre
   * - Guarda el nombre de la torre
   * - Activa la pantalla blanca (esperando submenú)
   */
  const handleTorreSeleccionada = (torreSeleccionada) => {
    setTorre(torreSeleccionada);
    setPantallaBlanca(true);
  };

  /**
   * ✅ Activa una vista especial (como alarmas, aplicativos, etc.)
   * - Limpia tipo de nota y pantalla blanca
   */
  const handleVistaEspecial = (vista) => {
    setVistaEspecial(vista);
    setTipoNota("");
    setPantallaBlanca(false);
  };

  /**
   * 🔄 Reinicia todo a su estado inicial
   */
  const handleVolverInicio = () => {
    setVista("inicio");
    setTipoNota("");
    setTorre("");
    setModoB2B(false);
    setVistaEspecial("");
    setPantallaBlanca(false);
  };

  // Exporta todas las variables y funciones necesarias al componente que lo utilice
  return {
    tipoNota,
    torre,
    pantallaBlanca,
    modoB2B,
    vista,
    vistaEspecial,
    handleSelectTipoNota,
    handleTorreSeleccionada,
    handleVistaEspecial,
    handleVolverInicio,
  };
}
