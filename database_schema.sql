-- --------------------------------------------------------
-- Base de Datos: nuevabdpreubarestaurante
-- Versión: 2.0 (Corregida y ampliada para restaurante real)
-- --------------------------------------------------------
DROP DATABASE IF EXISTS nuevabdpreubarestaurante;
CREATE DATABASE nuevabdpreubarestaurante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nuevabdpreubarestaurante;

-- --------------------------------------------------------
-- 1. Seguridad y usuarios (con roles)
-- --------------------------------------------------------
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Cajero', 'Puede registrar pedidos y cobrar'),
('Cocina', 'Puede ver pedidos y cambiar estado a preparación/listo'),
('Mesero', 'Puede tomar pedidos en sala'),
('Cliente', 'Usuario registrado desde la web');

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    contrasena_hash CHAR(64) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- --------------------------------------------------------
-- 2. Clientes (para facturación, separado de usuarios web)
-- --------------------------------------------------------
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('RUC', 'CEDULA', 'PASAPORTE') DEFAULT 'CEDULA',
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- --------------------------------------------------------
-- 3. Gestión de inventario (ingredientes y proveedores)
-- --------------------------------------------------------
CREATE TABLE categorias_insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    ruc VARCHAR(20) UNIQUE,
    contacto_nombre VARCHAR(100),
    contacto_telefono VARCHAR(20),
    contacto_email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    unidad_medida VARCHAR(20) NOT NULL,
    stock_actual DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_insumos(id)
);

CREATE TABLE insumo_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    insumo_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    costo_referencia DECIMAL(10,2),
    dias_entrega INT DEFAULT 1,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    UNIQUE KEY (insumo_id, proveedor_id)
);

CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    usuario_id INT NOT NULL,
    numero_factura VARCHAR(50),
    fecha_compra DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    iva DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalle_compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    insumo_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id)
);

DELIMITER $$
CREATE TRIGGER trg_compra_actualizar_stock AFTER INSERT ON detalle_compras
FOR EACH ROW
BEGIN
    UPDATE insumos 
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id = NEW.insumo_id;
END$$
DELIMITER ;

-- --------------------------------------------------------
-- 4. Menú (productos terminados)
-- --------------------------------------------------------
CREATE TABLE categorias_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE productos_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(10,2) NOT NULL,
    tiene_iva BOOLEAN DEFAULT TRUE,
    url_imagen VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    tiempo_preparacion INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias_menu(id)
);

CREATE TABLE recetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    insumo_id INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos_menu(id) ON DELETE CASCADE,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id)
);

-- --------------------------------------------------------
-- 5. Descuentos
-- --------------------------------------------------------
CREATE TABLE descuentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('PRODUCTO', 'CATEGORIA', 'PEDIDO') NOT NULL,
    ref_id INT NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- --------------------------------------------------------
-- 6. Pedidos y facturación
-- --------------------------------------------------------
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    cliente_id INT,
    numero_mesa INT NULL,
    tipo_pedido ENUM('LOCAL', 'PARA_LLEVAR', 'DOMICILIO') DEFAULT 'LOCAL',
    estado ENUM('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) DEFAULT 0,
    base_imponible DECIMAL(12,2) NOT NULL DEFAULT 0,
    base_cero DECIMAL(12,2) NOT NULL DEFAULT 0,
    porcentaje_iva DECIMAL(5,2) DEFAULT 15.00,
    monto_iva DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento_aplicado DECIMAL(5,2) DEFAULT 0,
    subtotal_linea DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario * (1 - descuento_aplicado/100)) STORED,
    iva_linea DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario * (1 - descuento_aplicado/100) * 0.15) STORED,
    total_linea DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario * (1 - descuento_aplicado/100) * 1.15) STORED,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos_menu(id)
);

