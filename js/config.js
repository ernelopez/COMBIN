// config.js
export const ARCHIVO_TABLERO = 'assets/tablero.png';

export const ANCHO_PANTALLA = 1200;
export const ALTO_PANTALLA  = 750;

// Barras fijas (en px lógicos)
export const ALTO_BARRA_SUP = 80;
export const ALTO_BARRA_INF = 100;

export const RELACION_FONDO = 600 / 375;   // ancho / alto de fondo.png

// Flag: si es false, se anulan los encadenamientos de efectos
export const ENCADENAMIENTO_ACTIVO = true;

// Coordenadas en el sistema de la imagen (9921 x 7016).
// Array 1-indexado: [0] vacío, [1] = SALIDA, [60] = LLEGADA.
export const POSICIONES_CASILLAS = [
    null,                    // 0 (no se usa)
    { x: 1417, y: 6292 },    // 1  SALIDA
    { x: 2627, y: 6292 },    // 2
    { x: 3565, y: 6292 },    // 3  DESAFÍO
    { x: 4500, y: 6292 },    // 4  AVANZÁ 2! (2)
    { x: 5438, y: 6292 },    // 5  DESAFÍO
    { x: 6375, y: 6292 },    // 6
    { x: 7313, y: 6292 },    // 7  AVANZÁ AL SIGUIENTE DESAFÍO (11)
    { x: 8251, y: 6292 },    // 8
    { x: 9185, y: 6292 },    // 9  AVANZÁ 3! (6)
    { x: 9185, y: 5358 },    // 10
    { x: 9185, y: 4418 },    // 11 DESAFÍO
    { x: 9185, y: 3481 },    // 12
    { x: 9185, y: 2547 },    // 13
    { x: 9185, y: 1611 },    // 14 DESAFÍO
    { x: 9185, y: 677  },    // 15
    { x: 8251, y: 677  },    // 16
    { x: 7313, y: 677  },    // 17
    { x: 6375, y: 677  },    // 18 DESAFÍO
    { x: 5438, y: 677  },    // 19
    { x: 4500, y: 677  },    // 20 AVANZÁ 2! (2)
    { x: 3565, y: 677  },    // 21
    { x: 2627, y: 677  },    // 22 RETROCEDÉ 3!-2! (4)
    { x: 1699, y: 677  },    // 23 AVANZÁ 2! (2)
    { x: 1699, y: 1611 },    // 24 DESAFÍO
    { x: 1699, y: 2547 },    // 25
    { x: 1699, y: 3481 },    // 26 AVANZÁ 3! (6)
    { x: 1699, y: 4418 },    // 27 DESAFÍO
    { x: 1699, y: 5358 },    // 28
    { x: 2627, y: 5358 },    // 29 DESAFÍO
    { x: 3565, y: 5358 },    // 30
    { x: 4500, y: 5358 },    // 31
    { x: 5438, y: 5358 },    // 32
    { x: 6375, y: 5358 },    // 33 DESAFÍO
    { x: 7313, y: 5358 },    // 34 RETROCEDÉ 2! (2)
    { x: 8251, y: 5358 },    // 35
    { x: 8251, y: 4418 },    // 36 AVANZÁ 1! (1)
    { x: 8251, y: 3481 },    // 37
    { x: 8251, y: 2547 },    // 38 DESAFÍO
    { x: 8251, y: 1611 },    // 39 RETROCEDÉ 0! (1)
    { x: 7313, y: 1611 },    // 40
    { x: 6375, y: 1611 },    // 41 AVANZÁ 2! (2)
    { x: 5438, y: 1611 },    // 42 DESAFÍO
    { x: 4500, y: 1611 },    // 43
    { x: 3565, y: 1611 },    // 44 DESAFÍO
    { x: 2627, y: 1611 },    // 45
    { x: 2627, y: 2547 },    // 46 DESAFÍO
    { x: 2627, y: 3481 },    // 47 RETROCEDÉ 3! (6)
    { x: 2627, y: 4418 },    // 48 AVANZÁ AL SIGUIENTE DESAFÍO (51)
    { x: 3565, y: 4418 },    // 49
    { x: 4500, y: 4418 },    // 50 AVANZÁ 2! (2)
    { x: 5438, y: 4418 },    // 51 DESAFÍO
    { x: 6375, y: 4418 },    // 52
    { x: 7313, y: 4418 },    // 53
    { x: 7313, y: 3481 },    // 54 DESAFÍO
    { x: 7313, y: 2547 },    // 55
    { x: 6375, y: 2547 },    // 56
    { x: 5438, y: 2547 },    // 57 RETROCEDÉ 2! (2)
    { x: 4500, y: 2547 },    // 58
    { x: 3565, y: 2547 },    // 59 RETROCEDÉ AL ANTERIOR DESAFÍO (54)
    { x: 4969, y: 3481 },    // 60 LLEGADA
];

// --- Casillas especiales ---
export const CASILLAS_DESAFIO = [3, 5, 11, 14, 18, 24, 27, 29, 33, 38, 42, 44, 46, 51, 54];

// Avanzar N!  (casilla -> N)
export const CASILLAS_AVANZAR_FACTORIAL = {
    4: 2, 9: 3, 20: 2, 23: 2, 26: 3, 36: 1, 41: 2, 50: 2,
};

// Retroceder N!  (casilla -> N). N=0 => 0! = 1.
export const CASILLAS_RETROCEDER_FACTORIAL = {
    34: 2, 39: 0, 47: 3, 57: 2,
};

// Retroceder (a! - b!)  (casilla -> [a, b])
export const CASILLA_RETROCEDER_RESTA = {
    22: [3, 2],
};

// Retroceder al desafío anterior
export const CASILLA_RETROCEDER_ANTERIOR_DESAFIO = 59;

// Avanzar al siguiente desafío
export const CASILLAS_AVANZAR_SIGUIENTE_DESAFIO = [7, 48];

export const ULTIMA_CASILLA = 59;
export const CASILLA_LLEGADA = 60;

// Jugadores
export const MAX_JUGADORES = 6;
export const COLORES_JUGADORES = [
    '#c86464',
    '#3c6eb4',
    '#64c864',
    '#e0c832',
    '#c864dc',
    '#e09632',
];

// Assets
export const IMG_DADO = [
    'assets/dado_1.png',
    'assets/dado_2.png',
    'assets/dado_3.png',
    'assets/dado_4.png',
    'assets/dado_5.png',
    'assets/dado_6.png',
];
export const IMG_BOTON_AYUDA    = 'assets/boton_ayuda.png';
export const IMG_BOTON_RESET    = 'assets/boton_reset.png';
export const IMG_BOTON_LANZAR   = 'assets/boton_lanzar.png';
export const IMG_BAA            = 'assets/BAA2.png';
export const IMG_FONDO_DESAFIO = 'assets/fondo.png';
export const IMG_BOTON_RESPONDER = 'assets/boton_responder.png';

export const DURACION_MENSAJE_MS = 2500;

// Color del título dentro de la carta de desafío
export const COLOR_TITULO_DESAFIO = '#6b8e23';