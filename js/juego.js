// juego.js
import {
    ANCHO_PANTALLA, ALTO_PANTALLA,
    ALTO_BARRA_SUP, ALTO_BARRA_INF,
    POSICIONES_CASILLAS, ULTIMA_CASILLA, CASILLA_LLEGADA,
    CASILLAS_DESAFIO,
    CASILLAS_AVANZAR_FACTORIAL, CASILLAS_RETROCEDER_FACTORIAL,
    CASILLA_RETROCEDER_RESTA,
    CASILLA_RETROCEDER_ANTERIOR_DESAFIO,
    CASILLAS_AVANZAR_SIGUIENTE_DESAFIO,
    ENCADENAMIENTO_ACTIVO,
    ARCHIVO_TABLERO,
    MAX_JUGADORES, COLORES_JUGADORES,
    IMG_DADO, IMG_BOTON_AYUDA, IMG_BOTON_RESET, IMG_BOTON_RESPONDER,
    IMG_BOTON_LANZAR, IMG_BAA, IMG_FONDO_DESAFIO,
} from './config.js';
import { DESAFIOS } from './desafios.js';

// Colores generales
export const COLOR_FONDO       = '#282828';
export const COLOR_BOTON       = '#464646';
export const COLOR_BOTON_HOVER = '#646464';
export const COLOR_TEXTO_BOTON = '#ffffff';
export const COLOR_TEXTO       = '#ffffff';
export const COLOR_TITULO      = '#ffffc8';

// Pausa entre un efecto y el siguiente encadenado (ms)
const PAUSA_ENCADENAMIENTO = 1200;

// -------------------------------------------------
// Boton
// -------------------------------------------------
export class Boton {
    constructor(x, y, ancho, alto, texto,
                imagen = null,
                color = COLOR_BOTON,
                colorHover = COLOR_BOTON_HOVER) {
        this.x = x; this.y = y;
        this.ancho = ancho; this.alto = alto;
        this.texto = texto;
        this.imagen = imagen;
        this.color = color;
        this.colorHover = colorHover;
        this.activo = true;
        this.visible = true;
    }
    estaSobre(mx, my) {
        return mx >= this.x && mx <= this.x + this.ancho &&
               my >= this.y && my <= this.y + this.alto;
    }
    click(mx, my) {
        return this.activo && this.visible && this.estaSobre(mx, my);
    }
}

