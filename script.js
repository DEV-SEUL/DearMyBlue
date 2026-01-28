// ==========================================
// 전역 변수
// ==========================================
let cropper = null; // Cropper.js 인스턴스
let targetId = ""; // 현재 편집 중인 이미지 ID

// ==========================================
// 파일 선택 트리거
// ==========================================
/**
 * 숨겨진 파일 input을 클릭하여 파일 선택 대화상자 열기
 * @param {string} id - 클릭할 input 요소의 ID
 */
function triggerFile(id) {
  document.getElementById(id).click();
}

// ==========================================
// 이미지 편집 모달 열기
// ==========================================
/**
 * 선택한 이미지를 크롭 모달에서 편집
 * @param {HTMLInputElement} input - 파일 input 요소
 * @param {string} imgId - 결과를 표시할 img 요소의 ID
 * @param {number} ratio - 크롭 비율 (예: 2/3, 1/1)
 */
function openEditor(input, imgId, ratio) {
  if (!input.files || !input.files[0]) return;

  targetId = imgId;
  const reader = new FileReader();

  reader.onload = function (e) {
    const modal = document.getElementById("crop-modal");
    const targetImg = document.getElementById("crop-target");

    targetImg.src = e.target.result;
    modal.style.display = "flex";

    // 기존 cropper 인스턴스 제거
    if (cropper) cropper.destroy();

    // 새 cropper 인스턴스 생성
    cropper = new Cropper(targetImg, {
      aspectRatio: ratio,
      viewMode: 1,
      autoCropArea: 1,
      dragMode: "move",
    });
  };

  reader.readAsDataURL(input.files[0]);
  input.value = ""; // 같은 파일 재선택 가능하도록
}

// ==========================================
// 크롭 적용
// ==========================================
/**
 * 크롭된 이미지를 타겟 img 요소에 적용
 */
function applyCrop() {
  const canvas = cropper.getCroppedCanvas();
  const resultImg = document.getElementById(targetId);

  resultImg.src = canvas.toDataURL();
  resultImg.parentElement.classList.add("has-img");

  closeModal();
}

// ==========================================
// 모달 닫기
// ==========================================
/**
 * 크롭 모달을 닫고 cropper 인스턴스 정리
 */
function closeModal() {
  document.getElementById("crop-modal").style.display = "none";
  if (cropper) cropper.destroy();
}

// ==========================================
// 리스트 아이템 추가
// ==========================================
/**
 * 특징 리스트에 새로운 항목 추가
 * @param {string} listId - 리스트 컨테이너 요소의 ID
 */
function addItem(listId) {
  const list = document.getElementById(listId);
  const div = document.createElement("div");

  div.className = "info-item";
  div.innerHTML = `
    <span class="info-text" contenteditable="true">새로운 특징</span>
    <div class="btn-group">
      <button class="list-btn" onclick="addItem('${listId}')">+</button>
      <button class="list-btn" onclick="this.parentElement.parentElement.remove()">−</button>
    </div>
  `;

  list.appendChild(div);
}

// ==========================================
// 컬러 피커
// ==========================================
/**
 * 컬러 피커를 열어 색상 선택
 * @param {string} id - 컬러 도트 요소의 ID
 */
function pickColor(id) {
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = document.getElementById(id).style.background || "#000000";

  colorPicker.oninput = (e) => {
    document.getElementById(id).style.background = e.target.value;
  };

  colorPicker.click();
}

// ==========================================
// 이미지로 저장
// ==========================================
/**
 * 캡처 영역을 PNG 이미지로 저장
 */
function saveAsImage() {
  const area = document.getElementById("capture-area");
  const title = document.querySelector(".pair-title").innerText;
  const btns = document.querySelectorAll(".btn-group");

  // 편집 버튼 숨기기
  btns.forEach((btn) => (btn.style.display = "none"));

  // 페이지 최상단으로 스크롤
  window.scrollTo(0, 0);

  // 렌더링 완료 대기 후 캡처
  setTimeout(() => {
    html2canvas(area, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${title}_profile.png`;
      link.href = canvas.toDataURL();
      link.click();

      // 편집 버튼 다시 표시
      btns.forEach((btn) => (btn.style.display = "flex"));
    });
  }, 100);
}
