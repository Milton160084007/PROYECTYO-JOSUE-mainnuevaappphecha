<?php
class Purchase {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        try {
            $this->conn->beginTransaction();

            $query = "INSERT INTO compras (proveedor_id, usuario_id, numero_factura, fecha_compra, subtotal, iva, total, observaciones)
                      VALUES (:proveedor_id, :usuario_id, :numero_factura, :fecha_compra, :subtotal, :iva, :total, :observaciones)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":proveedor_id", $data['proveedor_id']);
            $stmt->bindParam(":usuario_id", $data['usuario_id']);
            $nf = $data['numero_factura'] ?? '';
            $stmt->bindParam(":numero_factura", $nf);
            $stmt->bindParam(":fecha_compra", $data['fecha_compra']);
            $stmt->bindParam(":subtotal", $data['subtotal']);
            $stmt->bindParam(":iva", $data['iva']);
            $stmt->bindParam(":total", $data['total']);
            $obs = $data['observaciones'] ?? '';
            $stmt->bindParam(":observaciones", $obs);
            
            if(!$stmt->execute()) {
                throw new Exception("Error al crear la compra.");
            }
            $compra_id = $this->conn->lastInsertId();

            // Insertar detalles (el trigger actualiza el stock automáticamente)
            $queryDetail = "INSERT INTO detalle_compras (compra_id, insumo_id, cantidad, costo_unitario)
                           VALUES (:compra_id, :insumo_id, :cantidad, :costo_unitario)";
            $stmtDetail = $this->conn->prepare($queryDetail);

            foreach($data['detalles'] as $item) {
                $stmtDetail->bindParam(":compra_id", $compra_id);
                $stmtDetail->bindParam(":insumo_id", $item['insumo_id']);
                $stmtDetail->bindParam(":cantidad", $item['cantidad']);
                $stmtDetail->bindParam(":costo_unitario", $item['costo_unitario']);
                if(!$stmtDetail->execute()) {
                    throw new Exception("Error al crear detalle de compra.");
                }
            }

            $this->conn->commit();
            return $compra_id;

        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function getAll() {
        $query = "SELECT c.*, p.nombre_empresa AS nombre_proveedor, u.nombre AS nombre_usuario
                  FROM compras c
                  JOIN proveedores p ON c.proveedor_id = p.id
                  JOIN usuarios u ON c.usuario_id = u.id
                  ORDER BY c.fecha_registro DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT c.*, p.nombre_empresa AS nombre_proveedor, u.nombre AS nombre_usuario
                  FROM compras c
                  JOIN proveedores p ON c.proveedor_id = p.id
                  JOIN usuarios u ON c.usuario_id = u.id
                  WHERE c.id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt;
    }

    public function getDetails($compra_id) {
        $query = "SELECT dc.*, i.nombre AS nombre_insumo, i.unidad_medida
                  FROM detalle_compras dc
                  JOIN insumos i ON dc.insumo_id = i.id
                  WHERE dc.compra_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$compra_id]);
        return $stmt;
    }
}
?>
