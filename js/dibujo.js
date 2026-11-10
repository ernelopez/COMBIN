// dibujo.js
import {
    Juego, COLOR_FONDO, COLOR_TEXTO, COLOR_TITULO,
    COLOR_TEXTO_BOTON,
} from './juego.js';
import {
    POSICIONES_CASILLAS, ALTO_BARRA_SUP, ALTO_BARRA_INF,
    MAX_JUGADORES, COLORES_JUGADORES, DURACION_MENSAJE_MS, RELACION_FONDO,
    COLOR_TITULO_DESAFIO,
} from './config.js';

function medirTexto(ctx, texto, fuente) {
    ctx.font = fuente;
    return ctx.measureText(texto).width;
}

function dibujarTexto(ctx, texto, x, y, fuente, color, centrado = false) {
    ctx.font = fuente;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(texto);
    const alto = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const offsetY = m.actualBoundingBoxAscent - alto / 2;
    const yAjust = y + offsetY;
    if (centrado) {
        const ancho = ctx.measureText(texto).width;
        ctx.fillText(texto, x - ancho / 2, yAjust);
    } else {
        ctx.fillText(texto, x, yAjust);
    }
}

// -------------------------------------------------
// Pantalla de input
// -------------------------------------------------
Juego.prototype.dibujarInputNombres = function() {
    const ctx = this.ctx;
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const centroX = Math.floor(this.anchoPantalla / 2);
    const esc = this.escala;
    const fuenteTitulo = `${this.tamanoFuenteGrande}px Junegull`;
    const fuenteInput  = `${this.tamanoFuenteInput}px Junegull`;

    dibujarTexto(ctx, "El juego de la combinatoria", centroX,
                 Math.floor(60 * esc),
                 fuenteTitulo, COLOR_TITULO, true);
    dibujarTexto(ctx, "Ingresá los nombres (2 a 6 jugadores).",
                 centroX, Math.floor(110 * esc),
                 fuenteInput, '#ffffff', true);

    const ahora = Date.now();
    if (ahora - this.ultimoParpadeo > 500) {
        this.mostrarCursor = !this.mostrarCursor;
        this.ultimoParpadeo = ahora;
    }

    for (let i = 0; i < MAX_JUGADORES; i++) {
        const rect = this.rectInput(i);
        const colorJ = COLORES_JUGADORES[i];

        dibujarTexto(ctx, `Jugador ${i + 1}:`,
                     rect.x - Math.floor(140 * esc),
                     rect.y + Math.floor(rect.h / 2),
                     fuenteInput, colorJ);

        ctx.strokeStyle = (this.ingresandoNombre === i) ? '#c8c8c8' : '#505050';
        ctx.lineWidth = (this.ingresandoNombre === i) ? 3 : 2;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

        dibujarTexto(ctx, this.nombres[i],
                     rect.x + Math.floor(15 * esc),
                     rect.y + Math.floor(rect.h / 2),
                     fuenteInput, colorJ);

        if (this.ingresandoNombre === i && this.mostrarCursor) {
            const anchoTexto = medirTexto(ctx, this.nombres[i], fuenteInput);
            ctx.strokeStyle = colorJ;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rect.x + Math.floor(15 * esc) + anchoTexto + 2,
                       rect.y + Math.floor(8 * esc));
            ctx.lineTo(rect.x + Math.floor(15 * esc) + anchoTexto + 2,
                       rect.y + rect.h - Math.floor(8 * esc));
            ctx.stroke();
        }
    }

    dibujarTexto(ctx, "Presioná ENTER para comenzar.",
                 centroX, this.altoPantalla - Math.floor(50 * esc),
                 fuenteInput, '#c8c8c8', true);

    if (this.imgBaa) {
        const escalaBaa = 0.4 * esc;
        const anchoBaa = Math.floor(this.imgBaa.width  * escalaBaa);
        const altoBaa  = Math.floor(this.imgBaa.height * escalaBaa);
        ctx.drawImage(this.imgBaa,
                      this.anchoPantalla - anchoBaa - Math.floor(20 * esc),
                      this.altoPantalla - altoBaa  - Math.floor(20 * esc),
                      anchoBaa, altoBaa);
    }
};

