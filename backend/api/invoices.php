<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Invoice.php';

$database = new Database();
$db = $database->getConnection();
$invoice = new Invoice($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $stmt = $invoice->getById($_GET['id']);
            $factura = $stmt->fetch(PDO::FETCH_ASSOC);
            if($factura) {
                echo json_encode($factura);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Factura no encontrada."]);
            }
        } else {
            $stmt = $invoice->getAll();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['pedido_id'])) {
            $result = $invoice->createFromOrder(
                $data['pedido_id'],
                $data['cliente_id'] ?? null,
                $data['metodo_pago'] ?? 'EFECTIVO'
            );
            if($result) {
                http_response_code(201);
                echo json_encode(["message" => "Factura creada.", "id" => $result['id'], "numero_factura" => $result['numero_factura']]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "No se pudo crear la factura."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Se requiere pedido_id."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(isset($data['id']) && isset($data['anular']) && $data['anular']) {
            if($invoice->anular($data['id'])) {
                echo json_encode(["message" => "Factura anulada."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al anular factura."]);
            }
        }
        break;
}
?>
