// ========================================
// 1. 추천 여행 코스 데이터
// JSON 파일에서 불러옴
// ========================================

let tourCourses = [];


// ========================================
// 2. 사용자가 선택한 필터 상태
// ========================================

const userSelection = {
  region: null,
  companion: null,
  season: null
};


// ========================================
// 3. DOM 요소 가져오기
// ========================================

const stepCompanion = document.getElementById('step-companion');
const stepSeason = document.getElementById('step-season');

const resultBox = document.getElementById('result-box');
const resultTitle = document.getElementById('result-title');
const courseList = document.getElementById('course-list');


// ========================================
// 4. JSON 데이터 불러오기
// ========================================

fetch("/data/tourCourses.json")
  .then(response => {

    if (!response.ok) {
      throw new Error(
        "tourCourses.json 파일을 불러오지 못했습니다."
      );
    }

    return response.json();
  })

  .then(data => {

    // JSON 데이터를 tourCourses에 저장
    tourCourses = data;

    console.log("여행 코스 데이터 로딩 완료");
    console.log(tourCourses);

    // JSON을 불러온 후 버튼 이벤트 설정
    setupEvents();
  })

  .catch(error => {

    console.error(
      "여행 코스 데이터 로딩 실패:",
      error
    );

    courseList.innerHTML = `
      <div style="
        text-align: center;
        padding: 30px;
        color: #ef4444;
      ">
        여행 코스 데이터를 불러오지 못했습니다.
      </div>
    `;
  });


// ========================================
// 5. 버튼 그룹 선택 공통 이벤트 함수
// ========================================

function setupGroupSelect(containerId, stateKey, onSelect) {

  const container =
    document.getElementById(containerId);

  const buttons =
    container.querySelectorAll('.btn-option');


  buttons.forEach(btn => {

    btn.addEventListener('click', () => {

      // 같은 그룹의 다른 버튼 선택 해제
      buttons.forEach(b => {
        b.classList.remove('selected');
      });


      // 현재 버튼 선택
      btn.classList.add('selected');


      // data-value 저장
      userSelection[stateKey] =
        btn.dataset.value;


      // 다음 단계 실행
      if (onSelect) {
        onSelect();
      }

    });

  });
}


// ========================================
// 6. 단계별 이벤트 연결
// ========================================

function setupEvents() {

  // -------------------------------
  // 1단계 : 지역 선택
  // -------------------------------

  setupGroupSelect(
    'region-group',
    'region',
    () => {

      resetStep(stepCompanion);
      resetStep(stepSeason);

      resultBox.classList.add('hidden');

      showStep(stepCompanion);
    }
  );


  // -------------------------------
  // 2단계 : 동행자 선택
  // -------------------------------

  setupGroupSelect(
    'companion-group',
    'companion',
    () => {

      resetStep(stepSeason);

      resultBox.classList.add('hidden');

      showStep(stepSeason);
    }
  );


  // -------------------------------
  // 3단계 : 계절 선택
  // -------------------------------

  setupGroupSelect(
    'season-group',
    'season',
    () => {

      renderResult();
    }
  );
}


// ========================================
// 7. UI 제어 함수
// ========================================

// 영역 보여주기

function showStep(element) {

  element.classList.remove('hidden');

  element.classList.add('fade-in');
}


// 상위 항목 재선택 시
// 하위 선택 영역 초기화

function resetStep(element) {

  element.classList.add('hidden');

  element.classList.remove('fade-in');


  const buttons =
    element.querySelectorAll('.btn-option');


  buttons.forEach(b => {
    b.classList.remove('selected');
  });
}


// ========================================
// 8. 결과 화면 렌더링
// ========================================

