<?php
class Order {
    private $conn;
    private $table_name = "pedidos";
    private $details_table = "detalle_pedido";

    public $id;
    public $usuario_id;
    public $cliente_id;
    public $numero_mesa;
    public $tipo_pedido;
    public $estado;
    public $subtotal;
    public $descuento;
    public $base_imponible;
    public $base_cero;
    public $porcentaje_iva;
    public $monto_iva;
    public $total;
    public $order_items = [];

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        try {
            $this->conn->beginTransaction();

            // Calcular totales desde los items
            $subtotal = 0;
            $base_imponible = 0;
            $base_cero = 0;

            foreach($this->order_items as $item) {
                $precio = $item['precio_unitario'] * $item['cantidad'];
                $desc = isset($item['descuento_aplicado']) ? $item['descuento_aplicado'] : 0;
                $precio_con_desc = $precio * (1 - $desc / 100);
                $subtotal += $precio_con_desc;
                
                if(isset($item['tiene_iva']) && $item['tiene_iva']) {
                    $base_imponible += $precio_con_desc;
                } else {
                    $base_cero += $precio_con_desc;
                }
            }

            $porcentaje_iva = 15.00;
            $monto_iva = $base_imponible * ($porcentaje_iva / 100);
            $total = $subtotal + $monto_iva;
            $descuento = $this->descuento ?? 0;

            $query = "INSERT INTO " . $this->table_name . " 
                      (usuario_id, cliente_id, numero_mesa, tipo_pedido, estado, subtotal, descuento, 
                       base_imponible, base_cero, porcentaje_iva, monto_iva, total)
                      VALUES (:usuario_id, :cliente_id, :numero_mesa, :tipo_pedido, 'PENDIENTE', 
                              :subtotal, :descuento, :base_imponible, :base_cero, :porcentaje_iva, :monto_iva, :total)";
            $stmt = $this->conn->prepare($query);
            
            $tipo = $this->tipo_pedido ?? 'LOCAL';
            $stmt->bindParam(":usuario_id", $this->usuario_id);
            $stmt->bindParam(":cliente_id", $this->cliente_id);
            $stmt->bindParam(":numero_mesa", $this->numero_mesa);
            $stmt->bindParam(":tipo_pedido", $tipo);
            $stmt->bindParam(":subtotal", $subtotal);
            $stmt->bindParam(":descuento", $descuento);
            $stmt->bindParam(":base_imponible", $base_imponible);
            $stmt->bindParam(":base_cero", $base_cero);
            $stmt->bindParam(":porcentaje_iva", $porcentaje_iva);
            $stmt->bindParam(":monto_iva", $monto_iva);
            $stmt->bindParam(":total", $total);
            
            if(!$stmt->execute()) {
                throw new Exception("Error al crear el pedido.");
            }
            $this->id = $this->conn->lastInsertId();

            // Insertar detalles
            $queryDetail = "INSERT INTO " . $this->details_table . " 
                           (pedido_id, producto_id, cantidad, precio_unitario, descuento_aplicado)
                           VALUES (:pedido_id, :producto_id, :cantidad, :precio_unitario, :descuento_aplicado)";
            $stmtDetail = $this->conn->prepare($queryDetail);

            foreach($this->order_items as $item) {
                $desc_item = isset($item['descuento_aplicado']) ? $item['descuento_aplicado'] : 0;
                $stmtDetail->bindParam(":pedido_id", $this->id);
                $stmtDetail->bindParam(":producto_id", $item['producto_id']);
                $stmtDetail->bindParam(":cantidad", $item['cantidad']);
                $stmtDetail->bindParam(":precio_unitario", $item['precio_unitario']);
                $stmtDetail->bindParam(":descuento_aplicado", $desc_item);
                
                if(!$stmtDetail->execute()) {
                    throw new Exception("Error al crear detalle del pedido.");
                }
            }

            $this->conn->commit();
            $this->total = $total;
            return true;

        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function getAll($estado = null, $usuario_id = null) {
        $query = "SELECT p.*, u.nombre AS nombre_usuario, c.nombre_completo AS nombre_cliente
                  FROM " . $this->table_name . " p
                  LEFT JOIN usuarios u ON p.usuario_id = u.id
                  LEFT JOIN clientes c ON p.cliente_id = c.id
                  WHERE 1=1";
        
        if($estado) {
            $query .= " AND p.estado = :estado";
        }
        if($usuario_id) {
            $query .= " AND p.usuario_id = :usuario_id";
        }
        
        $query .= " ORDER BY p.fecha_creacion DESC";
        $stmt = $this->conn->prepare($query);
        
        if($estado) {
            $stmt->bindParam(":estado", $estado);
        }
        if($usuario_id) {
            $stmt->bindParam(":usuario_id", $usuario_id);
        }
        
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT p.*, u.nombre AS nombre_usuario, c.nombre_completo AS nombre_cliente
                  FROM " . $this->table_name . " p
                  LEFT JOIN usuarios u ON p.usuario_id = u.id
                  LEFT JOIN clientes c ON p.cliente_id = c.id
                  WHERE p.id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt;
    }

    public function getDetails($pedido_id) {
        $query = "SELECT d.*, pm.nombre AS nombre_producto, pm.tiene_iva
                  FROM " . $this->details_table . " d
                  JOIN productos_menu pm ON d.producto_id = pm.id
                  WHERE d.pedido_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$pedido_id]);
        return $stmt;
    }

    public function updateStatus($id, $estado) {
        $query = "UPDATE " . $this->table_name . " SET estado = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$estado, $id]);
    }

    public function getPending() {
        return $this->getAll('PENDIENTE');
    }

    public function getInPreparation() {
        return $this->getAll('EN_PREPARACION');
    }
}
?>
