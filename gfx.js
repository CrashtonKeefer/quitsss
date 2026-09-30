const gfxGrid = document.querySelector("#gfx-grid");
const gfxEmpty = document.querySelector("#gfx-empty");
const lightbox = document.querySelector("#banner-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const gfxFiles = window.portfolioGfxFiles || [];

function buildGfxGrid() {
  gfxEmpty.hidden = gfxFiles.length > 0;

  gfxFiles.forEach((fileName, index) => {
    const card = document.createElement("button");
    const image = document.createElement("img");

    card.className = "banner-card gfx-card";
    card.type = "button";
    card.style.transitionDelay = `${Math.min(index * 45, 540)}ms`;
    image.alt = `GFX artwork ${index + 1}`;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      card.remove();
      gfxEmpty.hidden = gfxGrid.children.length !== 0;
    });

    image.src = `gfx/${encodeURIComponent(fileName)}`;
    card.append(image);
    card.addEventListener("click", () => {
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    });
    gfxGrid.append(card);
  });
}

buildGfxGrid();
