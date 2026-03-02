<?php
class Product {
    private $conn;
    private $table_name = "productos_menu";

    public $id;
    public $categoria_id;
    public $nombre;
    public $descripcion;
    public $precio_venta;
    public $tiene_iva;
    public $url_imagen;
    public $activo;
    public $tiempo_preparacion;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT c.nombre as nombre_categoria, p.id, p.nombre, p.descripcion, 
                         p.precio_venta, p.categoria_id, p.url_imagen, p.activo, 
                         p.tiene_iva, p.tiempo_preparacion
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categorias_menu c ON p.categoria_id = c.id 
                  WHERE p.activo = 1
                  ORDER BY c.nombre, p.nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readAll() {
        $query = "SELECT c.nombre as nombre_categoria, p.id, p.nombre, p.descripcion, 
                         p.precio_venta, p.categoria_id, p.url_imagen, p.activo, 
                         p.tiene_iva, p.tiempo_preparacion
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categorias_menu c ON p.categoria_id = c.id 
                  WHERE p.activo = 1
                  ORDER BY c.nombre, p.nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (categoria_id, nombre, descripcion, precio_venta, tiene_iva, url_imagen, tiempo_preparacion)
                  VALUES (:categoria_id, :nombre, :descripcion, :precio_venta, :tiene_iva, :url_imagen, :tiempo_preparacion)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":categoria_id", $this->categoria_id);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":precio_venta", $this->precio_venta);
        $stmt->bindParam(":tiene_iva", $this->tiene_iva);
        $stmt->bindParam(":url_imagen", $this->url_imagen);
        $stmt->bindParam(":tiempo_preparacion", $this->tiempo_preparacion);
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET categoria_id=:categoria_id, nombre=:nombre, descripcion=:descripcion, 
                      precio_venta=:precio_venta, tiene_iva=:tiene_iva, url_imagen=:url_imagen, 
                      tiempo_preparacion=:tiempo_preparacion, activo=:activo
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":categoria_id", $this->categoria_id);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":precio_venta", $this->precio_venta);
        $stmt->bindParam(":tiene_iva", $this->tiene_iva);
        $stmt->bindParam(":url_imagen", $this->url_imagen);
        $stmt->bindParam(":tiempo_preparacion", $this->tiempo_preparacion);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "UPDATE " . $this->table_name . " SET activo = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getCategories() {
        $query = "SELECT id, nombre, descripcion FROM categorias_menu WHERE activo = 1 ORDER BY nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getAllCategories() {
        $query = "SELECT id, nombre, descripcion, activo FROM categorias_menu ORDER BY nombre";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function createCategory($nombre, $descripcion) {
        $query = "INSERT INTO categorias_menu (nombre, descripcion) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$nombre, $descripcion]);
    }

    public function updateCategory($id, $nombre, $descripcion) {
        $query = "UPDATE categorias_menu SET nombre = ?, descripcion = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$nombre, $descripcion, $id]);
    }

    public function deleteCategory($id) {
        $query = "UPDATE categorias_menu SET activo = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getRecipe($producto_id) {
        $query = "SELECT r.insumo_id, r.cantidad, i.nombre as nombre_insumo, i.unidad_medida 
                  FROM recetas r
                  JOIN insumos i ON r.insumo_id = i.id
                  WHERE r.producto_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$producto_id]);
        return $stmt;
    }

    public function saveRecipe($producto_id, $receta_items) {
        try {
            $this->conn->beginTransaction();

            $queryDelete = "DELETE FROM recetas WHERE producto_id = ?";
            $stmtDelete = $this->conn->prepare($queryDelete);
            $stmtDelete->execute([$producto_id]);

            if (!empty($receta_items)) {
                $queryInsert = "INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES (?, ?, ?)";
                $stmtInsert = $this->conn->prepare($queryInsert);

                foreach($receta_items as $item) {
                    $insumo_id = is_object($item) ? $item->insumo_id : $item['insumo_id'];
                    $cantidad = is_object($item) ? $item->cantidad : $item['cantidad'];
                    $stmtInsert->execute([$producto_id, $insumo_id, $cantidad]);
                }
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}
?>
