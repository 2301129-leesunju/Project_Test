document.addEventListener("DOMContentLoaded", () => {
    // ==================================================
    // 추천 여행지 슬라이더
    // ==================================================

    const currentSlideEl = document.querySelector(".current-slide");
    const totalSlidesEl = document.querySelector(".total-slides");
    const toggleAutoplayBtn = document.querySelector(".btn-toggle-autoplay");
    const toggleIcon = toggleAutoplayBtn.querySelector("i");
    const totalSlides = document.querySelectorAll(".main-slider .swiper-wrapper > .swiper-slide").length;
    totalSlidesEl.textContent = totalSlides;
    let isPlaying = true;

    // ==================================================
    // Swiper
    // ==================================================

    const swiper = new Swiper(".main-slider", {
        // 가운데 슬라이드를 크게 보여주고
        // 양옆 슬라이드를 일부 노출
        slidesPerView: 1.25,

        // 현재 슬라이드를 가운데 정렬
        centeredSlides: true,

        // 카드 사이 간격
        spaceBetween: 20,

        // 무한 반복
        loop: true,

        // 이동 속도
        speed: 600,

        // 자동재생
        autoplay: {
            delay: 3500,
            disableOnInteraction: false
        },

        // 좌우 버튼
        navigation: {
            nextEl: ".swiper-button-next",

            prevEl: ".swiper-button-prev"
        },

        // 반응형
        breakpoints: {
            640: {
                slidesPerView: 1.3,
                spaceBetween: 22
            },

            1024: {
                slidesPerView: 1.4,
                spaceBetween: 26
            },

            1400: {
                slidesPerView: 1.5,
                spaceBetween: 30
            }
        },

        // Swiper 이벤트
        on: {
            init: function () {
                currentSlideEl.textContent = this.realIndex + 1;
            },

            slideChange: function () {
                currentSlideEl.textContent = this.realIndex + 1;
            }
        }
    });

    // ==================================================
    // 자동재생 / 정지
    // ==================================================

    toggleAutoplayBtn.addEventListener("click", () => {
        // 재생 중
        if (isPlaying) {
            swiper.autoplay.stop();
            toggleIcon.classList.remove("fa-pause");
            toggleIcon.classList.add("fa-play");
            toggleAutoplayBtn.setAttribute("aria-label", "자동재생");
            isPlaying = false;
        }

        // 정지 중
        else {
            swiper.autoplay.start();
            toggleIcon.classList.remove("fa-play");
            toggleIcon.classList.add("fa-pause");
            toggleAutoplayBtn.setAttribute("aria-label", "일시정지");
            isPlaying = true;
        }
    });

    // ==================================================
    // 계절별 여행 추천
    // ==================================================

    const seasonButtons = document.querySelectorAll(".season-button");
    const seasonBadge = document.getElementById("selectedSeasonBadge");
    const courseRegion = document.getElementById("courseRegion");
    const courseCompanion = document.getElementById("courseCompanion");
    const courseTitle = document.getElementById("courseTitle");
    const placeList = document.getElementById("placeList");

    // ==================================================
    // 오른쪽 상세정보 패널 DOM (0.4 추가)
    // ==================================================

    const detailPanel = document.getElementById("courseDetailPanel");
    const detailPosition = document.getElementById("detailPosition");
    const detailPlaceName = document.getElementById("detailPlaceName");
    const detailPlaceDescription = document.getElementById("detailPlaceDescription");
    const detailRegion = document.getElementById("detailRegion");
    const detailCompanion = document.getElementById("detailCompanion");
    const detailSeason = document.getElementById("detailSeason");
    const detailMapLink = document.getElementById("detailMapLink");
    // JSON description에 <img> 태그가 있을 때 사용할 상세 패널 이미지 (0.5 추가)
    const detailPlaceMedia = document.getElementById("detailPlaceMedia");
    const detailPlaceImage = document.getElementById("detailPlaceImage");

    // 목록과 상세 패널이 같은 이미지 허용 규칙을 사용한다.
    function parsePlaceDescription(description) {
        return PlaceDescription.parse(description);
    }

    // 선택한 여행지에 실제 등록된 사진이 있을 때만 표시
    function showDetailImage(imageSrc, placeName) {
        detailPlaceMedia.hidden = true;
        detailPlaceImage.removeAttribute("src");
        detailPlaceImage.alt = "";

        if (!imageSrc) return;
        detailPlaceImage.onload = () => {
            detailPlaceMedia.hidden = false;
        };
        detailPlaceImage.onerror = () => {
            // 파일이 없는 경우 깨진 이미지 대신 사진 영역을 숨김
            detailPlaceMedia.hidden = true;
        };
        detailPlaceImage.alt = `${placeName} 사진`;
        detailPlaceImage.src = imageSrc;
    }

    let selectedCourse = null;
    let selectedPlaceIndex = 0;

    // ==================================================
    // 계절 정보
    // ==================================================

    const seasonInfo = {
        봄: {
            icon: "🌸",
            month: "3 ~ 5월"
        },

        여름: {
            icon: "🌊",
            month: "6 ~ 8월"
        },

        가을: {
            icon: "🍂",
            month: "9 ~ 11월"
        },

        겨울: {
            icon: "❄️",
            month: "12 ~ 2월"
        }
    };

    // ==================================================
    // JSON 데이터 저장
    // ==================================================

    let tourCourses = [];
    let explorerSeason = "봄";
    let explorerPage = 0;
    const tourRegion = document.getElementById("tourRegion");
    const tourCompanion = document.getElementById("tourCompanion");
    const tourSearch = document.getElementById("tourSearch");
    const tourGrid = document.getElementById("tourCardGrid");
    const tourPrev = document.getElementById("tourPrev");
    const tourNext = document.getElementById("tourNext");
    const pageSize = 6;

    function matchingTours() {
        const query = tourSearch.value.trim().toLocaleLowerCase();
        return tourCourses.filter(course => course.season === explorerSeason &&
            (!tourRegion.value || course.region === tourRegion.value) &&
            (!tourCompanion.value || course.companion === tourCompanion.value) &&
            (!query || [course.title, ...course.places.map(p => p.name + " " + p.description)].join(" ").toLocaleLowerCase().includes(query)));
    }

    function renderTourCards() {
        const matches = matchingTours();
        const pages = Math.max(1, Math.ceil(matches.length / pageSize));
        explorerPage = Math.min(explorerPage, pages - 1);
        document.getElementById("tourResultCount").textContent = `${explorerSeason} · ${matches.length.toLocaleString()}개 코스 / 전체 ${tourCourses.length.toLocaleString()}개`;
        document.getElementById("tourPage").textContent = `${explorerPage + 1} / ${pages}`;
        tourPrev.disabled = explorerPage === 0;
        tourNext.disabled = explorerPage >= pages - 1;
        tourGrid.replaceChildren();
        for (const course of matches.slice(explorerPage * pageSize, (explorerPage + 1) * pageSize)) {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "tour-card";
            card.setAttribute("aria-pressed", String(course === selectedCourse));
            const cover = document.createElement("div");
            cover.className = "tour-card-cover";
            cover.textContent = "🧭";
            const src = PlaceDescription.parse(course.places[0]?.description).imageSrc;
            if (src) {
                const img = document.createElement("img");
                img.alt = course.places[0].name;
                img.loading = "lazy";
                img.src = src;
                img.onerror = () => img.remove();
                cover.append(img);
            }
            const title = document.createElement("strong");
            title.textContent = course.places.map(p => p.name).join(" · ");
            const meta = document.createElement("span");
            meta.textContent = `${course.region} · ${course.companion} · ${course.places.length}곳`;
            card.append(cover, title, meta);
            card.addEventListener("click", () => {
                showSeasonCourse(explorerSeason, course);
                tourGrid.querySelectorAll(".tour-card").forEach(c => c.setAttribute("aria-pressed", String(c === card)));
            });
            tourGrid.append(card);
        }
        if (!matches.length) tourGrid.textContent = "조건에 맞는 관광지가 없습니다. 지역이나 검색어를 바꿔주세요.";
    }

    function refreshExplorer() {
        explorerPage = 0;
        showSeasonCourse(explorerSeason, matchingTours()[0]);
        renderTourCards();
    }
    tourRegion.addEventListener("change", refreshExplorer);
    tourCompanion.addEventListener("change", refreshExplorer);
    tourSearch.addEventListener("input", refreshExplorer);
    tourPrev.addEventListener("click", () => { explorerPage--; renderTourCards(); });
    tourNext.addEventListener("click", () => { explorerPage++; renderTourCards(); });

    // ==================================================
    // JSON 불러오기
    // ==================================================

    async function loadTourCourses() {
        try {
            const response = await fetch("../data/tourCourses.json");

            if (!response.ok) {
                throw new Error("JSON 파일을 불러오지 못했습니다.");
            }

            tourCourses = await response.json();
            [...new Set(tourCourses.map(course => course.region))].sort().forEach(region => {
                tourRegion.add(new Option(region, region));
            });

            // JSON을 슬라이더에도 연결 (기존 6장의 HTML 구조는 보존)
            // setupSliderCourseLinks();

            // 처음에는 봄
            showSeasonCourse("봄");
            renderTourCards();
        } catch (error) {
            console.error(error);
            document.getElementById("tourResultCount").textContent = "여행 정보를 불러오지 못했습니다. Live Server 연결을 확인해주세요.";
            if (placeList) {
            courseRegion.textContent = "-";
            courseCompanion.textContent = "-";
            courseTitle.textContent = "여행 정보를 불러오지 못했습니다.";
            placeList.innerHTML = `
                <div class="place-item">

                    <div class="place-number">
                        !
                    </div>

                    <div class="place-text">
                        <h3>
                            JSON 파일 확인
                        </h3>

                        <p>
                            tourCourses.json 경로와
                            Live Server 실행 여부를 확인해주세요.
                        </p>
                    </div>

                </div>
            `;

            }
            // 오른쪽 패널도 오류 상태 안내
            showDetailEmpty("여행 코스 데이터를 불러오지 못했습니다.");
        }
    }

    // ==================================================
    // 선택한 계절의 여행 코스 표시
    // ==================================================

    function showSeasonCourse(season, preferredCourse = null) {
        // 해당 계절 데이터 찾기
        // 슬라이더에서 선택된 코스가 있다면 그 코스를 우선 표시
        const course =
            preferredCourse && preferredCourse.season === season
                ? preferredCourse
                : matchingTours()[0];

        const info = seasonInfo[season];

        // ==================================================
        // 버튼 active 변경
        // ==================================================

        seasonButtons.forEach(button => {
            button.classList.toggle("active", button.dataset.season === season);
        });

        // ==================================================
        // 계절 뱃지
        // ==================================================

        if (seasonBadge) seasonBadge.textContent = `${info.icon} ${info.month}`;

        // 코스 요약 HTML을 주석 처리해도 검색 카드와 상세 패널은 동작한다.
        if (!placeList) {
            if (course) showPlaceDetail(course, 0);
            else showDetailEmpty("조건에 맞는 관광지가 없습니다.");
            return;
        }

        // ==================================================
        // 해당 계절 데이터 없음
        // ==================================================

        if (!course) {
            courseRegion.textContent = "-";
            courseCompanion.textContent = "-";
            courseTitle.textContent = `${season} 추천 여행 코스 준비중`;
            placeList.innerHTML = `
                <div class="place-item">

                    <div class="place-number">
                        !
                    </div>

                    <div class="place-text">

                        <h3>
                            추천 코스 준비중
                        </h3>

                        <p>
                            ${season} 여행 데이터가
                            아직 없습니다.
                        </p>

                    </div>

                </div>
            `;
            showDetailEmpty(`${season} 추천 여행 코스 준비중`);

            return;
        }

        // ==================================================
        // 기본 여행 정보
        // ==================================================

        courseRegion.textContent = course.region;
        courseCompanion.textContent = course.companion;
        courseTitle.textContent = course.title;

        // ==================================================
        // 기존 여행지 목록 제거
        // ==================================================

        placeList.innerHTML = "";

        // ==================================================
        // 여행지 3개 출력
        // ==================================================

        course.places.forEach((place, index) => {
            const item = document.createElement("div");
            item.className = "place-item";

            // 클릭 및 Enter/Space 키로 오른쪽 상세 패널 갱신
            item.setAttribute("role", "button");
            item.setAttribute("tabindex", "0");
            item.setAttribute("aria-pressed", "false");

            // 기존 왼쪽 여행지 목록 디자인 유지
            // description의 이미지 HTML은 왼쪽에 렌더링하지 않고 글만 표시
            const parsedDescription = parsePlaceDescription(place.description);
            const number = document.createElement("div");
            number.className = "place-number";
            number.textContent = index + 1;
            const placeText = document.createElement("div");
            placeText.className = "place-text";
            const placeName = document.createElement("h3");
            placeName.textContent = place.name;
            const placeSummary = document.createElement("p");
            placeSummary.textContent = PlaceDescription.parse(place.description).summary;
            placeText.append(placeName, placeSummary);
            item.append(number, placeText);
            placeList.appendChild(item);
            item.addEventListener("click", () => {
                showPlaceDetail(course, index);
            });
            item.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    showPlaceDetail(course, index);
                }
            });
        });

        // 계절을 바꾸면 해당 코스의 첫 번째 여행지 자동 선택
        showPlaceDetail(course, 0);
    }

    // ==================================================
    // 오른쪽 여행지 상세정보 갱신 (0.4 추가)
    // JSON에 있는 항목만 표시하며, 없는 시간/활동은 만들지 않음
    // ==================================================

    function showPlaceDetail(course, index) {
        const place = course.places[index];
        if (!place) {
            showDetailEmpty("선택한 여행지 정보가 없습니다.");
            return;
        }

        selectedCourse = course;
        selectedPlaceIndex = index;
        detailPosition.textContent = `${index + 1} / ${course.places.length}`;
        detailPlaceName.textContent = place.name;

        // JSON description 안의 HTML 이미지를 안전하게 분리 표시 (0.5 추가)
        const parsedDescription = parsePlaceDescription(place.description);
        detailPlaceDescription.innerHTML = PlaceDescription.html(place.description);
        showDetailImage(parsedDescription.imageSrc, place.name);
        detailRegion.textContent = course.region;
        detailCompanion.textContent = course.companion;
        detailSeason.textContent = course.season;

        // 실제 장소가 아니라 검색 키워드이므로 결과를 사용자가 확인
        const mapKeyword = `${course.region} ${place.name}`;
        detailMapLink.href = `https://map.naver.com/p/search/${encodeURIComponent(mapKeyword)}`;
        detailMapLink.classList.remove("is-disabled");
        detailMapLink.removeAttribute("aria-disabled");

        // 왼쪽 선택한 여행지 강조
        placeList?.querySelectorAll('.place-item[role="button"]').forEach((item, itemIndex) => {
            const isSelected = itemIndex === index;
            item.classList.toggle("selected", isSelected);
            item.setAttribute("aria-pressed", String(isSelected));
        });
    }

    // ==================================================
    // 상세정보 없음 / 불러오기 실패 안내 (0.4 추가)
    // ==================================================

    function showDetailEmpty(message) {
        selectedCourse = null;
        selectedPlaceIndex = 0;
        detailPosition.textContent = "- / -";
        detailPlaceName.textContent = "여행지 정보 없음";
        detailPlaceDescription.textContent = message;
        showDetailImage(null, "");
        detailRegion.textContent = "-";
        detailCompanion.textContent = "-";
        detailSeason.textContent = "-";
        detailMapLink.href = "https://map.naver.com/";
        detailMapLink.classList.add("is-disabled");
        detailMapLink.setAttribute("aria-disabled", "true");
    }

    // ==================================================
    // 상단 추천 슬라이더도 같은 JSON 데이터 사용 (0.4 추가)
    // 6장 HTML / 기존 슬라이더 주석은 유지
    // 1~4번 카드: 현재 등록된 여행 코스
    // 나머지 카드: 추가될 여행 코스를 위한 준비중 슬롯
    // ==================================================

    function setupSliderCourseLinks() {
        const slides = document.querySelectorAll(".main-slider .swiper-wrapper > .swiper-slide");
        slides.forEach((slide, index) => {
            // Swiper loop 모드에서 슬라이드 DOM 순서가 바뀔 수 있으므로
            // 원본 슬라이드 번호를 기준으로 JSON 항목을 연결
            const originalIndex = Number(slide.getAttribute("data-swiper-slide-index") ?? index);
            const course = tourCourses[originalIndex];
            const title = slide.querySelector(".slide-content h2");
            const description = slide.querySelector(".slide-content p");
            const detailButton = slide.querySelector(".btn-detail");
            const slideImage = slide.querySelector(".slide-bg");

            // 빈 이미지 경로로 깨진 이미지 아이콘 표시되지 않게 함
            if (slideImage && !slideImage.getAttribute("src")) {
                slideImage.hidden = true;
            }

            if (!course) {
                slide.dataset.slideSeason = "pending";
                title.textContent = "새로운 여행 코스 준비중";
                description.textContent = "다른 지역과 계절의 여행 코스를 추가할 예정입니다.";
                detailButton.textContent = "여행 코스 탐색 →";
                detailButton.href = "subpage.html";
                return;
            }

            slide.dataset.slideSeason = course.season;
            title.textContent = course.title;
            description.textContent = `${course.region} · ${course.companion} · ${course.season} · ${course.places.length}곳`;
            if (slideImage) {
                slideImage.alt = course.title;
            }

            detailButton.href = "#courseDetailPanel";
            detailButton.addEventListener("click", event => {
                event.preventDefault();
                showSeasonCourse(course.season, course);
                detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    }

    // ==================================================
    // 계절 버튼 클릭
    // ==================================================

    seasonButtons.forEach(button => {
        button.addEventListener("click", () => {
            const season = button.dataset.season;
            explorerSeason = season;
            explorerPage = 0;
            showSeasonCourse(season);
            renderTourCards();
        });
    });

    // ==================================================
    // 실행
    // ==================================================

    loadTourCourses();
});

