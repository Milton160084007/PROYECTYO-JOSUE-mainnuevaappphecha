<?php
class Supplier {
    private $conn;
    private $table_name = "proveedores";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE activo = 1 ORDER BY nombre_empresa";
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

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (nombre_empresa, ruc, contacto_nombre, contacto_telefono, contacto_email, direccion)
                  VALUES (:nombre_empresa, :ruc, :contacto_nombre, :contacto_telefono, :contacto_email, :direccion)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombre_empresa", $data['nombre_empresa']);
        $ruc = $data['ruc'] ?? null;
        $stmt->bindParam(":ruc", $ruc);
        $stmt->bindParam(":contacto_nombre", $data['contacto_nombre']);
        $stmt->bindParam(":contacto_telefono", $data['contacto_telefono']);
        $stmt->bindParam(":contacto_email", $data['contacto_email']);
        $dir = $data['direccion'] ?? '';
        $stmt->bindParam(":direccion", $dir);
        if($stmt->execute()) return $this->conn->lastInsertId();
        return false;
    }

    public function update($data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET nombre_empresa=:nombre_empresa, ruc=:ruc, contacto_nombre=:contacto_nombre,
                      contacto_telefono=:contacto_telefono, contacto_email=:contacto_email, direccion=:direccion
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombre_empresa", $data['nombre_empresa']);
        $stmt->bindParam(":ruc", $data['ruc']);
        $stmt->bindParam(":contacto_nombre", $data['contacto_nombre']);
        $stmt->bindParam(":contacto_telefono", $data['contacto_telefono']);
        $stmt->bindParam(":contacto_email", $data['contacto_email']);
        $stmt->bindParam(":direccion", $data['direccion']);
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
