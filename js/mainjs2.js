document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // 추천 여행지 슬라이더
    // ==================================================

    const currentSlideEl =
        document.querySelector(".current-slide");

    const totalSlidesEl =
        document.querySelector(".total-slides");

    const toggleAutoplayBtn =
        document.querySelector(".btn-toggle-autoplay");

    const toggleIcon =
        toggleAutoplayBtn.querySelector("i");

    const totalSlides =
        document.querySelectorAll(
            ".main-slider .swiper-wrapper > .swiper-slide"
        ).length;

    totalSlidesEl.textContent =
        totalSlides;

    let isPlaying = true;


    // ==================================================
    // Swiper
    // ==================================================

    const swiper =
        new Swiper(".main-slider", {

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
                nextEl:
                    ".swiper-button-next",

                prevEl:
                    ".swiper-button-prev"
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
                    currentSlideEl.textContent =
                        this.realIndex + 1;
                },

                slideChange: function () {
                    currentSlideEl.textContent =
                        this.realIndex + 1;
                }

            }

        });


    // ==================================================
    // 자동재생 / 정지
    // ==================================================

    toggleAutoplayBtn.addEventListener(
        "click",
        () => {

            // 재생 중
            if (isPlaying) {

                swiper.autoplay.stop();

                toggleIcon.classList.remove(
                    "fa-pause"
                );

                toggleIcon.classList.add(
                    "fa-play"
                );

                toggleAutoplayBtn.setAttribute(
                    "aria-label",
                    "자동재생"
                );

                isPlaying = false;
            }

            // 정지 중
            else {

                swiper.autoplay.start();

                toggleIcon.classList.remove(
                    "fa-play"
                );

                toggleIcon.classList.add(
                    "fa-pause"
                );

                toggleAutoplayBtn.setAttribute(
                    "aria-label",
                    "일시정지"
                );

                isPlaying = true;
            }

        }
    );


    // ==================================================
    // 계절별 여행 추천
    // ==================================================

    const seasonButtons =
        document.querySelectorAll(
            ".season-button"
        );

    const seasonBadge =
        document.getElementById(
            "selectedSeasonBadge"
        );

    const courseRegion =
        document.getElementById(
            "courseRegion"
        );

    const courseCompanion =
        document.getElementById(
            "courseCompanion"
        );

    const courseTitle =
        document.getElementById(
            "courseTitle"
        );

    const placeList =
        document.getElementById(
            "placeList"
        );


    // ==================================================
    // 계절 정보
    // ==================================================

    const seasonInfo = {

        "봄": {
            icon: "🌸",
            month: "3 ~ 5월"
        },

        "여름": {
            icon: "🌊",
            month: "6 ~ 8월"
        },

        "가을": {
            icon: "🍂",
            month: "9 ~ 11월"
        },

        "겨울": {
            icon: "❄️",
            month: "12 ~ 2월"
        }

    };


    // ==================================================
    // JSON 데이터 저장
    // ==================================================

    let tourCourses = [];


    // ==================================================
    // JSON 불러오기
    // ==================================================

    async function loadTourCourses() {

        try {

            const response =
                await fetch(
                    "../data/tourCourses.json"
                );

            if (!response.ok) {

                throw new Error(
                    "JSON 파일을 불러오지 못했습니다."
                );

            }

            tourCourses =
                await response.json();

            // 처음에는 봄
            showSeasonCourse("봄");

        } catch (error) {

            console.error(error);

            courseRegion.textContent =
                "-";

            courseCompanion.textContent =
                "-";

            courseTitle.textContent =
                "여행 정보를 불러오지 못했습니다.";

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

    }


    // ==================================================
    // 선택한 계절의 여행 코스 표시
    // ==================================================

    function showSeasonCourse(season) {

        // 해당 계절 데이터 찾기
        const course =
            tourCourses.find(
                item =>
                    item.season === season
            );

        const info =
            seasonInfo[season];


        // ==================================================
        // 버튼 active 변경
        // ==================================================

        seasonButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.season === season
                );

            }
        );


        // ==================================================
        // 계절 뱃지
        // ==================================================

        seasonBadge.textContent =
            `${info.icon} ${info.month}`;


        // ==================================================
        // 해당 계절 데이터 없음
        // ==================================================

        if (!course) {

            courseRegion.textContent =
                "-";

            courseCompanion.textContent =
                "-";

            courseTitle.textContent =
                `${season} 추천 여행 코스 준비중`;

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

            return;
        }


        // ==================================================
        // 기본 여행 정보
        // ==================================================

        courseRegion.textContent =
            course.region;

        courseCompanion.textContent =
            course.companion;

        courseTitle.textContent =
            course.title;


        // ==================================================
        // 기존 여행지 목록 제거
        // ==================================================

        placeList.innerHTML = "";


        // ==================================================
        // 여행지 3개 출력
        // ==================================================

        course.places.forEach(
            (place, index) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "place-item";

                item.innerHTML = `
                    <div class="place-number">
                        ${index + 1}
                    </div>

                    <div class="place-text">

                        <h3>
                            ${place.name}
                        </h3>

                        <p>
                            ${place.description}
                        </p>

                    </div>
                `;

                placeList.appendChild(
                    item
                );

            }
        );

    }


    // ==================================================
    // 계절 버튼 클릭
    // ==================================================

    seasonButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const season =
                        button.dataset.season;

                    showSeasonCourse(
                        season
                    );

                }
            );

        }
    );


    // ==================================================
    // 실행
    // ==================================================

    loadTourCourses();

});