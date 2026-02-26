-- ============================================================
-- Datos de Prueba: Asadero La Mocahua
-- La Tradición del buen sabor
-- ============================================================

-- Usuarios de Prueba (Contraseña para todos: admin123)
INSERT INTO usuarios (rol_id, nombre, email, contrasena_hash) VALUES
(1, 'Admin Principal', 'admin@lamocahua.com', SHA2('admin123', 256)),
(4, 'Juan Mesero', 'mesero@lamocahua.com', SHA2('admin123', 256)),
(3, 'Maria Cocina', 'cocina@lamocahua.com', SHA2('admin123', 256)),
(5, 'Cliente Demo', 'cliente@example.com', SHA2('admin123', 256));

-- Categorías del Menú La Mocahua
INSERT INTO categorias_menu (nombre, descripcion) VALUES
('Pollos Asados al Carbón', 'Todos los platos incluyen papas fritas, arroz y ensalada'),
('Especialidades de la Casa', 'Platillos especiales preparados con recetas tradicionales'),
('Menú Diario', 'Opciones económicas para el día a día'),
('Bebidas y Extras', 'Gaseosas, jugos naturales y porciones adicionales');

-- Productos del Menú La Mocahua
INSERT INTO productos_menu (categoria_id, nombre, descripcion, precio_venta, tiene_iva, tiempo_preparacion, url_imagen) VALUES
-- Pollos Asados al Carbón
(1, 'Pollo Entero', 'Pollo entero asado al carbón, acompañado de papas fritas, arroz y ensalada fresca', 13.50, TRUE, 30, ''),
(1, '1/2 Pollo', 'Medio pollo asado al carbón con papas fritas, arroz y ensalada', 7.00, TRUE, 25, ''),
(1, '1/4 de Pollo Pechuga', 'Cuarto de pollo (presa pechuga) asado al carbón con papas fritas, arroz y ensalada', 4.00, TRUE, 20, ''),
(1, '1/4 de Pollo Pierna', 'Cuarto de pollo (presa pierna) asado al carbón con papas fritas, arroz y ensalada', 4.00, TRUE, 20, ''),
(1, '1/8 de Pollo', 'Octavo de pollo asado al carbón con papas fritas, arroz y ensalada', 2.75, TRUE, 15, ''),
-- Especialidades de la Casa
(2, 'Costillas BBQ', 'Tiernas costillas bañadas en salsa BBQ, acompañadas de papas fritas y ensalada', 6.50, TRUE, 25, ''),
(2, 'Seco de Pollo', 'Estofado tradicional ecuatoriano con arroz amarillo y maduro', 3.50, TRUE, 20, ''),
-- Menú Diario
(3, 'Almuerzo Ejecutivo', 'Sopa del día + Segundo a elección + Jugo natural', 3.00, TRUE, 15, ''),
(3, 'Merienda', 'Opción ligera para la noche, incluye bebida', 2.50, TRUE, 15, ''),
-- Bebidas y Extras
(4, 'Gaseosa Personal', 'Gaseosa en presentación personal', 0.75, TRUE, 2, ''),
(4, 'Gaseosa 1.5 Litros', 'Gaseosa familiar de 1.5 litros', 2.00, TRUE, 2, ''),
(4, 'Jugo Natural', 'Jugo natural de frutas de temporada', 1.00, TRUE, 5, ''),
(4, 'Porción de Papas Fritas', 'Porción adicional de papas fritas crujientes', 1.50, TRUE, 10, ''),
(4, 'Porción de Arroz', 'Porción adicional de arroz', 1.00, TRUE, 5, '');
