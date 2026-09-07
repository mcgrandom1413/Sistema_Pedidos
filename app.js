const productosIniciales = [
    { id: 1, nombre: "Hamburguesa", precio: 15000, disponible: true, imagen: "" },
    { id: 2, nombre: "Perro Caliente", precio: 12000, disponible: true, imagen: "" },
    { id: 3, nombre: "Papas Fritas", precio: 6000, disponible: true, imagen: "" },
    { id: 4, nombre: "Gaseosa", precio: 5000, disponible: true, imagen: "" }
];

let productos = JSON.parse(localStorage.getItem("inventario")) || productosIniciales;
let pedidoActual = [];
let historialFacturas = JSON.parse(localStorage.getItem("historialFacturas")) || [];

document.addEventListener("DOMContentLoaded", () => {
    cargarMenu();
    actualizarVistaPedido();
    cargarHistorial();
});

// 1. CARGAR MENÚ DE PRODUCTOS (CON BOTÓN DE ELIMINAR)
function cargarMenu() {
    const contenedor = document.getElementById("grid-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No hay productos en el menú.</p>`;
        return;
    }

    productos.forEach(prod => {
        if (prod.disponible) {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta-producto";

            let contenidoImagen = prod.imagen && prod.imagen.trim() !== "" 
                ? `<img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.style.display='none'">` 
                : "";

            tarjeta.innerHTML = `
                <button type="button" class="btn-borrar-prod" onclick="eliminarProductoDelMenu(${prod.id})" title="Eliminar producto del menú">×</button>
                <div class="contenido-tarjeta" onclick="agregarAlPedido(${prod.id})">
                    ${contenidoImagen}
                    <div class="info-producto">
                        <strong>${prod.nombre}</strong>
                        <span>$${prod.precio.toLocaleString()}</span>
                    </div>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        }
    });
}

// NUEVA FUNCIÓN: ELIMINAR PRODUCTO DEL MENÚ
function eliminarProductoDelMenu(idProducto) {
    const prod = productos.find(p => p.id === idProducto);
    if (!prod) return;

    if (confirm(`¿Estás seguro de que deseas eliminar "${prod.nombre}" del menú?`)) {
        productos = productos.filter(p => p.id !== idProducto);
        localStorage.setItem("inventario", JSON.stringify(productos));
        cargarMenu();
    }
}

// 2. AGREGAR PRODUCTO AL PEDIDO
function agregarAlPedido(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    const existe = pedidoActual.find(item => item.id === idProducto);
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

// 3. MOSTRAR / OCULTAR CAMPOS DE DOMICILIO
function toggleDomicilio() {
    const tipoEntrega = document.getElementById("tipo-entrega").value;
    const seccionDomicilio = document.getElementById("seccion-domicilio");
    
    if (tipoEntrega === "Domicilio") {
        seccionDomicilio.style.display = "block";
    } else {
        seccionDomicilio.style.display = "none";
    }
    actualizarVistaPedido();
}

// 4. ACTUALIZAR VISTA DEL PEDIDO
function actualizarVistaPedido() {
    const tbody = document.getElementById("lista-pedido");
    const totalSpan = document.getElementById("total-pedido");
    if (!tbody || !totalSpan) return;

    tbody.innerHTML = "";
    let subtotalProductos = 0;

    pedidoActual.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        subtotalProductos += subtotal;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${subtotal.toLocaleString()}</td>
            <td>
                <button type="button" class="btn-quitar" onclick="quitarDelPedido(${index})">X</button>
            </td>
        `;
        tbody.appendChild(fila);
    });

    let costoDomicilio = 0;
    const tipoEntrega = document.getElementById("tipo-entrega").value;
    if (tipoEntrega === "Domicilio") {
        const inputCosto = document.getElementById("costo-domicilio");
        costoDomicilio = parseFloat(inputCosto.value) || 0;
    }

    const totalFinal = subtotalProductos + costoDomicilio;
    totalSpan.textContent = totalFinal.toLocaleString();
}

function quitarDelPedido(index) {
    pedidoActual.splice(index, 1);
    actualizarVistaPedido();
}

// 5. FINALIZAR VENTA
function finalizarVenta() {
    if (pedidoActual.length === 0) {
        alert("El pedido está vacío.");
        return;
    }

    const tipoEntrega = document.getElementById("tipo-entrega").value;
    const metodoPago = document.getElementById("metodo-pago").value;
    let direccion = "";
    let costoEnvio = 0;

    if (tipoEntrega === "Domicilio") {
        direccion = document.getElementById("direccion-domicilio").value.trim();
        costoEnvio = parseFloat(document.getElementById("costo-domicilio").value) || 0;

        if (!direccion) {
            alert("Por favor ingrese la dirección para el domicilio.");
            return;
        }
    }

    const totalProductos = pedidoActual.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalVenta = totalProductos + costoEnvio;

    const nuevaFactura = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        tipoEntrega: tipoEntrega,
        direccion: direccion,
        metodoPago: metodoPago,
        total: totalVenta
    };

    historialFacturas.push(nuevaFactura);
    localStorage.setItem("historialFacturas", JSON.stringify(historialFacturas));

    pedidoActual = [];
    document.getElementById("direccion-domicilio").value = "";
    document.getElementById("tipo-entrega").value = "Local";
    toggleDomicilio();
    actualizarVistaPedido();
    cargarHistorial();

    alert("¡Venta registrada con éxito!");
}

// 6. CARGAR HISTORIAL DE FACTURAS
function cargarHistorial() {
    const tabla = document.getElementById("tabla-facturas");
    if (!tabla) return;

    tabla.innerHTML = "";

    if (historialFacturas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay facturas registradas.</td></tr>`;
        return;
    }

    historialFacturas.forEach((factura) => {
        const detalle = factura.tipoEntrega === "Domicilio" 
            ? `${factura.metodoPago} (${factura.direccion})` 
            : factura.metodoPago;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>#${factura.id.toString().slice(-4)}</td>
            <td>${factura.tipoEntrega}</td>
            <td>$${factura.total.toLocaleString()}</td>
            <td><small>${detalle}</small></td>
        `;
        tabla.appendChild(fila);
    });
}

// 7. BORRAR FACTURAS
function borrarFacturas() {
    if (historialFacturas.length === 0) {
        alert("No hay facturas para borrar.");
        return;
    }

    if (confirm("¿Estás seguro de que deseas borrar TODAS las facturas del historial?")) {
        historialFacturas = [];
        localStorage.removeItem("historialFacturas");
        cargarHistorial();
        alert("Historial de facturas borrado.");
    }
}

// 8. CREAR NUEVO PRODUCTO
function crearProducto(event) {
    event.preventDefault();

    const nombreInput = document.getElementById("nombre");
    const precioInput = document.getElementById("precio");
    const imagenInput = document.getElementById("imagen");

    const precio = parseFloat(precioInput.value);

    if (precio < 5000 || precio > 15000) {
        alert("El precio debe estar entre $5,000 y $15,000 pesos.");
        return;
    }

    const nuevoProducto = {
        id: Date.now(),
        nombre: nombreInput.value.trim(),
        precio: precio,
        disponible: true,
        imagen: imagenInput.value.trim()
    };

    productos.push(nuevoProducto);
    localStorage.setItem("inventario", JSON.stringify(productos));

    cargarMenu();

    nombreInput.value = "";
    precioInput.value = "";
    imagenInput.value = "";

    alert("Producto agregado correctamente.");
}