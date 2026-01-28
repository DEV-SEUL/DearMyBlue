// ==========================================
// 1. 전역 변수 설정
// ==========================================
let cropper = null;
let targetId = "";
let currentScale = 1.0;

// 컬러 피커 관련 전역 변수
let activeDot = null; // 현재 선택된 컬러 점 객체
let originalColor = ""; // 취소 시 복구할 원본 색상
let colorPicker = null; // Vanilla-Picker 인스턴스

// ==========================================
// 2. 페이지 축소/확대 제어
// ==========================================
function adjustScale(amount) {
  currentScale = Math.min(1.0, Math.max(0.5, currentScale + amount));
  updateDisplay();
}

function updateDisplay() {
  const area = document.getElementById("capture-area");
  const valText = document.getElementById("scale-val");
  if (!area || !valText) return;

  area.style.transform = `scale(${currentScale})`;
  area.style.transformOrigin = "top center";

  const displayVal = Math.round(currentScale * 100);
  valText.innerText = `${displayVal}%`;

  // 배율에 따른 부모 컨테이너 높이 보정
  const wrapper = area.parentElement;
  if (wrapper) {
    wrapper.style.height = area.offsetHeight * currentScale + "px";
  }
}

// ==========================================
// 3. 이미지 편집 및 크롭 (Cropper.js)
// ==========================================
function triggerFile(id) {
  const el = document.getElementById(id);
  if (el) el.click();
}

function openEditor(input, imgId, ratio) {
  if (!input.files || !input.files[0]) return;
  targetId = imgId;

  const reader = new FileReader();
  reader.onload = function (e) {
    const modal = document.getElementById("crop-modal");
    const targetImg = document.getElementById("crop-target");
    if (!modal || !targetImg) return;

    targetImg.src = e.target.result;
    modal.style.display = "flex";

    if (cropper) cropper.destroy();
    cropper = new Cropper(targetImg, {
      aspectRatio: ratio,
      viewMode: 1,
      autoCropArea: 1,
      dragMode: "move",
      background: false,
    });
  };
  reader.readAsDataURL(input.files[0]);
  input.value = ""; // 동일 파일 재선택 가능하게 초기화
}

function applyCrop() {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas();
  const resultImg = document.getElementById(targetId);
  if (resultImg) {
    const box = resultImg.parentElement;
    resultImg.src = canvas.toDataURL("image/png");
    resultImg.style.display = "block";

    // 이미지 업로드 시 플러스 아이콘/라벨 숨기기
    const plusIcon = box.querySelector(".plus-icon, .small-box-label");
    if (plusIcon) plusIcon.style.opacity = "0";
  }
  closeModal();
}

function closeModal() {
  const modal = document.getElementById("crop-modal");
  if (modal) modal.style.display = "none";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function resetImg(event, imgId) {
  event.stopPropagation();
  const resultImg = document.getElementById(imgId);
  if (!resultImg) return;

  const box = resultImg.parentElement;
  const plusIcon = box.querySelector(".plus-icon, .small-box-label");

  resultImg.src = "";
  resultImg.style.display = "none";
  if (plusIcon) plusIcon.style.opacity = "1";
}

// ==========================================
// 4. 특징 리스트 제어
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
// 5. 커스텀 컬러 피커 (Vanilla-Picker & 미리보기/취소/적용)
// ==========================================
function pickColor(id) {
  activeDot = document.getElementById(id);
  if (!activeDot) return;

  // 1. 취소 시 복구를 위해 현재 색상 저장 (원본 백업)
  originalColor = activeDot.style.background || "#ffffff";

  const popup = document.getElementById("color-popup");
  const pickerContent = document.getElementById("picker-content");
  if (!popup || !pickerContent) return;

  // 2. 팝업 초기화 및 표시
  pickerContent.innerHTML = "";
  popup.style.display = "block";

  // 3. 팝업 위치 설정 (클릭한 점 근처)
  const rect = activeDot.getBoundingClientRect();
  popup.style.top = window.scrollY + rect.top - 280 + "px";
  popup.style.left = window.scrollX + rect.left - 100 + "px";

  // 4. 피커 생성
  colorPicker = new Picker({
    parent: pickerContent,
    popup: false,
    alpha: false,
    color: originalColor,
    // onChange: 색상을 선택하는 동안 실시간으로 점의 색상을 변경 (미리보기)
    onChange: (color) => {
      activeDot.style.background = color.rgbaString;
    },
  });
}

/**
 * 컬러 피커 팝업 닫기
 * @param {boolean} isApply - '적용' 버튼 클릭 시 true, '취소'나 바깥 클릭 시 false
 */
function closeColorPopup(isApply) {
  const popup = document.getElementById("color-popup");
  if (!popup || !activeDot) return;

  if (!isApply) {
    // 취소한 경우 원본 색상으로 복구
    activeDot.style.background = originalColor;
  }

  popup.style.display = "none";

  if (colorPicker) {
    colorPicker.destroy();
    colorPicker = null;
  }
}

// 팝업 바깥 클릭 시 취소 처리
document.addEventListener("mousedown", (e) => {
  const popup = document.getElementById("color-popup");
  if (popup && popup.style.display === "block") {
    if (!popup.contains(e.target) && e.target !== activeDot) {
      closeColorPopup(false);
    }
  }
});

// ==========================================
// 6. 이미지 저장 (html2canvas)
// ==========================================
function saveAsImage() {
  const area = document.getElementById("capture-area");
  if (!area) return;

  // 저장을 위해 배율 잠시 초기화
  const originalTransform = area.style.transform;
  area.style.transform = "scale(1)";

  // UI 요소 숨기기
  const hideTargets = document.querySelectorAll(
    ".btn-group, .del-btn, .top-nav, #color-popup",
  );
  hideTargets.forEach((el) => (el.style.visibility = "hidden"));

  window.scrollTo(0, 0);

  setTimeout(() => {
    html2canvas(area, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      const title = document.querySelector(".pair-title").innerText.trim();
      const link = document.createElement("a");
      link.download = `${title || "profile"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      // 원래 상태로 복구
      hideTargets.forEach((el) => (el.style.visibility = "visible"));
      area.style.transform = originalTransform;
    });
  }, 300);
}

// 서식 없는 텍스트 붙여넣기 방지
document.addEventListener("paste", (e) => {
  if (e.target.isContentEditable) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }
});
