let inone = parseInt(prompt("해당하는 동행 형태 선택\n1 : 혼자\n2 : 가족\n3 : 연인"));
let inoneDesc = "";

if (inone >= 1 && inone <= 3) {
    console.log("입력 완료");

    switch (inone) {
        case 1:
            inoneDesc = "혼자";
            break;
        case 2:
            inoneDesc = "가족";
            break;
        case 3:
            inoneDesc = "연인";
            break;
    }
} else {
    console.error("잘못된 입력");
}

let day = parseInt(prompt("여행 일 수 입력 : (1 ~ 3)"));
let result = "";

if (day >= 1 && day <= 3) {
    console.log("입력 완료");
} else {
    console.error("잘못된 입력");
}

if (inone >= 1 && inone <= 3 && day >= 1 && day <= 3) {
    switch (day) {
        case 1:
            result = "광주";
            break;
        case 2:
            result = "경기";
            break;
        case 3:
            result = "강릉";
            break;
    }
}

console.log("인원 형태 : " + inoneDesc + "\n일 수 : " + day + "\n결과 : " + result);
