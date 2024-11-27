// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCpu2EGKchqvCh44EKskHG2_NRvXaUuAs4",
    authDomain: "menupaginaweb.firebaseapp.com",
    projectId: "menupaginaweb",
    storageBucket: "menupaginaweb.firebasestorage.app",
    messagingSenderId: "643673132476",
    appId: "1:643673132476:web:07b5a396f30b6d55afefb9",
    measurementId: "G-QVXN6M6ZP8"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elementos del DOM
const menuItemsContainer = document.getElementById('menu-items');

// Variables globales
let categories = {}; // Almacena las categorías y subcategorías
let menuOffset = 0;

// Función para cargar las categorías y subcategorías desde Firestore
async function loadCategories() {
    const menuNavegacion = document.querySelector('.menu-navegacion');
    menuNavegacion.innerHTML = '';

    try {
        const querySnapshot = await db.collection("menu").get();
        categories = {};

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const family = item.Familia;
            const subfamily = item.Subfamilia || 'Sin Subfamilia';

            if (!categories[family]) {
                categories[family] = {};
            }

            if (!categories[family][subfamily]) {
                categories[family][subfamily] = [];
            }

            categories[family][subfamily].push({ ...item, id: docSnap.id });
        });

        // Construir el menú de navegación superior según las nuevas reglas
        for (const family in categories) {
            const subfamilies = Object.keys(categories[family]);
            const hasRealSubfamilies = subfamilies.some(sub => sub !== 'Sin Subfamilia');

            if (hasRealSubfamilies) {
                // Si la familia tiene subfamilias (excluyendo "Sin Subfamilia"), mostramos las subfamilias
                subfamilies.forEach(subfamily => {
                    if (subfamily !== 'Sin Subfamilia') {
                        const subfamilyLink = document.createElement('a');
                        subfamilyLink.textContent = subfamily;
                        subfamilyLink.href = '#';
                        subfamilyLink.dataset.family = family;
                        subfamilyLink.dataset.subfamily = subfamily;

                        subfamilyLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            const targetSectionId = `${family}-${subfamily}`.replace(/\s+/g, '-').toLowerCase();
                            const targetSection = document.getElementById(targetSectionId);
                            if (targetSection) {
                                window.scrollTo({
                                    top: targetSection.offsetTop - menuOffset,
                                    behavior: 'smooth'
                                });
                            }
                        });

                        menuNavegacion.appendChild(subfamilyLink);
                    }
                });
            } else {
                // Si la familia no tiene subfamilias o solo tiene "Sin Subfamilia", mostramos la familia
                const familyLink = document.createElement('a');
                familyLink.textContent = family;
                familyLink.href = '#';
                familyLink.dataset.family = family;
                familyLink.dataset.subfamily = 'Sin Subfamilia';

                familyLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetSectionId = `${family}-Sin Subfamilia`.replace(/\s+/g, '-').toLowerCase();
                    const targetSection = document.getElementById(targetSectionId);
                    if (targetSection) {
                        window.scrollTo({
                            top: targetSection.offsetTop - menuOffset,
                            behavior: 'smooth'
                        });
                    }
                });

                menuNavegacion.appendChild(familyLink);
            }
        }

        // Mostrar todas las categorías al cargar la página
        displayAllItems();

        // Llamar a observeSections después de cargar los elementos
        observeSections();

    } catch (error) {
        console.error("Error al cargar las categorías:", error);
        menuItemsContainer.innerHTML = '<p>Error al cargar el menú. Por favor, inténtelo más tarde.</p>';
    }
}




