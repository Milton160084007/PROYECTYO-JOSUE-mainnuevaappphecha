<?php
error_reporting(0);
ini_set('display_errors', 0);
include_once 'cors_headers.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$type = $_GET['type'] ?? 'weekly'; // 'weekly' or 'monthly'

if ($type === 'weekly') {
    $date_start = date('Y-m-d', strtotime('monday this week'));
    $date_end   = date('Y-m-d', strtotime('sunday this week'));
    $label = 'Informe Semanal: ' . date('d/m/Y', strtotime($date_start)) . ' — ' . date('d/m/Y', strtotime($date_end));
} else {
    $date_start = date('Y-m-01');
    $date_end   = date('Y-m-t');
    $label = 'Informe Mensual: ' . date('F Y');
}

$report = ['label' => $label, 'date_start' => $date_start, 'date_end' => $date_end];

// ─── VENTAS (pedidos no cancelados) ─────────────────────────────────────────
$stmt = $db->prepare("
    SELECT COUNT(*) as total_pedidos,
           COALESCE(SUM(total), 0) as ingresos_brutos,
           COALESCE(SUM(CASE WHEN estado = 'CANCELADO' THEN 1 ELSE 0 END), 0) as pedidos_cancelados,
           COALESCE(SUM(CASE WHEN tipo_pedido = 'LOCAL' THEN 1 ELSE 0 END), 0) as pedidos_local,
           COALESCE(SUM(CASE WHEN tipo_pedido = 'PARA_LLEVAR' THEN 1 ELSE 0 END), 0) as pedidos_llevar
    FROM pedidos
    WHERE DATE(fecha_creacion) BETWEEN ? AND ?
");
$stmt->execute([$date_start, $date_end]);
$report['ventas'] = $stmt->fetch(PDO::FETCH_ASSOC);

// Pedidos entregados / completados
$stmt = $db->prepare("
    SELECT COALESCE(SUM(total), 0) as ingresos_netos, COUNT(*) as pedidos_entregados
    FROM pedidos
    WHERE DATE(fecha_creacion) BETWEEN ? AND ? AND estado = 'ENTREGADO'
");
$stmt->execute([$date_start, $date_end]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$report['ventas']['ingresos_netos'] = $row['ingresos_netos'];
$report['ventas']['pedidos_entregados'] = $row['pedidos_entregados'];

// ─── TOP 5 PRODUCTOS MÁS VENDIDOS ────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT pm.nombre, SUM(dp.cantidad) as unidades_vendidas,
           ROUND(SUM(dp.cantidad * dp.precio_unitario), 2) as total_generado
    FROM detalle_pedidos dp
    JOIN pedidos p ON dp.pedido_id = p.id
    JOIN productos_menu pm ON dp.producto_id = pm.id
    WHERE DATE(p.fecha_creacion) BETWEEN ? AND ? AND p.estado != 'CANCELADO'
    GROUP BY dp.producto_id, pm.nombre
    ORDER BY unidades_vendidas DESC
    LIMIT 5
");
$stmt->execute([$date_start, $date_end]);
$report['top_productos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ─── VENTAS POR DÍA ──────────────────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT DATE(fecha_creacion) as fecha,
           COUNT(*) as pedidos,
           COALESCE(SUM(total), 0) as total
    FROM pedidos
    WHERE DATE(fecha_creacion) BETWEEN ? AND ? AND estado != 'CANCELADO'
    GROUP BY DATE(fecha_creacion)
    ORDER BY fecha
");
$stmt->execute([$date_start, $date_end]);
$report['ventas_por_dia'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ─── FACTURAS ────────────────────────────────────────────────────────────────
try {
    $stmt = $db->prepare("
        SELECT COUNT(*) as total_facturas,
               COALESCE(SUM(total), 0) as monto_facturado,
               COALESCE(SUM(iva), 0) as total_iva,
               COUNT(CASE WHEN anulada = 1 THEN 1 END) as facturas_anuladas,
               COUNT(CASE WHEN metodo_pago = 'EFECTIVO' THEN 1 END) as pago_efectivo,
               COUNT(CASE WHEN metodo_pago = 'TARJETA' THEN 1 END) as pago_tarjeta,
               COUNT(CASE WHEN metodo_pago = 'TRANSFERENCIA' THEN 1 END) as pago_transferencia
        FROM facturas
        WHERE DATE(fecha_emision) BETWEEN ? AND ?
    ");
    $stmt->execute([$date_start, $date_end]);
    $report['facturacion'] = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $report['facturacion'] = ['total_facturas'=>0,'monto_facturado'=>0,'total_iva'=>0,'facturas_anuladas'=>0,'pago_efectivo'=>0,'pago_tarjeta'=>0,'pago_transferencia'=>0];
}

// ─── COMPRAS / GASTOS ────────────────────────────────────────────────────────
try {
    $stmt = $db->prepare("
        SELECT COUNT(*) as total_compras,
               COALESCE(SUM(total), 0) as gasto_total,
               COALESCE(SUM(iva), 0) as iva_pagado
        FROM compras
        WHERE DATE(fecha_compra) BETWEEN ? AND ?
    ");
    $stmt->execute([$date_start, $date_end]);
    $report['compras'] = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $report['compras'] = ['total_compras' => 0, 'gasto_total' => 0, 'iva_pagado' => 0];
}

// ─── INVENTARIO (stock bajo) ─────────────────────────────────────────────────
try {
    $stmt = $db->query("
        SELECT nombre, stock_actual, stock_minimo, unidad_medida
        FROM insumos
        WHERE activo = 1 AND stock_actual <= stock_minimo
        ORDER BY (stock_actual - stock_minimo) ASC
        LIMIT 10
    ");
    $report['stock_bajo'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $report['stock_bajo'] = [];
}

// ─── CLIENTES NUEVOS ─────────────────────────────────────────────────────────
$stmt = $db->prepare("
    SELECT COUNT(*) as nuevos_clientes
    FROM clientes
    WHERE activo = 1 AND DATE(fecha_registro) BETWEEN ? AND ?
");
$stmt->execute([$date_start, $date_end]);
$report['clientes'] = $stmt->fetch(PDO::FETCH_ASSOC);

// Total clientes activos
$stmt = $db->query("SELECT COUNT(*) as total FROM clientes WHERE activo = 1");
$report['clientes']['total_activos'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// ─── RESUMEN EJECUTIVO ───────────────────────────────────────────────────────
$ingresos = floatval($report['ventas']['ingresos_netos']);
$gastos   = floatval($report['compras']['gasto_total']);
$report['resumen'] = [
    'ingresos_netos' => $ingresos,
    'gastos'         => $gastos,
    'utilidad_bruta' => $ingresos - $gastos,
    'margen'         => $ingresos > 0 ? round((($ingresos - $gastos) / $ingresos) * 100, 1) : 0
];

echo json_encode($report);
?>
