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

// --- LÓGICA DEL VISOR DE GALERÍA ---
let imagenesActuales = [];
let indiceActual = 0;

function abrirFoto(elementoImg) {
    const proyectoActivo = elementoImg.closest('.seccion');
    
    // Buscar todas las imágenes de este proyecto para la galería
    imagenesActuales = Array.from(proyectoActivo.querySelectorAll('.img-zoom'));
    indiceActual = imagenesActuales.indexOf(elementoImg);

    const visor = document.getElementById('visor');
    const imgVisor = document.getElementById('img-visor');
    
    imgVisor.src = elementoImg.src;
    visor.style.display = 'flex';
}

function cambiarFoto(direccion) {
    if (imagenesActuales.length === 0) return;
    
    indiceActual += direccion;
    
    // Si llegas al final, vuelve al principio y viceversa
    if (indiceActual >= imagenesActuales.length) {
        indiceActual = 0;
    } else if (indiceActual < 0) {
        indiceActual = imagenesActuales.length - 1;
    }
    
    document.getElementById("img-visor").src = imagenesActuales[indiceActual].src;
}

function cerrarFoto(evento) {
    // Si hace click en las flechas o en la imagen central, NO cerramos el visor
    if (evento && (
        evento.target.id === 'img-visor' || 
        evento.target.classList.contains('prev-visor') || 
        evento.target.classList.contains('next-visor')
    )) {
        return;
    }
    document.getElementById('visor').style.display = 'none';
}

// Control por teclado para el visor
document.addEventListener('keydown', (e) => {
    const visor = document.getElementById('visor');
    if (visor.style.display === 'flex') {
        if (e.key === 'ArrowRight') cambiarFoto(1);
        if (e.key === 'ArrowLeft') cambiarFoto(-1);
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
