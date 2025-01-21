// backend.js
const debug=true;
if(debug) console.log("backend.js cargado correctamente.");

window.llenarComboCajas = llenarComboCajas;
window.cargarDatosCaja = cargarDatosCaja;

// ✅ Token seguro y base URL
const token = "elpkaXPV92X55ueGM9U56fyrqifJKoMuphALxKLu.4jIqcGQ2IV1WpSZmPKhooGMZO0PeaKrbS0zmzNnL"; // Reemplaza con tu token de Dentalink
const apiBaseUrl = "https://api.dentalink.healthatom.com/api/v1";

// ✅ Función segura para obtener elementos y manejar errores
function getElementSafe(id) {
    const element = document.querySelector(`#${id}`);
    if (!element) {
        console.error(`Elemento no encontrado: #${id}`);
        return null;
    }
    return element;
}

// ✅ Llenar el combo de cajas con validaciones y formato
async function llenarComboCajas() {
    const fechaSeleccionada = getElementSafe("fecha").value;

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaSeleccionada)) {
        console.error("Formato de fecha incorrecto:", fechaSeleccionada);
        return;
    }   
    const cajaSelect = getElementSafe("caja");
    const errorMessage = getElementSafe("errorMessage");



    if (!cajaSelect || !errorMessage) return;

    cajaSelect.disabled = true;
    cajaSelect.innerHTML = `<option value="">Cargando cajas...</option>`;
    errorMessage.textContent = "";

    if (!fechaSeleccionada) {
        errorMessage.textContent = "⚠️ Por favor, selecciona una fecha válida.";
        //cajaSelect.disabled = false;
        return;
    }

    const spinnerCajas = getElementSafe("spinnerCajas");
    spinnerCajas.classList.remove("d-none"); // Mostrar el spinner
    try {
        // Estas constantes se agregaron porque en la vida real, las cajas a rendir son las abiertas, no las cerradas.
        //TODO: Hacer que al rendir la caja, las obligue a cerrarla y enlazarla.
        const tipoCaja = "1";//"0";
        const campoFecha = "fecha_apertura";//"fecha_cierre";

        const url = `${apiBaseUrl}/cajas?q={"${campoFecha}":{"eq":"${fechaSeleccionada}"},"estado":{"eq":"${tipoCaja}"}}`;
        if (debug) console.log("Consulta a la API:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Token ${token}` }
        });

        const responseText = await response.text();
        

        if (!response.ok) throw new Error(`Error al obtener cajas: ${response.status} - ${responseText}`);

        const data = JSON.parse(responseText);
        const cajas = data.data;

        if (cajas.length === 0) {
            cajaSelect.innerHTML = `<option value="">No hay cajas abiertas</option>`;
            return;
        }

        cajaSelect.innerHTML = `<option value="">Seleccione una caja</option>`;
        cajas.forEach(caja => {
            const nombreCajera = caja.nombre_usuario || "Desconocido";
            cajaSelect.innerHTML += `<option value="${caja.id}">Caja ${caja.id} - ${nombreCajera}</option>`;
        });

        cajaSelect.disabled = false;
        if (debug) console.log("Respuesta de la API:", responseText);

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
    const errorMessage = getElementSafe("errorMessage");

    if (!cajaSeleccionada) {
        errorMessage.textContent = "⚠️ Selecciona una caja válida.";
        return;
    }

    const spinnerCajas = getElementSafe("spinnerCajas");
    spinnerCajas.classList.remove("d-none"); // Mostrar el spinner al inicio
    try {
        const url = `${apiBaseUrl}/cajas/${cajaSeleccionada}`;
        if (debug) console.log("Consulta a la API:", url);
        const response = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Token ${token}` }
        });

        const responseText = await response.text();
        if (!response.ok) throw new Error(`Error al obtener caja: ${response.statusText}`);

        const caja = JSON.parse(responseText).data;

        getElementSafe("saldoInicial").value = formatoMoneda(caja.saldo_inicial ?? 0);
        getElementSafe("acumulado").value = formatoMoneda(caja.acumulado ?? 0);
        getElementSafe("saldoTotal").value = formatoMoneda(caja.saldo_total ?? 0);
        getElementSafe("saldoCierre").value = formatoMoneda(caja.saldo_cierre ?? 0);
        getElementSafe("cajera").value = caja.nombre_usuario || "Desconocido";
        if (debug) console.log("Respuesta de la API:", responseText);
        errorMessage.textContent = "✅ Datos de la caja cargados exitosamente.";
    } catch (error) {
        errorMessage.textContent = `❌ Error al cargar la caja: ${error.message}`;
    } finally {
        spinnerCajas.classList.add("d-none"); // Ocultar el spinner siempre al final
    }
}