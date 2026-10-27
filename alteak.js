// Desplegar menú responsive
function desplegarMenu(forzarCerrar) {
    const menu = document.getElementById('menu');
    const abrir = forzarCerrar ? false : !menu.classList.contains('activo');
    menu.classList.toggle('activo', abrir);
    document.body.classList.toggle('menu-abierto', abrir);
    const btn = document.querySelector('.hamburger');
    if (btn) { btn.classList.toggle('abierto', abrir); btn.setAttribute('aria-expanded', abrir ? 'true' : 'false'); }
}

// Cambia el idioma sin salir de la página en la que estás
function cambiarIdioma(idioma) {
    const body = document.body;
    body.classList.remove('lang-es', 'lang-en');
    body.classList.add(idioma === 'en' ? 'lang-en' : 'lang-es');
    try { localStorage.setItem('idioma', idioma); } catch (e) {}
}

// Variable para memorizar la posición en la galería
let posicionScrollProyectos = 0;

// Navegación entre secciones
function mostrarSeccion(id, subirArriba = true) {
    // Marca en el menú la sección activa (los proyectos cuentan como Galería)
    try {
        const esProyecto = !!document.querySelector(`[onclick*="verProyecto('${id}')"]`);
        document.querySelectorAll('#menu a').forEach(a => {
            const m = (a.getAttribute('onclick') || '').match(/mostrarSeccion\('([^']+)'\)/);
            const destino = m ? m[1] : null;
            a.classList.toggle('activo', destino === id || (esProyecto && destino === 'proyectos'));
        });
    } catch (e) {}

    const secciones = document.getElementsByClassName('seccion');
    for (let i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove('activa');
    }

    const seccionActiva = document.getElementById(id);
    if (seccionActiva) {
        seccionActiva.classList.add('activa');
    }

    // Reproduce solo los vídeos de la sección visible (ahorra datos al cargar la web)
    gestionarVideos(seccionActiva);

    desplegarMenu(true);
    
    // Solo sube al tope si la función lo permite
    if (subirArriba) {
        window.scrollTo(0, 0);
    }
}

// Abrir proyectos
function verProyecto(id) {
    // 1. Bloquea el salto hacia arriba del href="#"
    if (window.event) window.event.preventDefault();

    // 2. Guarda la posición exacta del scroll actual
    posicionScrollProyectos = window.scrollY;
    
    // 3. Muestra el proyecto y fuerza a que el proyecto empiece desde arriba
    mostrarSeccion(id, true);
}

// Cerrar proyectos
function cerrarProyecto() {
    // 1. Bloquea el salto hacia arriba del botón volver
    if (window.event) window.event.preventDefault();

    // 2. Muestra la galería pero le dice que NO suba al tope
    mostrarSeccion('proyectos', false);
    
    // 3. Te devuelve exactamente a la posición guardada
    window.scrollTo({
        top: posicionScrollProyectos,
        behavior: 'instant'
    });
}

// Flecha para bajar suavemente a la galería de proyectos
function deslizarAbajo(event) {
    event.preventDefault();
    const galeria = document.getElementById('galeria');
    if (galeria) {
        galeria.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- LÓGICA DEL VISOR DE GALERÍA (IMÁGENES Y VIDEOS) ---
let mediaActuales = [];
let indiceActual = 0;

function abrirFoto(elemento) {
    procesarMedia(elemento);
}

function abrirVideo(elemento) {
    procesarMedia(elemento);
}

function procesarMedia(elemento) {
    const proyectoActivo = elemento.closest('.seccion');
    
    // Busca tanto imágenes como videos dentro del proyecto actual
    mediaActuales = Array.from(proyectoActivo.querySelectorAll('.img-zoom, .video-zoom'));
    indiceActual = mediaActuales.indexOf(elemento);

    mostrarEnVisor(elemento);
}

function mostrarEnVisor(elemento) {
    const visor = document.getElementById('visor');
    const imgVisor = document.getElementById('img-visor');
    const videoVisor = document.getElementById('video-visor');
    
    videoVisor.pause();
    silenciarVideosPagina(); // evita que suenen dos vídeos a la vez

    if (elemento.tagName.toLowerCase() === 'img') {
        imgVisor.src = elemento.src;
        imgVisor.style.display = 'block';
        videoVisor.style.display = 'none';
    } else if (elemento.tagName.toLowerCase() === 'video') {
        // Si el vídeo tiene una versión completa (p. ej. con créditos), el visor muestra esa
        videoVisor.src = elemento.dataset.completo || elemento.src;
        videoVisor.style.display = 'block';
        imgVisor.style.display = 'none';
        videoVisor.play(); 
    }
    
    visor.style.display = 'flex';
}

function cambiarMedia(direccion) {
    if (mediaActuales.length === 0) return;
    
    indiceActual += direccion;
    
    if (indiceActual >= mediaActuales.length) {
        indiceActual = 0;
    } else if (indiceActual < 0) {
        indiceActual = mediaActuales.length - 1;
    }
    
    mostrarEnVisor(mediaActuales[indiceActual]);
}

function cerrarFoto(evento) {
    if (evento && (
        evento.target.id === 'img-visor' || 
        evento.target.id === 'video-visor' || 
        evento.target.classList.contains('prev-visor') || 
        evento.target.classList.contains('next-visor')
    )) {
        return;
    }
    
    document.getElementById('video-visor').pause(); 
    document.getElementById('visor').style.display = 'none';
}

// Control por teclado
document.addEventListener('keydown', (e) => {
    const visor = document.getElementById('visor');
    if (visor.style.display === 'flex') {
        if (e.key === 'ArrowRight') cambiarMedia(1);
        if (e.key === 'ArrowLeft') cambiarMedia(-1);
        if (e.key === 'Escape') cerrarFoto();
    }
});

// --- ANIMACIONES Y MULTIMEDIA ---
const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add('mostrar');
        } else {
            entrada.target.classList.remove('mostrar');
        }
    });
});

