<?php
try {
    $conn = new PDO('mysql:host=localhost;dbname=nuevabdpreubarestaurante;charset=utf8mb4', 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->query("SELECT id, nombre FROM productos_menu");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $updates = 0;
    foreach($products as $p) {
        $id = $p['id'];
        $nombre = strtolower($p['nombre']);
        $url = '';
        
        // Refined matching
        if (strpos($nombre, 'entero') !== false || $nombre == 'pollo asado') {
            $url = 'assets/images/menu-item-1.jpeg';
        } else if (strpos($nombre, 'medio') !== false || strpos($nombre, '1/2') !== false) {
            $url = 'assets/images/menu-item-2.jpeg';
        } else if (strpos($nombre, 'cuarto') !== false || strpos($nombre, '1/4') !== false) {
            $url = 'assets/images/menu-item-3.jpeg';
        } else if (strpos($nombre, 'parrillada') !== false || strpos($nombre, 'mixto') !== false) {
            $url = 'assets/images/menu-item-4.jpeg';
        } else if (strpos($nombre, 'costilla') !== false) {
            $url = 'assets/images/menu-item-5.jpeg';
        } else if (strpos($nombre, 'chuleta') !== false || strpos($nombre, 'lomo') !== false) {
            $url = 'assets/images/menu-item-6.jpeg';
        } else if (strpos($nombre, 'hamburguesa') !== false) {
            $url = 'assets/images/menu-item-7.jpeg';
        } else if (strpos($nombre, 'salchipapa') !== false || strpos($nombre, 'papas') !== false) {
            $url = 'assets/images/menu-item-8.jpeg';
        } else if (strpos($nombre, 'empanada') !== false || strpos($nombre, 'porción') !== false || strpos($nombre, 'arroz') !== false || strpos($nombre, 'menestra') !== false) {
            $url = 'assets/images/menu-item-9.jpeg';
        } else if (strpos($nombre, 'jugo') !== false || strpos($nombre, 'limonada') !== false) {
            $url = 'assets/images/menu-item-10.jpeg';
        } else if (strpos($nombre, 'cerveza') !== false || strpos($nombre, 'pilsener') !== false || strpos($nombre, 'club') !== false) {
            $url = 'assets/images/menu-item-11.jpeg';
        } else if (strpos($nombre, 'gaseosa') !== false || strpos($nombre, 'cola') !== false || strpos($nombre, 'sprite') !== false || strpos($nombre, 'fioravanti') !== false) {
            $url = 'assets/images/menu-item-12.jpeg';
        } else {
            $url = 'assets/images/menu-item-13.jpeg';
        }
        
        $updateStmt = $conn->prepare("UPDATE productos_menu SET url_imagen = ? WHERE id = ?");
        $updateStmt->execute([$url, $id]);
        $updates++;
    }
    
    echo "Refined updates: $updates products with new image mapping.\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
