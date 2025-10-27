// Controlador para funcionalidades de IA
const axios = require('axios');

// Función para mejorar texto usando procesamiento local
const mejorarTexto = async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({ 
        error: 'El texto no puede estar vacío' 
      });
    }

    // Procesamiento local de mejora de texto
    let textoMejorado = texto.trim();
    
    // Correcciones básicas
    textoMejorado = textoMejorado.replace(/\bola\b/gi, 'hola');
    textoMejorado = textoMejorado.replace(/\bcmo\b/gi, 'cómo');
    textoMejorado = textoMejorado.replace(/\bcm\b/gi, 'cómo');
    textoMejorado = textoMejorado.replace(/\bestas\b/gi, 'estás');
    textoMejorado = textoMejorado.replace(/\bestan\b/gi, 'están');
    textoMejorado = textoMejorado.replace(/\bq\b/gi, 'que');
    textoMejorado = textoMejorado.replace(/\bk\b/gi, 'que');
    textoMejorado = textoMejorado.replace(/\bke\b/gi, 'que');
    textoMejorado = textoMejorado.replace(/\bxq\b/gi, 'por qué');
    textoMejorado = textoMejorado.replace(/\bpq\b/gi, 'por qué');
    
    // Acentos comunes
    textoMejorado = textoMejorado.replace(/\bque\b/gi, 'qué');
    textoMejorado = textoMejorado.replace(/\bcomo\b/gi, 'cómo');
    textoMejorado = textoMejorado.replace(/\bdonde\b/gi, 'dónde');
    textoMejorado = textoMejorado.replace(/\bcuando\b/gi, 'cuándo');
    textoMejorado = textoMejorado.replace(/\bporque\b/gi, 'por qué');
    textoMejorado = textoMejorado.replace(/\bdespues\b/gi, 'después');
    textoMejorado = textoMejorado.replace(/\btambien\b/gi, 'también');
    textoMejorado = textoMejorado.replace(/\bademas\b/gi, 'además');
    textoMejorado = textoMejorado.replace(/\bsi\b/gi, 'sí');

    // 2. Espacios después de comas y puntos
    textoMejorado = textoMejorado.replace(/([,.])([A-Za-z])/g, '$1 $2');
    
    // 3. Espacios antes de signos de puntuación
    textoMejorado = textoMejorado.replace(/([a-zA-Z])([.!?])/g, '$1 $2');
    
    // 4. Capitalización después de puntos
    textoMejorado = textoMejorado.replace(/\. ([a-z])/g, (match, p1) => `. ${p1.toUpperCase()}`);
    
    // 5. Eliminar espacios múltiples
    textoMejorado = textoMejorado.replace(/\s+/g, ' ');
    
    // 6. Limpiar espacios al inicio y final
    textoMejorado = textoMejorado.trim();

    // 7. Mejoras básicas si no hay cambios
    if (textoMejorado === texto) {
      // Agregar punto final si no lo tiene
      if (!textoMejorado.endsWith('.') && !textoMejorado.endsWith('!') && !textoMejorado.endsWith('?')) {
        textoMejorado += '.';
      }
      
      // Capitalizar primera letra
      if (textoMejorado.length > 0) {
        textoMejorado = textoMejorado.charAt(0).toUpperCase() + textoMejorado.slice(1);
      }
    }

    console.log('Texto mejorado:', textoMejorado);

    res.json({
      textoOriginal: texto,
      textoMejorado: textoMejorado,
      mejoras: {
        longitudOriginal: texto.length,
        longitudMejorada: textoMejorado.length,
        fecha: new Date().toISOString(),
        tipo: 'Procesamiento local'
      }
    });

  } catch (error) {
    console.error('Error en mejorarTexto:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al procesar el texto',
      details: error.message
    });
  }
};

// Función alternativa usando una API gratuita (Hugging Face)
const mejorarTextoGratuito = async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({ 
        error: 'El texto no puede estar vacío' 
      });
    }

    // Usar Hugging Face API (gratuita)
    const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    
    if (!huggingFaceApiKey) {
      return res.status(500).json({ 
        error: 'API key de Hugging Face no configurada' 
      });
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        inputs: `Corrige y mejora la redacción del siguiente texto en español: ${texto}`,
        parameters: {
          max_length: 200,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${huggingFaceApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const textoMejorado = response.data[0]?.generated_text || texto;

    res.json({
      textoOriginal: texto,
      textoMejorado: textoMejorado,
      mejoras: {
        longitudOriginal: texto.length,
        longitudMejorada: textoMejorado.length,
        fecha: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en mejorarTextoGratuito:', error);
    
    // Fallback: retornar el texto original si falla la API
    res.json({
      textoOriginal: texto,
      textoMejorado: texto,
      mejoras: {
        longitudOriginal: texto.length,
        longitudMejorada: texto.length,
        fecha: new Date().toISOString(),
        nota: 'No se pudo mejorar el texto automáticamente'
      }
    });
  }
};

// Función para obtener sugerencias de sinónimos
const obtenerSinonimos = async (req, res) => {
  try {
    const { palabra } = req.query;

    if (!palabra || palabra.trim().length === 0) {
      return res.status(400).json({ 
        error: 'La palabra no puede estar vacía' 
      });
    }

    // Usar API de sinónimos (ejemplo con Datamuse API - gratuita)
    const response = await axios.get(
      `https://api.datamuse.com/words?rel_syn=${palabra}&max=10`
    );

    const sinonimos = response.data.map(item => item.word);

    res.json({
      palabra: palabra,
      sinonimos: sinonimos,
      fecha: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en obtenerSinonimos:', error);
    res.status(500).json({ 
      error: 'Error al obtener sinónimos' 
    });
  }
};

module.exports = {
  mejorarTexto,
  mejorarTextoGratuito,
  obtenerSinonimos
};