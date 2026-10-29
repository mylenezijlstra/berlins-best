/**
 * Berlin's Best - Tempelhofer Feld Field Guide
 * Slideshow logica (6 foto's, naadloze loop, 3s auto-scroll, thumbnails, swipe)
 * Plus mobiel hamburger-menu interactiviteit
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 1. MOBIEL HAMBURGER MENU
  // ============================================================
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const isOpen = mobileNav.classList.contains('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================================
  // 2. INTERACTIEVE SLIDESHOW (ZES BLIKKEN OP HET VELD)
  // ============================================================
  const slidesData = [
    { 
      src: 'img/foto2.jpg', 
      fallback: 'documenten/img/foto2.jpg', 
      tag: '01/06', 
      title: 'Landingsbaan', 
      desc: 'De landingsbaan is nu van iedereen · De schaal van vrijheid' 
    },
    { 
      src: 'img/foto3.jpg', 
      fallback: 'documenten/img/foto3.jpg', 
      tag: '02/06', 
      title: 'Panorama', 
      desc: 'Een horizon midden in de stad' 
    },
    { 
      src: 'img/foto4.jpg', 
      fallback: 'documenten/img/foto4.jpg', 
      tag: '03/06', 
      title: 'Gemeenschapstuin', 
      desc: 'Allmende-Kontor · Burgerparticipatie in het groen' 
    },
    { 
      src: 'img/foto5.jpg', 
      fallback: 'documenten/img/foto5.jpg', 
      tag: '04/06', 
      title: 'Groene paden', 
      desc: 'Ruimte om te wandelen, skaten en ontdekken' 
    },
    { 
      src: 'img/foto6.jpg', 
      fallback: 'documenten/img/foto6.jpg', 
      tag: '05/06', 
      title: 'Hergebruikt hout', 
      desc: 'Zelfbouw en circulaire materialen' 
    },
    { 
      src: 'img/foto7.jpg', 
      fallback: 'documenten/img/foto7.jpg', 
      tag: '06/06', 
      title: 'Het veld in mei', 
      desc: 'Natuur, biodiversiteit en open lucht' 
    }
  ];

  const totalOriginalSlides = slidesData.length;
  const AUTOPLAY_INTERVAL = 3000; // 3 seconden

  const track = document.getElementById('gallery-track');
  const viewport = document.getElementById('gallery-viewport');
  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');
  const progressBar = document.getElementById('gallery-progress-bar');
  const overlayBadge = document.getElementById('slide-badge');
  const thumbnails = document.querySelectorAll('.thumb-card');

  if (!track || !viewport) return;

  // Render slides met clones voor oneindige loop: [Clone Laatste, Slide 1..6, Clone Eerste]
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
    img.alt = slideInfo.title;
    img.loading = index <= 2 ? 'eager' : 'lazy';

    img.onerror = function() {
      if (this.src.indexOf(slideInfo.fallback) === -1) {
        this.src = slideInfo.fallback;
      }
    };

    slideEl.appendChild(img);
    track.appendChild(slideEl);
  });

  // Toestand
  let currentIndex = 1;
  let isTransitioning = false;
  let isPlaying = true;
  let progressAnimation = null;
  let progressStartTime = 0;
  let progressElapsed = 0;

  // Init positie direct op index 1
  track.style.transition = 'none';
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  void track.offsetWidth;
  track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

  function updateUI() {
    let displayIndex;
    if (currentIndex === 0) {
      displayIndex = totalOriginalSlides;
    } else if (currentIndex === totalOriginalSlides + 1) {
      displayIndex = 1;
    } else {
      displayIndex = currentIndex;
    }

    const currentData = slidesData[displayIndex - 1];
    if (overlayBadge && currentData) {
      overlayBadge.innerHTML = `<strong>${currentData.tag}</strong> ${currentData.title} · ${currentData.desc}`;
    }

    thumbnails.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === displayIndex - 1);
    });
  }

  function goToSlide(targetIndex) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = targetIndex;
    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateUI();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Naadloze infinite loop wrapping
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
    updateUI();
  });

  // 3-Seconden Autoplay Timer & Voortgangsbalk
  function startProgress() {
    cancelAnimationFrame(progressAnimation);
    progressStartTime = performance.now() - progressElapsed;

    function step(timestamp) {
      if (!isPlaying) return;
      const elapsed = timestamp - progressStartTime;
      const percent = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      if (progressBar) progressBar.style.width = `${percent}%`;

      if (elapsed >= AUTOPLAY_INTERVAL) {
        if (progressBar) progressBar.style.width = '0%';
        progressElapsed = 0;
        nextSlide();
        startProgress();
      } else {
        progressAnimation = requestAnimationFrame(step);
      }
    }

    progressAnimation = requestAnimationFrame(step);
  }

  function resetAutoPlay() {
    progressElapsed = 0;
    if (progressBar) progressBar.style.width = '0%';
    if (isPlaying) {
      startProgress();
    }
  }

  // Thumbnails click interactie
  thumbnails.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      goToSlide(idx + 1);
      resetAutoPlay();
    });
  });

  // Pijlknoppen
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
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
      startProgress();
    }
  });

  // Toetsenbord pijltoetsen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoPlay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoPlay();
    }
  });

  // Swipe & Muis slepen
  let startX = 0;
  let isDragging = false;

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.clientX || (e.touches && e.touches[0].clientX) || 0;
  }

  viewport.addEventListener('mousedown', (e) => {
    if (isTransitioning) return;
    isDragging = true;
    startX = getPositionX(e);
    cancelAnimationFrame(progressAnimation);
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const endX = getPositionX(e);
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
  });

  viewport.addEventListener('touchstart', (e) => {
    if (isTransitioning) return;
    isDragging = true;
    startX = getPositionX(e);
    cancelAnimationFrame(progressAnimation);
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const endX = (e.changedTouches && e.changedTouches[0].clientX) || startX;
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
  }, { passive: true });

  // Init
  updateUI();
  startProgress();

  // ============================================================
  // 3. GOOGLE MAPS WEERGAVE WISSELAAR (Walid Salhi)
  // ============================================================
  const mapFrame = document.getElementById('google-maps-frame');
  const btnFeld = document.getElementById('btn-view-feld');
  const btnSat = document.getElementById('btn-view-sat');

  const MAP_VIEWS = {
    feld: 'https://maps.google.com/maps?q=Tempelhofer%20Feld%2C%20Berlin&hl=nl&t=&z=14&ie=UTF8&iwloc=&output=embed',
    satellite: 'https://maps.google.com/maps?q=Tempelhofer%20Feld%2C%20Berlin&hl=nl&t=k&z=15&ie=UTF8&iwloc=&output=embed'
  };

  function setMapView(viewKey, activeBtn) {
    if (mapFrame && MAP_VIEWS[viewKey]) {
      mapFrame.src = MAP_VIEWS[viewKey];
    }
    if (btnFeld && btnSat) {
      btnFeld.classList.remove('active');
      btnSat.classList.remove('active');
      if (activeBtn) activeBtn.classList.add('active');
    }
  }

  if (btnFeld) {
    btnFeld.addEventListener('click', () => setMapView('feld', btnFeld));
  }

  if (btnSat) {
    btnSat.addEventListener('click', () => setMapView('satellite', btnSat));
  }
});
