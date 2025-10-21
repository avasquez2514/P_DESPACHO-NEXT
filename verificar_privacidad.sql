-- 🔍 VERIFICAR PRIVACIDAD ENTRE USUARIOS

-- 1. Ver todos los usuarios y cuántas notas tiene cada uno
SELECT 
  u.id as usuario_id,
  u.nombre,
  u.email,
  COUNT(ndr.id) as total_notas_propias
FROM usuarios u
LEFT JOIN notas_despacho_rel ndr ON u.id = ndr.usuario_id
GROUP BY u.id, u.nombre, u.email;

-- 2. Ver todas las plantillas base (tanto por defecto como personalizadas)
SELECT 
  pb.id,
  pb.novedad,
  pb.nota_publica,
  COUNT(ndr.id) as usuarios_que_la_tienen
FROM plantillas_base pb
LEFT JOIN notas_despacho_rel ndr ON pb.id = ndr.plantilla_id
GROUP BY pb.id, pb.novedad, pb.nota_publica
ORDER BY usuarios_que_la_tienen DESC;

-- 3. Ver qué plantillas tiene un usuario específico (reemplaza 'USUARIO-UUID')
SELECT 
  u.nombre as usuario,
  pb.novedad,
  pb.nota_publica,
  ndr.creado_en
FROM notas_despacho_rel ndr
INNER JOIN usuarios u ON ndr.usuario_id = u.id
INNER JOIN plantillas_base pb ON ndr.plantilla_id = pb.id
WHERE u.id = 'USUARIO-UUID-AQUI'
ORDER BY ndr.creado_en DESC;

-- 4. Verificar que no hay acceso cruzado (esto debería devolver 0 resultados)
-- Intentar ver las notas de otro usuario (reemplaza los UUIDs)
SELECT 
  u.nombre as usuario_que_consulta,
  pb.novedad as nota_de_otro_usuario,
  ndr.creado_en
FROM notas_despacho_rel ndr
INNER JOIN usuarios u ON ndr.usuario_id = u.id
INNER JOIN plantillas_base pb ON ndr.plantilla_id = pb.id
WHERE u.id = 'USUARIO-A-UUID'  -- Usuario A consulta
AND pb.id IN (
  SELECT ndr2.plantilla_id 
  FROM notas_despacho_rel ndr2 
  WHERE ndr2.usuario_id = 'USUARIO-B-UUID'  -- Pero busca notas de Usuario B
);
-- Esta consulta debería devolver 0 resultados si la privacidad funciona correctamente

-- 5. Ver aplicativos por usuario (mismo principio)
SELECT 
  u.nombre as usuario,
  ab.nombre as aplicativo,
  ab.url,
  ab.categoria,
  ar.creado_en
FROM aplicativos_rel ar
INNER JOIN usuarios u ON ar.usuario_id = u.id
INNER JOIN aplicativos_base ab ON ar.aplicativo_base_id = ab.id
WHERE u.id = 'USUARIO-UUID-AQUI'
ORDER BY ar.creado_en DESC;
