/**
 * Premium Shopify Theme JavaScript
 * 
 * This file contains all the custom JavaScript functionality for the theme.
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initHeader();
  initProductCards();
  initQuickView();
  initQuantitySelector();
  initMobileMenu();
  initAccordions();
  initImageZoom();
});

/**
 * Header functionality (sticky, search, etc)
 */
function initHeader() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      menuToggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-active');
      document.body.classList.toggle('mobile-menu-open');
    });
  }
  
  // Sticky header
  const header = document.querySelector('.header[data-header-sticky="true"]');
  
  if (header) {
    let lastScrollTop = 0;
    const scrollThreshold = 100;
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > scrollThreshold) {
        header.classList.add('is-sticky');
        
        if (scrollTop > lastScrollTop) {
          // Scrolling down
          header.classList.add('is-hidden');
        } else {
          // Scrolling up
          header.classList.remove('is-hidden');
        }
      } else {
        header.classList.remove('is-sticky', 'is-hidden');
      }
      
      lastScrollTop = scrollTop;
    });
  }
}

/**
 * Product card hover effects and quick add functionality
 */
function initProductCards() {
  const quickAddForms = document.querySelectorAll('.quick-add-form');
  
  quickAddForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.innerHTML = '<span class="loading-spinner"></span>';
      submitButton.disabled = true;
      
      const formData = new FormData(form);
      
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        submitButton.innerHTML = '<span class="checkmark">✓</span>';
        
        // Update cart count
        updateCartCount();
        
        // Reset button after delay
        setTimeout(() => {
          submitButton.innerHTML = originalButtonText;
          submitButton.disabled = false;
        }, 2000);
      })
      .catch(error => {
        console.error('Error:', error);
        submitButton.innerHTML = 'Error';
        
        // Reset button after delay
        setTimeout(() => {
          submitButton.innerHTML = originalButtonText;
          submitButton.disabled = false;
        }, 2000);
      });
    });
  });
}

/**
 * Quick view modal functionality
 */
function initQuickView() {
  const quickViewButtons = document.querySelectorAll('.quick-view-btn');
  const quickViewModal = document.getElementById('quick-view-modal');
  
  if (quickViewButtons.length && quickViewModal) {
    quickViewButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        const container = document.getElementById('quick-view-container');
        
        // Show modal and loading state
        quickViewModal.classList.add('show');
        container.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch product data
        fetch(`/products/${productId}?view=quick-view`)
          .then(response => response.text())
          .then(html => {
            container.innerHTML = html;
            
            // Initialize product form functionality inside quick view
            if (container.querySelector('.product-form')) {
              initQuantitySelector();
              initVariantSelector();
            }
          })
          .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p>Error loading product. Please try again.</p>';
          });
      });
    });
    
    // Close modal functionality
    const closeButton = quickViewModal.querySelector('.modal-close');
    
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        quickViewModal.classList.remove('show');
      });
      
      // Close on click outside content
      quickViewModal.addEventListener('click', function(e) {
        if (e.target === quickViewModal) {
          quickViewModal.classList.remove('show');
        }
      });
    }
  }
}

/**
 * Quantity selector for product forms
 */
function initQuantitySelector() {
  const quantityWrappers = document.querySelectorAll('.quantity-selector');
  
  quantityWrappers.forEach(wrapper => {
    const minusButton = wrapper.querySelector('.quantity-minus');
    const plusButton = wrapper.querySelector('.quantity-plus');
    const input = wrapper.querySelector('.quantity-input');
    
    if (minusButton && plusButton && input) {
      minusButton.addEventListener('click', function() {
        const currentValue = parseInt(input.value);
        const minValue = parseInt(input.getAttribute('min')) || 1;
        
        if (currentValue > minValue) {
          input.value = currentValue - 1;
          input.dispatchEvent(new Event('change'));
        }
      });
      
      plusButton.addEventListener('click', function() {
        const currentValue = parseInt(input.value);
        const maxValue = parseInt(input.getAttribute('max')) || 999;
        
        if (currentValue < maxValue) {
          input.value = currentValue + 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    }
  });
}

/**
 * Mobile menu functionality
 */
function initMobileMenu() {
  const mobileMenuItems = document.querySelectorAll('.mobile-menu .has-dropdown');
  
  mobileMenuItems.forEach(item => {
    const link = item.querySelector('a');
    const dropdown = item.querySelector('.dropdown');
    
    if (link && dropdown) {
      // Create a toggle button
      const toggleButton = document.createElement('button');
      toggleButton.className = 'dropdown-toggle';
      toggleButton.setAttribute('aria-label', 'Toggle submenu');
      toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      
      link.parentNode.insertBefore(toggleButton, link.nextSibling);
      
      toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        item.classList.toggle('is-open');
        
        // Toggle aria-expanded
        const expanded = item.classList.contains('is-open');
        toggleButton.setAttribute('aria-expanded', expanded);
        
        // Adjust dropdown height
        if (expanded) {
          dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
        } else {
          dropdown.style.maxHeight = null;
        }
      });
    }
  });
}

/**
 * Accordion functionality for product descriptions, FAQs, etc.
 */
function initAccordions() {
  const accordions = document.querySelectorAll('.accordion');
  
  accordions.forEach(accordion => {
    const items = accordion.querySelectorAll('.accordion-item');
    
    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      
      if (header && content) {
        header.addEventListener('click', function() {
          // Check if this accordion allows multiple open items
          const allowMultiple = accordion.getAttribute('data-allow-multiple') === 'true';
          
          if (!allowMultiple) {
            // Close other items
            items.forEach(otherItem => {
              if (otherItem !== item && otherItem.classList.contains('is-open')) {
                otherItem.classList.remove('is-open');
                otherItem.querySelector('.accordion-content').style.maxHeight = null;
              }
            });
          }
          
          // Toggle current item
          item.classList.toggle('is-open');
          
          // Adjust content height
          if (item.classList.contains('is-open')) {
            content.style.maxHeight = content.scrollHeight + 'px';
          } else {
            content.style.maxHeight = null;
          }
        });
      }
    });
  });
}

