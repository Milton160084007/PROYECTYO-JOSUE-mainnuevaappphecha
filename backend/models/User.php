<?php
class User {
    private $conn;
    private $table_name = "usuarios";

    public $id;
    public $nombre;
    public $email;
    public $password;
    public $rol_id;
    public $rol_nombre;
    public $telefono;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login() {
        $query = "SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol_nombre, u.contrasena_hash
                  FROM " . $this->table_name . " u
                  JOIN roles r ON u.rol_id = r.id
                  WHERE u.email = :email 
                    AND u.activo = 1
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $email = trim($this->email);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $hash = hash('sha256', $this->password);
            
            if($hash === $row['contrasena_hash']) {
                $this->id = $row['id'];
                $this->nombre = $row['nombre'];
                $this->rol_id = $row['rol_id'];
                $this->rol_nombre = $row['rol_nombre'];
                
                // Actualizar último acceso
                $update = $this->conn->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?");
                $update->execute([$this->id]);
                
                return true;
            }
        }
        return false;
    }

    public function getAll() {
        $query = "SELECT u.id, u.nombre, u.email, u.telefono, u.rol_id, r.nombre AS rol_nombre, u.activo, u.fecha_registro
                  FROM " . $this->table_name . " u
                  JOIN roles r ON u.rol_id = r.id
                  ORDER BY u.fecha_registro DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT u.id, u.nombre, u.email, u.telefono, u.rol_id, r.nombre AS rol_nombre, u.activo
                  FROM " . $this->table_name . " u
                  JOIN roles r ON u.rol_id = r.id
                  WHERE u.id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (rol_id, nombre, email, telefono, contrasena_hash)
                  VALUES (:rol_id, :nombre, :email, :telefono, SHA2(:password, 256))";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":rol_id", $this->rol_id);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":password", $this->password);
        return $stmt->execute();
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET rol_id=:rol_id, nombre=:nombre, email=:email, telefono=:telefono, activo=:activo
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":rol_id", $this->rol_id);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":telefono", $this->telefono);
        $activo = $this->activo ?? 1;
        $stmt->bindParam(":activo", $activo);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "UPDATE " . $this->table_name . " SET activo = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getRoles() {
        $query = "SELECT id, nombre, descripcion FROM roles WHERE activo = 1 ORDER BY id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>