// Función para mostrar los artículos agrupados por categoría y subcategoría
function displayAllItems() {
    menuItemsContainer.innerHTML = '';

    for (const family in categories) {
        for (const subfamily in categories[family]) {
            const sectionId = `${family}-${subfamily}`.replace(/\s+/g, '-').toLowerCase();
            const section = document.createElement('section');
            section.id = sectionId;
            section.classList.add('menu-section');

            // Solo agregamos el título de la familia si no tiene subfamilias reales
            const subfamilies = Object.keys(categories[family]);
            const hasRealSubfamilies = subfamilies.some(sub => sub !== 'Sin Subfamilia');

            if (!hasRealSubfamilies || subfamily === 'Sin Subfamilia') {
                const familyTitle = document.createElement('h2');
                familyTitle.textContent = family;
                familyTitle.classList.add('family-title');
                section.appendChild(familyTitle);
            }

            // Agregamos el título de la subfamilia si existe y no es 'Sin Subfamilia'
            if (subfamily !== 'Sin Subfamilia') {
                const subfamilyTitle = document.createElement('h3');
                subfamilyTitle.textContent = subfamily;
                subfamilyTitle.classList.add('subfamily-title');
                section.appendChild(subfamilyTitle);
            }

            const itemsContainer = document.createElement('div');
            itemsContainer.classList.add('menu-items');

            categories[family][subfamily].forEach(item => {
                const menuItemElement = createMenuItemElement(item, item.id);
                itemsContainer.appendChild(menuItemElement);
            });

            section.appendChild(itemsContainer);
            menuItemsContainer.appendChild(section);
        }
    }
}



// Función para crear elementos de menú
function createMenuItemElement(item, id) {
    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');

    // Contenedor de la imagen
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const img = document.createElement('img');
    const baseImageUrl = 'https://joel1to96.github.io/PaginaWeb/imagenes/';
    img.src = item.Imagen ? baseImageUrl + item.Imagen : 'imagenes/default.png';
    imageContainer.appendChild(img);

    // Contenedor de detalles (nombre, descripción y precio)
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('details-container');

    const title = document.createElement('h5');
    title.textContent = item.Artículo;

    const description = document.createElement('p');
    description.classList.add('descripcion');
    description.textContent = item.Descripción || '';

    const price = document.createElement('p');
    price.classList.add('precio');
    price.textContent = `${item.Precio.toFixed(2)} €`;

    // Añadir elementos al contenedor de detalles
    detailsContainer.appendChild(title);
    detailsContainer.appendChild(description);
    detailsContainer.appendChild(price);

    // Añadir la imagen y los detalles al elemento del menú
    menuItem.appendChild(imageContainer);
    menuItem.appendChild(detailsContainer);

    return menuItem;
}



// Función para observar las secciones y actualizar el menú
function observeSections() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const sectionId = entry.target.id;
            const [familyPart, subfamilyPart] = sectionId.split('-').map(s => s.replace(/-/g, ' '));
            const family = familyPart;
            const subfamily = subfamilyPart;

            const menuLinks = document.querySelectorAll('.menu-navegacion a');

            if (entry.isIntersecting) {
                menuLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.family === family && link.dataset.subfamily === subfamily) {
                        link.classList.add('active');
                        // Desplazar el menú para centrar el enlace activo
                        link.scrollIntoView({ inline: 'center', behavior: 'smooth' });
                    }
                });
            }
        });
    }, options);

    const sections = document.querySelectorAll('.menu-section');
    sections.forEach(section => {
        observer.observe(section);
    });
}



// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadCategories().then(() => {
        // Calcular el offset después de que el contenido haya cargado
        menuOffset = document.querySelector('.header').offsetHeight + document.querySelector('.menu-navegacion').offsetHeight;
    });
});

// Modo Oscuro
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Verificar si hay una preferencia almacenada en localStorage
    const darkModePreference = localStorage.getItem('darkMode');

    if (darkModePreference === 'enabled') {
        enableDarkMode();
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDarkModeEnabled = document.body.classList.contains('dark-mode');
            if (isDarkModeEnabled) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    }

    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
        localStorage.setItem('darkMode', 'enabled');
    }

    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        localStorage.setItem('darkMode', 'disabled');
    }
});
