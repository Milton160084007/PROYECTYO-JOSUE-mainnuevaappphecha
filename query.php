<?php
$conn = new PDO('mysql:host=localhost;dbname=lamocahua_db', 'root', '');
$stmt = $conn->query('SELECT id, nombre, url_imagen FROM productos_menu');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
