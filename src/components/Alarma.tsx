"use client";

import React, { useEffect, useState } from "react";
import "../styles/alarma.css";

interface AlarmaItem {
  hora: string;
  nombre: string;
  sonido?: string;
}

interface SonidoPersonalizado {
  nombre: string;
  url: string;
}

const Alarma: React.FC = () => {
  const [nuevaHora, setNuevaHora] = useState<string>("");
  const [nombreAlarma, setNombreAlarma] = useState<string>("");
  const [sonidoPredeterminado] = useState<string>("/Sonidos/default.mp3");
  const [archivoSonido, setArchivoSonido] = useState<File | null>(null);
  const [sonidoSeleccionado, setSonidoSeleccionado] = useState<string>("/Sonidos/default.mp3");
  const [audioEnReproduccion, setAudioEnReproduccion] = useState<HTMLAudioElement | null>(null);

  const [sonidos, setSonidos] = useState<SonidoPersonalizado[]>(() => {
    try {
      const guardados = localStorage.getItem("sonidos");
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  const [alarmas, setAlarmas] = useState<AlarmaItem[]>(() => {
    try {
      const guardadas = localStorage.getItem("alarmas");
      return guardadas ? JSON.parse(guardadas) : [];
    } catch (e) {
      console.error("❌ Error leyendo alarmas:", e);
      return [];
    }
  });

  const [activadas, setActivadas] = useState<number[]>([]);

  useEffect(() => {
    localStorage.setItem("alarmas", JSON.stringify(alarmas));
  }, [alarmas]);

  const detenerAlarma = () => {
    if (audioEnReproduccion) {
      audioEnReproduccion.pause();
      audioEnReproduccion.currentTime = 0;
      setAudioEnReproduccion(null);
    }
  };

  const mostrarPantallaAlarma = (alarma: AlarmaItem) => {
    const mensaje = `⏰ ${alarma.nombre || "¡Alarma activada!"} - ${alarma.hora}`;
    const overlay = document.createElement("div");
    overlay.className = "alarma-overlay";
    overlay.innerText = mensaje;

    const sonidoURL = alarma.sonido?.startsWith("blob:") || alarma.sonido?.startsWith("/Sonidos/")
      ? alarma.sonido
      : sonidoPredeterminado;

    const audio = new Audio(sonidoURL);
    audio.loop = true;
    audio.play().catch((e) => console.error("Error reproduciendo sonido:", e));
    setAudioEnReproduccion(audio);

    overlay.addEventListener("click", () => {
      audio.pause();
      audio.currentTime = 0;
      setAudioEnReproduccion(null);
      document.body.removeChild(overlay);
    });

    document.body.appendChild(overlay);
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = new Date();
      const horaActual = ahora.toTimeString().slice(0, 5);

      alarmas.forEach((alarma, index) => {
        if (alarma.hora === horaActual && !activadas.includes(index)) {
          mostrarPantallaAlarma(alarma);
          setActivadas((prev) => [...prev, index]);
        }
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [alarmas, activadas]);

  const agregarAlarma = () => {
    if (!nuevaHora) return;

    let sonidoURL = sonidoSeleccionado;

    if (archivoSonido) {
      sonidoURL = URL.createObjectURL(archivoSonido);
    }

    const nueva: AlarmaItem = {
      hora: nuevaHora,
      nombre: nombreAlarma.trim(),
      sonido: sonidoURL,
    };

    setAlarmas((prev) => [...prev, nueva]);
    setNuevaHora("");
    setNombreAlarma("");
    setArchivoSonido(null);
    setSonidoSeleccionado("/Sonidos/default.mp3");
  };

  const eliminarAlarma = (index: number) => {
    setAlarmas((prev) => prev.filter((_, i) => i !== index));
    setActivadas((prev) => prev.filter((i) => i !== index));
  };

  const agregarSonidoPersonalizado = (file: File) => {
    const url = URL.createObjectURL(file);
    const nuevoSonido: SonidoPersonalizado = {
      nombre: file.name,
      url,
    };

    const actualizados = [...sonidos, nuevoSonido];
    setSonidos(actualizados);
    localStorage.setItem("sonidos", JSON.stringify(actualizados));
  };

  const eliminarSonidoPersonalizado = (index: number) => {
    const actualizados = sonidos.filter((_, i) => i !== index);
    setSonidos(actualizados);
    localStorage.setItem("sonidos", JSON.stringify(actualizados));

    if (sonidoSeleccionado === sonidos[index].url) {
      setSonidoSeleccionado("/Sonidos/default.mp3");
    }
  };

  return (
    <div className="alarma-container">
      <h2 className="alarma-title">⏰ Gestión de Alarmas</h2>

      <div className="alarma-input-container">
        <input
          type="time"
          value={nuevaHora}
          onChange={(e) => setNuevaHora(e.target.value)}
          className="alarma-input"
        />

        <input
          type="text"
          placeholder="Nombre de la alarma"
          value={nombreAlarma}
          onChange={(e) => setNombreAlarma(e.target.value)}
          className="alarma-input"
        />

        <select
          value={sonidoSeleccionado}
          onChange={(e) => setSonidoSeleccionado(e.target.value)}
          className="alarma-input"
        >
          <option value="/Sonidos/default.mp3">🔔 Sonido predeterminado</option>
          {sonidos.map((s) => (
            <option key={s.url} value={s.url}>
              🎵 {s.nombre}
            </option>
          ))}
        </select>

        <button onClick={agregarAlarma} className="alarma-agregar">
          Agregar Alarma
        </button>
      </div>

      <div className="alarma-input-container">
        <label>Agregar sonido personalizado:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) agregarSonidoPersonalizado(file);
          }}
        />
      </div>

      {sonidos.length > 0 && (
        <div className="alarma-sonidos-personalizados">
          <h4>🎶 Sonidos personalizados</h4>
          <ul className="sonidos-lista">
            {sonidos.map((s, index) => (
              <li key={index} className="sonido-item">
                <span>{s.nombre}</span>
                <button
                  onClick={() => eliminarSonidoPersonalizado(index)}
                  className="alarma-eliminar"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {alarmas.length === 0 ? (
        <p className="alarma-empty">No hay alarmas programadas.</p>
      ) : (
        <ul className="alarma-lista">
          {alarmas.map((alarma, index) => (
            <li key={index} className="alarma-item">
              <span className="alarma-hora">
                🕒 {alarma.hora} {alarma.nombre && `- ${alarma.nombre}`}
              </span>
              <button onClick={() => eliminarAlarma(index)} className="alarma-eliminar">
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alarma;
