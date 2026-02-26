<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Client.php';

$database = new Database();
$db = $database->getConnection();
$client = new Client($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $stmt = $client->getById($_GET['id']);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($data ?: ["message" => "No encontrado."]);
        } elseif(isset($_GET['search'])) {
            $stmt = $client->search($_GET['search']);
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        } else {
            $stmt = $client->getAll();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $client->create($data);
        if($id) {
            http_response_code(201);
            echo json_encode(["message" => "Cliente creado.", "id" => $id]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al crear cliente."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if($client->update($data)) {
            echo json_encode(["message" => "Cliente actualizado."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al actualizar."]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if($id && $client->delete($id)) {
            echo json_encode(["message" => "Cliente eliminado."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Error al eliminar."]);
        }
        break;
}
?>
