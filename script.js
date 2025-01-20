// ✅ Token seguro y base URL
const token = "elpkaXPV92X55ueGM9U56fyrqifJKoMuphALxKLu.4jIqcGQ2IV1WpSZmPKhooGMZO0PeaKrbS0zmzNnL";
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
    const fechaSeleccionada = getElementSafe("fecha").value;
    const cajaSelect = getElementSafe("caja");
    const requestStringBox = getElementSafe("requestString");
    const responseJsonBox = getElementSafe("responseJson");
    const errorMessage = getElementSafe("errorMessage");

    if (!cajaSelect || !requestStringBox || !responseJsonBox || !errorMessage) return;

    cajaSelect.disabled = true;
    cajaSelect.innerHTML = `<option value="">Cargando cajas...</option>`;
    errorMessage.textContent = "";

    if (!fechaSeleccionada) {
        errorMessage.textContent = "⚠️ Por favor, selecciona una fecha válida.";
        cajaSelect.disabled = false;
        return;
    }
    const spinnerCajas = getElementSafe("spinnerCajas");
    spinnerCajas.classList.remove("d-none"); // Mostrar el spinner
    try {
        const url = `${apiBaseUrl}/cajas?q={"fecha_cierre":{"eq":"${fechaSeleccionada}"},"estado":{"eq":0}}`;
        requestStringBox.value = `GET ${url}`;

        const response = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Token ${token}` }
        });

        const responseText = await response.text();
        responseJsonBox.value = responseText;

        if (!response.ok) throw new Error(`Error al obtener cajas: ${response.status} - ${responseText}`);

        const data = JSON.parse(responseText);
        const cajas = data.data;

        if (cajas.length === 0) {
            cajaSelect.innerHTML = `<option value="">No hay cajas cerradas</option>`;
            cajaSelect.disabled = false;
            return;
        }

        cajaSelect.innerHTML = `<option value="">Seleccione una caja</option>`;
        cajas.forEach(caja => {
            const nombreCajera = caja.nombre_usuario || "Desconocido";
            cajaSelect.innerHTML += `<option value="${caja.id}">Caja ${caja.id} - ${nombreCajera}</option>`;
        });

        cajaSelect.disabled = false;
        errorMessage.textContent = "✅ Cajas cargadas exitosamente.";
    } catch (error) {
        errorMessage.textContent = `❌ Error: ${error.message}`;
        cajaSelect.disabled = false;
    } finally {
        spinnerCajas.classList.add("d-none"); // Ocultar el spinner siempre al final
    }
}

// ✅ Cargar los datos de la caja y formatear con $0.00 si es cero
async function cargarDatosCaja() {
    const cajaSeleccionada = getElementSafe("caja").value;
    const responseJsonBox = getElementSafe("responseJson");
    const errorMessage = getElementSafe("errorMessage");

    if (!cajaSeleccionada) {
        errorMessage.textContent = "⚠️ Selecciona una caja válida.";
        return;
    }
    const spinnerCajas = getElementSafe("spinnerCajas"); 
    spinnerCajas.classList.remove("d-none"); // Mostrar el spinner al inicio
    try {
        const url = `${apiBaseUrl}/cajas/${cajaSeleccionada}`;
        const response = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Token ${token}` }
        });

        const responseText = await response.text();
        responseJsonBox.value = responseText;

        if (!response.ok) throw new Error(`Error al obtener caja: ${response.statusText}`);

        const caja = JSON.parse(responseText).data;

        getElementSafe("saldoInicial").value = formatoMoneda(caja.saldo_inicial ?? 0);
        getElementSafe("acumulado").value = formatoMoneda(caja.acumulado ?? 0);
        getElementSafe("saldoTotal").value = formatoMoneda(caja.saldo_total ?? 0);
        getElementSafe("saldoCierre").value = formatoMoneda(caja.saldo_cierre ?? 0);
        getElementSafe("cajera").value = caja.nombre_usuario || "Desconocido";

        errorMessage.textContent = "✅ Datos de la caja cargados exitosamente.";
    } catch (error) {
        errorMessage.textContent = `❌ Error al cargar la caja: ${error.message}`;
    } finally {
        spinnerCajas.classList.add("d-none"); // Ocultar el spinner siempre al final
    }
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
    // Asumiendo que estos campos existen en tu HTML
    const vales = getNumber("vales"); 
    const transferencias = getNumber("transferencias");
    const dolares = getNumber("dolares");
    const tipoCambio = getNumber("tipoCambio");
    const valorDolaresMXN = dolares*tipoCambio; 
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
        contenedorTipoCambio.hidden = false; // Mostrar contenedorTipoCambio
        contenedorValorDolaresMXN.hidden = false; // Mostrar contenedorValorDolaresMXN
    } else {
        contenedorTipoCambio.hidden = true; // Ocultar contenedorTipoCambio
        contenedorValorDolaresMXN.hidden = true; // Ocultar contenedorValorDolaresMXN
        getElementSafe("tipoCambio").value = formatoMoneda(0); // Restablecer el valor a cero
    }
}