/**
 * Product image zoom functionality
 */
function initImageZoom() {
  const productImages = document.querySelectorAll('.product-image-zoom');
  
  productImages.forEach(img => {
    img.addEventListener('mousemove', function(e) {
      const zoomer = this.querySelector('.product-image-zoomer');
      
      if (zoomer) {
        const offsetX = e.offsetX;
        const offsetY = e.offsetY;
        const x = offsetX / this.offsetWidth * 100;
        const y = offsetY / this.offsetHeight * 100;
        
        zoomer.style.backgroundPosition = x + '% ' + y + '%';
      }
    });
  });
}

/**
 * Update cart count in header
 */
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const countBubble = document.querySelector('[data-cart-count-bubble]');
      
      if (countBubble) {
        if (cart.item_count > 0) {
          countBubble.innerHTML = `
            <span aria-hidden="true">${cart.item_count}</span>
            <span class="visually-hidden">${cart.item_count} items in cart</span>
          `;
        } else {
          countBubble.innerHTML = '';
        }
      }
    })
    .catch(error => console.error('Error updating cart count:', error));
}

/**
 * Variant selector for product forms
 */
function initVariantSelector() {
  const variantSelectors = document.querySelectorAll('.variant-selector');
  
  variantSelectors.forEach(selector => {
    const variantSelect = selector.querySelector('select[data-variant-select]');
    const optionSelectors = selector.querySelectorAll('.option-selector');
    const priceContainer = document.querySelector('[data-product-price]');
    const addToCartButton = document.querySelector('[data-add-to-cart]');
    
    if (variantSelect && optionSelectors.length) {
      // Set initial state
      updateSelectedVariant();
      
      // Listen for option changes
      optionSelectors.forEach(optionSelector => {
        const inputs = optionSelector.querySelectorAll('input[type="radio"]');
        
        inputs.forEach(input => {
          input.addEventListener('change', updateSelectedVariant);
        });
      });
      
      function updateSelectedVariant() {
        // Get selected options
        const selectedOptions = [];
        
        optionSelectors.forEach(optionSelector => {
          const selectedInput = optionSelector.querySelector('input[type="radio"]:checked');
          
          if (selectedInput) {
            selectedOptions.push(selectedInput.value);
          }
        });
        
        // Find matching variant
        const selectedVariant = findVariant(selectedOptions);
        
        if (selectedVariant) {
          // Update hidden select
          variantSelect.value = selectedVariant.id;
          variantSelect.dispatchEvent(new Event('change'));
          
          // Update price
          if (priceContainer) {
            if (selectedVariant.compare_at_price > selectedVariant.price) {
              priceContainer.innerHTML = `
                <span class="product-price-sale">${formatMoney(selectedVariant.price)}</span>
                <span class="product-price-compare">${formatMoney(selectedVariant.compare_at_price)}</span>
              `;
            } else {
              priceContainer.innerHTML = `
                <span class="product-price-regular">${formatMoney(selectedVariant.price)}</span>
              `;
            }
          }
          
          // Update add to cart button
          if (addToCartButton) {
            if (selectedVariant.available) {
              addToCartButton.disabled = false;
              addToCartButton.innerHTML = 'Add to Cart';
            } else {
              addToCartButton.disabled = true;
              addToCartButton.innerHTML = 'Sold Out';
            }
          }
        }
      }
      
      function findVariant(selectedOptions) {
        const variants = JSON.parse(selector.getAttribute('data-variants'));
        
        return variants.find(variant => {
          return selectedOptions.every((option, index) => {
            return variant.options[index] === option;
          });
        });
      }
      
      function formatMoney(cents) {
        const moneyFormat = selector.getAttribute('data-money-format') || '{{ amount }}';
        
        return moneyFormat.replace('{{ amount }}', (cents / 100).toFixed(2));
      }
    }
  });
}
