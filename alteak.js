// Desplegar menú responsive
function desplegarMenu() {
    document.getElementById('menu').classList.toggle('activo');
}

// Navegación entre secciones
function mostrarSeccion(id) {
    const secciones = document.getElementsByClassName('seccion');
    for (let i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove('activa');
    }

    const seccionActiva = document.getElementById(id);
    if (seccionActiva) {
        seccionActiva.classList.add('activa');
    }

    document.getElementById('menu').classList.remove('activo');
    
    // Fuerza a subir siempre que cambie de pantalla
    window.scrollTo(0, 0);
}

// Abrir y cerrar proyectos
function verProyecto(id) {
    mostrarSeccion(id);
    window.scrollTo(0, 0);
}

function cerrarProyecto() {
    mostrarSeccion('proyectos');
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

    if (elemento.tagName.toLowerCase() === 'img') {
        imgVisor.src = elemento.src;
        imgVisor.style.display = 'block';
        videoVisor.style.display = 'none';
    } else if (elemento.tagName.toLowerCase() === 'video') {
        videoVisor.src = elemento.src;
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
        const mailtoLink = `mailto:alteakdesigns@gmail.com?subject=${subject}&body=${body}`;

        window.location.href = mailtoLink;
    });
}

function entrarConIdioma(idioma) {
    const body = document.body;
    if (idioma === 'en') {
        body.classList.replace('lang-es', 'lang-en');
        localStorage.setItem('idioma', 'en');
    } else {
        body.classList.replace('lang-en', 'lang-es');
        localStorage.setItem('idioma', 'es');
    }
    // Manda directo al sub-inicio (menú flotante)
    mostrarSeccion('sub-inicio');
}
