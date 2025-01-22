// frontend.js
// Variable global para almacenar los gastos
let gastos = [];
let idGasto = 1;

document.addEventListener("DOMContentLoaded", () => {
    // Cargar backend.js dinámicamente
    const script = document.createElement("script");
    script.src = "backend.js";
    script.defer = true;
    script.onload = () => {
        if(debug) console.log("frontend.js cargado correctamente");

        // Listener para el cambio en la fecha
        const fechaInput = document.getElementById("fecha");
        if (fechaInput) {
            fechaInput.addEventListener("change", () => {
                console.log("Evento de cambio en fecha disparado.");
                llenarComboCajas(); // Cargar las cajas
            });
        } else {
            console.error("Elemento con ID 'fecha' no encontrado.");
        }

        // Listener para el cambio en el combo de cajas
        const cajaSelect = document.getElementById("caja");
        if (cajaSelect) {
            cajaSelect.addEventListener("change", () => {
                console.log("Evento de cambio en combo de cajas disparado.");
                cargarDatosCaja(); // Cargar los datos de la caja seleccionada
            });
        } else {
            console.error("Elemento con ID 'caja' no encontrado.");
        }
    };

    document.body.appendChild(script);
    
        // Detectar si es Safari
        if (isSafari()) {
            console.log("Safari detectado. Inicializando Flatpickr...");
            
            // Cambiar el input a texto para evitar conflictos
            const fechaInput = document.getElementById("fecha");
            if (fechaInput) {
                fechaInput.setAttribute("type", "text");
            }
    
            // Inicializar Flatpickr
            flatpickr("#fecha", {
                dateFormat: "Y-m-d", // Formato esperado por la API
                locale: "es",        // Español
            });
        } else {
            console.log("No es Safari. Se usa el control nativo.");
        }

        const tablaGastos = document.getElementById("tablaGastos").querySelector("tbody");
        const totalLaboratorios = document.getElementById("laboratorios");
        const totalComidas = document.getElementById("comidas");
        const totalProveedores = document.getElementById("proveedores");
        const totalOtros = document.getElementById("otros");
    
        // Actualiza los totales por categoría
        function actualizarTotales() {
            const categorias = { Laboratorios: 0, Comidas: 0, Proveedores: 0, Otros: 0 };
    
            gastos.forEach((gasto) => {
                categorias[gasto.categoria] += gasto.importe;
            });
    
            totalLaboratorios.value = categorias.Laboratorios.toFixed(2);
            totalComidas.value = categorias.Comidas.toFixed(2);
            totalProveedores.value = categorias.Proveedores.toFixed(2);
            totalOtros.value = categorias.Otros.toFixed(2);
        }
    
        // Renderiza la tabla de gastos
        function renderizarTabla() {
            tablaGastos.innerHTML = "";
            gastos.forEach((gasto) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${gasto.id}</td>
                    <td>${gasto.categoria}</td>
                    <td>${gasto.descripcion}</td>
                    <td>${gasto.importe.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarGasto(${gasto.id})">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarGasto(${gasto.id})">🗑️</button>
                    </td>
                `;
                tablaGastos.appendChild(fila);
            });
            actualizarTotales();
        }
    
        // Añade un nuevo renglón para un registro nuevo
        function añadirRenglónEditable(id, categoria = "", descripcion = "", importe = "") {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${id}</td>
                <td>
                    <select class="form-select">
                        <option value="Laboratorios" ${categoria === "Laboratorios" ? "selected" : ""}>Laboratorios</option>
                        <option value="Comidas" ${categoria === "Comidas" ? "selected" : ""}>Comidas</option>
                        <option value="Proveedores" ${categoria === "Proveedores" ? "selected" : ""}>Proveedores</option>
                        <option value="Otros" ${categoria === "Otros" ? "selected" : ""}>Otros</option>
                    </select>
                </td>
                <td><input type="text" class="form-control" value="${descripcion}" placeholder="Descripción"></td>
                <td><input type="number" class="form-control" value="${importe}" placeholder="Importe"></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="guardarRenglón(${id})">✔️</button>
                    <button class="btn btn-warning btn-sm" onclick="rechazarRenglón(${id})">❌</button>
                </td>
            `;
            tablaGastos.appendChild(fila);
        }
    
        // Guardar un nuevo registro o cambios de edición
        window.guardarRenglón = (id) => {
            const fila = [...tablaGastos.children].find((row) => row.children[0].innerText == id);
            const categoria = fila.children[1].querySelector("select").value;
            const descripcion = fila.children[2].querySelector("input").value;
            const importe = parseFloat(fila.children[3].querySelector("input").value);
    
            if (!categoria || !descripcion || isNaN(importe)) {
                alert("Todos los campos son obligatorios y el importe debe ser un número válido.");
                return;
            }
    
            const index = gastos.findIndex((gasto) => gasto.id === id);
            if (index >= 0) {
                // Actualiza registro existente
                gastos[index] = { id, categoria, descripcion, importe };
            } else {
                // Nuevo registro
                gastos.push({ id, categoria, descripcion, importe });
            }
    
            renderizarTabla();
        };
    
        // Rechazar un nuevo renglón o cancelar edición
        window.rechazarRenglón = (id) => {
            const index = gastos.findIndex((gasto) => gasto.id === id);
            if (index === -1) {
                // Es un renglón nuevo, simplemente eliminarlo
                const fila = [...tablaGastos.children].find((row) => row.children[0].innerText == id);
                fila.remove();
            } else {
                // Si estaba editando, volver a la versión original
                renderizarTabla();
            }
        };
    
        // Editar un renglón existente
        window.editarGasto = (id) => {
            const gasto = gastos.find((g) => g.id === id);
            if (gasto) {
                // Convierte el renglón a editable
                añadirRenglónEditable(gasto.id, gasto.categoria, gasto.descripcion, gasto.importe);
                const filaAnterior = [...tablaGastos.children].find((row) => row.children[0].innerText == id);
                filaAnterior.remove();
            }
        };
    
        // Eliminar un gasto existente
        window.eliminarGasto = (id) => {
            gastos = gastos.filter((g) => g.id !== id);
            renderizarTabla();
        };
    
        // Añadir un nuevo registro
        document.getElementById("btnAgregarGasto").addEventListener("click", () => {
            añadirRenglónEditable(idGasto++);
        });
    
        // Renderiza tabla inicial
        renderizarTabla();
        
});

// ✅ Función segura para obtener elementos y manejar errores
function getElementSafe(id) {
    const element = document.querySelector(`#${id}`);
    if (!element) {
        console.error(`Elemento no encontrado: #${id}`);
        return null;
    }
    return element;
}

// ✅ Formatear valores a moneda con 2 decimales (MXN)
function formatoMoneda(valor) {
    if (isNaN(valor) || valor === "") valor = 0;
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    }).format(valor);
}

