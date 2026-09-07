const productosIniciales = [
    { id: 1, nombre: "Hamburguesa", precio: 15000, disponible: true, imagen: "" },
    { id: 2, nombre: "Perro Caliente", precio: 12000, disponible: true, imagen: "" },
    { id: 3, nombre: "Papas Fritas", precio: 6000, disponible: true, imagen: "" },
    { id: 4, nombre: "Gaseosa", precio: 4000, disponible: true, imagen: "" }
];

let productos = JSON.parse(localStorage.getItem("inventario")) || productosIniciales;
let pedidoActual = [];
let historialFacturas = JSON.parse(localStorage.getItem("historialFacturas")) || [];

document.addEventListener("DOMContentLoaded", () => {
    cargarMenu();
    actualizarVistaPedido();
    cargarHistorial();
});

function cargarMenu() {
    const contenedor = document.getElementById("grid-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    productos.forEach(prod => {
        if (prod.disponible) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tarjeta-producto";
            btn.onclick = () => agregarAlPedido(prod.id);

            let contenidoImagen = prod.imagen && prod.imagen.trim() !== "" 
                ? `<img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.style.display='none'">` 
                : "";

            btn.innerHTML = `
                ${contenidoImagen}
                <div class="info-producto">
                    <strong>${prod.nombre}</strong>
                    <span>$${prod.precio.toLocaleString()}</span>
                </div>
            `;
            contenedor.appendChild(btn);
        }
    });
}

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
                <button type="button" class="btn-quitar" onclick="quitarDelPedido(${index})">X</button>
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
        total: totalVenta
    };

    historialFacturas.push(nuevaFactura);
    localStorage.setItem("historialFacturas", JSON.stringify(historialFacturas));

    pedidoActual = [];
    actualizarVistaPedido();
    cargarHistorial();

    alert("¡Venta registrada con éxito!");
}

function cargarHistorial() {
    const tabla = document.getElementById("tabla-facturas");
    if (!tabla) return;

    tabla.innerHTML = "";

    if (historialFacturas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay facturas registradas.</td></tr>`;
        return;
    }

    historialFacturas.forEach((factura) => {
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

    nombreInput.value = "";
    precioInput.value = "";
    imagenInput.value = "";

    alert("Producto agregado correctamente.");
}