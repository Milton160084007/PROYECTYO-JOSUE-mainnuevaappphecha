<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Inventory.php';

$database = new Database();
$db = $database->getConnection();
$inventory = new Inventory($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['categories'])) {
            $stmt = $inventory->getCategories();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        } elseif(isset($_GET['low_stock'])) {
            $stmt = $inventory->getLowStock();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        } elseif(isset($_GET['id'])) {
            $stmt = $inventory->getById($_GET['id']);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $inventory->getAll();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(isset($data['action']) && $data['action'] === 'create_category') {
            if($inventory->createCategory($data['nombre'], $data['descripcion'] ?? '')) {
                http_response_code(201);
                echo json_encode(["message" => "Categoría creada."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al crear categoría."]);
            }
        } else {
            $id = $inventory->create($data);
            if($id) {
                http_response_code(201);
                echo json_encode(["message" => "Insumo creado.", "id" => $id]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al crear insumo."]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if($inventory->update($data)) {
            echo json_encode(["message" => "Insumo actualizado."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al actualizar."]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if($id && $inventory->delete($id)) {
            echo json_encode(["message" => "Insumo eliminado."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Error al eliminar."]);
        }
        break;
}
?>
