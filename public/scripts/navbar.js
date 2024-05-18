// Reveal navbar when scrolling
const navbarReveal = document.querySelector(".navbar-reveal");
if (navbarReveal) {
    let windowScroll = window.scrollY;

    const windowEvents = ["load", "scroll"];
    windowEvents.forEach((e) => {
        window.addEventListener(e, () => {
            const currentScroll = window.scrollY;
            const navbarOffset =
                windowScroll < currentScroll && currentScroll > 0 ? "-100%" : "0";
            const navbarCollapse = navbarReveal.querySelector(".navbar-collapse");

            if (!navbarCollapse.classList.contains("show"))
                navbarReveal.style.transform = `translateY(${navbarOffset})`;

            windowScroll = currentScroll;
        });
    });
}
