<?php
class Client {
    private $conn;
    private $table_name = "clientes";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1 ORDER BY nombre_completo";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt;
    }

    public function search($term) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE activo = 1 AND (nombre_completo LIKE ? OR numero_documento LIKE ?)
                  ORDER BY nombre_completo LIMIT 20";
        $stmt = $this->conn->prepare($query);
        $like = "%$term%";
        $stmt->execute([$like, $like]);
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (tipo_documento, numero_documento, nombre_completo, direccion, telefono, email)
                  VALUES (:tipo_documento, :numero_documento, :nombre_completo, :direccion, :telefono, :email)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":tipo_documento", $data['tipo_documento']);
        $stmt->bindParam(":numero_documento", $data['numero_documento']);
        $stmt->bindParam(":nombre_completo", $data['nombre_completo']);
        $dir = $data['direccion'] ?? '';
        $tel = $data['telefono'] ?? '';
        $email = $data['email'] ?? '';
        $stmt->bindParam(":direccion", $dir);
        $stmt->bindParam(":telefono", $tel);
        $stmt->bindParam(":email", $email);
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function update($data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET tipo_documento=:tipo_documento, numero_documento=:numero_documento, 
                      nombre_completo=:nombre_completo, direccion=:direccion, telefono=:telefono, email=:email
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":tipo_documento", $data['tipo_documento']);
        $stmt->bindParam(":numero_documento", $data['numero_documento']);
        $stmt->bindParam(":nombre_completo", $data['nombre_completo']);
        $stmt->bindParam(":direccion", $data['direccion']);
        $stmt->bindParam(":telefono", $data['telefono']);
        $stmt->bindParam(":email", $data['email']);
        $stmt->bindParam(":id", $data['id']);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "UPDATE " . $this->table_name . " SET activo = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>
