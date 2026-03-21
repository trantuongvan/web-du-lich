let tours = [];

async function loadTours() {
  try {
    const response = await fetch("../data/tours.json");
    tours = await response.json();

    renderTours(tours);
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
}

function getSpec(tour, key) {
  return tour.specs.find((s) => s.k === key)?.v || "";
}

function renderTours(list) {
  const tourList = document.getElementById("tourList");
  const emptyState = document.getElementById("empty_state");

  if (!tourList || !emptyState) return;

  tourList.innerHTML = "";

  if (list.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");

  list.forEach((tour) => {
    tourList.innerHTML += `
      <div class="col-lg-4 col-md-6">
        <div class="card h-100">
          <img src="${tour.images[0].url}" class="card-img-top">
          <div class="card-body">
            <h6>${tour.short_name}</h6>
            <p>${tour.type}</p>
            <p class="text-primary fw-bold">${tour.price.display}</p>
          </div>
        </div>
      </div>
    `;
  });
}

function handleSearch() {
  const destination = document.getElementById("destinationSelect").value;
  const departure = document.getElementById("departureSelect").value;

  const sortValue = document.getElementById("sortSelect").value;

  const budgetBtn = document.querySelector(".budget_button.active");
  const timeBtn = document.querySelector(".time_button.active");

  const min = budgetBtn ? +budgetBtn.dataset.min : 0;
  const max = budgetBtn ? +budgetBtn.dataset.max : Infinity;

  const timeValue = timeBtn ? timeBtn.dataset.value : null;

  const result = tours.filter((tour) => {
    const price = tour.price.amount;
    const start = getSpec(tour, "location_start");
    const end = getSpec(tour, "location_end");
    const days = parseInt(tour.type);

    let matchTime = true;
    if (timeValue) {
      if (timeValue === "7+") {
        matchTime = days >= 5;
      } else {
        const [minD, maxD] = timeValue.split("-").map(Number);
        matchTime = days >= minD && days <= maxD;
      }
    }

    return (
      (!destination || end.includes(destination)) &&
      (!departure || start.includes(departure)) &&
      price >= min &&
      price <= max &&
      matchTime
    );
  });

  if (sortValue === "price_asc") {
    result.sort((a, b) => a.price.amount - b.price.amount);
  } else if (sortValue === "price_desc") {
    result.sort((a, b) => b.price.amount - a.price.amount);
  }

  renderTours(result);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTours();

  document.querySelectorAll(".budget_button").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".budget_button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  document.querySelectorAll(".time_button").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".time_button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  document
    .getElementById("searchTourBtn")
    .addEventListener("click", handleSearch);

  document
    .getElementById("sortSelect")
    .addEventListener("change", handleSearch);
});
