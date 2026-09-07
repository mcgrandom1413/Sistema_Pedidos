// Catálogo predeterminado inicial
const productosIniciales = [
    { id: 1, nombre: "Hamburguesa", precio: 15000, disponible: true },
    { id: 2, nombre: "Perro Caliente", precio: 12000, disponible: true },
    { id: 3, nombre: "Papas Fritas", precio: 6000, disponible: true },
    { id: 4, nombre: "Gaseosa", precio: 4000, disponible: true }
];

let productos = JSON.parse(localStorage.getItem("inventario")) || productosIniciales;
let facturas = JSON.parse(localStorage.getItem("historial_facturas")) || [];
let pedidoActual = [];

function guardarInventario() {
    localStorage.setItem("inventario", JSON.stringify(productos));
}

function guardarFacturas() {
    localStorage.setItem("historial_facturas", JSON.stringify(facturas));
}

// 1. Mostrar menú
function cargarMenu() {
    const contenedor = document.getElementById("grid-productos");
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        if (prod.disponible) {
            const btn = document.createElement("button");
            btn.className = "btn-producto";
            btn.innerText = `${prod.nombre}\n$${prod.precio}`;
            btn.onclick = () => agregarAlPedido(prod);
            contenedor.appendChild(btn);
        }
    });
}

function agregarAlPedido(prod) {
    pedidoActual.push(prod);
    actualizarVistaPedido();
}

function actualizarVistaPedido() {
    const lista = document.getElementById("lista-pedido");
    const subtotalSpan = document.getElementById("subtotal-pagar");
    const domicilioSpan = document.getElementById("valor-domicilio");
    const totalSpan = document.getElementById("total-pagar");
    const costoDomicilio = parseFloat(document.getElementById("costo-domicilio").value) || 0;

    lista.innerHTML = "";

    let subtotal = 0;
    pedidoActual.forEach((item) => {
        subtotal += item.precio;
        const li = document.createElement("li");
        li.innerText = `${item.nombre} - $${item.precio}`;
        lista.appendChild(li);
    });

    const total = subtotal + costoDomicilio;

    subtotalSpan.innerText = subtotal;
    domicilioSpan.innerText = costoDomicilio;
    totalSpan.innerText = total;
}

function limpiarPedido() {
    pedidoActual = [];
    document.getElementById("costo-domicilio").value = "0";
    actualizarVistaPedido();
}

// 2. Confirmar y guardar la factura (Guarda fecha para controlar tiempo)
function confirmarPedido() {
    if (pedidoActual.length === 0) return alert("El pedido está vacío.");

    const costoDomicilio = parseFloat(document.getElementById("costo-domicilio").value) || 0;
    let subtotal = 0;
    pedidoActual.forEach(item => subtotal += item.precio);

    const nuevaFactura = {
        id: "FAC-" + Date.now().toString().slice(-5),
        fecha: new Date().toISOString(),
        items: [...pedidoActual],
        subtotal: subtotal,
        domicilio: costoDomicilio,
        total: subtotal + costoDomicilio
    };

    facturas.unshift(nuevaFactura); // Agregar al inicio
    guardarFacturas();
    cargarFacturas();

    alert(`¡Factura ${nuevaFactura.id} registrada con éxito!`);
    limpiarPedido();
}

// 3. Panel de administración y eliminación de comidas
function cargarAdmin() {
    const contenedorAdmin = document.getElementById("lista-admin");
    contenedorAdmin.innerHTML = "";

    productos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "item-admin";
        div.innerHTML = `
            <span><strong>${prod.nombre}</strong> ($${prod.precio})</span>
            <div>
                <label>
                    <input type="checkbox" ${prod.disponible ? "checked" : ""} onchange="cambiarEstado(${prod.id})">
                    Disponible
                </label>
                <button class="btn-eliminar-sm" onclick="eliminarProducto(${prod.id})">🗑️ Borrar</button>
            </div>
        `;
        contenedorAdmin.appendChild(div);
    });
}

function cambiarEstado(id) {
    productos = productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p);
    guardarInventario();
    cargarMenu();
}

function eliminarProducto(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto definitivamente?")) {
        productos = productos.filter(p => p.id !== id);
        guardarInventario();
        cargarMenu();
        cargarAdmin();
    }
}

// 4. Crear producto
function crearProducto(event) {
    event.preventDefault();

    const nombreInput = document.getElementById("nombre");
    const precioInput = document.getElementById("precio");

    const nuevoProducto = {
        id: Date.now(),
        nombre: nombreInput.value.trim(),
        precio: parseFloat(precioInput.value),
        disponible: true
    };

    productos.push(nuevoProducto);
    guardarInventario();

    cargarMenu();
    cargarAdmin();

    nombreInput.value = "";
    precioInput.value = "";
}

// 5. Visualizar historial de facturas
function cargarFacturas() {
    const contenedorFacturas = document.getElementById("historial-facturas");
    contenedorFacturas.innerHTML = "";

    facturas.forEach(f => {
        const fechaFormateada = new Date(f.fecha).toLocaleString();
        const card = document.createElement("div");
        card.className = "factura-card";

        let listaHTML = "<ul>";
        f.items.forEach(item => {
            listaHTML += `<li>• ${item.nombre}: $${item.precio}</li>`;
        });
        listaHTML += "</ul>";

        card.innerHTML = `
            <h4>${f.id}</h4>
            <small>${fechaFormateada}</small>
            ${listaHTML}
            <hr>
            <p>Subtotal: $${f.subtotal}</p>
            <p>Domicilio: $${f.domicilio}</p>
            <strong>TOTAL: $${f.total}</strong>
        `;
        contenedorFacturas.appendChild(card);
    });
}

// Limpiar automático de facturas de más de 30 días
function limpiarFacturasExpiradas() {
    const limite30Dias = Date.now() - (30 * 24 * 60 * 60 * 1000);
    facturas = facturas.filter(f => new Date(f.fecha).getTime() > limite30Dias);
    guardarFacturas();
    cargarFacturas();
    alert("Se han limpiado las facturas con más de 30 días de antigüedad.");
}

// Inicialización
cargarMenu();
cargarAdmin();
cargarFacturas();