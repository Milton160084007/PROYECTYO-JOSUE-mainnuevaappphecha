<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

if(!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Fallo en la conexión a la base de datos."]);
    exit();
}

$user = new User($db);
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $user->email = $data->email;
    $user->password = $data->password;

    if($user->login()) {
        http_response_code(200);
        echo json_encode([
            "message" => "Inicio de sesión exitoso.",
            "id" => $user->id,
            "name" => $user->nombre,
            "role_id" => $user->rol_id,
            "role_name" => $user->rol_nombre
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Error de inicio de sesión. Verifique correo o contraseña."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Datos incompletos. Se requiere correo y contraseña."]);
}
?>
