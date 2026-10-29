/**
 * Berlin's Best - Infinite Slideshow
 * Minimalistisch: Foto2 t/m Foto7 (6 foto's), automatische 3s loop, vooruit/terug, grijs thema.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Afbeeldingen: 6 foto's (foto2.jpg t/m foto7.jpg)
  const slidesData = [
    { src: 'img/foto2.jpg', fallback: 'documenten/img/foto2.jpg', alt: 'Foto 2' },
    { src: 'img/foto3.jpg', fallback: 'documenten/img/foto3.jpg', alt: 'Foto 3' },
    { src: 'img/foto4.jpg', fallback: 'documenten/img/foto4.jpg', alt: 'Foto 4' },
    { src: 'img/foto5.jpg', fallback: 'documenten/img/foto5.jpg', alt: 'Foto 5' },
    { src: 'img/foto6.jpg', fallback: 'documenten/img/foto6.jpg', alt: 'Foto 6' },
    { src: 'img/foto7.jpg', fallback: 'documenten/img/foto7.jpg', alt: 'Foto 7' }
  ];

  const totalOriginalSlides = slidesData.length;
  const AUTOPLAY_INTERVAL = 3000; // 3 seconden

  // DOM Elementen
  const track = document.getElementById('slideshow-track');
  const viewport = document.getElementById('slideshow-viewport');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dotsContainer = document.getElementById('dots-container');
  const progressBar = document.getElementById('progress-bar');
  const togglePlayBtn = document.getElementById('toggle-play-btn');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');

  if (!track || !viewport) return;

  // Render Slides met clones voor naadloze infinite loop
  // Structuur: [Clone Laatste, Slide 1, Slide 2, ..., Slide 7, Clone Eerste]
  const fullSlides = [
    { ...slidesData[totalOriginalSlides - 1], isClone: true },
    ...slidesData,
    { ...slidesData[0], isClone: true }
  ];

  track.innerHTML = '';
  fullSlides.forEach((slideInfo, index) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'slide';

    const img = document.createElement('img');
    img.src = slideInfo.src;
    img.alt = slideInfo.alt;
    img.loading = index <= 2 ? 'eager' : 'lazy';

    img.onerror = function() {
      if (this.src.indexOf(slideInfo.fallback) === -1) {
        this.src = slideInfo.fallback;
      }
    };

    slideEl.appendChild(img);
    track.appendChild(slideEl);
  });

  // Render 7 Indicatordots onderaan
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalOriginalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = `dot ${i === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Ga naar foto ${i + 1}`);
    dot.dataset.index = i;
    dot.addEventListener('click', () => {
      goToSlide(i + 1);
      resetAutoPlay();
    });
    dotsContainer.appendChild(dot);
  }

  // Toestand
  let currentIndex = 1;
  let isTransitioning = false;
  let isPlaying = true;
  let progressAnimation = null;
  let progressStartTime = 0;
  let progressElapsed = 0;

  // Initiële positie
  track.style.transition = 'none';
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  void track.offsetWidth;
  track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

  function updateDots() {
    let displayIndex;
    if (currentIndex === 0) {
      displayIndex = totalOriginalSlides;
    } else if (currentIndex === totalOriginalSlides + 1) {
      displayIndex = 1;
    } else {
      displayIndex = currentIndex;
    }

    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === displayIndex - 1);
    });
  }

  function goToSlide(targetIndex) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = targetIndex;
    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Naadloze infinite loop
  track.addEventListener('transitionend', () => {
    isTransitioning = false;

    if (currentIndex === totalOriginalSlides + 1) {
      track.style.transition = 'none';
      currentIndex = 1;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      void track.offsetWidth;
    } else if (currentIndex === 0) {
      track.style.transition = 'none';
      currentIndex = totalOriginalSlides;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      void track.offsetWidth;
    }
    updateDots();
  });

  // Voortgangsbalk & 3-seconden timer
  function startProgress() {
    cancelAnimationFrame(progressAnimation);
    progressStartTime = performance.now() - progressElapsed;

    function step(timestamp) {
      if (!isPlaying) return;
      const elapsed = timestamp - progressStartTime;
      const percent = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      progressBar.style.width = `${percent}%`;

      if (elapsed >= AUTOPLAY_INTERVAL) {
        progressBar.style.width = '0%';
        progressElapsed = 0;
        nextSlide();
        startProgress();
      } else {
        progressAnimation = requestAnimationFrame(step);
      }
    }

    progressAnimation = requestAnimationFrame(step);
  }

  function pauseProgress() {
    cancelAnimationFrame(progressAnimation);
    progressElapsed = performance.now() - progressStartTime;
    if (playIcon && pauseIcon) {
      playIcon.style.display = 'inline-block';
      pauseIcon.style.display = 'none';
    }
  }

  function resumeProgress() {
    if (playIcon && pauseIcon) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline-block';
    }
    startProgress();
  }

  function resetAutoPlay() {
    progressElapsed = 0;
    progressBar.style.width = '0%';
    if (isPlaying) {
      startProgress();
    }
  }

  function togglePlayPause() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      resumeProgress();
    } else {
      pauseProgress();
    }
  }

  // Knoppen
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  if (togglePlayBtn) {
    togglePlayBtn.addEventListener('click', togglePlayPause);
  }

  // Hover pauze
  viewport.addEventListener('mouseenter', () => {
    if (isPlaying) {
      cancelAnimationFrame(progressAnimation);
      progressElapsed = performance.now() - progressStartTime;
    }
  });

  viewport.addEventListener('mouseleave', () => {
    if (isPlaying) {
      resumeProgress();
    }
  });

  // Toetsenbord
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoPlay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoPlay();
    } else if (e.key === ' ') {
      if (document.activeElement.tagName !== 'BUTTON') {
        e.preventDefault();
        togglePlayPause();
      }
    }
  });

  // Swipe & Muis drag
  let startX = 0;
  let isDragging = false;

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.clientX || (e.touches && e.touches[0].clientX) || 0;
  }

  function dragStart(e) {
    if (isTransitioning) return;
    isDragging = true;
    startX = getPositionX(e);
    cancelAnimationFrame(progressAnimation);
  }

  function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.type.includes('mouse') ? e.pageX : (e.changedTouches && e.changedTouches[0].clientX) || startX;
    const diff = endX - startX;

    if (diff < -50) {
      nextSlide();
      resetAutoPlay();
    } else if (diff > 50) {
      prevSlide();
      resetAutoPlay();
    } else {
      track.style.transition = 'transform 0.3s ease';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (isPlaying) startProgress();
    }
  }

  viewport.addEventListener('mousedown', dragStart);
  window.addEventListener('mouseup', dragEnd);

  viewport.addEventListener('touchstart', dragStart, { passive: true });
  viewport.addEventListener('touchend', dragEnd, { passive: true });

  updateDots();
  startProgress();
});
