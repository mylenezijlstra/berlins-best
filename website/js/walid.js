/**
 * Berlin's Best - Tempelhofer Feld Google Maps Interactie
 * Auteur: Walid Salhi
 */

document.addEventListener('DOMContentLoaded', () => {
  const mapFrame = document.getElementById('google-maps-frame');
  const btnFeld = document.getElementById('btn-view-feld');
  const btnSat = document.getElementById('btn-view-sat');

  const VIEWS = {
    feld: 'https://maps.google.com/maps?q=Tempelhofer%20Feld%2C%20Berlin&hl=nl&t=&z=14&ie=UTF8&iwloc=&output=embed',
    satellite: 'https://maps.google.com/maps?q=Tempelhofer%20Feld%2C%20Berlin&hl=nl&t=k&z=15&ie=UTF8&iwloc=&output=embed'
  };

  function setView(viewKey, activeBtn) {
    if (mapFrame && VIEWS[viewKey]) {
      mapFrame.src = VIEWS[viewKey];
    }
    if (btnFeld && btnSat) {
      btnFeld.classList.remove('active');
      btnSat.classList.remove('active');
      if (activeBtn) activeBtn.classList.add('active');
    }
  }

  if (btnFeld) {
    btnFeld.addEventListener('click', () => setView('feld', btnFeld));
  }

  if (btnSat) {
    btnSat.addEventListener('click', () => setView('satellite', btnSat));
  }
});
