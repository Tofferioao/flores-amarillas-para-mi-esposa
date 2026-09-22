const garden = document.getElementById('garden');
const btnCarta = document.getElementById('btnCarta');
const btnFlores = document.getElementById('btnFlores');
const carta = document.getElementById('carta');
const contadorFlores = document.getElementById('contadorFlores');
const feedback = document.getElementById('feedback');
const btnGoogleFotos = document.getElementById('btnGoogleFotos');
const estadoGoogleFotos = document.getElementById('estadoGoogleFotos');
const galeriaFotos = document.getElementById('galeriaFotos');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GOOGLE_CLIENT_ID = '654285211857-dob0clf76ihje9an8eq4ocrqsgfaciqa.apps.googleusercontent.com';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
const PHOTOS_API_BASE = 'https://photospicker.googleapis.com/v1';
const GARDEN_PHRASES = [
  'Tu amor hace florecer mi vida.',
  'Eres mi rayito amarillo favorito.',
  'Contigo todo tiene sentido y color.',
  'Gracias por cuidarnos con tanto amor.',
];

let flowersCount = 12;
let tokenClient;
let accessToken = '';
let tokenExpiryTime = 0;

function createFlower(leftPercent, delay = 0) {
  const flower = document.createElement('div');
  flower.className = 'flower';
  flower.style.left = `${leftPercent}%`;
  flower.style.bottom = '-4px';
  flower.style.animationDelay = `${delay}s`;
  flower.tabIndex = 0;
  flower.setAttribute('role', 'button');
  flower.setAttribute('aria-label', 'Flor amarilla interactiva');

  const stem = document.createElement('span');
  stem.className = 'stem';
  flower.appendChild(stem);

  const center = document.createElement('span');
  center.className = 'center';
  flower.appendChild(center);

  for (let i = 0; i < 8; i += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    flower.appendChild(petal);
  }

  garden.appendChild(flower);
}

function createBee(leftPercent, topPercent, delay = 0) {
  const bee = document.createElement('span');
  bee.className = 'bee';
  bee.style.left = `${leftPercent}%`;
  bee.style.top = `${topPercent}%`;
  bee.style.animationDelay = `${delay}s`;
  bee.tabIndex = 0;
  bee.setAttribute('role', 'button');
  bee.setAttribute('aria-label', 'Abejita interactiva');
  garden.appendChild(bee);
}

function addPetalRain(amount = 16) {
  for (let i = 0; i < amount; i += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal-rain';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = `${Math.random() * 20}%`;
    petal.style.animationDelay = `${Math.random() * 0.8}s`;
    garden.appendChild(petal);

    setTimeout(() => petal.remove(), 3200);
  }
}

function updateCounter() {
  contadorFlores.textContent = `Flores regaladas hoy: ${flowersCount}`;
}

function randomPhrase() {
  return GARDEN_PHRASES[Math.floor(Math.random() * GARDEN_PHRASES.length)];
}

function showGardenPhrase() {
  feedback.textContent = randomPhrase();
}

function parsePollInterval(rawValue) {
  if (typeof rawValue === 'number') {
    return Math.max(1000, rawValue * 1000);
  }
  if (typeof rawValue !== 'string') {
    return 2000;
  }
  const normalized = rawValue.trim().toLowerCase();
  if (normalized.endsWith('ms')) {
    const millis = Number.parseFloat(normalized.replace('ms', ''));
    return Number.isFinite(millis) ? Math.max(1000, millis) : 2000;
  }
  if (normalized.endsWith('s')) {
    const seconds = Number.parseFloat(normalized.replace('s', ''));
    return Number.isFinite(seconds) ? Math.max(1000, seconds * 1000) : 2000;
  }
  const numeric = Number.parseFloat(normalized);
  return Number.isFinite(numeric) ? Math.max(1000, numeric * 1000) : 2000;
}

