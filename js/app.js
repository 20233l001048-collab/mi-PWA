// 1. Registrar el Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Registrado'))
    .catch(err => console.error('Error en SW:', err));
}

// 2. Control de Instalación (PWA Instalable)
let deferredPrompt;
const btnInstall = document.getElementById('btn-install');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.style.display = 'block';
});

btnInstall.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        btnInstall.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }
});

// 3. Notificaciones
const btnNotify = document.getElementById('btn-notify');
btnNotify.addEventListener('click', () => {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('¡Notificaciones Activadas!', {
        body: 'Te avisaremos cuando tus platos estén listos.',
        icon: 'icons/recetario.svg'
      });
    }
  });
});

// 4. Detección de Conexión (Online / Offline)
const statusBar = document.getElementById('status-bar');

function updateOnlineStatus() {
  if (navigator.onLine) {
    statusBar.textContent = 'Estado: Conectado';
    statusBar.className = 'online';
    
    // Activar Evento Sync al volver a estar online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(swRegistration => {
        return swRegistration.sync.register('sync-recetas');
      });
    }
  } else {
    statusBar.textContent = 'Estado: Sin conexión (Modo Offline)';
    statusBar.className = 'offline';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// 5. Guardar Recetas Localmente (LocalStorage)
const form = document.getElementById('recipe-form');
const recipeList = document.getElementById('recipe-list');

function loadRecipes() {
  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  recipeList.innerHTML = '';
  recipes.forEach(r => {
    const div = document.createElement('div');
    div.className = 'recipe-card';
    div.innerHTML = `<h3>${r.title}</h3><p>${r.ingredients}</p>`;
    recipeList.appendChild(div);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const ingredients = document.getElementById('ingredients').value;

  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  recipes.push({ title, ingredients });
  localStorage.setItem('recipes', JSON.stringify(recipes));

  form.reset();
  loadRecipes();

  // Notificación local de confirmación
  if (Notification.permission === 'granted') {
    new Notification('Receta Guardada', {
      body: `Se guardó "${title}" correctamente.`,
      icon: 'icons/recetario.svg'
    });
  }
});

loadRecipes();