const elementosAnimados = document.querySelectorAll('.animado');
elementosAnimados.forEach(elemento => observador.observe(elemento));

function reproducirVideo(elementoDiv) {
    const video = elementoDiv.querySelector('video');
    const icono = elementoDiv.querySelector('.play-icon');

    video.play();
    video.controls = true;
    if (icono) icono.style.display = 'none';
}

// --- FORMULARIO DE CONTACTO ---
const form = document.getElementById('contactForm');
const nombreInput = document.getElementById('nombre');
const subjectInput = document.getElementById('subject');
const bodyInput = document.getElementById('mensaje');

if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const nombre = encodeURIComponent(nombreInput.value);
        const subject = encodeURIComponent(subjectInput.value);
        const mensaje = encodeURIComponent(bodyInput.value);

        const body = `Hola, soy ${nombre}.%0D%0A%0D%0A${mensaje}`;
        const mailtoLink = `mailto:nicolle.lesmes@gmail.com?subject=${subject}&body=${body}`;

        window.location.href = mailtoLink;
    });
}

function entrarConIdioma(idioma) {
    // Se mantiene por compatibilidad: cambia el idioma y abre Sobre mí
    cambiarIdioma(idioma);
    mostrarSeccion('acerca');
}

// --- VÍDEOS: carga diferida y botón de sonido ---
function gestionarVideos(seccionActiva) {
    document.querySelectorAll('video[data-autoplay]').forEach(video => {
        if (seccionActiva && seccionActiva.contains(video)) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}

function alternarSonido(evento, boton) {
    evento.stopPropagation();
    const video = boton.parentElement.querySelector('video');
    video.muted = !video.muted;
    if (!video.muted) video.play().catch(() => {});

    const icono = boton.querySelector('.icono-sonido i');
    icono.className = video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    boton.querySelector('.es').textContent = video.muted ? 'Activar sonido' : 'Silenciar';
    boton.querySelector('.en').textContent = video.muted ? 'Sound on' : 'Mute';
}

function silenciarVideosPagina() {
    document.querySelectorAll('.btn-sonido').forEach(boton => {
        const video = boton.parentElement.querySelector('video');
        if (video && !video.muted) {
            video.muted = true;
            boton.querySelector('.icono-sonido i').className = 'fas fa-volume-mute';
            boton.querySelector('.es').textContent = 'Activar sonido';
            boton.querySelector('.en').textContent = 'Sound on';
        }
    });
}


// Al abrir la web: idioma guardado o el del navegador, y directo a Sobre mí
(function iniciar() {
    let idioma = null;
    try { idioma = localStorage.getItem('idioma'); } catch (e) {}
    if (idioma !== 'es' && idioma !== 'en') {
        const nav = (navigator.language || 'es').toLowerCase();
        idioma = nav.startsWith('es') ? 'es' : 'en';
    }
    cambiarIdioma(idioma);
    if (typeof mostrarSeccion === 'function') mostrarSeccion('acerca', false);
})();