async function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function photosFetch(path, options = {}, shouldRetry = true) {
  const response = await fetch(`${PHOTOS_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && shouldRetry) {
    accessToken = '';
    tokenExpiryTime = 0;
    await ensureGoogleToken(true);
    return photosFetch(path, options, false);
  }

  if (!response.ok) {
    let details = '';
    try {
      const payload = await response.json();
      details = payload?.error?.message || '';
    } catch (_err) {
      details = '';
    }
    throw new Error(details || `HTTP ${response.status}`);
  }

  return response.status === 204 ? {} : response.json();
}

function initGoogleTokenClient() {
  if (tokenClient) {
    return;
  }

  if (!window.google?.accounts?.oauth2) {
    throw new Error('No fue posible cargar Google Identity Services.');
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: GOOGLE_SCOPE,
    callback: () => {},
  });
}

async function ensureGoogleToken(interactive = true) {
  if (accessToken && Date.now() < tokenExpiryTime) {
    return accessToken;
  }

  initGoogleTokenClient();

  return new Promise((resolve, reject) => {
    tokenClient.callback = (response) => {
      if (response.error) {
        if (response.error === 'access_denied') {
          reject(new Error('Permiso denegado por el usuario.'));
          return;
        }
        reject(new Error(`Error de autorización: ${response.error}`));
        return;
      }

      accessToken = response.access_token || '';
      tokenExpiryTime = Date.now() + Math.max((response.expires_in || 0) - 60, 0) * 1000;
      resolve(accessToken);
    };

    tokenClient.error_callback = (error) => {
      if (error.type === 'popup_closed') {
        reject(new Error('Cancelaste el inicio de sesión antes de autorizar.'));
        return;
      }
      reject(new Error('No se pudo completar el inicio de sesión con Google.'));
    };

    tokenClient.requestAccessToken({
      prompt: interactive ? 'consent' : '',
    });
  });
}

function renderSelectedPhotos(mediaItems) {
  galeriaFotos.innerHTML = '';

  mediaItems.forEach((item, index) => {
    const card = document.createElement('figure');
    card.className = 'photo-card';

    const image = document.createElement('img');
    image.alt = item.filename || `Recuerdo seleccionado ${index + 1}`;
    image.loading = 'lazy';
    image.src = `${item.baseUrl}=w900-h900`;
    card.appendChild(image);

    const caption = document.createElement('figcaption');
    caption.textContent = item.filename || 'Foto elegida desde Google Fotos';
    card.appendChild(caption);
    galeriaFotos.appendChild(card);
  });
}

async function collectPickedMediaItems(sessionId) {
  const items = [];
  let nextPageToken = '';

  do {
    const query = new URLSearchParams({
      sessionId,
      pageSize: '25',
    });
    if (nextPageToken) {
      query.set('pageToken', nextPageToken);
    }

    const data = await photosFetch(`/mediaItems?${query.toString()}`);
    if (Array.isArray(data.mediaItems)) {
      items.push(...data.mediaItems);
    }
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  return items;
}

async function pollUntilMediaIsSet(sessionId, expireTime, pollIntervalMs, popupWindow) {
  const expiresAt = expireTime ? Date.parse(expireTime) : Date.now() + 8 * 60 * 1000;
  while (Date.now() < expiresAt) {
    if (popupWindow?.closed) {
      throw new Error('Cancelaste la selección en Google Fotos.');
    }
    await wait(pollIntervalMs);
    const sessionState = await photosFetch(`/sessions/${encodeURIComponent(sessionId)}`);
    if (sessionState.mediaItemsSet) {
      return;
    }
  }
  throw new Error('La sesión del selector expiró antes de completar la selección.');
}

async function openPhotosPickerFlow() {
  btnGoogleFotos.disabled = true;
  btnGoogleFotos.textContent = 'Abriendo Google Fotos...';
  estadoGoogleFotos.textContent = 'Conectando con Google Fotos...';

  let sessionId = '';
  try {
    await ensureGoogleToken(true);
    const session = await photosFetch('/sessions', { method: 'POST', body: '{}' });
    sessionId = session.id || '';

    if (!sessionId || !session.pickerUri) {
      throw new Error('La API no devolvió una sesión válida para el selector.');
    }

    const popup = window.open(session.pickerUri, '_blank', 'noopener,noreferrer,width=1000,height=800');
    if (!popup) {
      throw new Error('El navegador bloqueó la ventana del selector. Permite pop-ups e inténtalo de nuevo.');
    }

    estadoGoogleFotos.textContent = 'Selecciona tus fotos en Google Fotos y vuelve a esta pestaña.';
    const pollIntervalMs = parsePollInterval(session.pollInterval || session.pollingConfig?.pollInterval);
    await pollUntilMediaIsSet(sessionId, session.expireTime, pollIntervalMs, popup);

    const pickedMedia = await collectPickedMediaItems(sessionId);
    if (!pickedMedia.length) {
      estadoGoogleFotos.textContent = 'No se eligieron fotos. Se mantienen los recuerdos locales.';
      return;
    }

    renderSelectedPhotos(pickedMedia);
    estadoGoogleFotos.textContent = `Se cargaron ${pickedMedia.length} foto(s) elegida(s) desde Google Fotos.`;
  } catch (error) {
    const knownMessage =
      error instanceof Error ? error.message : 'Ocurrió un error inesperado con Google Fotos.';
    if (knownMessage.includes('Permiso denegado')) {
      estadoGoogleFotos.textContent = 'No autorizaste el acceso. Seguimos mostrando recuerdos locales.';
    } else if (knownMessage.includes('Cancelaste')) {
      estadoGoogleFotos.textContent = 'Autorización cancelada. Puedes intentarlo cuando quieras.';
    } else if (knownMessage.includes('expiró')) {
      estadoGoogleFotos.textContent = 'Tu sesión expiró. Vuelve a abrir el selector para intentarlo de nuevo.';
    } else if (knownMessage.includes('HTTP')) {
      estadoGoogleFotos.textContent = 'Error de red o de la API de Google Fotos. Inténtalo en unos minutos.';
    } else {
      estadoGoogleFotos.textContent = knownMessage;
    }
  } finally {
    if (sessionId) {
      try {
        await photosFetch(`/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
      } catch (_err) {}
    }
    btnGoogleFotos.disabled = false;
    btnGoogleFotos.textContent = 'Elegir fotos de Google Fotos';
  }
}

