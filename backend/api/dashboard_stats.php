<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Estadísticas generales para el dashboard
$stats = [];

// Total pedidos hoy
$stmt = $db->query("SELECT COUNT(*) as total FROM pedidos WHERE DATE(fecha_creacion) = CURDATE()");
$stats['pedidos_hoy'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Pedidos pendientes
$stmt = $db->query("SELECT COUNT(*) as total FROM pedidos WHERE estado = 'PENDIENTE'");
$stats['pedidos_pendientes'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Pedidos en preparación
$stmt = $db->query("SELECT COUNT(*) as total FROM pedidos WHERE estado = 'EN_PREPARACION'");
$stats['pedidos_en_preparacion'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Ventas de hoy
$stmt = $db->query("SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE DATE(fecha_creacion) = CURDATE() AND estado != 'CANCELADO'");
$stats['ventas_hoy'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Total productos activos
$stmt = $db->query("SELECT COUNT(*) as total FROM productos_menu WHERE activo = 1");
$stats['total_productos'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Insumos con stock bajo
$stmt = $db->query("SELECT COUNT(*) as total FROM insumos WHERE activo = 1 AND stock_actual <= stock_minimo");
$stats['insumos_stock_bajo'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Total clientes
$stmt = $db->query("SELECT COUNT(*) as total FROM clientes WHERE activo = 1");
$stats['total_clientes'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Facturas hoy
$stmt = $db->query("SELECT COUNT(*) as total FROM facturas WHERE DATE(fecha_emision) = CURDATE() AND anulada = 0");
$stats['facturas_hoy'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Últimos 5 pedidos
$stmt = $db->query("SELECT p.id, p.estado, p.total, p.tipo_pedido, p.numero_mesa, p.fecha_creacion, u.nombre AS usuario
                     FROM pedidos p LEFT JOIN usuarios u ON p.usuario_id = u.id 
                     ORDER BY p.fecha_creacion DESC LIMIT 5");
$stats['ultimos_pedidos'] = [];
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $stats['ultimos_pedidos'][] = $row; }

echo json_encode($stats);
?>
