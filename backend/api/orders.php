<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Order.php';

$database = new Database();
$db = $database->getConnection();
$order = new Order($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $stmt = $order->getById($_GET['id']);
            $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
            if($pedido) {
                $stmtDet = $order->getDetails($_GET['id']);
                $detalles = [];
                while($row = $stmtDet->fetch(PDO::FETCH_ASSOC)) { $detalles[] = $row; }
                $pedido['detalles'] = $detalles;
                echo json_encode($pedido);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Pedido no encontrado."]);
            }
        } else {
            $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
            $usuario_id = isset($_GET['usuario_id']) ? $_GET['usuario_id'] : null;
            $stmt = $order->getAll($estado, $usuario_id);
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['items_pedido'])) {
            $order->usuario_id = $data['usuario_id'] ?? null;
            $order->cliente_id = $data['cliente_id'] ?? null;
            $order->numero_mesa = $data['numero_mesa'] ?? null;
            $order->tipo_pedido = $data['tipo_pedido'] ?? 'LOCAL';
            $order->descuento = $data['descuento'] ?? 0;
            $order->order_items = $data['items_pedido'];
            if($order->create()) {
                http_response_code(201);
                echo json_encode(["message" => "Pedido creado.", "id" => $order->id, "total" => $order->total]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "No se pudo crear el pedido. ¿Stock insuficiente?"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['id']) && !empty($data['estado'])) {
            if($order->updateStatus($data['id'], $data['estado'])) {
                echo json_encode(["message" => "Estado actualizado."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al actualizar estado."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Se requiere id y estado."]);
        }
        break;
}
?>
