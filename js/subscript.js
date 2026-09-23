// 1. 추천 여행 코스 데이터베이스 (Mock Data)
// 나중에 데이터 항목을 계속 추가하시면 됩니다.
const tourCourses = [
  {
    region: "경기도",
    companion: "커플",
    season: "봄",
    title: "가평 감성 수목원 & 데이트 코스",
    places: ["아침고요수목원 봄꽃축제", "남이섬 짚라인", "북한강 뷰 카페"]
  },
  {
    region: "강원도",
    companion: "커플",
    season: "가을",
    title: "강릉 단풍 & 드라이브 코스",
    places: ["오죽헌 단풍길", "안목해변 카페거리", "정동진 바다부채길"]
  },
  {
    region: "강원도",
    companion: "가족",
    season: "겨울",
    title: "평창 눈꽃 & 힐링 코스",
    places: ["대관령 양떼목장 눈꽃 구경", "월정사 전나무숲길", "상원사 차 한잔"]
  },
  {
    region: "제주특별자치도",
    companion: "혼자",
    season: "여름",
    title: "제주 서부 에메랄드빛 해변 코스",
    places: ["협재해수욕장 물놀이", "금오름 노을 감상", "한림 감성 카페"]
  }
];

// 2. 사용자가 선택한 필터 상태 저장 객체
const userSelection = {
  region: null,
  companion: null,
  season: null
};

// 3. DOM 요소 가져오기
const stepCompanion = document.getElementById('step-companion');
const stepSeason = document.getElementById('step-season');
const resultBox = document.getElementById('result-box');
const resultTitle = document.getElementById('result-title');
const courseList = document.getElementById('course-list');

// 4. 버튼 그룹 선택 공통 이벤트 함수
function setupGroupSelect(containerId, stateKey, onSelect) {
  const container = document.getElementById(containerId);
  const buttons = container.querySelectorAll('.btn-option');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 선택한 그룹 내 다른 버튼들의 active(selected) 클래스 제거
      buttons.forEach(b => b.classList.remove('selected'));
      
      // 클릭한 버튼에 active 클래스 추가
      btn.classList.add('selected');
      
      // html의 data-value 속성값을 userSelection 객체에 저장
      userSelection[stateKey] = btn.dataset.value;

      // 다음 단계 진행 콜백 함수 실행
      if (onSelect) onSelect();
    });
  });
}

// 5. 단계별 흐름 연결 (Event Listeners)

// [1단계: 지역 선택 완료 시] -> 2단계(동행자) 표시
setupGroupSelect('region-group', 'region', () => {
  resetStep(stepCompanion);
  resetStep(stepSeason);
  resultBox.classList.add('hidden');
  
  showStep(stepCompanion);
});

// [2단계: 동행자 선택 완료 시] -> 3단계(계절) 표시
setupGroupSelect('companion-group', 'companion', () => {
  resetStep(stepSeason);
  resultBox.classList.add('hidden');
  
  showStep(stepSeason);
});

// [3단계: 계절 선택 완료 시] -> 4단계(결과 화면) 출력
setupGroupSelect('season-group', 'season', () => {
  renderResult();
});


// 6. UI 제어 보조 함수들

// 영역 보여주기
function showStep(element) {
  element.classList.remove('hidden');
  element.classList.add('fade-in');
}

// 상위 항목 재선택 시 하위 선택 영역 초기화
function resetStep(element) {
  element.classList.add('hidden');
  element.classList.remove('fade-in');
  const buttons = element.querySelectorAll('.btn-option');
  buttons.forEach(b => b.classList.remove('selected'));
}


// 7. 핵심 기능: 필터링 및 결과 화면 렌더링
function renderResult() {
  const { region, companion, season } = userSelection;

  // 🔍 데이터 필터링 (3가지 조건 모두 일치하는 항목 검색)
  const matchedCourses = tourCourses.filter(item => 
    item.region === region && 
    item.companion === companion && 
    item.season === season
  );

  // 결과 제목 업데이트
  resultTitle.textContent = `🎉 [${region}] ${companion} · ${season} 추천 코스`;

  // 1) 조건에 맞는 데이터가 있는 경우
  if (matchedCourses.length > 0) {
    let htmlContent = '';

    matchedCourses.forEach(course => {
      htmlContent += `
        <div class="course-card" style="margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h4 style="font-size: 16px; color: #1e293b; margin-bottom: 10px;">📌 ${course.title}</h4>
          <ul style="list-style: none; padding: 0;">
            ${course.places.map((place, idx) => `
              <li style="padding: 6px 0; border-bottom: 1px dashed #f1f5f9; font-size: 14px;">
                <span style="font-weight: bold; color: #3b82f6;">Step ${idx + 1}.</span> ${place}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    });

    courseList.innerHTML = htmlContent;
  } 
  // 2) 조건에 일치하는 데이터가 없는 경우
  else {
    courseList.innerHTML = `
      <div style="text-align: center; padding: 30px 10px; color: #64748b;">
        <p style="font-size: 18px; margin-bottom: 8px;">😅</p>
        <p>선택하신 조건(<b>${region} / ${companion} / ${season}</b>)에 맞는 추천 코스를 준비 중입니다.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
        <p>.</p>
      </div>
    `;
  }

  showStep(resultBox);
}
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
    메뉴를 화면 안쪽에 표시
     */
    submenu.style.left = "10px";

    submenu.style.top =
        `${iconRect.bottom + 10}px`;

    /*
    실제 서브메뉴 크기 확인
     */
    const submenuRect =
        submenu.getBoundingClientRect();

    const margin = 10;

    let left = iconRect.left;

    /*
    기본적으로 아이콘의 왼쪽에 맞춤
     */
    left = iconRect.left;


    /*
    왼쪽으로 나가는 경우
     */
    if (left < margin) {
        left = margin;
    }


    /*
    오른쪽으로 나가는 경우
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


    if (left < margin) {
        left = margin;
    }


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
