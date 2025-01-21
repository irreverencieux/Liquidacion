// frontend.js

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
        contenedorTipoCambio.hidden = false; // Mostrar contenedorTipoCambio
        contenedorValorDolaresMXN.hidden = false; // Mostrar contenedorValorDolaresMXN
    } else {
        contenedorTipoCambio.hidden = true; // Ocultar contenedorTipoCambio
        contenedorValorDolaresMXN.hidden = true; // Ocultar contenedorValorDolaresMXN
        getElementSafe("tipoCambio").value = formatoMoneda(0); // Restablecer el valor a cero
    }
}