DELIMITER $$
CREATE TRIGGER trg_validar_stock_insumos BEFORE INSERT ON detalle_pedido
FOR EACH ROW
BEGIN
    DECLARE v_insumo_id INT;
    DECLARE v_necesario DECIMAL(10,2);
    DECLARE v_stock_actual DECIMAL(10,2);
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR 
        SELECT r.insumo_id, r.cantidad * NEW.cantidad
        FROM recetas r
        WHERE r.producto_id = NEW.producto_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_insumo_id, v_necesario;
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        SELECT i.stock_actual INTO v_stock_actual FROM insumos i WHERE i.id = v_insumo_id;
        IF v_stock_actual < v_necesario THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente de ingredientes';
        END IF;
    END LOOP;
    CLOSE cur;
END$$

CREATE TRIGGER trg_descontar_insumos AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    DECLARE v_insumo_id INT;
    DECLARE v_necesario DECIMAL(10,2);
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR 
        SELECT r.insumo_id, SUM(r.cantidad * d.cantidad)
        FROM detalle_pedido d
        JOIN recetas r ON d.producto_id = r.producto_id
        WHERE d.pedido_id = NEW.id
        GROUP BY r.insumo_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    IF OLD.estado = 'PENDIENTE' AND NEW.estado = 'EN_PREPARACION' THEN
        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO v_insumo_id, v_necesario;
            IF v_done THEN
                LEAVE read_loop;
            END IF;
            UPDATE insumos SET stock_actual = stock_actual - v_necesario WHERE id = v_insumo_id;
        END LOOP;
        CLOSE cur;
    END IF;
END$$
DELIMITER ;

-- --------------------------------------------------------
-- 7. Facturación
-- --------------------------------------------------------
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL UNIQUE,
    cliente_id INT,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) NOT NULL,
    base_imponible DECIMAL(12,2) NOT NULL,
    base_cero DECIMAL(12,2) NOT NULL,
    porcentaje_iva DECIMAL(5,2) NOT NULL,
    monto_iva DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO') DEFAULT 'EFECTIVO',
    url_pdf VARCHAR(255),
    anulada BOOLEAN DEFAULT FALSE,
    fecha_anulacion TIMESTAMP NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- 8. Auditoría
-- --------------------------------------------------------
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id INT NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    valor_anterior JSON,
    valor_nuevo JSON,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- 9. Procedimientos almacenados
-- --------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_registrar_usuario (
    IN p_rol_id INT,
    IN p_nombre VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_contrasena VARCHAR(255)
)
BEGIN
    INSERT INTO usuarios (rol_id, nombre, email, telefono, contrasena_hash)
    VALUES (p_rol_id, p_nombre, p_email, p_telefono, SHA2(p_contrasena, 256));
END$$

CREATE PROCEDURE sp_login (
    IN p_email VARCHAR(100),
    IN p_contrasena VARCHAR(255)
)
BEGIN
    SELECT u.id, u.nombre, u.email, r.nombre AS rol
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    WHERE u.email = p_email 
      AND u.contrasena_hash = SHA2(p_contrasena, 256)
      AND u.activo = 1;
END$$

DELIMITER ;

-- --------------------------------------------------------
-- Datos iniciales
-- --------------------------------------------------------
INSERT INTO categorias_menu (nombre, descripcion) VALUES 
('Pollos Asados al Carbón', 'Todos los platos incluyen papas fritas, arroz y ensalada'),
('Especialidades de la Casa', 'Platillos especiales preparados con recetas tradicionales'),
('Menú Diario', 'Opciones económicas para el día a día'),
('Bebidas y Extras', 'Gaseosas, jugos naturales y porciones adicionales');