// ✅ Eliminar formato de moneda y devolver un número puro
function limpiarFormatoMoneda(valor) {
    if (!valor) return 0;
    const valorLimpio = valor.replace(/[^0-9.-]/g, "");
    return valorLimpio ? parseFloat(valorLimpio) : 0;
}

// ✅ Aplicar formateo a los campos al perder el foco (onblur)
document.querySelectorAll('#billetes, #feria, #cheques, #vouchers, #vales, #transferencias, #dolares, #tipoCambio, #laboratorios, #comidas, #proveedores, #otros')
    .forEach(field => {
        field.addEventListener('blur', function () {
            const valorNumerico = limpiarFormatoMoneda(this.value);
            this.value = formatoMoneda(valorNumerico);
            calcularTotalCaja();  // Asegúrate de que calcularTotalCaja se llama primero
            mostrarOcultarCamposDolares(); // Llama a mostrarOcultarCamposDolares después de calcularTotalCaja
        });
    });    

// ✅ Calcular Total en Caja y Diferencia
function calcularTotalCaja() {
    const getNumber = (id) => limpiarFormatoMoneda(getElementSafe(id).value);
    
    const billetes = getNumber("billetes");
    const feria = getNumber("feria");
    const cheques = getNumber("cheques");
    const vouchers = getNumber("vouchers");
    const vales = getNumber("vales"); 
    const transferencias = getNumber("transferencias");
    const dolares = getNumber("dolares");
    const tipoCambio = getNumber("tipoCambio");
    const valorDolaresMXN = dolares * tipoCambio; 
    getElementSafe("valorDolaresMXN").value = formatoMoneda(valorDolaresMXN);
   
    const laboratorios = getNumber("laboratorios");
    const comidas = getNumber("comidas");
    const proveedores = getNumber("proveedores");
    const otros = getNumber("otros");

    const ingresos = billetes + feria + cheques + vouchers + vales + transferencias + valorDolaresMXN;
    const gastos = laboratorios + comidas + proveedores + otros;

    const totalEnCaja = ingresos - gastos;
    getElementSafe("totalEnCaja").value = formatoMoneda(totalEnCaja);

    const saldoTotal = getNumber("saldoTotal");
    const diferencia = saldoTotal - totalEnCaja;
    getElementSafe("diferencia").value = formatoMoneda(diferencia);
}

function mostrarOcultarCamposDolares() {
    const dolares = limpiarFormatoMoneda(getElementSafe("dolares").value);
    const contenedorTipoCambio = getElementSafe("contenedorTipoCambio");
    const contenedorValorDolaresMXN = getElementSafe("contenedorValorDolaresMXN");

    if (dolares > 0) {
        contenedorTipoCambio.hidden = false;
        contenedorValorDolaresMXN.hidden = false;
    } else {
        contenedorTipoCambio.hidden = true;
        contenedorValorDolaresMXN.hidden = true;
        getElementSafe("tipoCambio").value = "";
        getElementSafe("valorDolaresMXN").value = "";
    }
}

function isSafari() {
    return (
        navigator.userAgent.includes("Safari") && 
        !navigator.userAgent.includes("Chrome")
    );
}



