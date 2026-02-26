<?php
class Inventory {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT i.*, ci.nombre AS nombre_categoria
                  FROM insumos i
                  LEFT JOIN categorias_insumos ci ON i.categoria_id = ci.id
                  WHERE i.activo = 1
                  ORDER BY ci.nombre, i.nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getLowStock() {
        $query = "SELECT i.*, ci.nombre AS nombre_categoria
                  FROM insumos i
                  LEFT JOIN categorias_insumos ci ON i.categoria_id = ci.id
                  WHERE i.activo = 1 AND i.stock_actual <= i.stock_minimo
                  ORDER BY (i.stock_actual / NULLIF(i.stock_minimo, 0)) ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT i.*, ci.nombre AS nombre_categoria
                  FROM insumos i
                  LEFT JOIN categorias_insumos ci ON i.categoria_id = ci.id
                  WHERE i.id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt;
    }

    public function create($data) {
        $query = "INSERT INTO insumos (categoria_id, nombre, descripcion, unidad_medida, stock_actual, stock_minimo)
                  VALUES (:categoria_id, :nombre, :descripcion, :unidad_medida, :stock_actual, :stock_minimo)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":categoria_id", $data['categoria_id']);
        $stmt->bindParam(":nombre", $data['nombre']);
        $desc = $data['descripcion'] ?? '';
        $stmt->bindParam(":descripcion", $desc);
        $stmt->bindParam(":unidad_medida", $data['unidad_medida']);
        $stock = $data['stock_actual'] ?? 0;
        $min = $data['stock_minimo'] ?? 0;
        $stmt->bindParam(":stock_actual", $stock);
        $stmt->bindParam(":stock_minimo", $min);
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function update($data) {
        $query = "UPDATE insumos SET categoria_id=:categoria_id, nombre=:nombre, descripcion=:descripcion,
                  unidad_medida=:unidad_medida, stock_minimo=:stock_minimo
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":categoria_id", $data['categoria_id']);
        $stmt->bindParam(":nombre", $data['nombre']);
        $stmt->bindParam(":descripcion", $data['descripcion']);
        $stmt->bindParam(":unidad_medida", $data['unidad_medida']);
        $stmt->bindParam(":stock_minimo", $data['stock_minimo']);
        $stmt->bindParam(":id", $data['id']);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "UPDATE insumos SET activo = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getCategories() {
        $query = "SELECT * FROM categorias_insumos ORDER BY nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function createCategory($nombre, $descripcion = '') {
        $query = "INSERT INTO categorias_insumos (nombre, descripcion) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$nombre, $descripcion]);
    }
}
?>
