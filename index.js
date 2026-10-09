
const prompt = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

function preguntar(texto) {
    return new Promise(resolve => {
        prompt.question(texto, respuesta => resolve(respuesta.trim()));
    });
}

let clientes = [];
let pilaUrgencias = [];
let colaAtencion = [];

async function registrarClientes() {
    let cantidad = parseInt(await preguntar("Cantidad de clientes: "));

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        console.log("Cantidad no valida.");
        return;
    }

    for (let i = 0; i < cantidad; i++) {
        console.log("\n--- CLIENTE " + (i + 1) + " ---");

        let cedula = await preguntar("Cedula: ");

        if (clientes.some(c => c.cedula === cedula)) {
            console.log("Cedula ya registrada. Intente de nuevo.");
            i--;
            continue;
        }

        let nombre = await preguntar("Nombre: ");
        let telefono = await preguntar("Telefono: ");

        console.log("1. Limpieza");
        console.log("2. Calzas");
        console.log("3. Extraccion");
        console.log("4. Diagnostico");

        let opcion;
        do {
            opcion = await preguntar("Tipo de atencion: ");
        } while (!["1", "2", "3", "4"].includes(opcion));

        const tipos = {
            "1": "Limpieza",
            "2": "Calzas",
            "3": "Extraccion",
            "4": "Diagnostico"
        };

        let tipoAtencion = tipos[opcion];
        let cantidadPiezas = 1;

        if (opcion === "2" || opcion === "3") {
            do {
                cantidadPiezas = Number(
                    await preguntar("Cantidad de piezas: ")
                );
            } while (
                !Number.isInteger(cantidadPiezas) ||
                cantidadPiezas <= 0
            );
        }

        let prioridad;
        do {
            prioridad = (
                await preguntar("Prioridad (Normal/Urgente): ")
            ).toLowerCase();
        } while (!["normal", "urgente"].includes(prioridad));

        let fecha;
        do {
            fecha = await preguntar("Fecha (AAAA-MM-DD): ");
            let partes = fecha.split("-").map(Number);
            let valida = /^\d{4}-\d{2}-\d{2}$/.test(fecha);

            if (valida) {
                let fechaReal = new Date(Date.UTC(
                    partes[0], partes[1] - 1, partes[2]
                ));
                valida =
                    fechaReal.getUTCFullYear() === partes[0] &&
                    fechaReal.getUTCMonth() === partes[1] - 1 &&
                    fechaReal.getUTCDate() === partes[2];
            }

            if (!valida) {
                console.log("Fecha invalida. Intente de nuevo.");
                fecha = "";
            }
        } while (!fecha);

        clientes.push({
            cedula,
            nombre,
            telefono,
            tipoAtencion,
            cantidadPiezas,
            prioridad: prioridad === "urgente" ? "Urgente" : "Normal",
            fecha,
            atendido: false
        });

        console.log("Cliente registrado.");
    }
}

function generarPila() {
    pilaUrgencias = clientes
        .filter(c =>
            c.tipoAtencion === "Extraccion" &&
            c.prioridad === "Urgente" &&
            !c.atendido
        )
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    console.log("\n=== PILA DE URGENCIAS ===");

    if (pilaUrgencias.length === 0) {
        console.log("No hay extracciones urgentes pendientes.");
        return;
    }

    pilaUrgencias.forEach((c, i) => {
        console.log("\nPrioridad " + (i + 1));
        console.log("Nombre: " + c.nombre);
        console.log("Cedula: " + c.cedula);
        console.log("Telefono: " + c.telefono);
        console.log("Fecha: " + c.fecha);
        console.log("Piezas: " + c.cantidadPiezas);
    });
}

function generarCola() {
    colaAtencion = clientes.filter(c => !c.atendido);

    console.log("\n=== COLA DE ATENCION ===");

    if (colaAtencion.length === 0) {
        console.log("No hay clientes pendientes.");
        return;
    }

    colaAtencion.forEach((c, i) => {
        console.log(
            (i + 1) + ". " + c.nombre +
            " | " + c.tipoAtencion +
            " | " + c.fecha
        );
    });
}

function atenderCliente() {
    colaAtencion = clientes.filter(c => !c.atendido);

    if (colaAtencion.length === 0) {
        console.log("No hay clientes para atender.");
        return;
    }

    // La cola atiende primero al que ingreso primero.
    let cliente = colaAtencion.shift();
    cliente.atendido = true;

    console.log("\n=== CLIENTE ATENDIDO ===");
    console.log("Nombre: " + cliente.nombre);
    console.log("Cedula: " + cliente.cedula);
    console.log("Atencion: " + cliente.tipoAtencion);
    console.log("Fecha: " + cliente.fecha);
}

function mostrarClientes() {
    console.log("\n=== TODOS LOS CLIENTES ===");

    if (clientes.length === 0) {
        console.log("No hay clientes registrados.");
        return;
    }

    clientes.forEach((c, i) => {
        console.log(
            (i + 1) + ". " + c.nombre +
            " | " + c.tipoAtencion +
            " | " + c.prioridad +
            " | " + c.fecha +
            " | " + (c.atendido ? "Atendido" : "Pendiente")
        );
    });
}

async function menu() {
    let opcion = "";

    while (opcion !== "6") {
        console.log("\n===== CONSULTORIO ODONTOLOGICO =====");
        console.log("1. Registrar clientes");
        console.log("2. Generar pila de urgencias");
        console.log("3. Generar cola de atencion");
        console.log("4. Atender siguiente cliente");
        console.log("5. Mostrar todos los clientes");
        console.log("6. Salir");

        opcion = await preguntar("Seleccione una opcion: ");

        switch (opcion) {
            case "1":
                await registrarClientes();
                break;
            case "2":
                generarPila();
                break;
            case "3":
                generarCola();
                break;
            case "4":
                atenderCliente();
                break;
            case "5":
                mostrarClientes();
                break;
            case "6":
                console.log("Programa finalizado.");
                prompt.close();
                return;
            default:
                console.log("Opcion incorrecta.");
        }
    }
}

menu();
