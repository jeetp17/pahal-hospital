(function () {
  var mobileQuery = window.matchMedia("(max-width: 900px)");

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initScrollControls();
    initHeroSlider();
    initSimpleCarousel("#carousel-testimonials", 7000);
    initSimpleCarousel(".image-carousel", 5200);
    initContactForm();
  });

  function initMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    var dropdowns = Array.prototype.slice.call(document.querySelectorAll("[data-dropdown]"));

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var nextState = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", nextState);
      toggle.setAttribute("aria-expanded", String(nextState));
    });

    dropdowns.forEach(function (dropdown) {
      var button = dropdown.querySelector("[data-dropdown-toggle]");
      if (!button) {
        return;
      }

      button.addEventListener("click", function () {
        if (!mobileQuery.matches) {
          return;
        }

        var nextState = !dropdown.classList.contains("is-open");
        closeDropdowns(dropdowns, dropdown);
        dropdown.classList.toggle("is-open", nextState);
        button.setAttribute("aria-expanded", String(nextState));
      });
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) {
        return;
      }

      if (nav.contains(event.target) || toggle.contains(event.target)) {
        return;
      }

      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      closeDropdowns(dropdowns);
    });

    window.addEventListener("resize", function () {
      if (mobileQuery.matches) {
        return;
      }

      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      closeDropdowns(dropdowns);
    });
  }

  function closeDropdowns(dropdowns, except) {
    dropdowns.forEach(function (dropdown) {
      if (dropdown === except) {
        return;
      }

      dropdown.classList.remove("is-open");
      var button = dropdown.querySelector("[data-dropdown-toggle]");
      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initScrollControls() {
    var header = document.querySelector("[data-site-header]");
    var backToTop = document.getElementById("back-to-top");

    function update() {
      var scrolled = window.scrollY > 20;
      if (header) {
        header.classList.toggle("is-scrolled", scrolled);
      }
      if (backToTop) {
        backToTop.classList.toggle("is-visible", window.scrollY > 500);
      }
    }

    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initHeroSlider() {
    var banner = document.querySelector(".tp-banner");
    if (!banner) {
      return;
    }

    var list = banner.querySelector("ul");
    var slides = list ? Array.prototype.slice.call(list.children).filter(function (item) {
      return item.tagName && item.tagName.toLowerCase() === "li";
    }) : [];

    if (!slides.length) {
      return;
    }

    var container = banner.closest(".tp-banner-container") || banner;
    var index = 0;
    var timer = null;

    banner.classList.add("is-enhanced");
    activate(0);

    if (slides.length < 2) {
      return;
    }

    var previousButton = createHeroButton("prev", "Previous slide", "hero-control hero-control--prev");
    var nextButton = createHeroButton("next", "Next slide", "hero-control hero-control--next");
    container.appendChild(previousButton);
    container.appendChild(nextButton);

    previousButton.addEventListener("click", function () {
      go(index - 1);
      restart();
    });

    nextButton.addEventListener("click", function () {
      go(index + 1);
      restart();
    });

    container.addEventListener("mouseenter", stop);
    container.addEventListener("mouseleave", start);
    start();

    function createHeroButton(direction, label, className) {
      var button = document.createElement("button");
      var points = direction === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";
      button.type = "button";
      button.className = className;
      button.setAttribute("aria-label", label);
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline points="' + points + '"></polyline></svg>';
      return button;
    }

    function activate(nextIndex) {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === nextIndex);
      });
      index = nextIndex;
    }

    function go(nextIndex) {
      var wrapped = (nextIndex + slides.length) % slides.length;
      activate(wrapped);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
      }, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restart() {
      stop();
      start();
    }
  }

  function initSimpleCarousel(selector, interval) {
    var roots = Array.prototype.slice.call(document.querySelectorAll(selector));

    roots.forEach(function (root) {
      var items = Array.prototype.slice.call(root.children).filter(function (child) {
        return child.classList.contains("item");
      });

      if (!items.length) {
        return;
      }

      var index = 0;
      root.classList.add("is-enhanced");
      activate(0);

      if (items.length < 2) {
        return;
      }

      window.setInterval(function () {
        activate((index + 1) % items.length);
      }, interval);

      function activate(nextIndex) {
        items.forEach(function (item, itemIndex) {
          item.classList.toggle("is-active", itemIndex === nextIndex);
        });
        index = nextIndex;
      }
    });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    var message = document.getElementById("message-contact");
    var submit = document.getElementById("btnSubmit");
    var messageTimer;

    if (!form || !message) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var captcha = form.querySelector(".cf-turnstile");
      var captchaInput = form.querySelector("[name='cf-turnstile-response']");
      if (captcha && (!captchaInput || !captchaInput.value.trim())) {
        setMessage("Please complete the captcha verification.", true, true);
        return;
      }

      setMessage("Sending...", false, false);
      if (submit) {
        submit.disabled = true;
      }

      window.fetch(form.action, {
        method: form.method || "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (response) {
        return response.json().catch(function () {
          return {};
        }).then(function (payload) {
          if (!response.ok || payload.key === false) {
            throw new Error(payload.value || "Request failed (HTTP " + response.status + "). Please try again or call the hospital directly.");
          }

          form.reset();
          resetCaptcha();
          setMessage(payload.value || "Thank you! we'll contact you shortly.", false, true);
        });
      }).catch(function (error) {
        resetCaptcha();
        setMessage(error.message || "We could not send the message. Please call the hospital directly.", true, true);
      }).finally(function () {
        if (submit) {
          submit.disabled = false;
        }
      });
    });

    function resetCaptcha() {
      var captcha = form.querySelector(".cf-turnstile");
      if (captcha && window.turnstile && typeof window.turnstile.reset === "function") {
        window.turnstile.reset(captcha);
      }
    }

    function setMessage(text, isError, autoHide) {
      window.clearTimeout(messageTimer);
      message.textContent = text;
      message.style.display = "block";
      message.classList.toggle("is-error", Boolean(isError));

      if (autoHide) {
        messageTimer = window.setTimeout(function () {
          message.style.display = "none";
          message.textContent = "";
          message.classList.remove("is-error");
        }, 6000);
      }
    }
  }
})();