function renderResult() {

  const {
    region,
    companion,
    season
  } = userSelection;


  // --------------------------------
  // JSON 데이터 필터링
  // --------------------------------

  const matchedCourses =
    tourCourses.filter(item =>

      item.region === region &&
      item.companion === companion &&
      item.season === season

    );


  // --------------------------------
  // 결과 제목
  // --------------------------------

  resultTitle.textContent =
    `🎉 [${region}] ${companion} · ${season} 추천 코스`;


  // --------------------------------
  // 결과가 있는 경우
  // --------------------------------

  if (matchedCourses.length > 0) {

    let htmlContent = '';


    matchedCourses.forEach(course => {

      htmlContent += `

        <div class="course-card" style="
          margin-bottom: 20px;
          padding: 15px;
          background: #fff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        ">


          <!-- 제목 -->

          <h4 style="
            font-size: 16px;
            color: #1e293b;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            width: 100%;
          ">

            <span>
              📌 ${course.title}
            </span>


            <!-- 상세보기 버튼 -->

            <input
              class="info_button"
              type="button"
              value="상세보기"
              style="
                background-color: #3b82f6;
                color: white;
                font-size: 16px;
                text-align: center;
                border: 1px solid #3b82f6;
                box-shadow:
                  0 1px 3px 2px #1e3b8a64;
                border-radius: 8px;
                width: 80px;
                height: 40px;
                margin-left: auto;
                flex-shrink: 0;
                cursor: pointer;
              "
            >

          </h4>


          <!-- 여행지 목록 -->

          <ul
            class="place-list"
            style="
              list-style: none;
              padding: 0;
            "
          >

            ${course.places.map((place, idx) => `

              <li style="
                padding: 6px 0;
                border-bottom:
                  1px dashed #f1f5f9;
                font-size: 14px;
              ">


                <!-- Step 번호 -->

                <span style="
                  font-weight: bold;
                  color: #3b82f6;
                ">
                  Step ${idx + 1}.
                </span>


                <!-- 장소 이름 -->

                ${place.name}


                <!-- 상세 설명 -->

                <div
                  class="place-description"
                  style="
                    display: none;
                    margin-top: 8px;
                    padding: 10px;
                    background: #f8fafc;
                    border-radius: 6px;
                    color: #64748b;
                    font-size: 13px;
                  "
                >

                  ${place.description}

                </div>

              </li>

            `).join('')}

          </ul>

        </div>

      `;
    });


    // HTML 출력

    courseList.innerHTML = htmlContent;


    // --------------------------------
    // 상세보기 버튼 이벤트
    // --------------------------------

    const infoButtons =
      courseList.querySelectorAll(
        ".info_button"
      );


    infoButtons.forEach(button => {

      button.addEventListener(
        "click",
        function () {

          // 현재 버튼이 들어있는
          // course-card 찾기

          const courseCard =
            this.closest(".course-card");


          // 해당 코스의 설명 찾기

          const descriptions =
            courseCard.querySelectorAll(
              ".place-description"
            );


          // 설명이 현재 닫혀있는지 확인

          const isHidden =
            descriptions.length > 0 &&
            descriptions[0].style.display === "none";


          // 모든 설명 열기 / 닫기

          descriptions.forEach(description => {

            if (isHidden) {

              description.style.display =
                "block";

            } else {

              description.style.display =
                "none";

            }

          });


          // 버튼 글자 변경

          this.value =
            isHidden
              ? "간략히"
              : "상세보기";

        }
      );

    });

  }


  // --------------------------------
  // 결과가 없는 경우
  // --------------------------------

  else {

    courseList.innerHTML = `

      <div style="
        text-align: center;
        padding: 30px 10px;
        color: #64748b;
      ">

        <p style="
          font-size: 18px;
          margin-bottom: 8px;
        ">
          😅
        </p>

        <p>
          선택하신 조건
          (<b>
            ${region} /
            ${companion} /
            ${season}
          </b>)
          에 맞는 추천 코스를 준비 중입니다.
        </p>

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


  // 결과 화면 표시

  showStep(resultBox);
}


// ========================================
// 9. 메뉴
// ========================================

const menuIcon =
  document.querySelector(".menu_Icon");

const menuItem =
  document.querySelector(".menuList > li");

const submenu =
  document.querySelector(".submenu");


// ========================================
// 10. 메뉴 열기 / 닫기
// ========================================

menuIcon.addEventListener(
  "click",
  function () {

    menuItem.classList.toggle("open");


    if (menuItem.classList.contains("open")) {

      adjustSubmenu();

    }

  }
);


// ========================================
// 11. 서브메뉴 위치 계산
// ========================================

function adjustSubmenu() {

  const iconRect =
    menuIcon.getBoundingClientRect();


  const submenuRect =
    submenu.getBoundingClientRect();


  const margin = 10;


  // 기본 위치
  // 아이콘 아래쪽

  let left = iconRect.left;

  let top =
    iconRect.bottom + 10;


  // --------------------------------
  // 왼쪽 화면 밖으로 나가는 경우
  // --------------------------------

  if (left < margin) {

    left = margin;

  }


  // --------------------------------
  // 오른쪽 화면 밖으로 나가는 경우
  // --------------------------------

  if (
    left + submenuRect.width
    > window.innerWidth - margin
  ) {

    left =
      window.innerWidth
      - submenuRect.width
      - margin;

  }


  // --------------------------------
  // 최종 보정
  // --------------------------------

  if (left < margin) {

    left = margin;

  }


  // --------------------------------
  // 위치 적용
  // --------------------------------

  submenu.style.left =
    `${left}px`;

  submenu.style.top =
    `${top}px`;
}


// ========================================
// 12. 창 크기 변경
// ========================================

window.addEventListener(
  "resize",
  function () {

    if (
      menuItem.classList.contains("open")
    ) {

      adjustSubmenu();

    }

  }
);