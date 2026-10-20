// @ts-nocheck
/**
 * Tisso Vison - Product Hotspot & Quick View Popup
 * Font: Jost
 */
document.addEventListener("DOMContentLoaded", function () {
  /** @type {NodeListOf<HTMLElement>} */
  const moreDetailsButtons = document.querySelectorAll(".more-details");
  /** @type {HTMLElement | null} */
  const modal = document.getElementById("modal");
  if (!modal) return;

  /** @type {HTMLElement | null} */
  const modalOverlay = modal.querySelector(".modal-overlay");
  /** @type {HTMLElement | null} */
  const closeButton = modal.querySelector(".close-button");
  /** @type {HTMLImageElement | null} */
  const popupImage = modal.querySelector(".largePopupImage img");
  /** @type {HTMLElement | null} */
  const popupTitle = document.getElementById("popup-product-title");
  /** @type {HTMLElement | null} */
  const popupPrice = document.getElementById("popup-product-price");
  /** @type {HTMLElement | null} */
  const popupDescription = document.getElementById("popup-product-description");
  /** @type {HTMLElement | null} */
  const popupSizes = document.getElementById("popup-sizes");
  /** @type {HTMLElement | null} */
  const popupColors = document.getElementById("popup-colors");
  /** @type {HTMLButtonElement | null} */
  const addToCartBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById("add-to-cart-btn"));

  const arrowIconUrl = modal.dataset.arrowIcon || "";
  /** @type {any} */
  let currentProduct = null;
  /** @type {HTMLElement | null} */
  let activeHotspotButton = null;

  function closeModal() {
    if (modal) {
      modal.classList.remove("show-modal");
      modal.setAttribute("aria-hidden", "true");
    }
    if (activeHotspotButton) {
      activeHotspotButton.classList.remove("active");
      activeHotspotButton = null;
    }
  }

  // Close handlers
  if (closeButton) {
    closeButton.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("show-modal")) {
      closeModal();
    }
  });

  // Hotspot click handlers
  moreDetailsButtons.forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();
      const productHandle = button.dataset.productHandle || button.getAttribute("data-product-handle");
      if (!productHandle) return;

      // If clicking already open hotspot, toggle close
      if (button.classList.contains("active")) {
        closeModal();
        return;
      }

      // Deactivate any previously active hotspot button
      moreDetailsButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      activeHotspotButton = button;

      try {
        const response = await fetch(`/products/${productHandle}.js`);
        if (!response.ok) throw new Error("Product fetch failed");
        currentProduct = await response.json();

        // 1. Populate image
        const imgUrl = currentProduct.images && currentProduct.images[0] ? currentProduct.images[0] : "";
        if (popupImage) {
          popupImage.src = imgUrl;
          popupImage.alt = currentProduct.title || "";
        }

        // 2. Populate title & price & description
        if (popupTitle) popupTitle.textContent = currentProduct.title || "";
        if (popupPrice) popupPrice.textContent = `$${(currentProduct.price / 100).toFixed(2)}`;
        if (popupDescription) popupDescription.innerHTML = currentProduct.description || "";

        // 3. Populate Colors (Option 2)
        if (popupColors) {
          popupColors.innerHTML = "";
          const colorVariants = (currentProduct.variants || []).filter((/** @type {any} */ v) => v.option2);
          const uniqueColors = Array.from(
            new Map(colorVariants.map((/** @type {any} */ v) => [v.option2, v])).values()
          );

          if (uniqueColors.length > 0) {
            const colorLabel = document.createElement("label");
            colorLabel.classList.add("label");
            colorLabel.textContent = "Color";
            popupColors.appendChild(colorLabel);

            const btnItems = document.createElement("div");
            btnItems.classList.add("btn-items");

            uniqueColors.forEach((variant, index) => {
              const colorBtn = document.createElement("button");
              colorBtn.type = "button";
              colorBtn.classList.add("color-button", variant.option2);
              const textSpan = document.createElement("span");
              textSpan.classList.add("color-text");
              textSpan.textContent = variant.option2;
              colorBtn.appendChild(textSpan);
              colorBtn.dataset.colorName = variant.option2;

              // Side indicator stripe
              if (variant.option2 && variant.option2.toLowerCase() !== "white") {
                colorBtn.style.borderLeft = `5px solid ${variant.option2.toLowerCase()}`;
              }

              // Pre-select the first color
              if (index === 0) {
                colorBtn.classList.add("active");
              }

              colorBtn.addEventListener("click", function () {
                popupColors.querySelectorAll(".color-button").forEach((btn) => {
                  btn.classList.remove("active");
                });
                colorBtn.classList.add("active");

                // If variant has its own image, update preview
                if (variant.featured_image && variant.featured_image.src && popupImage) {
                  popupImage.src = variant.featured_image.src;
                }
              });

              btnItems.appendChild(colorBtn);
            });

            popupColors.appendChild(btnItems);
          }
        }

        // 4. Populate Sizes (Option 1)
        if (popupSizes) {
          popupSizes.innerHTML = "";
          const sizeVariants = (currentProduct.variants || []).filter((/** @type {any} */ v) => v.option1);
          const uniqueSizes = Array.from(
            new Map(sizeVariants.map((/** @type {any} */ v) => [v.option1, v])).values()
          );

          if (uniqueSizes.length > 0) {
            const sizeWrapper = document.createElement("div");
            sizeWrapper.classList.add("custom-dropdown");

            const sizeLabel = document.createElement("label");
            sizeLabel.classList.add("label");
            sizeLabel.textContent = "Size";
            sizeWrapper.appendChild(sizeLabel);

            const dropdownBtn = document.createElement("button");
            dropdownBtn.type = "button";
            dropdownBtn.classList.add("dropdown-button");

            const btnText = document.createElement("span");
            btnText.classList.add("btn-text");
            btnText.textContent = "Choose your size";

            const arrowIconSpan = document.createElement("span");
            arrowIconSpan.classList.add("arrow-icon");

            const arrowImg = document.createElement("img");
            arrowImg.src = arrowIconUrl;
            arrowImg.alt = "Toggle dropdown";
            arrowImg.classList.add("arrow");
            arrowIconSpan.appendChild(arrowImg);

            dropdownBtn.appendChild(btnText);
            dropdownBtn.appendChild(arrowIconSpan);
            sizeWrapper.appendChild(dropdownBtn);

            // List
            const dropdownList = document.createElement("ul");
            dropdownList.classList.add("dropdown-list");

            uniqueSizes.forEach((v) => {
              const li = document.createElement("li");
              li.classList.add("dropdown-item");
              li.dataset.sizeValue = v.option1;
              li.textContent = v.option1;
              dropdownList.appendChild(li);
            });

            sizeWrapper.appendChild(dropdownList);

            // Dropdown toggle
            dropdownBtn.addEventListener("click", function (e) {
              e.stopPropagation();
              dropdownList.classList.toggle("show");
              arrowImg.classList.toggle("rotate");
            });

            // Item selection
            dropdownList.addEventListener("click", function (e) {
              const target = /** @type {Element | null} */ (e.target);
              const item = target ? /** @type {HTMLElement | null} */ (target.closest(".dropdown-item")) : null;
              if (item) {
                btnText.textContent = item.dataset.sizeValue || item.textContent || "";
                dropdownBtn.dataset.selectedSize = item.dataset.sizeValue || "";
                dropdownList.classList.remove("show");
                arrowImg.classList.remove("rotate");
              }
            });

            // Close dropdown on outside click
            document.addEventListener("click", function (e) {
              const target = /** @type {Node | null} */ (e.target);
              if (target && !sizeWrapper.contains(target)) {
                dropdownList.classList.remove("show");
                arrowImg.classList.remove("rotate");
              }
            });

            popupSizes.appendChild(sizeWrapper);
          }
        }

        // 5. Open modal
        modal.classList.add("show-modal");
        modal.setAttribute("aria-hidden", "false");
      } catch (err) {
        console.error("Error fetching product data:", err);
      }
    });
  });

  // Add to Cart handler
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", async function () {
      if (!currentProduct) return;

      const activeColorBtn = popupColors
        ? /** @type {HTMLElement | null} */ (popupColors.querySelector(".color-button.active"))
        : null;
      const dropdownBtn = popupSizes
        ? /** @type {HTMLElement | null} */ (popupSizes.querySelector(".dropdown-button"))
        : null;
      const dropdownBtnText = dropdownBtn ? dropdownBtn.querySelector(".btn-text") : null;
      const selectedSizeText = dropdownBtn
        ? (dropdownBtn.dataset.selectedSize || (dropdownBtnText ? dropdownBtnText.textContent || "" : "")).trim()
        : "";

      if (!activeColorBtn) {
        alert("Please select a color.");
        return;
      }

      if (!selectedSizeText || selectedSizeText === "Choose your size") {
        alert("Please select a size.");
        return;
      }

      const selectedColorText = (activeColorBtn.dataset.colorName || activeColorBtn.textContent || "").trim();

      // Find the specific variant matching Size (option1) and Color (option2)
      const selectedVariant = (currentProduct.variants || []).find(
        (/** @type {any} */ v) =>
          v.option1 &&
          v.option2 &&
          v.option1.toLowerCase() === selectedSizeText.toLowerCase() &&
          v.option2.toLowerCase() === selectedColorText.toLowerCase()
      );

      if (!selectedVariant) {
        alert("The selected variant combination is not available.");
        return;
      }

      // Visual button loading state
      const btnTextEl = addToCartBtn.querySelector(".btn-text");
      const originalText = btnTextEl ? btnTextEl.textContent || "Add to Cart" : "Add to Cart";
      if (btnTextEl) btnTextEl.textContent = "Adding...";
      addToCartBtn.disabled = true;

      try {
        const response = await fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedVariant.id,
            quantity: 1,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText);
        }

        // SPECIAL EXAM RULE:
        // If variant Size = "M" and Color = "Black", also add "Soft Winter Jacket" (dark-winter-jacket)
        if (
          (selectedSizeText.toUpperCase() === "M" || selectedSizeText.toUpperCase() === "MEDIUM") &&
          selectedColorText.toLowerCase() === "black"
        ) {
          try {
            const bonusResponse = await fetch("/products/dark-winter-jacket.js");
            if (bonusResponse.ok) {
              const bonusProduct = await bonusResponse.json();
              const bonusVariant =
                (bonusProduct.variants || []).find(
                  (/** @type {any} */ v) =>
                    v.option1 &&
                    v.option2 &&
                    (v.option1.toUpperCase() === "M" || v.option1.toUpperCase() === "MEDIUM") &&
                    v.option2.toLowerCase() === "black"
                ) || (bonusProduct.variants ? bonusProduct.variants[0] : null);

              if (bonusVariant) {
                await fetch("/cart/add.js", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: bonusVariant.id,
                    quantity: 1,
                  }),
                });
              }
            }
          } catch (bonusErr) {
            console.error("Error adding bonus product:", bonusErr);
          }
        }

        // Successfully added, redirect to cart
        window.location.href = "/cart";
      } catch (err) {
        console.error("Error adding to cart:", err);
        alert("Failed to add product to cart. Please try again.");
        if (btnTextEl) btnTextEl.textContent = originalText;
        addToCartBtn.disabled = false;
      }
    });
  }
});
