// ✅ Token seguro y base URL
const token = ""; // Reemplaza con tu token de Dentalink
const apiBaseUrl = "https://api.dentalink.healthatom.com/api/v1";

// ✅ Variables Globales
let ultimaCajaSeleccionada = "";

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

// ✅ Evento al cambiar la fecha
getElementSafe("fecha").addEventListener("change", async () => {
    console.log("Cambio detectado en fecha, recargando combo de cajas...");
    await llenarComboCajas();
});

// ✅ Evento al seleccionar una caja
getElementSafe("caja").addEventListener("change", () => {
    const cajaSeleccionada = getElementSafe("caja").value;
    if (cajaSeleccionada && cajaSeleccionada !== ultimaCajaSeleccionada) {
        ultimaCajaSeleccionada = cajaSeleccionada;
        cargarDatosCaja();
    }
});

// ✅ Llenar el combo de cajas con validaciones y formato
async function llenarComboCajas() {
    // ... (código para obtener las cajas de la API de Dentalink) ...
}

// ✅ Cargar los datos de la caja y formatear con $0.00 si es cero
async function cargarDatosCaja() {
    // ... (código para obtener los datos de la caja de la API de Dentalink) ...
}

// ✅ Aplicar formateo a los campos al perder el foco (onblur)
document.querySelectorAll('#billetes, #feria, #cheques, #vouchers, #vales, #transferencias, #dolares, #tipoCambio, #laboratorios, #comidas, #proveedores, #otros')
    .forEach(field => {
        field.addEventListener('blur', function () {
            const valorNumerico = limpiarFormatoMoneda(this.value);
            this.value = formatoMoneda(valorNumerico);
            calcularTotalCaja(); 
            mostrarOcultarCamposDolares(); 
        });
    });    

// ✅ Calcular Total en Caja y Diferencia
function calcularTotalCaja() {
    // ... (código para calcular los totales) ...
}

getElementSafe("dolares").addEventListener("blur", function() {
    // ... (código para calcular el valor de los dólares) ...
});

function mostrarOcultarCamposDolares() {
    // ... (código para mostrar/ocultar campos) ...
}