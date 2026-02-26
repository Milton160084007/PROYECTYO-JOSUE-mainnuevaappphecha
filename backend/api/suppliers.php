<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Supplier.php';

$database = new Database();
$db = $database->getConnection();
$supplier = new Supplier($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $stmt = $supplier->getById($_GET['id']);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $supplier->getAll();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $supplier->create($data);
        if($id) {
            http_response_code(201);
            echo json_encode(["message" => "Proveedor creado.", "id" => $id]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al crear proveedor."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if($supplier->update($data)) {
            echo json_encode(["message" => "Proveedor actualizado."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al actualizar."]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if($id && $supplier->delete($id)) {
            echo json_encode(["message" => "Proveedor eliminado."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Error al eliminar."]);
        }
        break;
}
?>
