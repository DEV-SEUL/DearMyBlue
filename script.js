// ==========================================
// 1. 전역 변수 설정
// ==========================================
let cropper = null;
let targetId = "";
let activeDotId = "";
let currentScale = 1.0; // 기본 배율 100%

// ==========================================
// 2. 페이지 축소/확대 (Button 방식)
// ==========================================
function adjustScale(amount) {
  // 최소 0.5(50%) ~ 최대 1.0(100%) 범위 제한
  currentScale = Math.min(1.0, Math.max(0.5, currentScale + amount));
  updateDisplay();
}

function updateDisplay() {
  const area = document.getElementById("capture-area");
  const valText = document.getElementById("scale-val");
  if (!area || !valText) return;

  // 화면 배율 적용 (상단 중앙 기준)
  area.style.transform = `scale(${currentScale})`;
  area.style.transformOrigin = "top center";

  // 배율 텍스트 업데이트
  const displayVal = Math.round(currentScale * 100);
  valText.innerText = `${displayVal}%`;

  // 축소 시 발생하는 하단 빈 공간 방지 (부모 컨테이너 높이 보정)
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
  input.value = ""; // 동일 파일 재선택 가능하도록 초기화
}

function applyCrop() {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas();
  const resultImg = document.getElementById(targetId);

  if (resultImg) {
    const box = resultImg.parentElement;
    resultImg.src = canvas.toDataURL("image/png");
    resultImg.style.display = "block";

    const plusIcon = box.querySelector(".plus-icon, .small-box-label");
    if (plusIcon) plusIcon.style.opacity = "0"; // 아이콘 숨김
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

  const fileInput = document.getElementById(
    "file-" + imgId.replace("img-", ""),
  );
  if (fileInput) fileInput.value = "";
}

// ==========================================
// 4. 리스트 제어
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
// 5. 컬러 피커 로직
// ==========================================
function pickColor(id) {
  const dot = document.getElementById(id);
  const popup = document.getElementById("color-popup");
  if (!dot || !popup) return;

  activeDotId = id;
  const rect = dot.getBoundingClientRect();

  popup.style.display = "block";
  popup.style.top = window.scrollY + rect.bottom + 8 + "px";
  popup.style.left = window.scrollX + rect.left - 80 + "px";

  const closePopup = (e) => {
    if (!popup.contains(e.target) && e.target !== dot) {
      popup.style.display = "none";
      document.removeEventListener("mousedown", closePopup);
    }
  };
  document.addEventListener("mousedown", closePopup);
}

function selectColor(color) {
  if (activeDotId) {
    const targetDot = document.getElementById(activeDotId);
    if (targetDot) targetDot.style.background = color;
    const popup = document.getElementById("color-popup");
    if (popup) popup.style.display = "none";
  }
}

function openSystemPicker() {
  const hiddenPicker = document.getElementById("hidden-picker");
  const currentDot = document.getElementById(activeDotId);

  if (currentDot) {
    hiddenPicker.value = rgbToHex(currentDot.style.background) || "#000000";
  }
  hiddenPicker.click();
}

function rgbToHex(rgb) {
  if (!rgb || !rgb.startsWith("rgb")) return rgb;
  const vals = rgb.match(/\d+/g);
  return (
    "#" + vals.map((x) => parseInt(x).toString(16).padStart(2, "0")).join("")
  );
}

// ==========================================
// 6. 이미지 저장 (PNG Export)
// ==========================================
function saveAsImage() {
  const area = document.getElementById("capture-area");
  if (!area) return;

  // 1. 현재 배율 임시 해제 (100%로 캡처해야 고화질)
  const originalTransform = area.style.transform;
  const originalHeight = area.parentElement.style.height;

  area.style.transform = "scale(1)";
  area.parentElement.style.height = "auto";

  // 2. 불필요한 UI 요소 숨기기
  const hideTargets = document.querySelectorAll(
    ".btn-group, .del-btn, .top-nav, #color-popup",
  );
  hideTargets.forEach((el) => (el.style.visibility = "hidden"));

  window.scrollTo(0, 0);

  setTimeout(() => {
    html2canvas(area, {
      backgroundColor: "#ffffff",
      scale: 2, // 2배 선명하게 저장
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      const title = document.querySelector(".pair-title").innerText.trim();
      const link = document.createElement("a");
      link.download = `${title || "profile"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      // 3. UI 및 배율 복구
      hideTargets.forEach((el) => (el.style.visibility = "visible"));
      area.style.transform = originalTransform;
      area.parentElement.style.height = originalHeight;
    });
  }, 300);
}

// ==========================================
// 7. 유틸리티 (붙여넣기 서식 제거)
// ==========================================
document.addEventListener("paste", function (e) {
  if (e.target.isContentEditable) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }
});
