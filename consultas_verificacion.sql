-- 📋 CONSULTAS PARA VERIFICAR NOTAS PERSONALIZADAS

-- 1. Ver todas las plantillas base (incluyendo personalizadas)
SELECT 
  id,
  novedad,
  nota_publica,
  nota_interna,
  nota_avances,
  plantilla
FROM plantillas_base
ORDER BY novedad;

-- 2. Ver qué plantillas tiene asignadas un usuario específico
SELECT 
  u.nombre as usuario,
  pb.novedad,
  pb.nota_publica,
  pb.nota_interna,
  pb.nota_avances,
  ndr.creado_en
FROM notas_despacho_rel ndr
INNER JOIN usuarios u ON ndr.usuario_id = u.id
INNER JOIN plantillas_base pb ON ndr.plantilla_id = pb.id
WHERE u.id = 'TU-USUARIO-UUID-AQUI'
ORDER BY ndr.creado_en DESC;

-- 3. Contar cuántas plantillas tiene cada usuario
SELECT 
  u.nombre as usuario,
  COUNT(ndr.id) as total_notas
FROM usuarios u
LEFT JOIN notas_despacho_rel ndr ON u.id = ndr.usuario_id
GROUP BY u.id, u.nombre;

-- 📱 CONSULTAS PARA VERIFICAR APLICATIVOS PERSONALIZADOS

-- 4. Ver todos los aplicativos base (incluyendo personalizados)
SELECT 
  id,
  nombre,
  url,
  categoria
FROM aplicativos_base
ORDER BY categoria, nombre;

-- 5. Ver qué aplicativos tiene asignados un usuario específico
SELECT 
  u.nombre as usuario,
  ab.nombre as aplicativo,
  ab.url,
  ab.categoria,
  ar.creado_en
FROM aplicativos_rel ar
INNER JOIN usuarios u ON ar.usuario_id = u.id
INNER JOIN aplicativos_base ab ON ar.aplicativo_base_id = ab.id
WHERE u.id = 'TU-USUARIO-UUID-AQUI'
ORDER BY ar.creado_en DESC;

-- 6. Contar cuántos aplicativos tiene cada usuario
SELECT 
  u.nombre as usuario,
  COUNT(ar.id) as total_aplicativos
FROM usuarios u
LEFT JOIN aplicativos_rel ar ON u.id = ar.usuario_id
GROUP BY u.id, u.nombre;

-- 🔍 CONSULTAS GENERALES

-- 7. Ver toda la información de un usuario específico
SELECT 
  u.id,
  u.nombre,
  u.email,
  u.creado_en as usuario_creado,
  COUNT(DISTINCT ndr.id) as total_notas,
  COUNT(DISTINCT ar.id) as total_aplicativos
FROM usuarios u
LEFT JOIN notas_despacho_rel ndr ON u.id = ndr.usuario_id
LEFT JOIN aplicativos_rel ar ON u.id = ar.usuario_id
WHERE u.id = 'TU-USUARIO-UUID-AQUI'
GROUP BY u.id, u.nombre, u.email, u.creado_en;

-- 8. Ver las últimas 10 notas creadas (incluyendo personalizadas)
SELECT 
  pb.novedad,
  pb.nota_publica,
  u.nombre as creado_por,
  ndr.creado_en
FROM notas_despacho_rel ndr
INNER JOIN usuarios u ON ndr.usuario_id = u.id
INNER JOIN plantillas_base pb ON ndr.plantilla_id = pb.id
ORDER BY ndr.creado_en DESC
LIMIT 10;

-- 9. Ver los últimos 10 aplicativos creados (incluyendo personalizados)
SELECT 
  ab.nombre,
  ab.url,
  ab.categoria,
  u.nombre as creado_por,
  ar.creado_en
FROM aplicativos_rel ar
INNER JOIN usuarios u ON ar.usuario_id = u.id
INNER JOIN aplicativos_base ab ON ar.aplicativo_base_id = ab.id
ORDER BY ar.creado_en DESC
LIMIT 10;
