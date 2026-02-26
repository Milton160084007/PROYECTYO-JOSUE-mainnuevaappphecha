<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Invoice.php';

$database = new Database();
$db = $database->getConnection();

$invoice = new Invoice($db);

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->pedido_id) &&
    !empty($data->ruc_cedula) &&
    !empty($data->nombre_cliente) &&
    !empty($data->total)
) {
    $invoice->pedido_id = $data->pedido_id;
    $invoice->ruc_cedula = $data->ruc_cedula;
    $invoice->nombre_cliente = $data->nombre_cliente;
    $invoice->direccion_cliente = isset($data->direccion_cliente) ? $data->direccion_cliente : "";
    $invoice->email_cliente = isset($data->email_cliente) ? $data->email_cliente : "";
    $invoice->total = $data->total;

    if($invoice->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Factura creada exitosamente.", "id" => $invoice->id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "No se pudo crear la factura."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos para la factura."));
}
?>
