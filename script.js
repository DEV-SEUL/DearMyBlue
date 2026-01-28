// ==========================================
// 전역 변수
// ==========================================
let cropper = null;
let targetId = "";
let activeDotId = ""; // 현재 색상을 변경 중인 도트 ID

// ==========================================
// 파일 선택 및 이미지 편집 (Cropper)
// ==========================================
function triggerFile(id) {
  document.getElementById(id).click();
}

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

function applyCrop() {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas();
  const resultImg = document.getElementById(targetId);
  const box = resultImg.parentElement;

  resultImg.src = canvas.toDataURL();
  resultImg.style.display = "block";
  box.classList.add("has-img");

  const plusIcon = box.querySelector(".plus-icon, .small-box-label");
  const delBtn = box.querySelector(".del-btn");

  if (plusIcon) plusIcon.style.display = "none";
  if (delBtn) delBtn.style.display = "flex";

  closeModal();
}

function resetImg(event, imgId) {
  event.stopPropagation();

  const resultImg = document.getElementById(imgId);
  const box = resultImg.parentElement;
  const plusIcon = box.querySelector(".plus-icon, .small-box-label");
  const delBtn = box.querySelector(".del-btn");

  resultImg.src = "";
  resultImg.style.display = "none";
  box.classList.remove("has-img");

  if (plusIcon) plusIcon.style.display = "block";
  if (delBtn) delBtn.style.display = "none";

  const inputId = "file-" + imgId.replace("img-", "");
  const fileInput = document.getElementById(inputId);
  if (fileInput) fileInput.value = "";
}

function closeModal() {
  document.getElementById("crop-modal").style.display = "none";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

// ==========================================
// 리스트 아이템 추가 (개선된 디자인 반영)
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
// 커스텀 컬러 피커 로직 (리디자인)
// ==========================================
function pickColor(id) {
  const dot = document.getElementById(id);
  const popup = document.getElementById("color-popup");
  activeDotId = id;

  // 팝업 위치 설정 (클릭한 도트 근처)
  const rect = dot.getBoundingClientRect();
  popup.style.display = "block";
  popup.style.top = window.scrollY + rect.bottom + 10 + "px";
  popup.style.left = window.scrollX + rect.left - 70 + "px";

  // 팝업 외부 클릭 시 닫기
  const closePopup = (e) => {
    if (!popup.contains(e.target) && e.target !== dot) {
      popup.style.display = "none";
      document.removeEventListener("mousedown", closePopup);
    }
  };
  document.addEventListener("mousedown", closePopup);
}

// 팝업 내 사전 정의된 색상 선택
function selectColor(color) {
  if (activeDotId) {
    const targetDot = document.getElementById(activeDotId);
    targetDot.style.background = color;
    document.getElementById("color-popup").style.display = "none";
  }
}

// 직접 선택 버튼 (시스템 컬러 피커 호출)
function openSystemPicker() {
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  const currentDot = document.getElementById(activeDotId);

  // 현재 색상을 피커 기본값으로 (RGB -> HEX 변환)
  colorInput.value = rgbToHex(currentDot.style.background) || "#000000";

  colorInput.oninput = (e) => {
    selectColor(e.target.value);
  };
  colorInput.click();
}

// RGB(0,0,0) 스타일 문자열을 HEX(#000000)로 변환
function rgbToHex(rgb) {
  if (!rgb || !rgb.startsWith("rgb")) return rgb;
  const vals = rgb.match(/\d+/g);
  return (
    "#" +
    vals
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// ==========================================
// 이미지로 저장 (PNG Export)
// ==========================================
function saveAsImage() {
  const area = document.getElementById("capture-area");
  const titleElement = document.querySelector(".pair-title");
  const title = titleElement ? titleElement.innerText : "Untitled";

  // 캡처 시 방해되는 UI 요소 숨기기
  const allBtns = document.querySelectorAll(
    ".btn-group, .del-btn, .export-btn, .color-popup",
  );
  allBtns.forEach((btn) => (btn.style.opacity = "0"));

  window.scrollTo(0, 0);

  setTimeout(() => {
    html2canvas(area, {
      backgroundColor: "#ffffff",
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${title}_profile.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      // 버튼 다시 표시
      allBtns.forEach((btn) => (btn.style.opacity = "1"));
    });
  }, 200);
}
