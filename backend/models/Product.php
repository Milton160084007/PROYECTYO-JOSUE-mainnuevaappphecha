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
}
?>
