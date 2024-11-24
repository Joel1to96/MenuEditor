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
  
  // Inicializar Firestore
  const db = firebase.firestore();
  
  // Elementos del DOM
  const menuItemsContainer = document.getElementById('menu-items');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const addArticleBtn = document.getElementById('add-article-btn');
  const articleFormContainer = document.getElementById('article-form-container');
  const articleForm = document.getElementById('article-form');
  const cancelBtn = document.getElementById('cancel-btn');
  
  // Variables globales
  let currentArticles = []; // Almacena los artículos actuales mostrados
  let categories = {}; // Almacena las categorías y subcategorías
  
  // Función para cargar el menú desde Firestore
  async function loadMenu() {
      menuItemsContainer.innerHTML = '<p>Por favor, seleccione una categoría para ver los artículos.</p>';
      // No cargamos los artículos aquí, se cargarán al seleccionar una categoría
  }
  
  // Función para cargar las categorías y subcategorías desde Firestore
  async function loadCategories() {
      sidebarMenu.innerHTML = '';
  
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
  
      // Construir el menú lateral
      for (const family in categories) {
          const familyLi = document.createElement('li');
          const familyLink = document.createElement('a');
          familyLink.textContent = family;
          familyLink.href = '#';
          familyLink.addEventListener('click', () => {
              highlightActiveLink(familyLink);
              displayItems(categories[family]);
          });
          familyLi.appendChild(familyLink);
  
          const subfamilyUl = document.createElement('ul');
          for (const subfamily in categories[family]) {
              if (subfamily !== 'Sin Subfamilia') {
                  const subfamilyLi = document.createElement('li');
                  const subfamilyLink = document.createElement('a');
                  subfamilyLink.textContent = subfamily;
                  subfamilyLink.href = '#';
                  subfamilyLink.addEventListener('click', () => {
                      highlightActiveLink(subfamilyLink);
                      displayItems({ [subfamily]: categories[family][subfamily] });
                  });
                  subfamilyLi.appendChild(subfamilyLink);
                  subfamilyUl.appendChild(subfamilyLi);
              }
          }
  
          if (subfamilyUl.children.length > 0) {
              familyLi.appendChild(subfamilyUl);
          }
  
          sidebarMenu.appendChild(familyLi);
      }
  }
  
  // Función para mostrar los artículos de una categoría
  function displayItems(categoryItems) {
      menuItemsContainer.innerHTML = '';
      currentArticles = []; // Restablecer los artículos actuales
  
      for (const subfamily in categoryItems) {
          categoryItems[subfamily].forEach(item => {
              const menuItemElement = createMenuItemElement(item, item.id);
              menuItemsContainer.appendChild(menuItemElement);
              currentArticles.push(item);
          });
      }
  }
  
  // Función para crear elementos de menú
  function createMenuItemElement(item, id) {
    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const img = document.createElement('img');
    const baseImageUrl = 'https://joel1to96.github.io/PaginaWeb/imagenes/';
    img.src = item.Imagen ? baseImageUrl + item.Imagen : 'imagenes/default.png';
    imageContainer.appendChild(img);

    const title = document.createElement('h5');
    title.textContent = item.Artículo;

    const price = document.createElement('p');
    price.classList.add('precio');
    price.textContent = `${item.Precio.toFixed(2)} €`;

    // Botones de editar y eliminar
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', () => {
        showEditForm(item, id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.addEventListener('click', () => {
        deleteArticle(id);
    });

    // Añadir elementos al menú
    menuItem.appendChild(imageContainer);
    menuItem.appendChild(title);
    menuItem.appendChild(price);
    menuItem.appendChild(editButton);
    menuItem.appendChild(deleteButton);

    return menuItem;
}

  
  // Mostrar y ocultar el formulario
  addArticleBtn.addEventListener('click', () => {
      articleForm.reset();
      document.getElementById('form-title').textContent = 'Añadir Nuevo Artículo';
      articleFormContainer.style.display = 'flex';
  
      // Restaurar el evento submit original
      articleForm.onsubmit = async (e) => {
          e.preventDefault();
          await addNewArticle();
      };
  });
  
  cancelBtn.addEventListener('click', () => {
      articleFormContainer.style.display = 'none';
  });
  
  // Añadir un nuevo artículo
  async function addNewArticle() {
      const newArticle = {
          Artículo: document.getElementById('article-name').value,
          Referencia: document.getElementById('article-ref').value,
          Precio: parseFloat(document.getElementById('article-price').value),
          Familia: document.getElementById('article-family').value,
          Subfamilia: document.getElementById('article-subfamily').value || '',
          Imagen: document.getElementById('article-image').value || 'https://github.com/Joel1to96/PaginaWeb/tree/main/imagenes/default.png',
      };
  
      try {
          await db.collection("menu").add(newArticle);
          alert('Artículo añadido correctamente');
          articleFormContainer.style.display = 'none';
          await loadCategories();
          loadMenu();
      } catch (e) {
          console.error("Error añadiendo el artículo: ", e);
      }
  }
  
  // Mostrar el formulario de edición
  function showEditForm(item, id) {
      articleForm.reset();
      document.getElementById('form-title').textContent = 'Editar Artículo';
      articleFormContainer.style.display = 'flex';
  
      // Prellenar el formulario
      document.getElementById('article-name').value = item.Artículo;
      document.getElementById('article-ref').value = item.Referencia;
      document.getElementById('article-price').value = item.Precio;
      document.getElementById('article-family').value = item.Familia;
      document.getElementById('article-subfamily').value = item.Subfamilia;
      document.getElementById('article-image').value = item.Imagen;
  
      // Actualizar la función de submit
      articleForm.onsubmit = async (e) => {
          e.preventDefault();
  
          const updatedArticle = {
              Artículo: document.getElementById('article-name').value,
              Referencia: document.getElementById('article-ref').value,
              Precio: parseFloat(document.getElementById('article-price').value),
              Familia: document.getElementById('article-family').value,
              Subfamilia: document.getElementById('article-subfamily').value || '',
              Imagen: document.getElementById('article-image').value || 'https://github.com/Joel1to96/PaginaWeb/tree/main/imagenes/default.png',
          };
  
          try {
              await db.collection("menu").doc(id).update(updatedArticle);
              alert('Artículo actualizado correctamente');
              articleFormContainer.style.display = 'none';
              await loadCategories();
              loadMenu();
          } catch (e) {
              console.error("Error actualizando el artículo: ", e);
          }
      };
  }
  
  // Eliminar un artículo
  async function deleteArticle(id) {
      if (confirm('¿Estás seguro de eliminar este artículo?')) {
          try {
              await db.collection("menu").doc(id).delete();
              alert('Artículo eliminado correctamente');
              await loadCategories();
              loadMenu();
          } catch (e) {
              console.error("Error eliminando el artículo: ", e);
          }
      }
  }
  
  // Función para resaltar el enlace activo en la barra lateral
  function highlightActiveLink(activeLink) {
      // Eliminar la clase 'active' de todos los enlaces
      const links = sidebarMenu.querySelectorAll('a');
      links.forEach(link => {
          link.classList.remove('active');
      });
      // Añadir la clase 'active' al enlace seleccionado
      activeLink.classList.add('active');
  }
  
  // Inicializar la aplicación
  loadMenu();
  loadCategories();
  
  // Modo Oscuro (opcional)
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = darkModeToggle.querySelector('i');
      if (document.body.classList.contains('dark-mode')) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
      } else {
          icon.classList.remove('fa-sun');
          icon.classList.add('fa-moon');
      }
  });
  