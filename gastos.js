// Clase Gasto
export class Gasto {
    constructor(id, categoria, descripcion, importe, comprobante = null) {
        this.id = id;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.importe = parseFloat(importe);
        this.comprobante = comprobante;
    }

    info() {
        return `ID: ${this.id}, Categoría: ${this.categoria}, Descripción: ${this.descripcion}, Importe: ${this.importe.toFixed(2)}`;
    }
}

// Variables globales
export let gastos = [];
export let idGasto = 1;

// Función para actualizar totales
export function actualizarTotales() {
    const categorias = { Laboratorios: 0, Comidas: 0, Proveedores: 0, Otros: 0 };

    gastos.forEach((gasto) => {
        categorias[gasto.categoria] += gasto.importe;
    });

    document.getElementById("laboratorios").value = categorias.Laboratorios.toFixed(2);
    document.getElementById("comidas").value = categorias.Comidas.toFixed(2);
    document.getElementById("proveedores").value = categorias.Proveedores.toFixed(2);
    document.getElementById("otros").value = categorias.Otros.toFixed(2);
}

// Función para renderizar la tabla
export function renderizarTabla() {
    const tablaGastos = document.getElementById("tablaGastos").querySelector("tbody");
    tablaGastos.innerHTML = "";

    gastos.forEach((gasto) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${gasto.id}</td>
            <td>${gasto.categoria}</td>
            <td>${gasto.descripcion}</td>
            <td>${gasto.importe.toFixed(2)}</td>
            <td>
                ${gasto.comprobante ? `<a href="${gasto.comprobante}" target="_blank">Ver Comprobante</a>` : "N/A"}
            </td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarGasto(${gasto.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarGasto(${gasto.id})">🗑️</button>
            </td>
        `;
        tablaGastos.appendChild(fila);
    });

    actualizarTotales();
}

// Funciones CRUD
export function añadirGasto(categoria, descripcion, importe, comprobante = null) {
    const nuevoGasto = new Gasto(idGasto++, categoria, descripcion, importe, comprobante);
    gastos.push(nuevoGasto);
    renderizarTabla();
}

export function eliminarGasto(id) {
    gastos = gastos.filter((g) => g.id !== id);
    renderizarTabla();
}

export function editarGasto(id) {
    const gasto = gastos.find((g) => g.id === id);
    if (gasto) {
        const nuevaCategoria = prompt("Nueva categoría:", gasto.categoria);
        const nuevaDescripcion = prompt("Nueva descripción:", gasto.descripcion);
        const nuevoImporte = parseFloat(prompt("Nuevo importe:", gasto.importe));

        if (nuevaCategoria && nuevaDescripcion && !isNaN(nuevoImporte)) {
            gasto.categoria = nuevaCategoria;
            gasto.descripcion = nuevaDescripcion;
            gasto.importe = nuevoImporte;
            renderizarTabla();
        } else {
            alert("Todos los campos son obligatorios y el importe debe ser un número válido.");
        }
    }
}