const recommendations = {
	gyeonggi: {
		title: "남이섬",
		description: "메타세쿼이아 길을 걸으며 북한강의 여유를 즐겨보세요.",
		image: "/images/남이섬.jpeg"
	},
	gangwon: {
		title: "속초 영금정",
		description: "탁 트인 동해 풍경과 신선한 해산물을 함께 만날 수 있어요.",
		image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
	},
	chungcheong: {
		title: "단양 도담삼봉",
		description: "남한강 위에 솟은 기암절벽의 멋진 풍경을 감상해보세요.",
		image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80"
	},
	jeolla: {
		title: "전주 한옥마을",
		description: "고즈넉한 한옥길을 걷고 맛있는 전주 먹거리를 즐겨보세요.",
		image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80"
	},
	gyeongsang: {
		title: "경주 불국사",
		description: "천년의 역사와 아름다운 석조 건축을 천천히 둘러보세요.",
		image: "https://images.unsplash.com/photo-1538485399081-7c897a7c7f1c?auto=format&fit=crop&w=600&q=80"
	},
	jeju: {
		title: "성산일출봉",
		description: "제주 바다를 한눈에 담을 수 있는 대표 명소예요.",
		image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=600&q=80"
	}
};

const mapRegions = document.querySelectorAll(".map-region");
const recommendationCard = document.getElementById("recommendation-card");
const recommendationImage = document.getElementById("recommendation-image");
const recommendationTitle = document.getElementById("recommendation-title");
const recommendationDescription = document.getElementById("recommendation-description");

function showRecommendation(regionId) {
	const recommendation = recommendations[regionId];

	if (!recommendation) {
		return;
	}

	recommendationImage.src = recommendation.image;
	recommendationImage.alt = `${recommendation.title} 여행지 사진`;
	recommendationTitle.textContent = recommendation.title;
	recommendationDescription.textContent = recommendation.description;
	recommendationCard.classList.add("is-visible");
	recommendationCard.setAttribute("aria-hidden", "false");
}

function hideRecommendation() {
	recommendationCard.classList.remove("is-visible");
	recommendationCard.setAttribute("aria-hidden", "true");
}

mapRegions.forEach(region => {
	region.addEventListener("mouseenter", () => {
		showRecommendation(region.id);
	});

	region.addEventListener("mouseleave", hideRecommendation);
});




// 메뉴

const menuIcon = document.querySelector(".menu_Icon");
const menuItem = document.querySelector(".menuList > li");
const submenu = document.querySelector(".submenu");


/* =========================
   메뉴 열기 / 닫기
========================= */

menuIcon.addEventListener("click", function () {

    menuItem.classList.toggle("open");

    if (menuItem.classList.contains("open")) {
        adjustSubmenu();
    }
});


/* =========================
   서브메뉴 위치 계산
========================= */

function adjustSubmenu() {

    const iconRect = menuIcon.getBoundingClientRect();

    /*
     * 일단 메뉴를 화면 안쪽에 표시
     */
    submenu.style.left = "10px";

    submenu.style.top =
        `${iconRect.bottom + 10}px`;

    /*
     * 실제 서브메뉴 크기 확인
     */
    const submenuRect =
        submenu.getBoundingClientRect();

    const margin = 10;

    let left = iconRect.left;

    /*
     * 기본적으로 아이콘의 왼쪽에 맞춤
     */
    left = iconRect.left;


    /*
     * 왼쪽으로 나가는 경우
     */
    if (left < margin) {
        left = margin;
    }


    /*
     * 오른쪽으로 나가는 경우
     */
    if (
        left + submenuRect.width
        > window.innerWidth - margin
    ) {

        left =
            window.innerWidth
            - submenuRect.width
            - margin;
    }


    /*
     * 그래도 왼쪽으로 나가는 경우
     * 화면 자체가 매우 작은 상황
     */
    if (left < margin) {
        left = margin;
    }


    /*
     * 최종 위치
     */
    submenu.style.left = `${left}px`;
}


/* =========================
   창 크기 변경
========================= */

window.addEventListener("resize", function () {

    if (menuItem.classList.contains("open")) {
        adjustSubmenu();
    }

});
