document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       0. SYSTEM FLOW: LANDING -> VIDEO -> MAIN
       ========================================= */
    const landingScreen = document.getElementById('landing-screen');
    const btnVerInvitacion = document.getElementById('btn-ver-invitacion');

    const videoScreen = document.getElementById('video-screen');
    const introVideo = document.getElementById('intro-video');
    const btnSkipVideo = document.getElementById('btn-skip-video');

    const mainInvitation = document.getElementById('main-invitation');

    const musicBtn = document.getElementById('music-btn');
    const audioEl = document.getElementById('bg-music');
    let isPlaying = false;
    let firstPlay = true; // para fade-in solo la primera vez

    const startPlay = () => {
        if (isPlaying) return;

        const tryPlay = audioEl.play();
        if (!tryPlay) return;

        tryPlay.then(() => {
            isPlaying = true;
            musicBtn.classList.add('playing');

            // Fade-in solo la primera vez que suena
            if (firstPlay) {
                firstPlay = false;
                audioEl.volume = 0;
                const fadeDuration = 2500;
                const steps = 60;
                const stepTime = fadeDuration / steps;
                let step = 0;
                const ramp = setInterval(() => {
                    step++;
                    audioEl.volume = Math.min(1, step / steps);
                    if (step >= steps) clearInterval(ramp);
                }, stepTime);
            }
        }).catch(e => {
            console.warn('Audio no pudo reproducirse:', e);
        });
    };

    const toggleMusic = () => {
        if (isPlaying) {
            audioEl.pause();
            musicBtn.classList.remove('playing');
            isPlaying = false;
        } else {
            startPlay();
        }
    };

    musicBtn.addEventListener('click', () => toggleMusic());

    btnVerInvitacion.addEventListener('click', () => {
        landingScreen.classList.add('hidden-view');
        videoScreen.classList.remove('hidden-view');
        introVideo.play();
    });

    const showMainInvitation = () => {
        videoScreen.classList.add('hidden-view');
        introVideo.pause();

        mainInvitation.classList.remove('hidden-view');

        setTimeout(() => {
            startPlay();
        }, 500);
    };

    introVideo.addEventListener('ended', showMainInvitation);
    btnSkipVideo.addEventListener('click', showMainInvitation);


    /* =========================================
       0.5 BOTÓN DE SCROLL ABAJO (HERO)
       ========================================= */
    const scrollBtn = document.getElementById('scroll-down-btn');
    const familySection = document.getElementById('family-section-anchor');

    if (scrollBtn && familySection) {
        scrollBtn.addEventListener('click', () => {
            familySection.scrollIntoView({ behavior: 'smooth' });
        });
    }


    /* =========================================
       1. INTERSECTION OBSERVER FOR ANIMATIONS
       ========================================= */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(section => {
        observer.observe(section);
    });

    /* =========================================
       2. COUNTDOWN TIMER LOGIC
       ========================================= */
    let currentYear = new Date().getFullYear();
    let targetDate = new Date(`May 16, ${currentYear} 19:00:00`).getTime();

    if (new Date().getTime() > targetDate) {
        targetDate = new Date(`May 16, ${currentYear + 1} 19:00:00`).getTime();
    }

    const setTime = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            document.querySelector('.countdown-grid').innerHTML = "<h3>¡El día llegó!</h3>";
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('cd-days').innerText = days;
        document.getElementById('cd-hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('cd-minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('cd-seconds').innerText = seconds.toString().padStart(2, '0');
    };

    setTime();
    const countdownInterval = setInterval(setTime, 1000);

    /* =========================================
       3. CAROUSEL LOGIC
       ========================================= */
    const track = document.getElementById('photo-track');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const dotsContainer = document.getElementById('carousel-dots');

    if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

    const images = track.querySelectorAll('.carousel-img');
    const totalImages = images.length;
    let currentIndex = 0;

    images.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });

    const updateControls = () => {
        const slideWidth = images[0].clientWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        document.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentIndex);
        });
    };

    const goToSlide = (idx) => {
        currentIndex = idx;
        updateControls();
    };

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalImages;
        updateControls();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        updateControls();
    });

    window.addEventListener('resize', updateControls);

    // Swipe para móviles
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextBtn.click();
        if (touchEndX > touchStartX + 50) prevBtn.click();
    }

    /* =========================================
       4. FORMULARIO RSVP HANDLER
       ========================================= */
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = rsvpForm.querySelector('.btn-submit');

            // 1. Guardar los estilos originales para poder restaurarlos después
            const textoOriginal = submitBtn.innerHTML;
            const fondoOriginal = submitBtn.style.background;

            // 2. Estado de carga: Avisar al usuario que se está procesando y bloquear el botón
            submitBtn.innerHTML = 'Enviando...';
            submitBtn.disabled = true; // Evita que hagan doble clic accidentalmente

            // 3. Preparar los datos del formulario
            const formData = new FormData(rsvpForm);
            const urlDelScript = 'https://script.google.com/macros/s/AKfycbxdZHJHE5AGmFnKj5ByEcDtW_wWzR0yGhyB8Z2PbeQki68JRB_2WwU_bipfmdzpBeVXxA/exec'; // <-- Pega tu URL de Apps Script aquí

            // 4. Enviar los datos a Google Sheets
            fetch(urlDelScript, {
                method: 'POST',
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    // 5. ÉXITO: Aquí va tu lógica visual original
                    submitBtn.innerHTML = '¡Enviado, Gracias! <i class="ph ph-check-circle"></i>';
                    submitBtn.style.background = '#25D366';
                    submitBtn.disabled = false; // Volver a habilitar el botón

                    // Esperar 5 segundos para resetear
                    setTimeout(() => {
                        rsvpForm.reset();
                        submitBtn.innerHTML = textoOriginal;
                        submitBtn.style.background = fondoOriginal;
                    }, 5000);
                })
                .catch(error => {
                    // 6. ERROR: Qué pasa si falla el internet o el script
                    console.error('Error en la petición:', error);
                    submitBtn.innerHTML = 'Error al enviar';
                    submitBtn.style.background = '#ff4444'; // Rojo para error
                    submitBtn.disabled = false;

                    // Restaurar el botón rápido si hay error
                    setTimeout(() => {
                        submitBtn.innerHTML = textoOriginal;
                        submitBtn.style.background = fondoOriginal;
                    }, 3000);
                });
        });
    }
});
