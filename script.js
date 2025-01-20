// ✅ Base URL (reemplaza con la URL de tu API)
const apiBaseUrl = "https://script.googleapis.com/v1/scripts/{SCRIPT_ID}:run"; // Reemplaza {SCRIPT_ID} con el ID de tu script

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
    // ... (código igual que en la respuesta anterior) ...
}

// ✅ Cargar los datos de la caja y formatear con $0.00 si es cero
async function cargarDatosCaja() {
    // ... (código igual que en la respuesta anterior) ...
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

getElementSafe("dolares").addEventListener("blur", function() {
    const valorNumerico = limpiarFormatoMoneda(this.value);
    this.value = formatoMoneda(valorNumerico);
    calcularTotalCaja();
});

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
        getElementSafe("tipoCambio").value = formatoMoneda(0); 
    }
}

// ✅ Función para verificar la existencia de la caja (BACKEND)
async function existeCaja(cajaId) {
  try {
    const response = await fetch(apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'existeCaja', parameters: [cajaId] })
    });
    const data = await response.json();
    return data.response.result; // Ajusta la ruta según la respuesta de tu API
  } catch (error) {
    console.error('Error al verificar la existencia de la caja:', error);
    return false; 
  }
}

// ✅ Función para guardar los datos de la rendición (BACKEND)
async function guardarRendicion(datosRendicion) {
  try {
    const response = await fetch(apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'guardarRendicion', parameters: [datosRendicion] })
    });
    const data = await response.json();
    return data.response.result; // Ajusta la ruta según la respuesta de tu API
  } catch (error) {
    console.error('Error al guardar la rendición:', error);
    return 'Error al guardar la rendición';
  }
}