// -------------------------------------------------
// Botones
// -------------------------------------------------
Juego.prototype.dibujarBoton = function(boton) {
    if (!boton || !boton.visible) return;
    const ctx = this.ctx;

    if (boton.imagen) {
        ctx.save();
        if (!boton.activo) ctx.globalAlpha = 0.4;
        ctx.drawImage(boton.imagen, boton.x, boton.y, boton.ancho, boton.alto);
        ctx.restore();

        if (boton.texto) {
            const fuente = `${Math.floor(26 * this.escala)}px Junegull`;
            const colorTexto = boton.activo ? COLOR_TEXTO_BOTON : '#808080';
            const offsetX = Math.floor(2 * this.escala);
            const offsetY = Math.floor(3 * this.escala);
            dibujarTexto(ctx, boton.texto,
                         boton.x + boton.ancho / 2 - offsetX,
                         boton.y + boton.alto / 2 - offsetY,
                         fuente, colorTexto, true);
        }
    } else {
        const sobre = boton.estaSobre(this.mouseX, this.mouseY);
        ctx.fillStyle = boton.activo
            ? (sobre ? boton.colorHover : boton.color)
            : '#2a2a2a';
        ctx.fillRect(boton.x, boton.y, boton.ancho, boton.alto);
        ctx.strokeStyle = '#969696';
        ctx.lineWidth = 2;
        ctx.strokeRect(boton.x, boton.y, boton.ancho, boton.alto);

        if (boton.texto) {
            const fuente = `${Math.floor(24 * this.escala)}px Junegull`;
            const colorTexto = boton.activo ? COLOR_TEXTO_BOTON : '#808080';
            dibujarTexto(ctx, boton.texto,
                         boton.x + boton.ancho / 2,
                         boton.y + boton.alto / 2,
                         fuente, colorTexto, true);
        }
    }
};

Juego.prototype.dibujarBotones = function() {
    for (const b of this.botones) this.dibujarBoton(b);
};

// -------------------------------------------------
// Tablero + fichas
// -------------------------------------------------
Juego.prototype.dibujarTablero = function() {
    const ctx = this.ctx;
    if (this.imgTableroOriginal) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(this.imgTableroOriginal,
                      this.offsetTableroX, this.offsetTableroY,
                      this.anchoTableroDib, this.altoTableroDib);
    }
};

Juego.prototype.dibujarFichasJugadores = function() {
    if (!this.partida) return;
    const ctx = this.ctx;

    const radio = Math.max(10, Math.floor(16 * this.escala));
    const fuenteInicial = `${Math.max(10, Math.floor(16 * this.escala))}px Junegull`;

    const grupos = {};
    for (let i = 0; i < this.partida.posiciones.length; i++) {
        const c = this.partida.posiciones[i];
        if (!grupos[c]) grupos[c] = [];
        grupos[c].push(i);
    }

    for (const casillaIdx in grupos) {
        const indices = grupos[casillaIdx];
        const pos = POSICIONES_CASILLAS[Number(casillaIdx)];
        if (!pos) continue;
        const p = this.tableroA_canvas(pos);

        const N = indices.length;
        for (let k = 0; k < N; k++) {
            const i = indices[k];
            let ox = 0, oy = 0;
            if (N > 1) {
                const ang = (2 * Math.PI * k) / N - Math.PI / 2;
                const dist = radio * 0.9;
                ox = Math.cos(ang) * dist;
                oy = Math.sin(ang) * dist;
            }
            const cx = p.x + ox;
            const cy = p.y + oy;
            const jugador = this.partida.jugadores[i];

            ctx.beginPath();
            ctx.arc(cx, cy, radio, 0, Math.PI * 2);
            ctx.fillStyle = jugador.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            dibujarTexto(ctx, jugador.nombre.charAt(0).toUpperCase(),
                         cx, cy,
                         fuenteInicial, '#ffffff', true);
        }
    }
};

