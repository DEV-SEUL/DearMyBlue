// ==========================================
// 전역 변수
// ==========================================
let cropper = null;
let targetId = "";
let activeDotId = "";

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

    // Cropper.js 초기화
    cropper = new Cropper(targetImg, {
      aspectRatio: ratio,
      viewMode: 1,
      autoCropArea: 1,
      dragMode: "move",
      background: false, // 바둑판 배경 끄기 (취향껏)
    });
  };

  reader.readAsDataURL(input.files[0]);
  // 동일한 파일을 다시 선택해도 작동하도록 input 값 초기화
  input.value = "";
}

function applyCrop() {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas();
  const resultImg = document.getElementById(targetId);

  if (resultImg) {
    const box = resultImg.parentElement;
    resultImg.src = canvas.toDataURL("image/png");

    // 이미지 표시 처리
    resultImg.style.display = "block";
    box.classList.add("has-img");

    // UI 요소 제어 (아이콘 숨기고 삭제버튼 보이기)
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

  // 파일 인풋 초기화
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
// 이미지로 저장 (PNG Export)
// ==========================================
function saveAsImage() {
  const area = document.getElementById("capture-area");
  const titleEl = document.querySelector(".pair-title");
  const title = titleEl ? titleEl.innerText : "Untitled";

  // 캡처 시 불필요한 UI 숨기기
  const allBtns = document.querySelectorAll(
    ".btn-group, .del-btn, .export-btn, .color-popup, .list-btn",
  );
  allBtns.forEach((btn) => (btn.style.opacity = "0"));

  window.scrollTo(0, 0);

  setTimeout(() => {
    html2canvas(area, {
      backgroundColor: "#ffffff",
      scale: 2, // 3은 용량이 너무 클 수 있어 2 권장
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${title}_profile.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      allBtns.forEach((btn) => (btn.style.opacity = "1"));
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
