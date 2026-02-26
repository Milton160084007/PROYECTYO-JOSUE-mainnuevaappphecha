<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['roles'])) {
            $stmt = $user->getRoles();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        } elseif(isset($_GET['id'])) {
            $stmt = $user->getById($_GET['id']);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $user->getAll();
            $items = [];
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) { $items[] = $row; }
            echo json_encode(["records" => $items]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $user->rol_id = $data->rol_id;
        $user->nombre = $data->nombre;
        $user->email = $data->email;
        $user->telefono = $data->telefono ?? '';
        $user->password = $data->password;
        if($user->create()) {
            http_response_code(201);
            echo json_encode(["message" => "Usuario creado."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al crear usuario."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $user->id = $data->id;
        $user->rol_id = $data->rol_id;
        $user->nombre = $data->nombre;
        $user->email = $data->email;
        $user->telefono = $data->telefono ?? '';
        $user->activo = $data->activo ?? 1;
        if($user->update()) {
            echo json_encode(["message" => "Usuario actualizado."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Error al actualizar."]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if($id && $user->delete($id)) {
            echo json_encode(["message" => "Usuario desactivado."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Error."]);
        }
        break;
}
?>
