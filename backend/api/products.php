<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['categories'])) {
            $stmt = $product->getAllCategories();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        } else {
            $all = isset($_GET['all']) && $_GET['all'] == '1';
            $stmt = $all ? $product->readAll() : $product->read();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            http_response_code(200);
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if(isset($data->action) && $data->action === 'create_category') {
            if($product->createCategory($data->nombre, $data->descripcion ?? '')) {
                http_response_code(201);
                echo json_encode(["message" => "Categoría creada."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al crear categoría."]);
            }
        } else {
            $product->categoria_id = $data->categoria_id;
            $product->nombre = $data->nombre;
            $product->descripcion = $data->descripcion ?? '';
            $product->precio_venta = $data->precio_venta;
            $product->tiene_iva = $data->tiene_iva ?? 1;
            $product->url_imagen = $data->url_imagen ?? '';
            $product->tiempo_preparacion = $data->tiempo_preparacion ?? null;
            if($product->create()) {
                http_response_code(201);
                echo json_encode(["message" => "Producto creado.", "id" => $product->id]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Error al crear producto."]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $product->id = $data->id;
        $product->categoria_id = $data->categoria_id;
        $product->nombre = $data->nombre;
        $product->descripcion = $data->descripcion ?? '';
        $product->precio_venta = $data->precio_venta;
        $product->tiene_iva = $data->tiene_iva ?? 1;
        $product->url_imagen = $data->url_imagen ?? '';
        $product->tiempo_preparacion = $data->tiempo_preparacion ?? null;
        $product->activo = $data->activo ?? 1;
        if($product->update()) {
            echo json_encode(["message" => "Producto actualizado."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al actualizar producto."]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if($id && $product->delete($id)) {
            echo json_encode(["message" => "Producto eliminado."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Error al eliminar producto."]);
        }
        break;
}
?>
