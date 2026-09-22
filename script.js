const garden = document.getElementById('garden');
const btnCarta = document.getElementById('btnCarta');
const btnFlores = document.getElementById('btnFlores');
const carta = document.getElementById('carta');
const contadorFlores = document.getElementById('contadorFlores');
const feedback = document.getElementById('feedback');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let flowersCount = 12;

function createFlower(leftPercent, delay = 0) {
  const flower = document.createElement('div');
  flower.className = 'flower';
  flower.style.left = `${leftPercent}%`;
  flower.style.bottom = '-4px';
  flower.style.animationDelay = `${delay}s`;

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

for (let i = 0; i < flowersCount; i += 1) {
  createFlower(4 + i * 8, (i % 4) * 0.4);
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