// -------------------------------------------------
// Barra superior
// -------------------------------------------------
Juego.prototype.dibujarBarraSuperior = function() {
    const ctx = this.ctx;
    const esc = this.escala;
    const alto = Math.floor(ALTO_BARRA_SUP * esc);

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, alto);

    this.dibujarBoton(this.botonAyuda);
    this.dibujarBoton(this.botonReiniciar);

    if (this.partida && !this.partida.terminada) {
        const j = this.jugadorActual();
        const fuenteTurno = `${Math.floor(this.tamanoFuenteGrande * 1.3)}px Junegull`;
        dibujarTexto(ctx, `Turno: ${j.nombre}`,
                     this.anchoPantalla / 2,
                     Math.floor(alto / 2),
                     fuenteTurno, j.color, true);
    } else if (this.partida && this.partida.terminada) {
        const fuenteTurno = `${this.tamanoFuenteGrande}px Junegull`;
        const ganador = this.partida.ganador;
        dibujarTexto(ctx, `¡${ganador.nombre} GANÓ!`,
                     this.anchoPantalla / 2,
                     Math.floor(alto / 2),
                     fuenteTurno, ganador.color, true);
    }
};

// -------------------------------------------------
// Barra inferior
// -------------------------------------------------
Juego.prototype.dibujarBarraInferior = function() {
    const ctx = this.ctx;
    const esc = this.escala;
    const alto = Math.floor(ALTO_BARRA_INF * esc);
    const y = this.altoPantalla - alto;

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, y, this.anchoPantalla, alto);

    if (this.imgBaa) {
        const escalaBaa = 0.25 * esc;
        const w = Math.floor(this.imgBaa.width  * escalaBaa);
        const h = Math.floor(this.imgBaa.height * escalaBaa);
        const subirLogo = Math.floor(6 * esc);
        ctx.drawImage(this.imgBaa,
                      Math.floor(15 * esc),
                      y + Math.floor((alto - h) / 2) - subirLogo,
                      w, h);
    }

    const mostrarMensaje = this.mensaje && (
        this.mensajePersistente ||
        (Date.now() - this.tiempoMensaje < DURACION_MENSAJE_MS)
    );

    if (this.botonLanzar) {
        this.botonLanzar.visible = !mostrarMensaje;
        this.dibujarBoton(this.botonLanzar);
    }

    const caraVisible = this.animandoDado
        ? this.dadoMostrado
        : this.ultimoDado;
    const idxActual = this.partida ? this.indiceJugadorActual() : -1;
    const debeResponder = idxActual >= 0 && this.partida.debeResponderDesafio[idxActual];
    if (!mostrarMensaje && !debeResponder && caraVisible && this.imgDado[caraVisible - 1]) {
        const tamDado = Math.floor(70 * esc);
        const xDado = this.botonLanzar.x + this.botonLanzar.ancho + Math.floor(15 * esc);
        const yDado = this.botonLanzar.y + Math.floor((this.botonLanzar.alto - tamDado) / 2);
        ctx.drawImage(this.imgDado[caraVisible - 1], xDado, yDado, tamDado, tamDado);
    }

    //const mostrarMensaje = this.mensaje && (
    //    this.mensajePersistente ||
    //    (Date.now() - this.tiempoMensaje < DURACION_MENSAJE_MS)
    //);
    if (mostrarMensaje) {
        const fuenteMsg = `${Math.floor(this.tamanoFuenteGrande * 0.8)}px Junegull`;
        dibujarTexto(ctx, this.mensaje,
                     this.anchoPantalla / 2,
                     y + Math.floor(alto / 2),
                     fuenteMsg, this.mensajeColor, true);
    }

    if (this.partida) {
        const nJug = this.partida.orden.length;

        let fuentePx;
        let salto;
        if (nJug === 2)      { fuentePx = Math.floor(32 * esc); salto = Math.floor(32 * esc); }
        else if (nJug === 3) { fuentePx = Math.floor(28 * esc); salto = Math.floor(27 * esc); }
        else if (nJug === 4) { fuentePx = Math.floor(22 * esc); salto = Math.floor(22 * esc); }
        else if (nJug === 5) { fuentePx = Math.floor(17 * esc); salto = Math.floor(18 * esc); }
        else                 { fuentePx = Math.floor(15 * esc); salto = Math.floor(14 * esc); }
        const fuente = `${fuentePx}px Junegull`;

        const altoBloque = salto * nJug;
        const margenSup = Math.max(Math.floor(8 * esc),
            Math.floor((alto - altoBloque) / 2));

        const xLista = this.anchoPantalla - Math.floor(200 * esc);
        let yLista = y + margenSup;

        for (let k = 0; k < nJug; k++) {
            const idx = this.partida.orden[k];
            const j = this.partida.jugadores[idx];
            const esTurno = (k === this.partida.turnoOrdenIdx);
            const prefijo = esTurno ? '▶ ' : '   ';
            dibujarTexto(ctx, `${prefijo}${j.nombre}`,
                         xLista, yLista, fuente, j.color);
            yLista += salto;
        }
    }
};

