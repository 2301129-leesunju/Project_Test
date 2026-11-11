
let tourCourses = [];

const userSelection = {
  region: null,
  companion: null,
  season: null
};

const stepCompanion = document.getElementById("step-companion");
const stepSeason = document.getElementById("step-season");

const resultBox = document.getElementById("result-box");
const resultTitle = document.getElementById("result-title");
const courseList = document.getElementById("course-list");

function renderPlaceAddress(description) {
  const address = PlaceDescription.parse(description).sections
    .find(section => section.label === "주소")?.value;

  if (!address) {
    return "";
  }

  const element = document.createElement("p");
  element.className = "place-address";
  element.textContent = `📍 ${address.replace(/\s+/g, " ").trim()}`;

  return element.outerHTML;
}

fetch("../data/tourCourses.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("tourCourses.json 파일을 불러오지 못했습니다.");
    }

    return response.json();
  })
  .then(data => {
    tourCourses = data;
    setupEvents();
  })
  .catch(error => {
    console.error("여행 코스 데이터 로딩 실패:", error);

    courseList.innerHTML = `
      <div class="load-error">
        여행 코스 데이터를 불러오지 못했습니다.
      </div>
    `;
  });

function setupGroupSelect(containerId, stateKey, onSelect) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  const buttons = container.querySelectorAll(".btn-option");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(item => {
        item.classList.remove("selected");
      });

      button.classList.add("selected");
      userSelection[stateKey] = button.dataset.value;

      if (onSelect) {
        onSelect();
      }
    });
  });
}

function setupEvents() {
  setupGroupSelect("region-group", "region", () => {
    resetStep(stepCompanion);
    resetStep(stepSeason);
    resultBox.classList.add("hidden");
    showStep(stepCompanion);
  });

  setupGroupSelect("companion-group", "companion", () => {
    resetStep(stepSeason);
    resultBox.classList.add("hidden");
    showStep(stepSeason);
  });

  setupGroupSelect("season-group", "season", () => {
    renderResult();
  });
}

function showStep(element) {
  if (!element) {
    return;
  }

  element.classList.remove("hidden");
  element.classList.add("fade-in");
}

function resetStep(element) {
  if (!element) {
    return;
  }

  element.classList.add("hidden");
  element.classList.remove("fade-in");

  const buttons = element.querySelectorAll(".btn-option");

  buttons.forEach(button => {
    button.classList.remove("selected");
  });
}

function renderResult() {
  const { region, companion, season } = userSelection;

  const matchedCourses = tourCourses.filter(item =>
    item.region === region &&
    item.companion === companion &&
    item.season === season
  );

  resultTitle.textContent =
    `🎉 [${region}] ${companion} · ${season} 추천 코스`;

  if (matchedCourses.length > 0) {
    let htmlContent = "";

    matchedCourses.forEach(course => {
      htmlContent += `
        <div class="course-card">
          <h4 class="course-card-header">
            <span class="course-card-title">
              📌 ${course.title}
            </span>

            <input
              class="info_button"
              type="button"
              value="상세보기"
            >
          </h4>

          <ul class="place-list">
            ${course.places.map((place, index) => `
              <li class="place-item">
                <div class="place-heading">
                  <span class="place-step">
                    Step ${index + 1}.
                  </span>

                  <span class="place-name">
                    ${place.name}
                  </span>
                </div>

                ${renderPlaceAddress(place.description)}

              <div
                class="place-description"
                hidden
                style="
                  margin-top: 8px;
                  padding: 10px;
                  background: #f8fafc;
                  border-radius: 6px;
                  color: #64748b;
                  font-size: 13px;
                "
              >
                ${PlaceDescription.html(place.description, true)}
              </div>
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    });


courseList.innerHTML = htmlContent;

const infoButtons = courseList.querySelectorAll(".info_button");
let previousScrollY = 0;

infoButtons.forEach(button => {
    button.addEventListener("click", function(event) {
        event.stopPropagation();

        const courseCard = this.closest(".course-card");
        const descriptions = courseCard.querySelectorAll(".place-description");
        const isExpanded = this.value === "간략히";

        if (isExpanded) {
            courseCard.classList.remove("is-hiding");
            courseCard.classList.add("is-collapsing");

            courseList.querySelectorAll(".info_button").forEach(otherButton => {
                otherButton.value = "상세보기";
            });

            courseList.querySelectorAll(".place-description").forEach(description => {
                description.hidden = true;
            });

            setTimeout(() => {
                courseCard.classList.remove(
                    "selected-course",
                    "expand-left",
                    "expand-center",
                    "expand-right",
                    "is-collapsing"
                );

                courseList.classList.remove("has-selection");

                courseList.querySelectorAll(".course-card").forEach(card => {
                    card.style.display = "";
                    card.classList.remove("is-hiding");
                });

                window.scrollTo({
                    top: previousScrollY,
                    behavior: "smooth"
                });
            }, 400);

        } else {
            previousScrollY = window.scrollY;

            const listRect = courseList.getBoundingClientRect();
            const cardRect = courseCard.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const relativePosition = (cardCenter - listRect.left) / listRect.width;

            courseCard.classList.remove(
                "expand-left",
                "expand-center",
                "expand-right"
            );

            if (relativePosition < 0.4) {
                courseCard.classList.add("expand-left");
            } else if (relativePosition > 0.6) {
                courseCard.classList.add("expand-right");
            } else {
                courseCard.classList.add("expand-center");
            }

            courseList.querySelectorAll(".course-card").forEach(card => {
                card.classList.remove("selected-course", "is-collapsing");

                card.querySelectorAll(".place-description").forEach(description => {
                    description.hidden = true;
                });

                const otherButton = card.querySelector(".info_button");

                if (otherButton) {
                    otherButton.value = "상세보기";
                }

                if (card !== courseCard) {
                    card.classList.add("is-hiding");
                }
            });

            courseCard.classList.add("selected-course");
            courseList.classList.add("has-selection");

            descriptions.forEach(description => {
                description.hidden = false;
            });

            this.value = "간략히";

            setTimeout(() => {
                courseList.querySelectorAll(".course-card.is-hiding").forEach(card => {
                    card.style.display = "none";
                });
            }, 300);
        }
    });
});
  } else {
    courseList.innerHTML = `
      <div class="empty-result">
        <p class="empty-icon">😅</p>

        <p>
          선택하신 조건
          (<b>${region} / ${companion} / ${season}</b>)
          에 맞는 추천 코스를 준비 중입니다.
        </p>
      </div>
    `;
  }

  showStep(resultBox);
}

const menuIcon = document.querySelector(".menu_Icon");
const menuItem = document.querySelector(".menuList > li");
const submenu = document.querySelector(".submenu");

menuIcon?.addEventListener("click", function () {
  if (!menuItem) {
    return;
  }

  menuItem.classList.toggle("open");

  if (menuItem.classList.contains("open")) {
    adjustSubmenu();
  }
});

function adjustSubmenu() {
  if (!menuIcon || !submenu) {
    return;
  }

  const iconRect = menuIcon.getBoundingClientRect();
  const submenuRect = submenu.getBoundingClientRect();
  const margin = 10;

  let left = iconRect.left;
  const top = iconRect.bottom + 10;

  if (left + submenuRect.width > window.innerWidth - margin) {
    left = window.innerWidth - submenuRect.width - margin;
  }

  left = Math.max(margin, left);

  submenu.style.left = `${left}px`;
  submenu.style.top = `${top}px`;
}

window.addEventListener("resize", () => {
  if (menuItem?.classList.contains("open")) {
    adjustSubmenu();
  }
});
