// --- PRODUCTOS INICIALES CON IMÁGENES DE MUESTRA ---
const productosIniciales = [
    { id: 1, nombre: "Hamburguesa", precio: 15000, disponible: true, imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300" },
    { id: 2, nombre: "Perro Caliente", precio: 12000, disponible: true, imagen: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=300" },
    { id: 3, nombre: "Papas Fritas", precio: 6000, disponible: true, imagen: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300" },
    { id: 4, nombre: "Gaseosa", precio: 4000, disponible: true, imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300" }
];

// Estado global en memoria y lectura de localStorage
let productos = JSON.parse(localStorage.getItem("inventario")) || productosIniciales;
let pedidoActual = [];
let historialFacturas = JSON.parse(localStorage.getItem("historialFacturas")) || [];

// --- AL CARGAR LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    cargarMenu();
    actualizarVistaPedido();
    cargarHistorial();
});

// 1. CARGAR EL MENÚ DE PRODUCTOS (CON IMÁGENES)
function cargarMenu() {
    const contenedor = document.getElementById("grid-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    productos.forEach(prod => {
        if (prod.disponible) {
            const card = document.createElement("div");
            card.className = "tarjeta-producto";
            card.onclick = () => agregarAlPedido(prod);

            // Imagen por defecto si no ingresan enlace
            const urlImagen = prod.imagen && prod.imagen.trim() !== "" 
                ? prod.imagen 
                : "https://via.placeholder.com/150?text=Comida";

            card.innerHTML = `
                <img src="${urlImagen}" alt="${prod.nombre}">
                <div class="info-producto">
                    <strong>${prod.nombre}</strong>
                    <span>$${prod.precio.toLocaleString()}</span>
                </div>
            `;
            contenedor.appendChild(card);
        }
    });
}

// 2. AGREGAR PRODUCTO AL PEDIDO
function agregarAlPedido(producto) {
    const existe = pedidoActual.find(item => item.id === producto.id);
    if (existe) {
        existe.cantidad += 1;
    } else {
        pedidoActual.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    actualizarVistaPedido();
}

// 3. MOSTRAR TABLA DE PEDIDO ACTUAL Y TOTAL
function actualizarVistaPedido() {
    const tbody = document.getElementById("lista-pedido");
    const totalSpan = document.getElementById("total-pedido");
    if (!tbody || !totalSpan) return;

    tbody.innerHTML = "";
    let total = 0;

    pedidoActual.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${subtotal.toLocaleString()}</td>
            <td>
                <button class="btn-quitar" onclick="quitarDelPedido(${index})">X</button>
            </td>
        `;
        tbody.appendChild(fila);
    });

    totalSpan.textContent = total.toLocaleString();
}

function quitarDelPedido(index) {
    pedidoActual.splice(index, 1);
    actualizarVistaPedido();
}

// 4. COBRAR Y GENERAR FACTURA
function finalizarVenta() {
    if (pedidoActual.length === 0) {
        alert("El pedido está vacío.");
        return;
    }

    const metodoPago = document.getElementById("metodo-pago").value;
    const totalVenta = pedidoActual.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    const nuevaFactura = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        metodoPago: metodoPago,
        total: totalVenta,
        detalles: [...pedidoActual]
    };

    historialFacturas.push(nuevaFactura);
    localStorage.setItem("historialFacturas", JSON.stringify(historialFacturas));

    // Reiniciar pedido y refrescar vista
    pedidoActual = [];
    actualizarVistaPedido();
    cargarHistorial();

    alert("¡Venta registrada con éxito!");
}

// 5. CARGAR HISTORIAL DE FACTURAS EN LA TABLA
function cargarHistorial() {
    const tabla = document.getElementById("tabla-facturas");
    if (!tabla) return;

    tabla.innerHTML = "";

    if (historialFacturas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay facturas registradas.</td></tr>`;
        return;
    }

    historialFacturas.forEach((factura, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>#${factura.id.toString().slice(-4)}</td>
            <td>${factura.fecha}</td>
            <td>${factura.metodoPago}</td>
            <td>$${factura.total.toLocaleString()}</td>
        `;
        tabla.appendChild(fila);
    });
}

// 6. FUNCIÓN CORREGIDA: BORRAR FACTURAS
function borrarFacturas() {
    if (historialFacturas.length === 0) {
        alert("No hay facturas para borrar.");
        return;
    }

    const confirmar = confirm("¿Estás seguro de que deseas borrar TODAS las facturas del historial?");
    
    if (confirmar) {
        // Vaciar el arreglo en JavaScript
        historialFacturas = [];

        // Vaciar la clave del almacenamiento local
        localStorage.removeItem("historialFacturas");

        // Volver a renderizar la tabla para mostrarla vacía
        cargarHistorial();

        alert("Se ha borrado el historial de facturas.");
    }
}

// 7. CREAR NUEVO PRODUCTO (CON URL DE IMAGEN)
function crearProducto(event) {
    event.preventDefault();

    const nombreInput = document.getElementById("nombre");
    const precioInput = document.getElementById("precio");
    const imagenInput = document.getElementById("imagen");

    const nuevoProducto = {
        id: Date.now(),
        nombre: nombreInput.value.trim(),
        precio: parseFloat(precioInput.value),
        disponible: true,
        imagen: imagenInput.value.trim()
    };

    productos.push(nuevoProducto);
    localStorage.setItem("inventario", JSON.stringify(productos));

    cargarMenu();

    // Limpiar formulario
    nombreInput.value = "";
    precioInput.value = "";
    imagenInput.value = "";

    alert("Producto agregado correctamente.");
}