// -------------------------------------------------
// Utilidades
// -------------------------------------------------
function factorial(n) {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

// -------------------------------------------------
// Juego
// -------------------------------------------------
export class Juego {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.anchoPantalla = ANCHO_PANTALLA;
        this.altoPantalla  = ALTO_PANTALLA;
        this.escala = 1;

        // Input de nombres
        this.nombres = ['', '', '', '', '', ''];
        this.nombresIngresados = false;
        this.ingresandoNombre = 0;
        this.ultimoParpadeo = 0;
        this.mostrarCursor = true;

        // Partida
        this.partida = null;

        // Mensajes
        this.mensaje = "";
        this.mensajePersistente = false;
        this.tiempoMensaje = 0;
        this.mensajeColor = COLOR_TEXTO;

        // Carteles
        this.mostrarAyuda = false;

        // Desafío
        this.mostrarDesafio = false;
        this.desafioActual = null;
        this.desafioJugador = null;
        this.resultadoDesafio = null;
        this.tiempoResultadoDesafio = 0;
        this.inputNumerico = '';

        // Imágenes
        this.imgTableroOriginal = null;
        this.imgBaa = null;
        this.imgDado = [];
        this.imgBotonAyuda = null;
        this.imgBotonReset = null;
        this.imgBotonLanzar = null;
        this.imgFondoDesafio = null;
        this.imgBotonResponder = null;

        // Sonidos
        this.sonidoWin = null;
        this.sonidoClic = null;
        this.sonidoError = null;
        this.sonidoCoin = null;
        this.musicaFondo = null;
        this.sonidoDado = null;
        this.sonidoRetroceder = null;
        this.sonidoAvanzar = null;

        // Fuentes
        this.tamanoFuente = 20;
        this.tamanoFuenteGrande = 48;
        this.tamanoFuenteInput = 28;
        this.tamanoFuenteChica = 16;
        this.tamanoFuentePregunta = 40;

        // Botones
        this.botones = [];
        this.botonLanzar = null;
        this.botonAyuda = null;
        this.botonReiniciar = null;
        this.botonVF_Verdadero = null;
        this.botonVF_Falso = null;
        this.botonResponderNum = null;

        // Mouse
        this.mouseX = 0;
        this.mouseY = 0;
        this.mousePresionado = false;

        // Escala del tablero
        this.escalaTablero = 1;
        this.offsetTableroX = 0;
        this.offsetTableroY = 0;
        this.anchoTableroDib = 0;
        this.altoTableroDib  = 0;

        // Dado
        this.ultimoDado = null;
        this.animandoDado = false;
        this.tiempoInicioDado = 0;
        this.dadoMostrado = 1;

        // Animación de movimiento
        this.animandoFicha = false;
        this.casillaAnimActual = 0;
        this.casillaAnimDestino = 0;
        this.jugadorAnimIdx = -1;
        this.tiempoProxPaso = 0;
        this.pasoDuracion = 400;
        this.callbackFinMovimiento = null;

        // Cola de efectos (encadenamiento)
        this.colaEfectos = [];
        this.procesandoCola = false;

        // Desafíos
        this.mazoDesafios = [];

        // Control de input de nombres
        this.volverAInput = false;
    }

    async cargarRecursos() {
        const fontFace = new FontFace('Junegull', 'url(fonts/junegull.ttf)');
        await fontFace.load();
        document.fonts.add(fontFace);

        this.imgTableroOriginal = await this.cargarImagen(ARCHIVO_TABLERO);
        this.imgBaa = await this.cargarImagen(IMG_BAA);
        this.imgBotonAyuda  = await this.cargarImagen(IMG_BOTON_AYUDA);
        this.imgBotonReset  = await this.cargarImagen(IMG_BOTON_RESET);
        this.imgBotonLanzar = await this.cargarImagen(IMG_BOTON_LANZAR);
        this.imgFondoDesafio = await this.cargarImagen(IMG_FONDO_DESAFIO);
        this.imgBotonResponder = await this.cargarImagen(IMG_BOTON_RESPONDER);

        this.imgDado = [];
        for (const src of IMG_DADO) {
            this.imgDado.push(await this.cargarImagen(src));
        }

        this.sonidoWin        = new Audio('sonidos/win.mp3');
        this.sonidoClic       = new Audio('sonidos/clic.mp3');
        this.sonidoError      = new Audio('sonidos/error.mp3');
        this.sonidoCoin       = new Audio('sonidos/coin.mp3');
        this.musicaFondo      = new Audio('sonidos/loop.mp3');
        this.sonidoDado       = new Audio('sonidos/dado.mp3');
        this.sonidoRetroceder = new Audio('sonidos/retroceder.mp3');
        this.sonidoAvanzar    = new Audio('sonidos/avanzar.mp3');
        this.musicaFondo.loop = true;
    }

    cargarImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
            img.src = src;
        });
    }

    reproducirSonido(a) {
        if (!a) return;
        try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
    }
    iniciarMusica() { if (this.musicaFondo) this.musicaFondo.play().catch(() => {}); }
    detenerMusica() {
        if (this.musicaFondo) { this.musicaFondo.pause(); this.musicaFondo.currentTime = 0; }
    }

    // -------------------------------------------------
    // Escalado
    // -------------------------------------------------
    recalcularTamanos() {
        const escalaX = this.anchoPantalla / ANCHO_PANTALLA;
        const escalaY = this.altoPantalla  / ALTO_PANTALLA;
        this.escala = Math.min(escalaX, escalaY);

        this.tamanoFuente        = Math.max(12, Math.floor(22 * this.escala));
        this.tamanoFuenteGrande  = Math.max(16, Math.floor(42 * this.escala));
        this.tamanoFuenteInput   = Math.max(14, Math.floor(28 * this.escala));
        this.tamanoFuenteChica   = Math.max(10, Math.floor(16 * this.escala));
        this.tamanoFuentePregunta= Math.max(16, Math.floor(40 * this.escala));

        if (this.imgTableroOriginal) {
            const anchoImg = this.imgTableroOriginal.width;
            const altoImg  = this.imgTableroOriginal.height;

            const altoBarraSup = Math.floor(ALTO_BARRA_SUP * this.escala);
            const altoBarraInf = Math.floor(ALTO_BARRA_INF * this.escala);
            const margen = Math.floor(10 * this.escala);

            const disponibleAncho = this.anchoPantalla - margen * 2;
            const disponibleAlto  = this.altoPantalla - altoBarraSup - altoBarraInf - margen * 2;

            this.escalaTablero = Math.min(
                disponibleAncho / anchoImg,
                disponibleAlto  / altoImg
            );

            this.anchoTableroDib = anchoImg * this.escalaTablero;
            this.altoTableroDib  = altoImg  * this.escalaTablero;

            this.offsetTableroX = Math.floor((this.anchoPantalla - this.anchoTableroDib) / 2);
            this.offsetTableroY = altoBarraSup + margen
                + Math.floor((disponibleAlto - this.altoTableroDib) / 2);
        }
    }

    tableroA_canvas(pos) {
        return {
            x: this.offsetTableroX + pos.x * this.escalaTablero,
            y: this.offsetTableroY + pos.y * this.escalaTablero
        };
    }

    coordPantallaA_Juego(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (this.canvas.width  / rect.width);
        const y = (clientY - rect.top ) * (this.canvas.height / rect.height);
        return [x, y];
    }

    // -------------------------------------------------
    // Botones
    // -------------------------------------------------
    crearBotones() {
        this.botones = [];
        const esc = this.escala;
        const centroX = Math.floor(this.anchoPantalla / 2);

        // --- Barra superior ---
        const altoBarraSup = Math.floor(ALTO_BARRA_SUP * esc);
        const altoBotonSup = Math.floor(60 * esc);
        const margenIcono  = Math.floor(15 * esc);

        let anchoAyuda = altoBotonSup;
        if (this.imgBotonAyuda) {
            const ratio = this.imgBotonAyuda.width / this.imgBotonAyuda.height;
            anchoAyuda = Math.floor(altoBotonSup * ratio);
        }
        this.botonAyuda = new Boton(
            margenIcono,
            Math.floor((altoBarraSup - altoBotonSup) / 2),
            anchoAyuda, altoBotonSup,
            "AYUDA", this.imgBotonAyuda
        );
        this.botones.push(this.botonAyuda);

        let anchoReiniciar = altoBotonSup;
        if (this.imgBotonReset) {
            const ratio = this.imgBotonReset.width / this.imgBotonReset.height;
            anchoReiniciar = Math.floor(altoBotonSup * ratio);
        }
        this.botonReiniciar = new Boton(
            this.anchoPantalla - anchoReiniciar - margenIcono,
            Math.floor((altoBarraSup - altoBotonSup) / 2),
            anchoReiniciar, altoBotonSup,
            "REINICIAR", this.imgBotonReset
        );
        this.botones.push(this.botonReiniciar);

        // --- Botón Lanzar / Responder ---
        const anchoLanzar = Math.floor(200 * esc);
        const altoLanzar  = Math.floor(60 * esc);
        const desplazamientoIzq = Math.floor(50 * esc);

        let textoLanzar = "TIRAR DADO";
        let imagenLanzar = this.imgBotonLanzar;
        if (this.partida) {
            const idx = this.indiceJugadorActual();
            if (idx >= 0 && this.partida.debeResponderDesafio[idx]) {
                textoLanzar = "RESPONDER";
                imagenLanzar = this.imgBotonResponder || this.imgBotonLanzar;
            }
        }

        const altoBarraInf = Math.floor(ALTO_BARRA_INF * esc);
        const yBarraInf = this.altoPantalla - altoBarraInf;
        this.botonLanzar = new Boton(
            centroX - Math.floor(anchoLanzar / 2) - desplazamientoIzq,
            yBarraInf + Math.floor((altoBarraInf - altoLanzar) / 2),
            anchoLanzar, altoLanzar,
            textoLanzar, imagenLanzar
        );
        this.botones.push(this.botonLanzar);

        // --- Botones V/F y RESPONDER (desafío) ---
        const anchoModal = Math.floor(600 * esc);
        const altoModal  = Math.floor(anchoModal / (600 / 375));
        const xModal = Math.floor((this.anchoPantalla - anchoModal) / 2);
        const yModal = Math.floor((this.altoPantalla  - altoModal ) / 2);

        const anchoVF = Math.floor(200 * esc);
        const altoVF  = Math.floor(60  * esc);
        const sepVF   = Math.floor(30  * esc);
        const margenDebajo = Math.floor(25 * esc);
        const yVF = yModal + altoModal + margenDebajo;
        const centroXModal = xModal + Math.floor(anchoModal / 2);

        this.botonVF_Verdadero = new Boton(
            centroXModal - anchoVF - Math.floor(sepVF / 2),
            yVF,
            anchoVF, altoVF, "VERDADERO", null,
            '#32c832', '#3ce03c'
        );
        this.botonVF_Falso = new Boton(
            centroXModal + Math.floor(sepVF / 2),
            yVF,
            anchoVF, altoVF, "FALSO", null,
            '#c83232', '#e03c3c'
        );
        this.botonResponderNum = new Boton(
            centroXModal - Math.floor(anchoVF / 2),
            yVF,
            anchoVF, altoVF, "RESPONDER", null,
            '#3264c8', '#3c78e0'
        );
    }

    actualizarBotones() {
        if (!this.partida) {
            if (this.botonLanzar) this.botonLanzar.activo = false;
            return;
        }

        const idx = this.indiceJugadorActual();
        const debeResponder = idx >= 0 && this.partida.debeResponderDesafio[idx];

        this.botonLanzar.texto = debeResponder ? "RESPONDER" : "TIRAR DADO";
        this.botonLanzar.imagen = debeResponder
            ? (this.imgBotonResponder || this.imgBotonLanzar)
            : this.imgBotonLanzar;

        const bloqueado = this.partida.terminada
            || this.mostrarDesafio
            || this.animandoDado
            || this.animandoFicha
            || this.procesandoCola
            || (this.resultadoDesafio !== null);

        this.botonLanzar.activo = !bloqueado;
        this.botonReiniciar.activo = true;
        this.botonAyuda.activo = true;
    }

    // -------------------------------------------------
    // Input de nombres
    // -------------------------------------------------
    iniciarPartida() {
        const nombresFinales = [];
        for (let i = 0; i < MAX_JUGADORES; i++) {
            const n = this.nombres[i].trim();
            if (n) {
                nombresFinales.push({
                    nombre: n,
                    color: COLORES_JUGADORES[i],
                });
            }
        }

        if (nombresFinales.length < 2) {
            const usados = nombresFinales.length;
            for (let i = usados; i < 2; i++) {
                nombresFinales.push({
                    nombre: `Jugador ${i + 1}`,
                    color: COLORES_JUGADORES[i],
                });
            }
        }
        if (nombresFinales.length > MAX_JUGADORES) {
            nombresFinales.length = MAX_JUGADORES;
        }

        this.nombresIngresados = true;

        const orden = nombresFinales.map((_, i) => i);
        for (let i = orden.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [orden[i], orden[j]] = [orden[j], orden[i]];
        }

        this.partida = {
            jugadores: nombresFinales,
            orden: orden,
            turnoOrdenIdx: 0,
            posiciones: nombresFinales.map(() => 1),
            terminada: false,
            ganador: null,
            debeResponderDesafio: nombresFinales.map(() => false),
        };

        const primero = this.partida.jugadores[orden[0]];
        this.setMensaje(`¡Empieza ${primero.nombre}!`, primero.color, false);

        this.mazoDesafios = [...DESAFIOS];
        for (let i = this.mazoDesafios.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.mazoDesafios[i], this.mazoDesafios[j]] =
            [this.mazoDesafios[j], this.mazoDesafios[i]];
        }

        this.colaEfectos = [];
        this.procesandoCola = false;
        this.inputNumerico = '';
        this.actualizarBotones();
    }

    jugadorActual() {
        if (!this.partida) return null;
        return this.partida.jugadores[this.partida.orden[this.partida.turnoOrdenIdx]];
    }
    indiceJugadorActual() {
        if (!this.partida) return -1;
        return this.partida.orden[this.partida.turnoOrdenIdx];
    }

    // -------------------------------------------------
    // Teclado
    // -------------------------------------------------
    procesarTeclaInput(evento) {
        if (evento.key === 'Enter') {
            this.iniciarPartida();
            return false;
        } else if (evento.key === 'Tab') {
            evento.preventDefault();
            if (evento.shiftKey) {
                this.ingresandoNombre =
                    (this.ingresandoNombre - 1 + MAX_JUGADORES) % MAX_JUGADORES;
            } else {
                this.ingresandoNombre =
                    (this.ingresandoNombre + 1) % MAX_JUGADORES;
            }
            return true;
        } else if (evento.key === 'Backspace') {
            if (this.ingresandoNombre >= 0) {
                this.nombres[this.ingresandoNombre] =
                    this.nombres[this.ingresandoNombre].slice(0, -1);
            }
        } else if (evento.key.length === 1) {
            if (this.ingresandoNombre >= 0) {
                if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ ]$/.test(evento.key)) {
                    this.nombres[this.ingresandoNombre] += evento.key;
                }
            }
        }
        return true;
    }

    procesarClickInput(x, y) {
        for (let i = 0; i < MAX_JUGADORES; i++) {
            const rect = this.rectInput(i);
            if (x >= rect.x && x <= rect.x + rect.w &&
                y >= rect.y && y <= rect.y + rect.h) {
                this.ingresandoNombre = i;
                return;
            }
        }
    }

    rectInput(i) {
        const esc = this.escala;
        const centroX = Math.floor(this.anchoPantalla / 2);
        const altoCaja = Math.floor(50 * esc);
        const anchoCaja = Math.floor(350 * esc);
        const sep = Math.floor(12 * esc);
        const totalAlto = MAX_JUGADORES * altoCaja + (MAX_JUGADORES - 1) * sep;
        const yInicio = Math.floor((this.altoPantalla - totalAlto) / 2) + Math.floor(40 * esc);
        return {
            x: centroX - Math.floor(anchoCaja / 2),
            y: yInicio + i * (altoCaja + sep),
            w: anchoCaja,
            h: altoCaja
        };
    }

    // -------------------------------------------------
    // Click de juego
    // -------------------------------------------------
    procesarClickJuego(x, y) {
        if (this.mostrarDesafio) {
            if (this.desafioActual && this.desafioActual.tipo === 'vf') {
                if (this.botonVF_Verdadero.click(x, y)) this.responderDesafio(true);
                else if (this.botonVF_Falso.click(x, y)) this.responderDesafio(false);
            } else if (this.desafioActual && this.desafioActual.tipo === 'num') {
                if (this.botonResponderNum.click(x, y)) this.confirmarRespuestaNumerica();
            }
            return;
        }
        if (this.botonLanzar.click(x, y)) { this.accionPrincipal(); return; }
        if (this.botonReiniciar.click(x, y)) { this.reiniciarPartida(); return; }
        if (this.botonAyuda.click(x, y)) { this.mostrarAyuda = !this.mostrarAyuda; return; }
    }

    procesarTeclaJuego(evento) {
        if (this.mostrarAyuda && evento.key === 'Enter') {
            this.mostrarAyuda = false;
            return;
        }

        if (this.mostrarDesafio && this.desafioActual && this.desafioActual.tipo === 'num') {
            if (evento.key === 'Enter') {
                this.confirmarRespuestaNumerica();
            } else if (evento.key === 'Backspace') {
                this.inputNumerico = this.inputNumerico.slice(0, -1);
            } else if (/^[0-9]$/.test(evento.key)) {
                if (this.inputNumerico.length < 6) {
                    this.inputNumerico += evento.key;
                }
            }
        }
    }

    // -------------------------------------------------
    // Acción principal
    // -------------------------------------------------
    accionPrincipal() {
        if (!this.partida || this.partida.terminada) return;
        if (this.animandoDado || this.animandoFicha || this.procesandoCola) return;
        if (this.mostrarDesafio || this.resultadoDesafio !== null) return;

        const idx = this.indiceJugadorActual();
        if (idx < 0) return;

        if (this.partida.debeResponderDesafio[idx]) {
            this.iniciarDesafio(idx);
        } else {
            this.lanzarDado();
        }
    }

    lanzarDado() {
        this.limpiarMensaje();
        this.reproducirSonido(this.sonidoDado);
        this.animandoDado = true;
        this.tiempoInicioDado = Date.now();
        this.dadoMostrado = 1;
        this.ultimoDado = null;
        this.actualizarBotones();
    }

    reiniciarPartida() {
        this.partida = null;
        this.nombresIngresados = false;
        this.ingresandoNombre = 0;
        this.nombres = ['', '', '', '', '', ''];
        this.mostrarDesafio = false;
        this.mostrarAyuda = false;
        this.desafioActual = null;
        this.mensaje = "";
        this.mensajePersistente = false;
        this.ultimoDado = null;
        this.animandoDado = false;
        this.animandoFicha = false;
        this.jugadorAnimIdx = -1;
        this.callbackFinMovimiento = null;
        this.volverAInput = true;
        this.resultadoDesafio = null;
        this.desafioJugador = null;
        this.inputNumerico = '';
        this.colaEfectos = [];
        this.procesandoCola = false;
        this.actualizarBotones();
        this.iniciarMusica();
    }

    // -------------------------------------------------
    // Loop de animaciones
    // -------------------------------------------------
    actualizarAnimaciones() {
        const ahora = Date.now();

        // --- Animación del dado ---
        if (this.animandoDado) {
            const transcurrido = ahora - this.tiempoInicioDado;
            const DURACION_DADO = 500;

            if (transcurrido < DURACION_DADO) {
                const cara = 1 + Math.floor((transcurrido / 60) % 6);
                this.dadoMostrado = cara;
            } else {
                this.ultimoDado = 1 + Math.floor(Math.random() * 6);
                this.dadoMostrado = this.ultimoDado;
                this.animandoDado = false;

                //const j = this.jugadorActual();
                //this.setMensaje(`¡Sacaste ${this.ultimoDado}!`, j.color, true);

                const idx = this.indiceJugadorActual();
                const posActual = this.partida.posiciones[idx];
                const posDestino = Math.min(posActual + this.ultimoDado, CASILLA_LLEGADA);

                if (posDestino === posActual) {
                    this.finalizarTurno();
                } else {
                    setTimeout(() => {
                        if (!this.partida || this.partida.terminada) return;
                        this.encolarMovimiento(idx, posDestino, () => {
                            if (this.partida.posiciones[idx] >= CASILLA_LLEGADA) {
                                this.declararGanador(idx);
                                return;
                            }
                            setTimeout(() => {
                                if (!this.partida || this.partida.terminada) return;
                                this.encolarEfectoCasilla(idx, this.partida.posiciones[idx]);
                                this.procesandoCola = false;
                                this.procesarCola();
                            }, PAUSA_ENCADENAMIENTO);
                        });
                        this.procesandoCola = false;
                        this.procesarCola();
                    }, PAUSA_ENCADENAMIENTO);
                }
            }
            return;
        }

        // --- Animación de la ficha ---
        if (this.animandoFicha) {
            if (ahora >= this.tiempoProxPaso) {
                const paso = (this.casillaAnimActual < this.casillaAnimDestino) ? +1 : -1;

                if ((paso > 0 && this.casillaAnimActual < this.casillaAnimDestino) ||
                    (paso < 0 && this.casillaAnimActual > this.casillaAnimDestino)) {
                    this.casillaAnimActual += paso;
                    this.partida.posiciones[this.jugadorAnimIdx] = this.casillaAnimActual;

                    if (this.casillaAnimActual !== this.casillaAnimDestino) {
                        this.tiempoProxPaso = ahora + this.pasoDuracion;
                    } else {
                        this.animandoFicha = false;
                        const cb = this.callbackFinMovimiento;
                        this.callbackFinMovimiento = null;
                        if (cb) cb();
                    }
                }
            }
        }
    }

    // -------------------------------------------------
    // Cola de efectos
    // -------------------------------------------------
    encolarMovimiento(idx, destino, callback) {
        this.colaEfectos.push({ tipo: 'movimiento', idx, destino, callback });
    }

    encolarEfectoCasilla(idx, pos) {
        this.colaEfectos.push({ tipo: 'efectoCasilla', idx, pos });
    }

    procesarCola() {
        if (this.procesandoCola) return;
        if (this.colaEfectos.length === 0) {
            this.finalizarTurno();
            return;
        }
        this.procesandoCola = true;
        const item = this.colaEfectos.shift();
        this.ejecutarItemCola(item);
    }

    ejecutarItemCola(item) {
        if (!this.partida || this.partida.terminada) {
            this.procesandoCola = false;
            this.colaEfectos = [];
            return;
        }

        if (item.tipo === 'movimiento') {
            const posActual = this.partida.posiciones[item.idx];
            if (posActual === item.destino) {
                this.procesandoCola = false;
                if (item.callback) item.callback();
                else this.procesarCola();
                return;
            }
            this.animandoFicha = true;
            this.jugadorAnimIdx = item.idx;
            this.casillaAnimActual = posActual;
            this.casillaAnimDestino = item.destino;
            this.tiempoProxPaso = Date.now() + 300;
            this.callbackFinMovimiento = () => {
                this.procesandoCola = false;
                if (item.callback) item.callback();
                else this.procesarCola();
            };
            this.actualizarBotones();
            return;
        }

        if (item.tipo === 'efectoCasilla') {
            this.procesandoCola = false;
            this.aplicarEfectoCasilla(item.idx, item.pos);
            return;
        }
    }

    aplicarEfectoCasilla(idx, pos) {
        const jugador = this.partida.jugadores[idx];

        // --- DESAFÍO ---
        if (CASILLAS_DESAFIO.includes(pos)) {
            this.iniciarDesafio(idx);
            return;
        }

        // --- AVANZÁ N! ---
        if (CASILLAS_AVANZAR_FACTORIAL[pos] !== undefined) {
            const n = CASILLAS_AVANZAR_FACTORIAL[pos];
            const pasos = factorial(n);
            const destino = Math.min(pos + pasos, CASILLA_LLEGADA);
            this.setMensaje(`${n}! es ${pasos}. Avanzás ${pasos} casilla${pasos === 1 ? '' : 's'}.`, jugador.color, true);
            this.reproducirSonido(this.sonidoAvanzar);
            setTimeout(() => {
                if (!this.partida || this.partida.terminada) return;
                this.encolarMovimiento(idx, destino, () => {
                    if (this.partida.posiciones[idx] >= CASILLA_LLEGADA) {
                        this.declararGanador(idx);
                        return;
                    }
                    setTimeout(() => {
                        if (!this.partida || this.partida.terminada) return;
                        if (ENCADENAMIENTO_ACTIVO) {
                            this.encolarEfectoCasilla(idx, this.partida.posiciones[idx]);
                        }
                        this.procesandoCola = false;
                        this.procesarCola();
                    }, PAUSA_ENCADENAMIENTO);
                });
                this.procesandoCola = false;
                this.procesarCola();
            }, PAUSA_ENCADENAMIENTO);
            return;
        }

        // --- RETROCEDÉ N! ---
        if (CASILLAS_RETROCEDER_FACTORIAL[pos] !== undefined) {
            const n = CASILLAS_RETROCEDER_FACTORIAL[pos];
            const pasos = factorial(n);
            const destino = Math.max(1, pos - pasos);
            this.setMensaje(`${n}! es ${pasos}. Retrocedés ${pasos} casilla${pasos === 1 ? '' : 's'}.`, jugador.color, true);
            this.reproducirSonido(this.sonidoRetroceder);
            setTimeout(() => {
                if (!this.partida || this.partida.terminada) return;
                this.encolarMovimiento(idx, destino, () => {
                    setTimeout(() => {
                        if (!this.partida || this.partida.terminada) return;
                        if (ENCADENAMIENTO_ACTIVO) {
                            this.encolarEfectoCasilla(idx, this.partida.posiciones[idx]);
                        }
                        this.procesandoCola = false;
                        this.procesarCola();
                    }, PAUSA_ENCADENAMIENTO);
                });
                this.procesandoCola = false;
                this.procesarCola();
            }, PAUSA_ENCADENAMIENTO);
            return;
        }

        // --- RETROCEDÉ a!-b! ---
        if (CASILLA_RETROCEDER_RESTA[pos] !== undefined) {
            const [a, b] = CASILLA_RETROCEDER_RESTA[pos];
            const fa = factorial(a);
            const fb = factorial(b);
            const pasos = fa - fb;
            const destino = Math.max(1, pos - pasos);
            this.setMensaje(`${a}!-${b}! es ${fa}-${fb}=${pasos}. Retrocedés ${pasos} casilla${pasos === 1 ? '' : 's'}.`, jugador.color, true);
            this.reproducirSonido(this.sonidoRetroceder);
            setTimeout(() => {
                if (!this.partida || this.partida.terminada) return;
                this.encolarMovimiento(idx, destino, () => {
                    setTimeout(() => {
                        if (!this.partida || this.partida.terminada) return;
                        if (ENCADENAMIENTO_ACTIVO) {
                            this.encolarEfectoCasilla(idx, this.partida.posiciones[idx]);
                        }
                        this.procesandoCola = false;
                        this.procesarCola();
                    }, PAUSA_ENCADENAMIENTO);
                });
                this.procesandoCola = false;
                this.procesarCola();
            }, PAUSA_ENCADENAMIENTO);
            return;
        }

        // --- RETROCEDÉ AL ANTERIOR DESAFÍO ---
        if (pos === CASILLA_RETROCEDER_ANTERIOR_DESAFIO) {
            const anteriores = CASILLAS_DESAFIO.filter(c => c < pos);
            const destino = anteriores.length > 0 ? anteriores[anteriores.length - 1] : 1;
            this.setMensaje(`${jugador.nombre} retrocede al desafío de la casilla ${destino}.`, jugador.color, true);
            this.reproducirSonido(this.sonidoRetroceder);
            setTimeout(() => {
                if (!this.partida || this.partida.terminada) return;
                this.encolarMovimiento(idx, destino, () => {
                    setTimeout(() => {
                        if (!this.partida || this.partida.terminada) return;
                        if (ENCADENAMIENTO_ACTIVO) {
                            this.encolarEfectoCasilla(idx, this.partida.posiciones[idx]);
                        }
                        this.procesandoCola = false;
                        this.procesarCola();
                    }, PAUSA_ENCADENAMIENTO);
                });
                this.procesandoCola = false;
                this.procesarCola();
            }, PAUSA_ENCADENAMIENTO);
            return;
        }

        // --- AVANZÁ AL SIGUIENTE DESAFÍO ---
        if (CASILLAS_AVANZAR_SIGUIENTE_DESAFIO.includes(pos)) {
            const siguientes = CASILLAS_DESAFIO.filter(c => c > pos);
            const destino = siguientes.length > 0 ? siguientes[0] : CASILLA_LLEGADA;
            this.setMensaje(`${jugador.nombre} avanza al desafío de la casilla ${destino}.`, jugador.color, true);
            this.reproducirSonido(this.sonidoAvanzar);
            setTimeout(() => {
                if (!this.partida || this.partida.terminada) return;
                this.encolarMovimiento(idx, destino, () => {
                    setTimeout(() => {
                        if (!this.partida || this.partida.terminada) return;
                        if (ENCADENAMIENTO_ACTIVO) {
                            this.encolarEfectoCasilla(idx, this.partida.posiciones[idx]);
                        }
                        this.procesandoCola = false;
                        this.procesarCola();
                    }, PAUSA_ENCADENAMIENTO);
                });
                this.procesandoCola = false;
                this.procesarCola();
            }, PAUSA_ENCADENAMIENTO);
            return;
        }

        // --- Casilla común ---
        this.procesandoCola = false;
        this.finalizarTurno();
    }

    // -------------------------------------------------
    // Desafíos
    // -------------------------------------------------
    iniciarDesafio(idx) {
        this.desafioActual = this.sacarCartaDesafio();
        this.desafioJugador = idx;
        this.mostrarDesafio = true;
        this.resultadoDesafio = null;
        this.inputNumerico = '';
        this.procesandoCola = true;
        this.actualizarBotones();
    }

    sacarCartaDesafio() {
        if (this.mazoDesafios.length === 0) {
            this.mazoDesafios = [...DESAFIOS];
            for (let i = this.mazoDesafios.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.mazoDesafios[i], this.mazoDesafios[j]] =
                [this.mazoDesafios[j], this.mazoDesafios[i]];
            }
        }
        return this.mazoDesafios.pop();
    }

    confirmarRespuestaNumerica() {
        if (!this.desafioActual || this.desafioActual.tipo !== 'num') return;
        if (this.inputNumerico === '') return;
        const val = parseInt(this.inputNumerico, 10);
        this.responderDesafio(val);
    }

        responderDesafio(respuestaDada) {
        if (!this.desafioActual) return;

        const carta = this.desafioActual;
        const idx = this.desafioJugador;
        const correcto = (respuestaDada === carta.respuesta);

        this.mostrarDesafio = false;
        this.resultadoDesafio = correcto ? 'correcto' : 'incorrecto';
        this.tiempoResultadoDesafio = Date.now();
        this.reproducirSonido(correcto ? this.sonidoCoin : this.sonidoError);

        const DURACION_RESULTADO = 1200;
        setTimeout(() => {
            if (!this.partida || this.partida.terminada) return;
            this.resultadoDesafio = null;

            if (correcto) {
                this.partida.debeResponderDesafio[idx] = false;

                const premio = carta.premio;
                const posActual = this.partida.posiciones[idx];
                const destino = Math.min(posActual + premio, CASILLA_LLEGADA);
                const jugador = this.partida.jugadores[idx];

                this.setMensaje(`¡Correcto! Avanzás ${premio} casilla${premio === 1 ? '' : 's'}.`, jugador.color, true);

                setTimeout(() => {
                    if (!this.partida || this.partida.terminada) return;
                    this.encolarMovimiento(idx, destino, () => {
                        if (this.partida.posiciones[idx] >= CASILLA_LLEGADA) {
                            this.declararGanador(idx);
                            return;
                        }
                        setTimeout(() => {
                            if (!this.partida || this.partida.terminada) return;
                            if (ENCADENAMIENTO_ACTIVO) {
                                this.encolarEfectoCasilla(idx, this.partida.posiciones[idx]);
                            }
                            this.procesandoCola = false;
                            this.procesarCola();
                        }, PAUSA_ENCADENAMIENTO);
                    });
                    this.procesandoCola = false;
                    this.procesarCola();
                }, PAUSA_ENCADENAMIENTO);
            } else {
                this.partida.debeResponderDesafio[idx] = true;
                const jugador = this.partida.jugadores[idx];
                this.setMensaje(`${jugador.nombre} no acertó. En su próximo turno vuelve a responder.`, jugador.color, true);
                this.procesandoCola = false;
                this.colaEfectos = [];
                this.finalizarTurno();
            }
        }, DURACION_RESULTADO);
    }

    // -------------------------------------------------
    // Turnos y victoria
    // -------------------------------------------------
    finalizarTurno() {
        if (!this.partida || this.partida.terminada) return;
        this.limpiarMensaje();

        const n = this.partida.orden.length;
        this.partida.turnoOrdenIdx = (this.partida.turnoOrdenIdx + 1) % n;

        this.colaEfectos = [];
        this.procesandoCola = false;
        this.actualizarBotones();
    }

    declararGanador(idx) {
        this.partida.terminada = true;
        this.partida.ganador = this.partida.jugadores[idx];
        this.reproducirSonido(this.sonidoWin);
        this.setMensaje(`¡${this.partida.ganador.nombre} GANÓ!`, this.partida.ganador.color, true);
        this.colaEfectos = [];
        this.procesandoCola = false;
        this.actualizarBotones();
    }

    setMensaje(texto, color, persistente = false) {
        this.mensaje = texto;
        this.mensajeColor = color;
        this.tiempoMensaje = Date.now();
        this.mensajePersistente = persistente;
    }

    limpiarMensaje() {
        this.mensaje = "";
        this.mensajePersistente = false;
    }
}