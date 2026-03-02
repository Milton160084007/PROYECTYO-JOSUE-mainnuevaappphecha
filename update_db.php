<?php
try {
    $conn = new PDO('mysql:host=localhost;dbname=nuevabdpreubarestaurante;charset=utf8mb4', 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get all products to update them
    $stmt = $conn->query("SELECT id, nombre FROM productos_menu");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $updates = 0;
    foreach($products as $p) {
        $id = $p['id'];
        $nombre = strtolower($p['nombre']);
        $url = '';
        
        // Match names to our assets
        if (strpos($nombre, 'medio pollo') !== false) {
            $url = 'assets/images/menu-item-2.jpeg';
        } else if (strpos($nombre, 'cuarto de pollo') !== false || strpos($nombre, '1/4') !== false) {
            $url = 'assets/images/menu-item-3.jpeg';
        } else if (strpos($nombre, 'pollo entero') !== false) {
            $url = 'assets/images/menu-item-1.jpeg';
        } else if (strpos($nombre, 'parrillada') !== false) {
            $url = 'assets/images/menu-item-4.jpeg';
        } else if (strpos($nombre, 'costillas') !== false) {
            $url = 'assets/images/menu-item-5.jpeg';
        } else if (strpos($nombre, 'chuleta') !== false) {
            $url = 'assets/images/menu-item-6.jpeg';
        } else if (strpos($nombre, 'hamburguesa') !== false) {
            $url = 'assets/images/menu-item-7.jpeg';
        } else if (strpos($nombre, 'salchipapa') !== false) {
            $url = 'assets/images/menu-item-8.jpeg';
        } else if (strpos($nombre, 'empanada') !== false || strpos($nombre, 'porción') !== false) {
            $url = 'assets/images/menu-item-9.jpeg';
        } else if (strpos($nombre, 'jugo') !== false || strpos($nombre, 'batido') !== false) {
            $url = 'assets/images/menu-item-10.jpeg';
        } else if (strpos($nombre, 'cerveza') !== false) {
            $url = 'assets/images/menu-item-11.jpeg';
        } else if (strpos($nombre, 'gaseosa') !== false || strpos($nombre, 'cola') !== false) {
            $url = 'assets/images/menu-item-12.jpeg';
        } else {
            // Default image
            $url = 'assets/images/menu-item-13.jpeg';
        }
        
        $updateStmt = $conn->prepare("UPDATE productos_menu SET url_imagen = ? WHERE id = ?");
        $updateStmt->execute([$url, $id]);
        $updates++;
    }
    
    echo "Successfully updated $updates products with image URLs in nuevabdpreubarestaurante.\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