// -------------------------------------------------
// Cartel de ayuda
// -------------------------------------------------
Juego.prototype.dibujarAyudaCartel = function() {
    if (!this.mostrarAyuda) return;
    const ctx = this.ctx;
    const esc = this.escala;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const anchoC = Math.floor(950 * esc);
    const altoC  = Math.floor(640 * esc);
    const x = Math.floor((this.anchoPantalla - anchoC) / 2);
    const y = Math.floor((this.altoPantalla  - altoC ) / 2);

    ctx.fillStyle = '#323232';
    ctx.fillRect(x, y, anchoC, altoC);
    ctx.strokeStyle = '#969696';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, anchoC, altoC);

    const fuenteTitulo = `${this.tamanoFuenteGrande}px Junegull`;
    dibujarTexto(ctx, "Instrucciones",
                 this.anchoPantalla / 2, y + Math.floor(45 * esc),
                 fuenteTitulo, '#ffffff', true);

    ctx.strokeStyle = '#646464';
    ctx.beginPath();
    ctx.moveTo(x + Math.floor(30 * esc), y + Math.floor(75 * esc));
    ctx.lineTo(x + anchoC - Math.floor(30 * esc), y + Math.floor(75 * esc));
    ctx.stroke();

    const fuente = `${Math.floor(24 * esc)}px Junegull`;
    const lineas = [
        "1. Los jugadores comienzan en el casillero de SALIDA.",
        "2. El orden de turnos se sortea al inicio de la partida.",
        "3. Cada jugador tira el dado y avanza esa cantidad de casillas.",
        "4. Al caer en una casilla de desafío deberás responder una pregunta.",
        "   Si acertás, avanzás lo que indica el premio de la carta.",
        "   Si no acertás, en tu próximo turno no tirás el dado: volvés a responder.",
        "5. Hay casillas que te hacen avanzar o retroceder según un factorial.",
        "   Por ejemplo, 3! es 6. Si la casilla dice 'Retrocedé 3!', retrocedés 6.",
        "6. Gana quien llega primero a la LLEGADA, sin importar si te pasás.",
    ];
    let yl = y + Math.floor(115 * esc);
    for (const l of lineas) {
        dibujarTexto(ctx, l, x + Math.floor(35 * esc), yl, fuente, '#dcdcdc');
        yl += Math.floor(34 * esc);
    }

    const yLineaCreditos = y + altoC - Math.floor(130 * esc);
    ctx.strokeStyle = '#646464';
    ctx.beginPath();
    ctx.moveTo(x + Math.floor(30 * esc), yLineaCreditos);
    ctx.lineTo(x + anchoC - Math.floor(30 * esc), yLineaCreditos);
    ctx.stroke();

    const fuenteCreditos = `${Math.floor(18 * esc)}px Junegull`;
    const creditos = [
        "Territorio de Juegos - Escuelas en Foco Matemática",
        "Coordinación general: Gloria Rodríguez",
        "Diseño y desarrollo: Andrea Pallai y Ernesto López",
    ];
    let yc = yLineaCreditos + Math.floor(28 * esc);
    for (const l of creditos) {
        dibujarTexto(ctx, l, this.anchoPantalla / 2, yc,
                     fuenteCreditos, '#ffffc8', true);
        yc += Math.floor(24 * esc);
    }

    const fuenteCerrar = `${Math.floor(16 * esc)}px Junegull`;
    dibujarTexto(ctx, "Presioná ENTER para cerrar",
                 this.anchoPantalla / 2,
                 y + altoC - Math.floor(15 * esc),
                 fuenteCerrar, '#969696', true);
};

