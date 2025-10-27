"use client";

import React, { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import "../styles/envioCorreos.css";

interface EnvioCorreosProps {
  tipo: "envioInicio" | "envioCierre" | "envioApertura" | "envioPermisos";
}

interface FirmaProps {
  nombrePersonalizado?: string;
  incluirFirma: boolean;
  onToggleFirma: () => void;
  onNombreChange: (nombre: string) => void;
}

interface ArchivoAdjunto {
  id: string;
  nombre: string;
  archivo: File;
}

// ReactQuill no es compatible con React 19, usando textarea simple

// Componente de Firma
const Firma: React.FC<FirmaProps> = ({ nombrePersonalizado, incluirFirma, onToggleFirma, onNombreChange }) => {
  if (!incluirFirma) return null;

  return (
    <div className="firma-container">
      <div className="firma-content">
        <div className="firma-nombre">{nombrePersonalizado || "Anderson Vasquez Gonzalez"}</div>
        <div className="firma-cargo1">Despacho Reparaciones B2B</div>
        <div className="firma-cargo2">Gerencia Soporte a Clientes</div>
        <div className="firma-cargo3">Vicepresidencia de Negocios Empresas y Gobierno</div>
        <div className="firma-linea"></div>
        <div className="firma-logo">
          <img src="/logotigo.png" alt="Tigo" className="logo-imagen" />
        </div>
      </div>
    </div>
  );
};

const EnvioCorreos: React.FC<EnvioCorreosProps> = ({ tipo }) => {
  const [para, setPara] = useState("");
  const [cc, setCc] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [titulo, setTitulo] = useState("");
  const [archivos, setArchivos] = useState<ArchivoAdjunto[]>([]);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [incluirFirma, setIncluirFirma] = useState(false);
  const [nombrePersonalizado, setNombrePersonalizado] = useState("Anderson Vasquez Gonzalez");

  const [fechaHoyGuiones, setFechaHoyGuiones] = useState("");
  const [fechaHoyGuionesBajo, setFechaHoyGuionesBajo] = useState("");
  const [fechaMananaGuiones, setFechaMananaGuiones] = useState("");
  const [fechaMananaGuionesBajo, setFechaMananaGuionesBajo] = useState("");

  // 👉 Cargar datos guardados en localStorage (solo una vez al cargar el componente)
  useEffect(() => {
    const dataGuardada = localStorage.getItem(`correos_${tipo}`);
    if (dataGuardada) {
      try {
        const { para, cc, asunto, mensaje, incluirFirma, nombrePersonalizado } = JSON.parse(dataGuardada);
        setPara(para || "");
        setCc(cc || "");
        setAsunto(asunto || "");
        setMensaje(mensaje || "");
        setIncluirFirma(incluirFirma || false);
        setNombrePersonalizado(nombrePersonalizado || "Anderson Vasquez Gonzalez");
      } catch (e) {
        console.error("❌ Error cargando datos de localStorage:", e);
      }
    }
  }, []); // Solo ejecutar una vez al montar el componente

  // 📅 Fechas de hoy y mañana en varios formatos
  useEffect(() => {
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    const formatGuiones = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };

    const formatGuionesBajo = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${y}_${m}_${d}`;
    };

    setFechaHoyGuiones(formatGuiones(hoy));
    setFechaHoyGuionesBajo(formatGuionesBajo(hoy));
    setFechaMananaGuiones(formatGuiones(manana));
    setFechaMananaGuionesBajo(formatGuionesBajo(manana));
  }, []);

  // 🔤 Título del componente
  useEffect(() => {
    switch (tipo) {
      case "envioInicio":
        setTitulo("📤 Envío de Correos - Inicio");
        break;
      case "envioCierre":
        setTitulo("📤 Envío de Correos - Cierre");
        break;
      case "envioApertura":
        setTitulo("📤 Envío de Correos - Apertura");
        break;
      case "envioPermisos":
        setTitulo("📤 Envío de Correos - Permisos");
        break;
    }
  }, [tipo]);

  // 📝 Contenido predeterminado según el tipo
  useEffect(() => {
    if (!fechaHoyGuiones || !fechaHoyGuionesBajo || !fechaMananaGuiones || !fechaMananaGuionesBajo) return;

    // Aplicar contenido predeterminado según el tipo
    switch (tipo) {
      case "envioApertura":
        setAsunto(`Asignación Nacional ${fechaMananaGuiones} Logística de Campo B2B - EIA`);
        setMensaje(`Buen día,<br><br>

Se anexa tabla con la apertura de despacho reparación con la Asignación Nacional ${fechaMananaGuiones}

En las zonas donde falte completar la ratio de órdenes a los técnicos y tecnólogos en el transcurso de la mañana se les estarán asignando las demás órdenes.<br><br>`);
        break;

      case "envioCierre":
        setAsunto(`[Mesa de Despacho] – Informe diario de actualización día de hoy_ ${fechaHoyGuionesBajo}_EIA`);
        setMensaje(`Cordial saludo,<br><br>

Nos permitimos anexar la programación del día de hoy ${fechaHoyGuionesBajo} debidamente actualizado (estados). De igual manera ya se encuentra disponible en la ruta compartida.

Cualquier inquietud, quedamos atentos.<br><br>`);
        break;

      case "envioInicio":
        setAsunto(`[Mesa de Despacho] – Informe diario de programación_${fechaMananaGuionesBajo}_ EIA`);
        setMensaje(`Cordial saludo,<br><br>

Nos permitimos anexar la programación para el día de mañana ${fechaMananaGuionesBajo}. De igual manera ya se encuentra disponible en la ruta compartida.

Cualquier inquietud, quedamos atentos.<br><br>`);
        break;

      case "envioPermisos":
        setAsunto("SOLICITUD PERMISOS DE INGRESO");
        setMensaje(`Cordial saludo,<br><br>

Solicitamos por favor gestionar permisos de ingreso para el siguiente personal, con el fin de poder realizar la reparación.<br><br>
`);
        break;
    }
  }, [tipo, fechaHoyGuiones, fechaHoyGuionesBajo, fechaMananaGuiones, fechaMananaGuionesBajo]);

  // TipTap maneja automáticamente el estado del editor

  // ✂️ Funciones para copiar y guardar
  const copiarTexto = (texto: string) => navigator.clipboard.writeText(texto);
  const copiarTodo = () => {
    const textoCompleto = `Para:\n${para}\n\nCC:\n${cc}\n\nAsunto:\n${asunto}\n\n${mensaje}`;
    navigator.clipboard.writeText(textoCompleto);
  };
  const guardarTodo = () => {
    const data = { para, cc, asunto, mensaje, incluirFirma, nombrePersonalizado };
    localStorage.setItem(`correos_${tipo}`, JSON.stringify(data));
    alert("Información guardada");
  };
  const limpiarFormulario = () => {
    // Usar setTimeout para evitar problemas de re-renderizado
    setTimeout(() => {
      setPara('');
      setCc('');
      setAsunto('');
      setMensaje('');
      setArchivos([]);
      
      // Forzar el foco en el textarea después de limpiar
      setTimeout(() => {
        const textarea = document.querySelector('.mensaje-con-tablas') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.disabled = false;
        }
      }, 200);
      
      alert("Formulario limpiado");
    }, 100);
  };

  // TipTap maneja automáticamente la inserción de imágenes

  // 📧 Validación de emails
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validarListaEmails = (listaEmails: string): boolean => {
    if (!listaEmails.trim()) return true; // Campo vacío es válido
    const emails = listaEmails.split(/[,;\s]+/).filter(email => email.trim());
    return emails.every(email => validarEmail(email.trim()));
  };

  const obtenerClaseValidacion = (campo: string): string => {
    if (!campo.trim()) return "";
    return validarListaEmails(campo) ? "email-valido" : "email-invalido";
  };

  // 📎 Manejo de archivos adjuntos
  const manejarSeleccionArchivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivosSeleccionados = Array.from(event.target.files || []);
    const nuevosArchivos: ArchivoAdjunto[] = archivosSeleccionados.map(archivo => ({
      id: Math.random().toString(36).substr(2, 9),
      nombre: archivo.name,
      archivo: archivo
    }));
    setArchivos(prev => [...prev, ...nuevosArchivos]);
  };

  const eliminarArchivo = (id: string) => {
    setArchivos(prev => prev.filter(archivo => archivo.id !== id));
  };

  // 📋 Manejo de pegado de tablas (para cuando TipTap no tiene extensión de tabla)
  const manejarPegadoTablas = (event: React.ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    const pastedData = clipboardData.getData('text/html') || clipboardData.getData('text/plain');
    
    if (pastedData.includes('<table') || pastedData.includes('\t')) {
      // Es una tabla HTML o datos tabulares
      event.preventDefault();
      const tablaFormateada = formatearTabla(pastedData);
      const nuevoMensaje = mensaje + (mensaje ? '\n\n' : '') + tablaFormateada;
      setMensaje(nuevoMensaje);
    }
  };

  const formatearTabla = (data: string): string => {
    // Si es HTML, extraer el contenido de la tabla
    if (data.includes('<table')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const table = doc.querySelector('table');
      
      if (table) {
        let tablaHTML = '<div style="margin: 15px 0; display: inline-block;">';
        
        // Buscar título antes de la tabla
        const titulo = table.previousSibling?.textContent?.trim() || 
                      table.parentElement?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim() ||
                      '';
        
        if (titulo && titulo.toUpperCase() === titulo && titulo.length > 3) {
          tablaHTML += `<h3 style="color: #1a73e8; font-weight: bold; text-align: center; margin-bottom: 10px; font-size: 16px; margin-top: 0;">${titulo}</h3>`;
        }
        
        tablaHTML += '<table style="border-collapse: collapse; width: auto; max-width: 400px; font-family: Arial, sans-serif; margin: 0 auto;">';
        
        const filas = table.querySelectorAll('tr');
        filas.forEach((fila) => {
          const celdas = fila.querySelectorAll('td, th');
          const esFilaTotal = Array.from(celdas).some(celda => 
            celda.textContent?.toLowerCase().includes('total')
          );
          
          tablaHTML += '<tr>';
          celdas.forEach((celda, celdaIndex) => {
            const texto = celda.textContent?.trim() || '';
            const esTitulo = celda.tagName === 'TH';
            
            let estilo = 'padding: 6px 10px; border: 1px solid #000; font-size: 13px; ';
            
            if (esTitulo) {
              estilo += 'background-color: #1a73e8; color: white; font-weight: bold; text-align: center;';
            } else if (esFilaTotal) {
              estilo += 'background-color: #ffffff; font-weight: bold;';
            } else {
              estilo += 'background-color: #e8f0fe;';
            }
            
            // Alineación de texto
            if (celdaIndex === celdas.length - 1 && texto.includes('$')) {
              estilo += ' text-align: right;';
            } else {
              estilo += ' text-align: left;';
            }
            
            tablaHTML += `<td style="${estilo}">${texto}</td>`;
          });
          tablaHTML += '</tr>';
        });
        
        tablaHTML += '</table></div>';
        return tablaHTML;
      }
    }
    
    // Si es texto plano con tabs o espacios, convertir a HTML
    if (data.includes('\t') || data.includes('  ')) {
      const lineas = data.split('\n');
      let tablaHTML = '<div style="margin: 15px 0; display: inline-block;">';
      let titulo = '';
      const filasDatos: string[][] = [];
      
      lineas.forEach((linea, index) => {
        if (linea.trim()) {
          const partes = linea.split('\t').map(p => p.trim());
          const primeraParte = partes[0] || '';
          
          // Detectar título
          if (primeraParte === primeraParte.toUpperCase() && 
              primeraParte.length > 3 && 
              !primeraParte.includes('$') &&
              !primeraParte.toLowerCase().includes('total') &&
              index === 0) {
            titulo = primeraParte;
          } else {
            filasDatos.push(partes);
          }
        }
      });
      
      // Agregar título si existe
      if (titulo) {
        tablaHTML += `<h3 style="color: #1a73e8; font-weight: bold; text-align: center; margin-bottom: 10px; font-size: 16px; margin-top: 0;">${titulo}</h3>`;
      }
      
      tablaHTML += '<table style="border-collapse: collapse; width: auto; max-width: 400px; font-family: Arial, sans-serif; margin: 0 auto;">';
      
      filasDatos.forEach((fila) => {
        const esFilaTotal = fila.some(celda => celda.toLowerCase().includes('total'));
        
        tablaHTML += '<tr>';
        fila.forEach((celda, celdaIndex) => {
          let estilo = 'padding: 6px 10px; border: 1px solid #000; font-size: 13px; ';
          
          if (esFilaTotal) {
            estilo += 'background-color: #ffffff; font-weight: bold;';
          } else {
            estilo += 'background-color: #e8f0fe;';
          }
          
          // Alineación de texto
          if (celdaIndex === fila.length - 1 && celda.includes('$')) {
            estilo += ' text-align: right;';
          } else {
            estilo += ' text-align: left;';
          }
          
          tablaHTML += `<td style="${estilo}">${celda}</td>`;
        });
        tablaHTML += '</tr>';
      });
      
      tablaHTML += '</table></div>';
      return tablaHTML;
    }
    
    // Si no es tabla, devolver como está
    return data;
  };

  // 🔑 Función para obtener el token de autenticación
  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  // 📤 Enviar correo (real)
  const enviarCorreo = async () => {
    if (!para.trim()) {
      alert("Por favor ingrese al menos un destinatario en el campo 'Para'");
      return;
    }
    
    if (!validarListaEmails(para)) {
      alert("Por favor ingrese direcciones de correo válidas en el campo 'Para'");
      return;
    }

    if (cc.trim() && !validarListaEmails(cc)) {
      alert("Por favor ingrese direcciones de correo válidas en el campo 'CC'");
      return;
    }

    if (!asunto.trim()) {
      alert("Por favor ingrese un asunto");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("No se encontró token de autenticación. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      // Mostrar indicador de carga
      const botonEnviar = document.querySelector('.btn-enviar') as HTMLButtonElement;
      if (botonEnviar) {
        botonEnviar.textContent = '📤 Enviando...';
        botonEnviar.disabled = true;
      }

      // Preparar el mensaje completo con firma si está habilitada
      let mensajeCompleto = mensaje.trim();
      
      // Agregar firma si está habilitada
      if (incluirFirma) {
        const firmaHTML = `
<div style="margin-top: 15px; font-family: Arial, sans-serif; max-width: 420px; line-height: 0.8;">
  <div style="font-size: 18px; font-weight: bold; color: #1e3a8a; margin-bottom: 5px;">${nombrePersonalizado}</div>
  <div style="font-size: 14px; font-weight: bold; color: #06b6d4; margin-bottom: 3px;">Despacho Reparaciones B2B</div>
  <div style="font-size: 13px; font-weight: normal; color: #1e3a8a; margin-bottom: 3px;">Gerencia Soporte a Clientes</div>
  <div style="font-size: 13px; font-weight: normal; color: #1e3a8a; margin-bottom: 8px;">Vicepresidencia de Negocios Empresas y Gobierno</div>
  <div style="width: 72%; height: 1px; background-color: #06b6d4; margin: 8px 0;"></div>
  <div style="font-size:16px; font-weight:bold; color:#002d72; margin-top:-2px">TIGO</div>
</div>`;
        
        // Si el mensaje contiene HTML, agregar la firma como HTML
        if (mensaje.includes('<') && mensaje.includes('>')) {
          mensajeCompleto += firmaHTML;
        } else {
          // Si es texto plano, convertir saltos de línea y agregar firma en texto plano
          mensajeCompleto = mensajeCompleto.replace(/\n/g, '<br>');
          mensajeCompleto += `<br><br><div style="margin-top: 15px; font-family: Arial, sans-serif; max-width: 420px; line-height: 0.8;">
<div style="font-size: 18px; font-weight: bold; color: #1e3a8a; margin-bottom: 5px;">${nombrePersonalizado}</div>
<div style="font-size: 14px; font-weight: bold; color: #06b6d4; margin-bottom: 3px;">Despacho Reparaciones B2B</div>
<div style="font-size: 13px; font-weight: normal; color: #1e3a8a; margin-bottom: 3px;">Gerencia Soporte a Clientes</div>
<div style="font-size: 13px; font-weight: normal; color: #1e3a8a; margin-bottom: 8px;">Vicepresidencia de Negocios Empresas y Gobierno</div>
<div style="width: 72%; height: 1px; background-color: #06b6d4; margin: 8px 0;"></div>
<div style="font-size:16px; font-weight:bold; color:#002d72; margin-top:-2px">TIGO</div></div>`;
        }
      } else {
        // Si no hay firma y el mensaje no contiene HTML, convertir saltos de línea a HTML
        if (!mensajeCompleto.includes('<') || !mensajeCompleto.includes('>')) {
          mensajeCompleto = mensajeCompleto.replace(/\n/g, '<br>');
        }
      }

      // Debug: Mostrar el mensaje que se va a enviar
      console.log('📧 Mensaje completo a enviar:', mensajeCompleto);
      console.log('📧 ¿Contiene HTML?', mensajeCompleto.includes('<') && mensajeCompleto.includes('>'));
      
      // Preparar FormData para enviar archivos
      const formData = new FormData();
      formData.append('para', para.trim());
      if (cc.trim()) formData.append('cc', cc.trim());
      formData.append('asunto', asunto.trim());
      formData.append('mensaje', mensajeCompleto);

      // Agregar archivos adjuntos
      archivos.forEach((archivoAdjunto, index) => {
        formData.append(`archivo_${index}`, archivoAdjunto.archivo);
      });

      // Agregar información de archivos
      formData.append('archivos_info', JSON.stringify(
        archivos.map(archivo => ({
          nombre: archivo.nombre,
          tipo: archivo.archivo.type,
          tamaño: archivo.archivo.size
        }))
      ));

      // Enviar petición al backend
      const response = await fetch('/api/correos/enviar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No incluir Content-Type para FormData
        },
        body: formData
      });

      const resultado = await response.json();

      if (resultado.success) {
        alert(`✅ Correo enviado exitosamente!\n\nID del mensaje: ${resultado.messageId}`);
        
        // Limpiar formulario después del envío exitoso (opcional)
        // Comentado para evitar bloqueo del textarea
        // setPara('');
        // setCc('');
        // setAsunto('');
        // setMensaje('');
        // setArchivos([]);
      } else {
        alert(`❌ Error al enviar el correo:\n${resultado.message}`);
      }

    } catch (error) {
      console.error('Error enviando correo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error de conexión:\n${errorMessage}`);
    } finally {
      // Restaurar botón
      const botonEnviar = document.querySelector('.btn-enviar') as HTMLButtonElement;
      if (botonEnviar) {
        botonEnviar.textContent = '📤 Enviar Correo';
        botonEnviar.disabled = false;
      }
    }
  };

  return (
    <div className="envio-container">
      <h2 className="envio-titulo">{titulo}</h2>

      <label className="envio-label">Para:</label>
      <textarea
        className={`envio-textarea ${obtenerClaseValidacion(para)}`}
        value={para}
        onChange={(e) => setPara(e.target.value)}
        placeholder="Direcciones de correo para... (separadas por comas)"
      />
      <button className="btn-mini" onClick={() => copiarTexto(para)}>Copiar Para</button>

      <label className="envio-label">CC:</label>
      <textarea
        className={`envio-textarea ${obtenerClaseValidacion(cc)}`}
        value={cc}
        onChange={(e) => setCc(e.target.value)}
        placeholder="Direcciones en copia... (separadas por comas)"
      />
      <button className="btn-mini" onClick={() => copiarTexto(cc)}>Copiar CC</button>

      <label className="envio-label">Asunto:</label>
      <input
        className="envio-input"
        type="text"
        value={asunto}
        onChange={(e) => setAsunto(e.target.value)}
        placeholder="Asunto del correo..."
      />
      <button className="btn-mini" onClick={() => copiarTexto(asunto)}>Copiar Asunto</button>

      <label className="envio-label">Mensaje:</label>
      <div className="mensaje-container">
        {!mostrarVistaPrevia ? (
          <RichTextEditor
            content={mensaje}
            onChange={setMensaje}
            placeholder="Cuerpo del mensaje... (Puedes pegar tablas de Excel con Ctrl+V o imágenes con Ctrl+V)"
          />
        ) : (
          <div 
            className="vista-previa-html"
            dangerouslySetInnerHTML={{ __html: mensaje }}
          />
        )}
      </div>
      <button className="btn-mini" onClick={() => copiarTexto(mensaje)}>Copiar Mensaje</button>

      {/* Sección de Firma */}
      <div className="firma-section">
        <div className="firma-controls">
          <label className="envio-label">
            <input
              type="checkbox"
              checked={incluirFirma}
              onChange={(e) => setIncluirFirma(e.target.checked)}
              className="firma-checkbox"
            />
            ✍️ Incluir Firma
          </label>
          {incluirFirma && (
            <div className="nombre-personalizado">
              <label className="envio-label">Nombre personalizado:</label>
              <input
                type="text"
                value={nombrePersonalizado}
                onChange={(e) => setNombrePersonalizado(e.target.value)}
                className="envio-input"
                placeholder="Ingrese el nombre para la firma..."
              />
            </div>
          )}
        </div>
        {incluirFirma && (
          <Firma
            nombrePersonalizado={nombrePersonalizado}
            incluirFirma={incluirFirma}
            onToggleFirma={() => setIncluirFirma(!incluirFirma)}
            onNombreChange={setNombrePersonalizado}
          />
        )}
      </div>

      {/* Sección de archivos adjuntos */}
      <label className="envio-label">📎 Archivos Adjuntos:</label>
      <div className="archivos-section">
        <input
          type="file"
          id="archivos-input"
          multiple
          onChange={manejarSeleccionArchivos}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
        />
        <button 
          className="btn-mini"
          onClick={() => document.getElementById('archivos-input')?.click()}
        >
          📎 Agregar Archivos
        </button>
        
        {archivos.length > 0 && (
          <div className="lista-archivos">
            {archivos.map(archivo => (
              <div key={archivo.id} className="archivo-item">
                <span className="archivo-nombre">{archivo.nombre}</span>
                <button 
                  className="btn-eliminar-archivo"
                  onClick={() => eliminarArchivo(archivo.id)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones principales */}
      <div className="envio-botones">
        <button className="btn" onClick={copiarTodo}>📋 Copiar Todo</button>
        <button className="btn" onClick={guardarTodo}>💾 Guardar</button>
        <button className="btn" onClick={limpiarFormulario}>🗑️ Limpiar</button>
        <button 
          className="btn btn-vista-previa" 
          onClick={() => setMostrarVistaPrevia(!mostrarVistaPrevia)}
        >
          👁️ Vista Previa
        </button>
        <button className="btn btn-enviar" onClick={enviarCorreo}>📤 Enviar Correo</button>
      </div>

      {/* Vista previa del correo */}
      {mostrarVistaPrevia && (
        <div className="vista-previa">
          <h3 className="vista-previa-titulo">📧 Vista Previa del Correo</h3>
          <div className="vista-previa-contenido">
            <div className="vista-previa-campo">
              <strong>Para:</strong> <span className={obtenerClaseValidacion(para)}>{para || "Sin destinatarios"}</span>
            </div>
            <div className="vista-previa-campo">
              <strong>CC:</strong> <span className={obtenerClaseValidacion(cc)}>{cc || "Sin copias"}</span>
            </div>
            <div className="vista-previa-campo">
              <strong>Asunto:</strong> {asunto || "Sin asunto"}
            </div>
            {archivos.length > 0 && (
              <div className="vista-previa-campo">
                <strong>Archivos adjuntos:</strong>
                <ul className="lista-adjuntos">
                  {archivos.map(archivo => (
                    <li key={archivo.id}>{archivo.nombre}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="vista-previa-campo">
              <strong>Mensaje:</strong>
              <div className="vista-previa-mensaje">
                {mensaje ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: mensaje }}
                    className="mensaje-renderizado"
                  />
                ) : (
                  "Sin mensaje"
                )}
                {incluirFirma && (
                  <Firma
                    nombrePersonalizado={nombrePersonalizado}
                    incluirFirma={incluirFirma}
                    onToggleFirma={() => setIncluirFirma(!incluirFirma)}
                    onNombreChange={setNombrePersonalizado}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvioCorreos;
