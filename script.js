// ==========================================
// 전역 변수
// ==========================================
let cropper = null; // Cropper.js 인스턴스
let targetId = ""; // 현재 편집 중인 이미지 ID (img 요소의 ID)

// ==========================================
// 파일 선택 트리거
// ==========================================
function triggerFile(id) {
  document.getElementById(id).click();
}

// ==========================================
// 이미지 편집 모달 열기
// ==========================================
function openEditor(input, imgId, ratio) {
  if (!input.files || !input.files[0]) return;

  targetId = imgId;
  const reader = new FileReader();

  reader.onload = function (e) {
    const modal = document.getElementById("crop-modal");
    const targetImg = document.getElementById("crop-target");

    targetImg.src = e.target.result;
    modal.style.display = "flex";

    if (cropper) cropper.destroy();

    cropper = new Cropper(targetImg, {
      aspectRatio: ratio,
      viewMode: 1,
      autoCropArea: 1,
      dragMode: "move",
    });
  };

  reader.readAsDataURL(input.files[0]);
  input.value = "";
}

// ==========================================
// 크롭 적용 (수정됨: UI 업데이트 로직 추가)
// ==========================================
function applyCrop() {
  const canvas = cropper.getCroppedCanvas();
  const resultImg = document.getElementById(targetId);
  const box = resultImg.parentElement;

  // 이미지 적용 및 표시
  resultImg.src = canvas.toDataURL();
  resultImg.style.display = "block";
  box.classList.add("has-img");

  // 이미지 추가 시 플러스 아이콘/라벨 숨기기 및 삭제 버튼 보이기
  const plusIcon = box.querySelector(".plus-icon, .small-box-label");
  const delBtn = box.querySelector(".del-btn");

  if (plusIcon) plusIcon.style.display = "none";
  if (delBtn) delBtn.style.display = "flex";

  closeModal();
}

// ==========================================
// 이미지 초기화 (새로 추가: 삭제 버튼 기능)
// ==========================================
/**
 * 이미지를 삭제하고 초기 상태로 되돌림
 * @param {Event} event - 클릭 이벤트 (버블링 방지용)
 * @param {string} imgId - 초기화할 이미지 요소의 ID
 */
function resetImg(event, imgId) {
  // 부모 img-box의 클릭 이벤트(파일 선택창 열기)가 실행되지 않도록 차단
  event.stopPropagation();

  const resultImg = document.getElementById(imgId);
  const box = resultImg.parentElement;
  const plusIcon = box.querySelector(".plus-icon, .small-box-label");
  const delBtn = box.querySelector(".del-btn");

  // 1. 이미지 제거
  resultImg.src = "";
  resultImg.style.display = "none";
  box.classList.remove("has-img");

  // 2. UI 복구 (플러스 아이콘 보이기, 삭제 버튼 숨기기)
  if (plusIcon) plusIcon.style.display = "block";
  if (delBtn) delBtn.style.display = "none";

  // 3. 연결된 파일 input 값 비우기
  const inputId = "file-" + imgId.replace("img-", "");
  const fileInput = document.getElementById(inputId);
  if (fileInput) fileInput.value = "";
}

// ==========================================
// 모달 닫기
// ==========================================
function closeModal() {
  document.getElementById("crop-modal").style.display = "none";
  if (cropper) cropper.destroy();
}

// ==========================================
// 리스트 아이템 추가
// ==========================================
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
// 이미지로 저장 (PNG Export)
// ==========================================
function saveAsImage() {
  const area = document.getElementById("capture-area");
  const title = document.querySelector(".pair-title").innerText;

  // 캡처 시 방해되는 모든 버튼 요소 숨기기
  const allBtns = document.querySelectorAll(".btn-group, .del-btn");
  allBtns.forEach((btn) => (btn.style.opacity = "0"));

  window.scrollTo(0, 0);

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

      // 저장 완료 후 버튼 다시 표시
      allBtns.forEach((btn) => (btn.style.opacity = "1"));
    });
  }, 100);
}
