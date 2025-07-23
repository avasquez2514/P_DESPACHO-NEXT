"use client";

import React, { useEffect, useState } from "react";
import "../styles/alarma.css";

// 🧠 Estructura para cada alarma
interface AlarmaItem {
  hora: string;
  nombre: string;
  sonido?: string;
}

// 🎵 Estructura para los sonidos personalizados
interface SonidoPersonalizado {
  nombre: string;
  url: string;
}

const Alarma: React.FC = () => {
  // 🕒 Estados principales
  const [nuevaHora, setNuevaHora] = useState<string>("");
  const [nombreAlarma, setNombreAlarma] = useState<string>("");
  const [sonidoPredeterminado] = useState<string>("/sonidos/default.mp3");
  const [archivoSonido, setArchivoSonido] = useState<File | null>(null);
  const [sonidoSeleccionado, setSonidoSeleccionado] = useState<string>("/sonidos/default.mp3");
  const [audioEnReproduccion, setAudioEnReproduccion] = useState<HTMLAudioElement | null>(null);

  // 🎵 Sonidos personalizados guardados
  const [sonidos, setSonidos] = useState<SonidoPersonalizado[]>(() => {
    try {
      const guardados = localStorage.getItem("sonidos");
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  // ⏰ Alarmas programadas
  const [alarmas, setAlarmas] = useState<AlarmaItem[]>(() => {
    try {
      const guardadas = localStorage.getItem("alarmas");
      return guardadas ? JSON.parse(guardadas) : [];
    } catch (e) {
      console.error("❌ Error leyendo alarmas:", e);
      return [];
    }
  });

  // ✅ Controla qué alarmas ya se activaron
  const [activadas, setActivadas] = useState<number[]>([]);

  // 💾 Guarda alarmas en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem("alarmas", JSON.stringify(alarmas));
  }, [alarmas]);

  // 🔇 Detener reproducción
  const detenerAlarma = () => {
    if (audioEnReproduccion) {
      audioEnReproduccion.pause();
      audioEnReproduccion.currentTime = 0;
      setAudioEnReproduccion(null);
    }
  };

  // 📢 Mostrar alarma en pantalla y reproducir sonido
  const mostrarPantallaAlarma = (alarma: AlarmaItem) => {
    const mensaje = `⏰ ${alarma.nombre || "¡Alarma activada!"} - ${alarma.hora}`;
    const overlay = document.createElement("div");
    overlay.className = "alarma-overlay";
    overlay.innerText = mensaje;

    const audio = new Audio(alarma.sonido || sonidoPredeterminado);
    audio.loop = true; // 🔁 Hace que suene hasta que lo pares
    audio.play().catch((e) => console.error("Error reproduciendo sonido:", e));
    setAudioEnReproduccion(audio); // 💾 guarda audio en estado

    // ✅ On click: detener audio y eliminar overlay
    overlay.addEventListener("click", () => {
      audio.pause();
      audio.currentTime = 0;
      setAudioEnReproduccion(null);
      document.body.removeChild(overlay);
    });

    document.body.appendChild(overlay);
  };
  // ⏳ Verifica cada segundo si alguna alarma debe sonar
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

  // ➕ Agregar nueva alarma
  const agregarAlarma = () => {
    if (!nuevaHora) return;

    let sonidoURL = sonidoSeleccionado || sonidoPredeterminado;

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
    setSonidoSeleccionado("/sonidos/default.mp3");
  };

  // ❌ Eliminar alarma
  const eliminarAlarma = (index: number) => {
    setAlarmas((prev) => prev.filter((_, i) => i !== index));
    setActivadas((prev) => prev.filter((i) => i !== index));
  };

  // 🎧 Agregar un sonido personalizado
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

  // 🗑️ Eliminar sonido personalizado
  const eliminarSonidoPersonalizado = (index: number) => {
    const actualizados = sonidos.filter((_, i) => i !== index);
    setSonidos(actualizados);
    localStorage.setItem("sonidos", JSON.stringify(actualizados));

    // Si el sonido eliminado era el seleccionado, volver al predeterminado
    if (sonidoSeleccionado === sonidos[index].url) {
      setSonidoSeleccionado("/sonidos/default.mp3");
    }
  };

  return (
    <div className="alarma-container">
      <h2 className="alarma-title">⏰ Gestión de Alarmas</h2>

      {/* 🔧 Entrada de hora, nombre y sonido */}
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
          <option value="/sonidos/default.mp3">🔔 Sonido predeterminado</option>
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

      {/* 📂 Agregar sonidos personalizados */}
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

      {/* 🎵 Lista de sonidos personalizados con eliminar */}
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

      {/* 📅 Lista de alarmas */}
      {alarmas.length === 0 ? (
        <p className="alarma-empty">No hay alarmas programadas.</p>
      ) : (
        <ul className="alarma-lista">
          {alarmas.map((alarma, index) => (
            <li key={index} className="alarma-item">
              <span className="alarma-hora">
                🕒 {alarma.hora} {alarma.nombre && `- ${alarma.nombre}`}
              </span>
              <button
                onClick={() => eliminarAlarma(index)}
                className="alarma-eliminar"
              >
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
