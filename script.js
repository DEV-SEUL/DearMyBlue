// ==========================================
// 전역 변수
// ==========================================
let cropper = null;
let targetId = "";
let activeDotId = "";

// ==========================================
// 시트 전체 축소/확대 (Scale) 로직 - 추가됨
// ==========================================
function updateScale(value) {
  const area = document.getElementById("capture-area");
  if (!area) return;

  // 슬라이더 값(0.5 ~ 1.0)에 따라 크기 조절
  area.style.transform = `scale(${value})`;
  area.style.transformOrigin = "top center";

  // 축소 시 아래쪽 여백이 남는 문제 해결 (부모 요소 높이 조정)
  const wrapper = area.parentElement;
  if (wrapper) {
    wrapper.style.height = area.offsetHeight * value + "px";
  }

  // 현재 배율 표시 (HTML에 scale-val 아이디를 가진 요소 필요)
  const scaleDisplay = document.getElementById("scale-val");
  if (scaleDisplay) {
    scaleDisplay.innerText = Math.floor(value * 100) + "%";
  }
}

// ==========================================
// 파일 선택 및 이미지 편집 (Cropper)
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

    if (!modal || !targetImg) {
      alert(
        "모달 구조를 찾을 수 없습니다. HTML에 crop-modal과 crop-target이 있는지 확인하세요.",
      );
      return;
    }

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
  input.value = "";
}

function applyCrop() {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas();
  const resultImg = document.getElementById(targetId);

  if (resultImg) {
    const box = resultImg.parentElement;
    resultImg.src = canvas.toDataURL("image/png");

    resultImg.style.display = "block";
    box.classList.add("has-img");

    const plusIcon = box.querySelector(".plus-icon, .small-box-label");
    const delBtn = box.querySelector(".del-btn");

    if (plusIcon) plusIcon.style.display = "none";
    if (delBtn) delBtn.style.display = "flex";
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
  const delBtn = box.querySelector(".del-btn");

  resultImg.src = "";
  resultImg.style.display = "none";
  box.classList.remove("has-img");

  if (plusIcon) plusIcon.style.display = "block";
  if (delBtn) delBtn.style.display = "none";

  const fileInput = document.getElementById(
    "file-" + imgId.replace("img-", ""),
  );
  if (fileInput) fileInput.value = "";
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
// 컬러 피커 로직
// ==========================================
function pickColor(id) {
  const dot = document.getElementById(id);
  const popup = document.getElementById("color-popup");
  if (!dot || !popup) return;

  activeDotId = id;

  const rect = dot.getBoundingClientRect();
  popup.style.display = "block";
  popup.style.top = window.scrollY + rect.bottom + 10 + "px";
  popup.style.left = window.scrollX + rect.left - 70 + "px";

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
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  const currentDot = document.getElementById(activeDotId);
  if (currentDot) {
    colorInput.value = rgbToHex(currentDot.style.background) || "#000000";
  }
  colorInput.oninput = (e) => selectColor(e.target.value);
  colorInput.click();
}

function rgbToHex(rgb) {
  if (!rgb || !rgb.startsWith("rgb")) return rgb;
  const vals = rgb.match(/\d+/g);
  return (
    "#" + vals.map((x) => parseInt(x).toString(16).padStart(2, "0")).join("")
  );
}

// ==========================================
// 이미지로 저장 (PNG Export) - 축소 보정 기능 통합
// ==========================================
function saveAsImage() {
  const area = document.getElementById("capture-area");
  if (!area) return;

  const originalTransform = area.style.transform; // 현재 적용된 축소 배율 보관
  area.style.transform = "scale(1)"; // 저장 시에는 100% 비율로 복구

  const titleEl = document.querySelector(".pair-title");
  const title = titleEl ? titleEl.innerText : "Untitled";

  // 캡처 시 불필요한 UI 숨기기
  const allBtns = document.querySelectorAll(
    ".btn-group, .del-btn, .export-btn, .color-popup, .list-btn, .scale-control",
  );
  allBtns.forEach((btn) => (btn.style.opacity = "0"));

  window.scrollTo(0, 0);

  setTimeout(() => {
    html2canvas(area, {
      backgroundColor: "#ffffff",
      scale: 2, // 저장 화질 보정
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${title}_profile.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      // UI 복구 및 축소 배율 복구
      allBtns.forEach((btn) => (btn.style.opacity = "1"));
      area.style.transform = originalTransform;
    });
  }, 400);
}

// ==========================================
// 붙여넣기 서식 제거
// ==========================================
document.addEventListener("paste", function (e) {
  if (e.target.isContentEditable) {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }
});
