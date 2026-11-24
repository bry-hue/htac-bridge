/* =========================================
   MOBILE MENU
   ========================================= */

function toggleMenu() {
    var nav = document.getElementById('mainNav');

    if (!nav) {
        return;
    }

    if (nav.className.indexOf('show') === -1) {
        nav.className += ' show';
    } else {
        nav.className = nav.className.replace(/\s?show/g, '');
    }
}


/* =========================================
   SCHOOL PHOTO SLIDER
   ========================================= */

var currentSlide = 0;
var slideTimer = null;

function getSlides() {
    return document.getElementsByClassName('school-slide');
}

function getDots() {
    return document.getElementsByClassName('slider-dot');
}

function showSlide(index) {
    var slides = getSlides();
    var dots = getDots();
    var i;

    if (!slides || slides.length === 0) {
        return;
    }

    if (index >= slides.length) {
        index = 0;
    }

    if (index < 0) {
        index = slides.length - 1;
    }

    currentSlide = index;

    /* Hide all slides */
    for (i = 0; i < slides.length; i++) {
        slides[i].className =
            slides[i].className.replace(/\s?active/g, '');
    }

    /* Remove active from all dots */
    for (i = 0; i < dots.length; i++) {
        dots[i].className =
            dots[i].className.replace(/\s?active/g, '');
    }

    /* Show current slide */
    slides[currentSlide].className += ' active';

    /* Activate current dot */
    if (dots[currentSlide]) {
        dots[currentSlide].className += ' active';
    }
}


function changeSlide(direction) {
    showSlide(currentSlide + direction);
    restartSlider();
}


function startSlider() {
    slideTimer = setInterval(function () {
        showSlide(currentSlide + 1);
    }, 5000);
}


function restartSlider() {
    if (slideTimer) {
        clearInterval(slideTimer);
    }

    startSlider();
}


/* =========================================
   INITIALIZE
   ========================================= */

function initializeMainPage() {
    showSlide(0);
    startSlider();
}

if (document.readyState === "complete") {
    initializeMainPage();
} else {
    window.addEventListener("load", initializeMainPage);
}