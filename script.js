const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Открыть меню'); }
menuButton.addEventListener('click', () => { const isOpen = menuButton.getAttribute('aria-expanded') === 'true'; mobileNav.hidden = isOpen; menuButton.setAttribute('aria-expanded', String(!isOpen)); menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню'); });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });

const cosmos = document.querySelector('.cosmos');
const phases = {
  feel: ['Чувствовать', 'Замечать, что происходит внутри. Давать место своим чувствам и желаниям.'],
  choose: ['Выбирать', 'Различать свои желания и чужие ожидания. Находить то, что важно именно вам.'],
  act: ['Действовать', 'Переводить понимание в свой следующий шаг. В подходящем вам темпе.']
};
if (cosmos) cosmos.querySelectorAll('button[data-phase]').forEach(button => {
  button.addEventListener('click', () => {
    const phase = button.dataset.phase;
    cosmos.dataset.phase = phase;
    cosmos.querySelectorAll('button[data-phase]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cosmos.querySelector('h3').textContent = phases[phase][0];
    cosmos.querySelector('.cosmos-core p').textContent = phases[phase][1];
  });
});

const reviewDeck = document.querySelector('.review-deck');
if (reviewDeck && !reviewDeck.classList.contains('review-fixed')) {
  const slides = [...reviewDeck.querySelectorAll('.review-slide')];
  const controls = document.querySelector('.review-controls');
  let active = 0;
  function showReview(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      slide.querySelector('.review-sheet').inert = i !== active;
      if (slides.length > 1) {
        slide.tabIndex = i === active ? -1 : 0;
        slide.setAttribute('aria-expanded', String(i === active));
      }
    });
    controls.querySelector('.review-counter').textContent = `${active + 1} / ${slides.length}`;
  }
  if (slides.length > 1) {
    controls.hidden = false;
    slides.forEach((slide, index) => {
      slide.addEventListener('click', () => { if (index !== active) showReview(index); });
      slide.addEventListener('keydown', event => {
        if (event.target === slide && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); showReview(index); }
      });
    });
    controls.querySelector('[data-review-prev]').addEventListener('click', () => showReview(active - 1));
    controls.querySelector('[data-review-next]').addEventListener('click', () => showReview(active + 1));
    let start;
    reviewDeck.addEventListener('touchstart', event => { start = [event.touches[0].clientX, event.touches[0].clientY]; }, {passive:true});
    reviewDeck.addEventListener('touchend', event => {
      if (!start) return;
      const dx = event.changedTouches[0].clientX - start[0];
      const dy = event.changedTouches[0].clientY - start[1];
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) showReview(active + (dx < 0 ? 1 : -1));
      start = null;
    }, {passive:true});
  }
  if (slides.length) showReview(0);
}

if (cosmos) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cosmosInView = false;
  const syncOrbitMotion = () => cosmos.classList.toggle('is-visible', cosmosInView && !document.hidden && !motionPreference.matches);
  const observer = new IntersectionObserver(entries => {
    cosmosInView = entries[0].isIntersecting;
    syncOrbitMotion();
  }, {threshold: 0.2});
  observer.observe(cosmos);
  document.addEventListener('visibilitychange', syncOrbitMotion);
  motionPreference.addEventListener('change', syncOrbitMotion);
  cosmos.addEventListener('pointermove', event => {
    if (motionPreference.matches || event.pointerType !== 'mouse') return;
    const bounds = cosmos.getBoundingClientRect();
    cosmos.style.setProperty('--tilt-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 22}deg`);
    cosmos.style.setProperty('--tilt-x', `${(.5 - (event.clientY - bounds.top) / bounds.height) * 16}deg`);
  });
  cosmos.addEventListener('pointerleave', () => {
    cosmos.style.setProperty('--tilt-x', '0deg');
    cosmos.style.setProperty('--tilt-y', '0deg');
  });
}

const orbitPause = document.querySelector('.orbit-pause');
if (orbitPause) orbitPause.addEventListener('click', () => {
  const paused = cosmos.classList.toggle('is-paused');
  orbitPause.setAttribute('aria-pressed', String(paused));
  orbitPause.textContent = paused ? 'Продолжить вращение' : 'Приостановить вращение';
});

document.querySelectorAll('.review-heart').forEach(button => {
  button.addEventListener('click', () => {
    const liked = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(liked));
    button.setAttribute('aria-label', liked ? 'Убрать отметку «Нравится»' : 'Нравится отзыв');
  });
});

const feedbackCarousel = document.querySelector('.feedback-grid');
if (feedbackCarousel) {
  const cards = [...feedbackCarousel.querySelectorAll('.feedback-frame')];
  const previous = document.querySelector('.feedback-prev');
  const next = document.querySelector('.feedback-next');
  const position = document.querySelector('.feedback-position');
  if (previous && next && position) {
    const currentIndex = () => cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left - feedbackCarousel.getBoundingClientRect().left) < Math.abs(cards[best].getBoundingClientRect().left - feedbackCarousel.getBoundingClientRect().left) ? index : best, 0);
    const move = direction => {
      const index = Math.max(0, Math.min(cards.length - 1, currentIndex() + direction));
      feedbackCarousel.scrollTo({left: cards[index].offsetLeft - cards[0].offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    const update = () => {
      const atEnd = feedbackCarousel.scrollLeft + feedbackCarousel.clientWidth >= feedbackCarousel.scrollWidth - 3;
      previous.disabled = feedbackCarousel.scrollLeft < 3;
      next.disabled = atEnd;
      position.textContent = `${atEnd ? cards.length : currentIndex() + 1} / ${cards.length}`;
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    feedbackCarousel.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    update();
  }
}

// Only one video review plays at a time, directly inside its circle.
const videoReviews = [...document.querySelectorAll('.video-review')];
videoReviews.forEach((button, index) => {
  const video = button.querySelector('video');
  const icon = button.querySelector('.video-review-play');
  const update = () => {
    const playing = !video.paused && !video.ended;
    button.classList.toggle('is-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', `${playing ? 'Приостановить' : 'Смотреть'} видеоотзыв ${index + 1}`);
    icon.textContent = playing ? 'Ⅱ' : '▶';
  };
  button.addEventListener('click', async () => {
    if (!video.paused) { video.pause(); return; }
    videoReviews.forEach(other => { if (other !== button) other.querySelector('video').pause(); });
    if (video.ended) video.currentTime = 0;
    try { await video.play(); }
    catch { button.querySelector('.video-review-caption').textContent = 'Не удалось загрузить · повторить'; }
  });
  ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, update));
  update();
});
