// data/festivos.js

/**
 * Devuelve un Set de festivos de Colombia
 * entre dos años (inclusive)
 *
 * @param {number} desde
 * @param {number} hasta
 * @returns {Set<string>} YYYY-MM-DD
 */
export const FESTIVOS_POR_ANIO = {
        2014: ["2014-01-01","2014-01-06","2014-03-24","2014-04-17","2014-04-18","2014-05-01","2014-06-02","2014-06-23","2014-06-30","2014-07-20","2014-08-07","2014-08-18","2014-10-13","2014-11-03","2014-11-17","2014-12-08","2014-12-25"],

2019: ["2019-01-01","2019-01-07","2019-03-25","2019-04-18","2019-04-19","2019-05-01","2019-06-03","2019-06-24","2019-07-01","2019-07-20","2019-08-07","2019-08-19","2019-10-14","2019-11-04","2019-11-11","2019-12-08","2019-12-25"],

2020: ["2020-01-01","2020-01-06","2020-03-23","2020-04-09","2020-04-10","2020-05-01","2020-05-25","2020-06-15","2020-06-22","2020-06-29","2020-07-20","2020-08-07","2020-08-17","2020-10-12","2020-11-02","2020-11-16","2020-12-08","2020-12-25"],

2021: ["2021-01-01","2021-01-11","2021-03-22","2021-04-01","2021-04-02","2021-05-01","2021-05-17","2021-06-07","2021-06-14","2021-07-05","2021-07-20","2021-08-07","2021-08-16","2021-10-18","2021-11-01","2021-11-15","2021-12-08","2021-12-25"], // corregido: 08-07 (antes 08-09)

2022: ["2022-01-01","2022-01-10","2022-03-21","2022-04-14","2022-04-15","2022-05-01","2022-05-30","2022-06-20","2022-06-27","2022-07-04","2022-07-20","2022-08-07","2022-08-15","2022-10-17","2022-11-07","2022-11-14","2022-12-08","2022-12-25"], // corregido: 08-07 (antes 08-08)

2023: ["2023-01-01","2023-01-09","2023-03-20","2023-04-06","2023-04-07","2023-05-01","2023-05-22","2023-06-12","2023-06-19","2023-07-03","2023-07-20","2023-08-07","2023-08-21","2023-10-16","2023-11-06","2023-11-13","2023-12-08","2023-12-25"],

2024: ["2024-01-01","2024-01-08","2024-03-25","2024-03-28","2024-03-29","2024-05-01","2024-05-13","2024-06-03","2024-06-10","2024-07-01","2024-07-20","2024-08-07","2024-08-19","2024-10-14","2024-11-04","2024-11-11","2024-12-08","2024-12-25"],

2025: ["2025-01-01","2025-01-06","2025-03-24","2025-04-17","2025-04-18","2025-05-01","2025-06-02","2025-06-23","2025-06-30","2025-07-20","2025-08-07","2025-08-18","2025-10-13","2025-11-03","2025-11-17","2025-12-08","2025-12-25"], // eliminado: 07-07 (no existe)

2026: ["2026-01-01","2026-01-12","2026-03-23","2026-04-02","2026-04-03","2026-05-01","2026-05-18","2026-06-08","2026-06-15","2026-06-29","2026-07-13","2026-07-20","2026-08-07","2026-08-17","2026-10-12","2026-11-02","2026-11-16","2026-12-08","2026-12-25"], // corregido: 08-07 (antes 08-10); agregado: 07-13 (Ley 2578/2026, Virgen de Chiquinquirá)
       
    };

function dos(n) {
    return String(n).padStart(2, "0");
}

function ymd(fecha) {
    return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function fechaPascua(anio) {
    const a = anio % 19;
    const b = Math.floor(anio / 100);
    const c = anio % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = 1 + ((h + l - 7 * m + 114) % 31);

    return new Date(anio, mes - 1, dia);
}

function sumarDias(fecha, dias) {
    const nueva = new Date(fecha);
    nueva.setDate(nueva.getDate() + dias);
    return nueva;
}

function siguienteLunes(fecha) {
    const dia = fecha.getDay();
    if (dia === 1) return fecha;

    return sumarDias(fecha, (8 - dia) % 7);
}

function generarFestivosAnio(anio) {
    const pascua = fechaPascua(anio);
    const fechas = [
        new Date(anio, 0, 1),
        siguienteLunes(new Date(anio, 0, 6)),
        siguienteLunes(new Date(anio, 2, 19)),
        sumarDias(pascua, -3),
        sumarDias(pascua, -2),
        new Date(anio, 4, 1),
        siguienteLunes(sumarDias(pascua, 39)),
        siguienteLunes(sumarDias(pascua, 60)),
        siguienteLunes(sumarDias(pascua, 68)),
        siguienteLunes(new Date(anio, 5, 29)),
        new Date(anio, 6, 20),
        new Date(anio, 7, 7),
        siguienteLunes(new Date(anio, 7, 15)),
        siguienteLunes(new Date(anio, 9, 12)),
        siguienteLunes(new Date(anio, 10, 1)),
        siguienteLunes(new Date(anio, 10, 11)),
        new Date(anio, 11, 8),
        new Date(anio, 11, 25)
    ];

    // La Ley 2578 de 2026 incorporo esta fiesta al calendario nacional.
    if (anio >= 2026) {
        fechas.push(siguienteLunes(new Date(anio, 6, 9)));
    }

    return fechas.map(ymd);
}

export function generarFestivosCO(desde, hasta) {

    const festivos = new Set();

    for (let anio = desde; anio <= hasta; anio++) {
        const festivosAnio = FESTIVOS_POR_ANIO[anio] || generarFestivosAnio(anio);
        festivosAnio.forEach(f => festivos.add(f));
    }

    return festivos;
}

export function faltanFestivosEnRango(desde, hasta) {
    return [];
}