// -------------------------------------------------
// Modal de desafío
// -------------------------------------------------
Juego.prototype.dibujarDesafio = function() {
    if (!this.mostrarDesafio || !this.desafioActual) return;
    const ctx = this.ctx;
    const esc = this.escala;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const anchoModal = Math.floor(600 * esc);
    const altoModal  = Math.floor(anchoModal / RELACION_FONDO);
    const xModal = Math.floor((this.anchoPantalla - anchoModal) / 2);
    const yModal = Math.floor((this.altoPantalla  - altoModal ) / 2);

    if (this.imgFondoDesafio) {
        ctx.drawImage(this.imgFondoDesafio, xModal, yModal, anchoModal, altoModal);
    } else {
        ctx.fillStyle = '#323232';
        ctx.fillRect(xModal, yModal, anchoModal, altoModal);
        ctx.strokeStyle = '#969696';
        ctx.lineWidth = 3;
        ctx.strokeRect(xModal, yModal, anchoModal, altoModal);
    }

    const anchoRect = Math.floor(anchoModal * 0.8);
    const altoRect  = Math.floor(altoModal  * 0.7);
    const xRect = xModal + Math.floor((anchoModal - anchoRect) / 2);
    const yRect = yModal + Math.floor((altoModal  - altoRect ) / 2);

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8 * esc;
    ctx.shadowOffsetY = 2 * esc;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.fillRect(xRect, yRect, anchoRect, altoRect);
    ctx.restore();

    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = Math.max(1, Math.floor(2 * esc));
    ctx.strokeRect(xRect, yRect, anchoRect, altoRect);

    // Título con el nombre del jugador
    const fuenteJug = `${this.tamanoFuenteGrande}px Junegull`;
    const jugador = this.partida.jugadores[this.desafioJugador];
    dibujarTexto(ctx, `Desafío para ${jugador.nombre}`,
                 this.anchoPantalla / 2,
                 yModal - Math.floor(45 * esc),
                 fuenteJug, jugador.color, true);

    // Texto: título (verde oliva) + pregunta (negro), sin salto entre ellos
    const fuentePreg = `${this.tamanoFuentePregunta*0.6}px Junegull`;
    const maxAnchoTexto = anchoRect - Math.floor(40 * esc);

    // Construir el texto compuesto: "titulo pregunta"
    const textoCompuesto = this.desafioActual.titulo + ' ' + this.desafioActual.pregunta;

    // Dividir en palabras y armar líneas; necesitamos saber dónde termina el título
    // para dibujar esa parte en verde oliva.
    const palabras = textoCompuesto.split(' ');
    const palabrasTitulo = this.desafioActual.titulo.split(' ').length;

    const lineas = [];
    let actualLinea = [];
    let anchoActual = 0;

    for (let i = 0; i < palabras.length; i++) {
        const p = palabras[i];
        const fuenteMedir = fuentePreg;
        const anchoPalabra = medirTexto(ctx, (actualLinea.length ? ' ' : '') + p, fuenteMedir);
        if (anchoActual + anchoPalabra > maxAnchoTexto && actualLinea.length > 0) {
            lineas.push(actualLinea);
            actualLinea = [p];
            anchoActual = medirTexto(ctx, p, fuenteMedir);
        } else {
            actualLinea.push(p);
            anchoActual += anchoPalabra;
        }
    }
    if (actualLinea.length > 0) lineas.push(actualLinea);

    const altoLinea = Math.floor(this.tamanoFuentePregunta * 0.6 * 1.25);
    const altoTotalTexto = lineas.length * altoLinea;
    let yTexto = yRect + Math.floor((altoRect - altoTotalTexto) / 2) + Math.floor(this.tamanoFuentePregunta * 0.7 * 0.8);

    // Dibujar palabra por palabra, coloreando las que son parte del título
    let idxPalabraGlobal = 0;
    for (const linea of lineas) {
        const anchoLinea = medirTexto(ctx, linea.join(' '), fuentePreg);
        let xCursor = xRect + Math.floor((anchoRect - anchoLinea) / 2);
        for (let k = 0; k < linea.length; k++) {
            const palabra = linea[k];
            const esTitulo = idxPalabraGlobal < palabrasTitulo;
            const color = esTitulo ? COLOR_TITULO_DESAFIO : '#111111';

            const textoPalabra = (k === 0 ? '' : ' ') + palabra;
            ctx.font = fuentePreg;
            ctx.fillStyle = color;
            ctx.textBaseline = 'alphabetic';

            ctx.fillText(textoPalabra, xCursor, yTexto);

            xCursor += ctx.measureText(textoPalabra).width;
            idxPalabraGlobal++;
        }
        yTexto += altoLinea;
    }

    // Premio (debajo del texto, dentro del rectángulo blanco)
    if (this.desafioActual.premio) {
        const fuentePremio = `${Math.floor(this.tamanoFuentePregunta * 0.5)}px Junegull`;
        const textoPremio = `Premio: avanzás ${this.desafioActual.premio} casillero${this.desafioActual.premio === 1 ? '' : 's'}`;
        dibujarTexto(ctx, textoPremio,
                     xRect + Math.floor(anchoRect / 2),
                     yRect + altoRect - Math.floor(25 * esc),
                     fuentePremio, COLOR_TITULO_DESAFIO, true);
    }

    // Botones o input según tipo
    if (this.desafioActual.tipo === 'vf') {
        this.dibujarBoton(this.botonVF_Verdadero);
        this.dibujarBoton(this.botonVF_Falso);
    } else {
        // Input numérico
        const anchoInput = Math.floor(300 * esc);
        const altoInput  = Math.floor(60 * esc);
        const sep = Math.floor(30 * esc);
        const yInput = this.botonResponderNum.y;
        const centroXModal = xModal + Math.floor(anchoModal / 2);

        const xInput = centroXModal - Math.floor(anchoInput / 2) - Math.floor(this.botonResponderNum.ancho / 2) - sep / 2;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(xInput, yInput, anchoInput, altoInput);
        ctx.strokeStyle = '#3264c8';
        ctx.lineWidth = 3;
        ctx.strokeRect(xInput, yInput, anchoInput, altoInput);

        const fuenteInput = `${Math.floor(32 * esc)}px Junegull`;
        const textoMostrar = this.inputNumerico || '';
        dibujarTexto(ctx, textoMostrar,
                     xInput + Math.floor(anchoInput / 2),
                     yInput + Math.floor(altoInput / 2),
                     fuenteInput, '#111111', true);

        // Cursor parpadeante
        const ahora = Date.now();
        if (ahora - this.ultimoParpadeo > 500) {
            this.mostrarCursor = !this.mostrarCursor;
            this.ultimoParpadeo = ahora;
        }
        if (this.mostrarCursor) {
            const anchoTexto = medirTexto(ctx, textoMostrar, fuenteInput);
            ctx.strokeStyle = '#111111';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(xInput + Math.floor(anchoInput / 2) + Math.floor(anchoTexto / 2) + 4,
                       yInput + Math.floor(12 * esc));
            ctx.lineTo(xInput + Math.floor(anchoInput / 2) + Math.floor(anchoTexto / 2) + 4,
                       yInput + altoInput - Math.floor(12 * esc));
            ctx.stroke();
        }

        // Botón RESPONDER a la derecha del input
        this.botonResponderNum.x = xInput + anchoInput + sep;
        this.botonResponderNum.y = yInput;
        this.dibujarBoton(this.botonResponderNum);
    }
};

// -------------------------------------------------
// Resultado del desafío
// -------------------------------------------------
Juego.prototype.dibujarResultadoDesafio = function() {
    if (!this.resultadoDesafio) return;
    const ctx = this.ctx;
    const esc = this.escala;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const texto = this.resultadoDesafio === 'correcto' ? '¡CORRECTO!' : 'INCORRECTO';
    const color = this.resultadoDesafio === 'correcto' ? '#32c832' : '#e03c3c';

    const fuente = `${this.tamanoFuenteGrande * 1.4}px Junegull`;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 15 * esc;
    ctx.shadowOffsetY = 4 * esc;
    dibujarTexto(ctx, texto,
                 this.anchoPantalla / 2,
                 this.altoPantalla  / 2,
                 fuente, color, true);
    ctx.restore();
};

// -------------------------------------------------
// Dibujo completo
// -------------------------------------------------
Juego.prototype.dibujarJuego = function() {
    const ctx = this.ctx;
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    this.dibujarTablero();
    this.dibujarFichasJugadores();
    this.dibujarBarraSuperior();
    this.dibujarBarraInferior();
    this.dibujarAyudaCartel();
    this.dibujarDesafio();
    this.dibujarResultadoDesafio();
};