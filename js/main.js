// main.js
import { Juego } from './juego.js';
import './dibujo.js';

async function iniciar() {
    const canvas = document.getElementById('canvas');
    const juego = new Juego(canvas);
    window.juego = juego;

    document.getElementById('btn-pantalla-completa').addEventListener('click', () => {
        const contenedor = document.getElementById('contenedor');
        if (contenedor.requestFullscreen) {
            contenedor.requestFullscreen();
        } else if (contenedor.webkitRequestFullscreen) {
            contenedor.webkitRequestFullscreen();
        } else if (contenedor.msRequestFullscreen) {
            contenedor.msRequestFullscreen();
        }
        document.getElementById('mensaje-pantalla-completa').style.display = 'none';

        if (juego.nombresIngresados === false) {
            juego.iniciarMusica();
        }

        setTimeout(() => ajustarCanvas(canvas, juego), 100);
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            document.getElementById('mensaje-pantalla-completa').style.display = 'flex';
        }
        setTimeout(() => ajustarCanvas(canvas, juego), 100);
    });

    await juego.cargarRecursos();

    ajustarCanvas(canvas, juego);
    window.addEventListener('resize', () => ajustarCanvas(canvas, juego));
    juego.crearBotones();

    let enInput = true;

    window.addEventListener('keydown', (evento) => {
        if (enInput) {
            const continuar = juego.procesarTeclaInput(evento);
            if (juego.nombresIngresados) {
                enInput = false;
                juego.detenerMusica();
            }
        } else {
            if (!juego.partida) return;
            juego.procesarTeclaJuego(evento);
        }
    });

    canvas.addEventListener('mousedown', (evento) => {
        if (evento.button !== 0) return;
        const [x, y] = juego.coordPantallaA_Juego(evento.clientX, evento.clientY);
        juego.mouseX = x;
        juego.mouseY = y;
        juego.mousePresionado = true;

        if (enInput) {
            juego.procesarClickInput(x, y);
        } else {
            juego.procesarClickJuego(x, y);
        }
    });

    canvas.addEventListener('mousemove', (evento) => {
        const [x, y] = juego.coordPantallaA_Juego(evento.clientX, evento.clientY);
        juego.mouseX = x;
        juego.mouseY = y;
    });

    canvas.addEventListener('mouseup', () => {
        juego.mousePresionado = false;
    });

    function bucle() {
        if (enInput) {
            juego.dibujarInputNombres();
        } else if (juego.partida) {
            juego.actualizarAnimaciones();
            juego.dibujarJuego();
        }

        if (juego.volverAInput) {
            juego.volverAInput = false;
            enInput = true;
        }

        requestAnimationFrame(bucle);
    }

    bucle();
}

function ajustarCanvas(canvas, juego) {
    const anchoCSS = window.innerWidth;
    const altoCSS  = window.innerHeight;

    const ratioBase = 1200 / 750;
    const ratioVentana = anchoCSS / altoCSS;

    let anchoVisual, altoVisual;
    if (ratioVentana > ratioBase) {
        altoVisual  = altoCSS;
        anchoVisual = Math.floor(altoCSS * ratioBase);
    } else {
        anchoVisual = anchoCSS;
        altoVisual  = Math.floor(anchoCSS / ratioBase);
    }

    const dpr = window.devicePixelRatio || 1;
    const anchoInterno = Math.floor(anchoVisual * dpr);
    const altoInterno  = Math.floor(altoVisual  * dpr);

    canvas.width  = anchoInterno;
    canvas.height = altoInterno;
    canvas.style.width  = anchoVisual + 'px';
    canvas.style.height = altoVisual + 'px';

    juego.anchoPantalla = anchoInterno;
    juego.altoPantalla  = altoInterno;

    juego.recalcularTamanos();
    juego.crearBotones();
}

window.addEventListener('load', () => {
    iniciar().catch(err => {
        console.error("Error al iniciar el juego:", err);
    });
});