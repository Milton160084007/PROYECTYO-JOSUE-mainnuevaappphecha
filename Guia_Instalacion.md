# Guía de Instalación y Ejecución del Proyecto

Esta guía explica paso a paso cómo abrir y ejecutar la aplicación (Frontend Angular y Backend PHP) en una computadora nueva.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en la nueva computadora:

1.  **XAMPP**: Para correr el servidor de base de datos MySQL y proveer PHP.
    *   Descárgalo de: apachefriends.org
    *   Instálalo en la ruta por defecto: `C:\xampp`
2.  **Node.js**: Para poder ejecutar el frontend de Angular.
    *   Descárgalo de: nodejs.org (Versión LTS recomendada)
    *   Al instalar, asegúrate de dejar marcada la opción que agrega Node al PATH del sistema.
3.  **Git**: Para descargar el código.
    *   Descárgalo de: git-scm.com
4.  **Angular CLI**: (Se instala después de Node.js)
    *   Abre tu consola de comandos (CMD o PowerShell) y ejecuta: `npm install -g @angular/cli`

---

## Paso 1: Descargar el Código

1.  Abre una consola o terminal en la carpeta donde desees guardar el proyecto.
2.  Clona el repositorio ejecutando:
    `git clone <URL_DEL_REPOSITORIO>`
    *(Reemplaza `<URL_DEL_REPOSITORIO>` con el link de tu proyecto en GitHub)*
3.  Entra a la carpeta del proyecto recién descargada:
    `cd PROYECTYO-JOSUE-main` *(o el nombre que tenga la carpeta principal)*

---

## Paso 2: Configurar la Base de Datos (Backend)

1.  Abre **XAMPP Control Panel**.
2.  Inicia los módulos **Apache** y **MySQL** dándole clic al botón "Start" en ambos.
3.  Abre tu navegador y ve a `http://localhost/phpmyadmin/`.
4.  Crea una nueva base de datos que se llame igual a como esté configurada en tu código (normalmente se llama la base de datos principal, revisa el archivo `backend/config/Database.php` para ver el nombre, por ejemplo, `restaurantedb`).
5.  Selecciona esa base de datos y ve a la pestaña **Importar**.
6.  Sube el archivo de configuración SQL de tu proyecto (por ejemplo `database_schema.sql` y `test_data.sql` que están en la carpeta principal) para crear todas las tablas y datos de prueba.

---

## Paso 3: Ejecutar el Backend (PHP)

Dado que la aplicación se conecta a PHP usando su servidor de desarrollo interno:

1.  Dentro de la carpeta principal del proyecto, haz doble clic en el archivo llamado **`start_backend.bat`**.
2.  Si la ruta de XAMPP es la estándar (`C:\xampp\php\php.exe`), se abrirá una ventana negra que indica: "Iniciando Servidor de Desarrollo PHP en http://localhost:8000".
3.  **IMPORTANTE:** No cierres esta ventana negra, mantenla abierta siempre que estés usando la aplicación.

---

## Paso 4: Preparar y Ejecutar el Frontend (Angular)

1.  Abre una nueva consola de comandos y ve a la ruta del proyecto. Luego, entra a la carpeta del frontend:
    `cd frontend`
2.  Instala las dependencias del proyecto utilizando Node.js ejecutando este comando:
    `npm install`
3.  Espera a que termine de descargar los paquetes (esto puede demorar un par de minutos).
4.  Una vez finalizado, ejecuta el servidor de Angular con:
    `ng serve`
5.  Verás que empieza a compilar. Cuando termine dirá algo como "Compiled successfully".

---

## Paso 5: ¡Abrir la Aplicación!

1.  Abre tu navegador web favorito (Chrome, Edge, Firefox).
2.  Ingresa a la siguiente dirección: **`http://localhost:4200`**
3.  Deberás ver la pantalla de inicio de tu aplicación funcionando correctamente y cargando los datos del backend.

---

### Solución de Problemas Comunes

*   **Pantalla en blanco o "NG0908 Zone.js"**: Asegúrate de haber ejecutado `npm install` completamente. (Este error ya fue parchado en el archivo `main.ts`).
*   **Error ERR_CONNECTION_REFUSED / Datos no cargan**: Significa que cerraste la ventana negra de PHP, o Apache/MySQL en XAMPP están apagados. Verifica que XAMPP esté corriendo y vuelve a abrir `start_backend.bat`.
*   **PHP no reconocido**: El script `start_backend.bat` asume que XAMPP está en `C:\xampp`. Si lo instalaste en otra parte en tu computadora nueva, edita el archivo `.bat` (clic derecho -> Editar) y pon la ruta correcta antes del `-S localhost:8000`.