for (let i = 0; i < flowersCount; i += 1) {
  createFlower(4 + i * 8, (i % 4) * 0.4);
}

for (let i = 0; i < 3; i += 1) {
  createBee(12 + i * 28, 18 + (i % 2) * 18, i * 0.5);
}

btnCarta.addEventListener('click', () => {
  const isHidden = carta.hidden;
  carta.hidden = !isHidden;
  btnCarta.setAttribute('aria-expanded', String(isHidden));
  btnCarta.textContent = isHidden ? 'Cerrar carta de amor' : 'Abrir carta de amor';
  feedback.textContent = isHidden
    ? 'Carta abierta. Gracias por leer mi corazón.'
    : 'Carta cerrada. Puedes abrirla cuando quieras.';
});

btnFlores.addEventListener('click', () => {
  const safeLeft = 4 + Math.random() * 88;
  createFlower(safeLeft, Math.random() * 0.6);
  if (!reducedMotion) {
    addPetalRain(12);
  }
  flowersCount += 1;
  updateCounter();
  feedback.textContent = '¡Floreció una nueva flor para ti!';

  btnFlores.disabled = true;
  btnFlores.textContent = 'Floreciendo...';
  window.setTimeout(() => {
    btnFlores.disabled = false;
    btnFlores.textContent = 'Hacer florecer más';
  }, 550);
});

garden.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  if (target.closest('.flower') || target.closest('.bee')) {
    showGardenPhrase();
  }
});

garden.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  if (target.classList.contains('flower') || target.classList.contains('bee')) {
    event.preventDefault();
    showGardenPhrase();
  }
});

btnGoogleFotos.addEventListener('click', () => {
  openPhotosPickerFlow();
});
