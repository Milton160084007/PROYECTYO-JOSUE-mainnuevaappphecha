<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'nuevabdpreubarestaurante';
    private $username = 'root';
    private $password = '';
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch(PDOException $exception) {
            echo json_encode(["message" => "Error de conexión: " . $exception->getMessage()]);
        }
        return $this->conn;
    }
}
?>
