<?php
class Invoice {
    private $conn;
    private $table_name = "facturas";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        // Generar número de factura único
        $numero = $this->generarNumeroFactura();
        
        $query = "INSERT INTO " . $this->table_name . " 
                  (pedido_id, cliente_id, numero_factura, subtotal, descuento, 
                   base_imponible, base_cero, porcentaje_iva, monto_iva, total, metodo_pago)
                  VALUES (:pedido_id, :cliente_id, :numero_factura, :subtotal, :descuento,
                          :base_imponible, :base_cero, :porcentaje_iva, :monto_iva, :total, :metodo_pago)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":pedido_id", $data['pedido_id']);
        $stmt->bindParam(":cliente_id", $data['cliente_id']);
        $stmt->bindParam(":numero_factura", $numero);
        $stmt->bindParam(":subtotal", $data['subtotal']);
        $stmt->bindParam(":descuento", $data['descuento']);
        $stmt->bindParam(":base_imponible", $data['base_imponible']);
        $stmt->bindParam(":base_cero", $data['base_cero']);
        $stmt->bindParam(":porcentaje_iva", $data['porcentaje_iva']);
        $stmt->bindParam(":monto_iva", $data['monto_iva']);
        $stmt->bindParam(":total", $data['total']);
        $metodo = $data['metodo_pago'] ?? 'EFECTIVO';
        $stmt->bindParam(":metodo_pago", $metodo);

        if($stmt->execute()) {
            return [
                'id' => $this->conn->lastInsertId(),
                'numero_factura' => $numero
            ];
        }
        return false;
    }

    public function getAll() {
        $query = "SELECT f.*, c.nombre_completo AS nombre_cliente, c.numero_documento
                  FROM " . $this->table_name . " f
                  LEFT JOIN clientes c ON f.cliente_id = c.id
                  ORDER BY f.fecha_emision DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT f.*, c.nombre_completo AS nombre_cliente, c.numero_documento, c.direccion, c.email AS email_cliente
                  FROM " . $this->table_name . " f
                  LEFT JOIN clientes c ON f.cliente_id = c.id
                  WHERE f.id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt;
    }

    public function anular($id) {
        $query = "UPDATE " . $this->table_name . " SET anulada = 1, fecha_anulacion = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function createFromOrder($pedido_id, $cliente_id, $metodo_pago) {
        // Obtener datos del pedido
        $query = "SELECT * FROM pedidos WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$pedido_id]);
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if(!$pedido) return false;

        $data = [
            'pedido_id' => $pedido_id,
            'cliente_id' => $cliente_id,
            'subtotal' => $pedido['subtotal'],
            'descuento' => $pedido['descuento'],
            'base_imponible' => $pedido['base_imponible'],
            'base_cero' => $pedido['base_cero'],
            'porcentaje_iva' => $pedido['porcentaje_iva'],
            'monto_iva' => $pedido['monto_iva'],
            'total' => $pedido['total'],
            'metodo_pago' => $metodo_pago
        ];

        return $this->create($data);
    }

    private function generarNumeroFactura() {
        $prefix = 'F-' . date('Ymd') . '-';
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE numero_factura LIKE ?";
        $stmt = $this->conn->prepare($query);
        $like = $prefix . '%';
        $stmt->execute([$like]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $num = ($row['total'] ?? 0) + 1;
        return $prefix . str_pad($num, 4, '0', STR_PAD_LEFT);
    }
}
?>
