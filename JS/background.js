document.addEventListener("DOMContentLoaded", () => {
    async function loadBg() {
        const response = await fetch('../data/tours.json');
        const tours = await response.json();

        const bgImg = document.getElementById('bg');
        const randomTour = tours[Math.floor(Math.random() * tours.length)];
        bgImg.style.backgroundImage = `url('${randomTour.images[0].url}')`;
        bgImg.style.backgroundSize = "cover";
        bgImg.style.backgroundPosition = "center";
        bgImg.style.backgroundRepeat = "no-repeat";
        bgImg.style.minHeight = "100vh";
        bgImg.style.backdropFilter = "blur(100px)";
        bgImg.style.transition = "opacity 0.5s ease-in-out";
        bgImg.style.opacity = "1";
    }
    loadBg();
});

const passwordInput = document.getElementById("password");
const togglePasswordButton = document.getElementById("togglePassword");
const eyeOpenIcon = `
  <i class="fa-solid fa-eye"></i>
`;

const eyeClosedIcon = `
  <i class="fa-solid fa-eye-slash"></i>
`;
let passwordVisible = false;
let visibilityTimeout;

togglePasswordButton.addEventListener("click", () => {
  passwordVisible = !passwordVisible;
  passwordInput.type = passwordVisible ? "text" : "password";
  togglePasswordButton.setAttribute("aria-pressed", passwordVisible);
  togglePasswordButton.setAttribute(
    "aria-label",
    passwordVisible ? "Hide password" : "Show password"
  );

  const eyeIcon = passwordVisible ? eyeOpenIcon : eyeClosedIcon;
  togglePasswordButton.innerHTML = eyeIcon;

  if (passwordVisible) {
    visibilityTimeout = setTimeout(() => {
      passwordInput.type = "password";
      passwordVisible = false;
      togglePasswordButton.setAttribute("aria-pressed", "false");
      togglePasswordButton.setAttribute("aria-label", "Show password");
      togglePasswordButton.innerHTML = eyeClosedIcon;
    }, 5000);
  } else {
    clearTimeout(visibilityTimeout);
  }
});