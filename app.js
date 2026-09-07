// Catálogo inicial predeterminado
const productosIniciales = [
    { id: 1, nombre: "Hamburguesa", precio: 15000, disponible: true },
    { id: 2, nombre: "Perro Caliente", precio: 12000, disponible: true },
    { id: 3, nombre: "Papas Fritas", precio: 6000, disponible: true },
    { id: 4, nombre: "Gaseosa", precio: 4000, disponible: true }
];

// Cargar catálogo guardado en el navegador o usar el inicial
let productos = JSON.parse(localStorage.getItem("inventario")) || productosIniciales;
let pedidoActual = [];

function guardarInventario() {
    localStorage.setItem("inventario", JSON.stringify(productos));
}

// 1. Mostrar menú de compras
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
    const totalSpan = document.getElementById("total-pagar");
    lista.innerHTML = "";

    let total = 0;
    pedidoActual.forEach((item) => {
        total += item.precio;
        const li = document.createElement("li");
        li.innerText = `${item.nombre} - $${item.precio}`;
        lista.appendChild(li);
    });

    totalSpan.innerText = total;
}

function limpiarPedido() {
    pedidoActual = [];
    actualizarVistaPedido();
}

function confirmarPedido() {
    if (pedidoActual.length === 0) return alert("El pedido está vacío.");
    alert("¡Pedido realizado con éxito!");
    limpiarPedido();
}

// 2. Control de Disponibilidad (Checkboxes)
function cargarAdmin() {
    const contenedorAdmin = document.getElementById("lista-admin");
    contenedorAdmin.innerHTML = "";

    productos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "item-admin";
        div.innerHTML = `
            <span><strong>${prod.nombre}</strong> ($${prod.precio})</span>
            <label>
                <input type="checkbox" ${prod.disponible ? "checked" : ""} onchange="cambiarEstado(${prod.id})">
                Disponible
            </label>
        `;
        contenedorAdmin.appendChild(div);
    });
}

function cambiarEstado(id) {
    productos = productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p);
    guardarInventario();
    cargarMenu();
}

// 3. Crear Nuevos Productos desde la Web
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

    alert("¡Producto agregado con éxito!");
}

// Inicializar la aplicación
cargarMenu();
cargarAdmin();