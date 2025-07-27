"use client";

import React, { useEffect, useState } from "react";
import Alarma from "../components/Alarma";
import Aplicativos from "../components/Aplicativos";
import EnvioCorreos from "../components/EnvioCorreos";
import NotasAvances from "../components/NotasAvances";
import NotasConciliacion from "../components/NotasConciliacion";
import NovedadesAsesor from "../components/NovedadesAsesor";
import PlantillasAdicionales from "../components/PlantillasAdicionales";
import PlantillaSelector from "../components/PlantillaSelector";
import Sidebar from "../components/Sidebar";
import TorreSelector from "../components/TorreSelector";
import Tema from "../components/Tema";
import PantallaInicio from "../components/PantallaInicio"; // ✅

import { useNavegacion } from "../hooks/useNavegacion";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

export default function Page() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem("usuario");
      if (guardado && guardado !== "undefined") {
        setUsuario(JSON.parse(guardado));
      }
    } catch (error) {
      console.error("❌ Error al leer usuario desde localStorage:", error);
    }
  }, []);

  const {
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
  } = useNavegacion();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const handleMenuOpen = () => setMenuOpen(!menuOpen);

  return (
    <div className="app-container">
      <div className="marca-de-agua"></div>

      {!usuario ? (
        <PantallaInicio /> // ✅ Muestra bienvenida y opción de registro
      ) : (
        <>
          <Tema />

          {torre && (
            <div className="torre-fija">
              TU TORRE ES: <span className="torre-etiqueta">{torre}</span>
            </div>
          )}

          <Sidebar
            onSelectTipoNota={handleSelectTipoNota}
            isOpen={menuOpen}
            onClose={handleMenuOpen}
            onVistaEspecial={handleVistaEspecial}
            torreSeleccionada={torre}
            modoB2B={modoB2B}
            onVolverInicio={handleVolverInicio}
            cerrarSesion={cerrarSesion}
          />

          <div className="main-container">
            {pantallaBlanca ? (
              <div className="pantalla-blanca"></div>
            ) : vista === "inicio" ? (
              <h1 className="title">BIENVENID@, {usuario.nombre?.toUpperCase()}</h1>
            ) : modoB2B && !torre ? (
              <TorreSelector onSelect={handleTorreSeleccionada} />
            ) : vistaEspecial === "notasAvances" ? (
              <NotasAvances torre={torre} />
            ) : vistaEspecial === "notasConciliacion" ? (
              <NotasConciliacion torre={torre} />
            ) : vistaEspecial === "notasSeguimiento" ? (
              <PlantillaSelector torre={torre} onSelect={() => {}} />
            ) : vistaEspecial === "plantillasAdicionales" ? (
              <PlantillasAdicionales torre={torre} />
            ) : ["envioInicio", "envioCierre", "envioApertura"].includes(vistaEspecial) ? (
              <EnvioCorreos tipo={vistaEspecial} />
            ) : vistaEspecial === "alarma" ? (
              <Alarma />
            ) : vistaEspecial === "aplicativos" ? (
              <Aplicativos />
            ) : vistaEspecial === "novedadesAsesor" ? (
              <NovedadesAsesor />
            ) : (
              !modoB2B && !torre && tipoNota && (
                <TorreSelector onSelect={handleTorreSeleccionada} />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
