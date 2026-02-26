<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Purchase.php';

$database = new Database();
$db = $database->getConnection();
$purchase = new Purchase($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $stmt = $purchase->getById($_GET['id']);
            $compra = $stmt->fetch(PDO::FETCH_ASSOC);
            if($compra) {
                $stmtDet = $purchase->getDetails($_GET['id']);
                $detalles = [];
                while($row = $stmtDet->fetch(PDO::FETCH_ASSOC)) { $detalles[] = $row; }
                $compra['detalles'] = $detalles;
                echo json_encode($compra);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Compra no encontrada."]);
            }
        } else {
            $stmt = $purchase->getAll();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $purchase->create($data);
        if($id) {
            http_response_code(201);
            echo json_encode(["message" => "Compra registrada.", "id" => $id]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al registrar compra."]);
        }
        break;
}
?>
