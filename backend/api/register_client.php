<?php
include_once 'cors_headers.php';
include_once '../config/Database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if (empty($data->nombre) || empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos. Se requiere nombre, email y contraseña."]);
        exit();
    }
    
    // Check if email already exists
    $query = "SELECT id FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["message" => "El correo electrónico ya está registrado."]);
        exit();
    }
    
    // Assign data to user model
    $user->rol_id = 5; // 5 is the 'Cliente' role from the database schema
    $user->nombre = $data->nombre;
    $user->email = $data->email;
    $user->telefono = $data->telefono ?? '';
    $user->password = $data->password;
    
    if($user->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Registro exitoso.", "status" => true]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Error al crear la cuenta. Inténtelo más tarde.", "status" => false]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Método no permitido"]);
}
?>