INSERT INTO productos_menu (categoria_id, nombre, descripcion, precio_venta, tiene_iva, tiempo_preparacion) VALUES
(1, 'Pollo Entero', 'Pollo entero asado al carbón con papas fritas, arroz y ensalada', 13.50, TRUE, 30),
(1, '1/2 Pollo', 'Medio pollo asado al carbón con papas fritas, arroz y ensalada', 7.00, TRUE, 25),
(1, '1/4 de Pollo Pechuga', 'Cuarto de pollo presa pechuga con papas fritas, arroz y ensalada', 4.00, TRUE, 20),
(1, '1/4 de Pollo Pierna', 'Cuarto de pollo presa pierna con papas fritas, arroz y ensalada', 4.00, TRUE, 20),
(1, '1/8 de Pollo', 'Octavo de pollo asado al carbón con papas fritas, arroz y ensalada', 2.75, TRUE, 15),
(2, 'Costillas BBQ', 'Tiernas costillas bañadas en salsa BBQ con papas y ensalada', 6.50, TRUE, 25),
(2, 'Seco de Pollo', 'Estofado tradicional con arroz amarillo y maduro', 3.50, TRUE, 20),
(3, 'Almuerzo Ejecutivo', 'Sopa del día + Segundo a elección + Jugo', 3.00, TRUE, 15),
(3, 'Merienda', 'Opción ligera para la noche, incluye bebida', 2.50, TRUE, 15),
(4, 'Gaseosa Personal', 'Gaseosa en presentación personal', 0.75, TRUE, 2),
(4, 'Gaseosa 1.5 Litros', 'Gaseosa familiar de 1.5 litros', 2.00, TRUE, 2),
(4, 'Jugo Natural', 'Jugo natural de frutas de temporada', 1.00, TRUE, 5),
(4, 'Porción de Papas Fritas', 'Porción adicional de papas fritas crujientes', 1.50, TRUE, 10),
(4, 'Porción de Arroz', 'Porción adicional de arroz', 1.00, TRUE, 5);

INSERT INTO categorias_insumos (nombre) VALUES 
('Carnes y Pollos'), ('Verduras y Ensaladas'), ('Bebidas'), ('Acompañamientos'), ('Salsas y Condimentos');

INSERT INTO insumos (categoria_id, nombre, unidad_medida, stock_actual, stock_minimo) VALUES
(1, 'Pollo entero', 'unidad', 20, 5),
(1, 'Costillas de cerdo', 'kg', 8, 2),
(2, 'Lechuga', 'unidad', 30, 10),
(2, 'Tomate', 'kg', 5, 1),
(4, 'Papas', 'kg', 25, 5),
(4, 'Arroz', 'kg', 20, 5),
(3, 'Gaseosa personal', 'unidad', 50, 15),
(3, 'Gaseosa 1.5L', 'unidad', 20, 5),
(5, 'Salsa BBQ', 'litro', 5, 1),
(5, 'Carbón vegetal', 'kg', 30, 10);

INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES
-- Pollo Entero: 1 pollo + papas + arroz + ensalada
(1, 1, 1), (1, 5, 0.5), (1, 6, 0.3), (1, 3, 1), (1, 4, 0.1),
-- 1/2 Pollo
(2, 1, 0.5), (2, 5, 0.3), (2, 6, 0.2), (2, 3, 1),
-- 1/4 Pollo Pechuga
(3, 1, 0.25), (3, 5, 0.2), (3, 6, 0.15),
-- Costillas BBQ
(6, 2, 0.4), (6, 9, 0.05), (6, 5, 0.3),
-- Gaseosa Personal
(10, 7, 1),
-- Gaseosa 1.5L
(11, 8, 1);

INSERT INTO clientes (tipo_documento, numero_documento, nombre_completo, telefono) VALUES
('CEDULA', '1234567890', 'Juan Pérez', '0999999999');

INSERT INTO usuarios (rol_id, nombre, email, contrasena_hash) VALUES
(1, 'Admin', 'admin@lamocahua.com', SHA2('admin123', 256)),
(2, 'Cajero', 'cajero@lamocahua.com', SHA2('cajero123', 256)),
(4, 'Mesero', 'mesero@lamocahua.com', SHA2('mesero123', 256)),
(3, 'Cocina', 'cocina@lamocahua.com', SHA2('cocina123', 256));
