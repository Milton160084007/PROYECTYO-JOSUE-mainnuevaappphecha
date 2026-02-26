<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Order.php';

$database = new Database();
$db = $database->getConnection();

$order = new Order($db);

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->usuario_id) &&
    !empty($data->total) &&
    !empty($data->items_pedido)
) {
    $order->usuario_id = $data->usuario_id;
    $order->numero_mesa = isset($data->numero_mesa) ? $data->numero_mesa : null; // Null para pedidos en línea
    $order->total = $data->total;
    $order->order_items = $data->items_pedido; // Se espera un arreglo de objetos

    if($order->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Pedido creado exitosamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "No se pudo crear el pedido."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "No se pudo crear el pedido. Datos incompletos."));
}
?>
