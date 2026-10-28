const ICONO_SILENCIO = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICONO_SONIDO = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

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
    document.documentElement.lang = idioma === 'en' ? 'en' : 'es';
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
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Enlace propio para cada sección y proyecto (p. ej. .../#dior) y botón Atrás del navegador
    actualizarDireccion(id);
}

let navegandoConHistorial = false;
let seccionAnterior = null;

function actualizarDireccion(id) {
    const anterior = seccionAnterior;
    seccionAnterior = id;
    if (navegandoConHistorial) return;
    try {
        const url = id === 'bienvenida' ? location.pathname + location.search : '#' + id;
        if (anterior === null || anterior === id) history.replaceState({ id }, '', url);
        else history.pushState({ id }, '', url);
    } catch (e) {}
}

function esSeccionValida(id) {
    const el = id ? document.getElementById(id) : null;
    return !!(el && el.classList.contains('seccion'));
}

window.addEventListener('popstate', function (e) {
    // Un enlace vacío (href="#") no debe mover de sección
    if (!e.state && !location.hash.slice(1)) return;
    const destino = (e.state && e.state.id) || location.hash.slice(1) || 'bienvenida';
    if (!esSeccionValida(destino)) return;
    const veniaDeProyecto = !!document.querySelector(`[onclick*="verProyecto('${seccionAnterior}')"]`);
    navegandoConHistorial = true;
    if (destino === 'proyectos' && veniaDeProyecto) {
        mostrarSeccion('proyectos', false);
        window.scrollTo({ top: posicionScrollProyectos, behavior: 'instant' });
    } else {
        mostrarSeccion(destino);
    }
    navegandoConHistorial = false;
});

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

// --- FORMULARIO DE CONTACTO: envío con Formspree sin salir de la web ---
const form = document.getElementById('contactForm');

if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const estado = document.getElementById('ct-estado');
        const boton = form.querySelector('.ct-enviar');
        const en = document.body.classList.contains('lang-en');
        const datos = new FormData(form);
        datos.append('_subject', 'Web · ' + (datos.get('asunto') || 'Nuevo mensaje'));
        boton.disabled = true;
        estado.className = 'ct-nota';
        estado.textContent = en ? 'Sending…' : 'Enviando…';
        try {
            const r = await fetch(form.action, { method: 'POST', body: datos, headers: { 'Accept': 'application/json' } });
            if (!r.ok) throw new Error('envio');
            form.reset();
            estado.className = 'ct-nota ct-ok';
            estado.textContent = en ? 'Message sent. Thank you! I\'ll get back to you soon.' : 'Mensaje enviado. ¡Gracias! Te responderé pronto.';
        } catch (e) {
            estado.className = 'ct-nota ct-error';
            estado.textContent = en ? 'It couldn\'t be sent. Please write to nicolle.lesmes@gmail.com' : 'No se pudo enviar. Escríbeme a nicolle.lesmes@gmail.com';
        }
        boton.disabled = false;
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

    boton.querySelector('.icono-sonido').innerHTML = video.muted ? ICONO_SILENCIO : ICONO_SONIDO;
    boton.querySelector('.es').textContent = video.muted ? 'Activar sonido' : 'Silenciar';
    boton.querySelector('.en').textContent = video.muted ? 'Sound on' : 'Mute';
}

function silenciarVideosPagina() {
    document.querySelectorAll('.btn-sonido').forEach(boton => {
        const video = boton.parentElement.querySelector('video');
        if (video && !video.muted) {
            video.muted = true;
            boton.querySelector('.icono-sonido').innerHTML = ICONO_SILENCIO;
            boton.querySelector('.es').textContent = 'Activar sonido';
            boton.querySelector('.en').textContent = 'Sound on';
        }
    });
}


// Al abrir la web: idioma guardado o el del navegador (la pantalla de entrada ya está visible)
(function iniciar() {
    let idioma = null;
    try { idioma = localStorage.getItem('idioma'); } catch (e) {}
    if (idioma !== 'es' && idioma !== 'en') {
        const nav = (navigator.language || 'es').toLowerCase();
        idioma = nav.startsWith('es') ? 'es' : 'en';
    }
    cambiarIdioma(idioma);
    // Si se entra con un enlace directo (p. ej. .../#dior), abre esa sección sin pasar por la entrada
    const destino = location.hash.slice(1);
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    if (destino && destino !== 'bienvenida' && esSeccionValida(destino)) {
        mostrarSeccion(destino);
        // El navegador intenta saltar al ancla al cargar: lo devolvemos arriba
        window.addEventListener('load', () => window.scrollTo({ top: 0, behavior: 'instant' }));
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
    } else {
        actualizarDireccion('bienvenida');
    }
})();

// Filtros de la galería por tipo de proyecto
function filtrarGaleria(cat, boton) {
    document.querySelectorAll('.gal-filtro').forEach(b => b.classList.toggle('activo', b === boton));
    document.querySelectorAll('#galeria .proyecto').forEach(p => {
        p.classList.toggle('oculto', cat !== 'todos' && p.dataset.cat !== cat);
    });
}
