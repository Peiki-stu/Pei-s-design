const revealItems = document.querySelectorAll(".reveal");

const revealOnLoad = () => {
  const hero = document.querySelector("#hero.reveal");
  if (hero) {
    hero.classList.add("is-visible");
  }
};

const revealOnScroll = () => {
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => {
    if (item.id !== "hero") {
      observer.observe(item);
    }
  });
};

const bindOrderForm = () => {
  const orderForm = document.querySelector("#order-form");
  const deliveryMethod = document.querySelector("#delivery-method");
  const addressField = document.querySelector("#address-field");
  const addressInput = document.querySelector("#address-input");
  const orderStatus = document.querySelector("#order-status");
  const bankInfo = document.querySelector("#bank-info");

  if (!orderForm || !deliveryMethod || !addressField || !addressInput) return;

  const syncAddressVisibility = () => {
    const needAddress = deliveryMethod.value === "郵寄";
    addressField.classList.toggle("is-hidden", !needAddress);
    addressInput.required = needAddress;
    if (!needAddress) addressInput.value = "";
  };

  deliveryMethod.addEventListener("change", syncAddressVisibility);
  syncAddressVisibility();

  orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = orderForm.dataset.sheetEndpoint?.trim();
    const formData = new FormData(orderForm);
    const payload = Object.fromEntries(formData.entries());
    payload.formType = "order";
    payload.createdAt = new Date().toISOString();

    orderStatus.textContent = "正在送出訂單...";

    // 沒有設定 Apps Script URL 時，先提供本機展示流程。
    if (!endpoint) {
      orderStatus.textContent =
        "已完成表單填寫。請在 order-form 的 data-sheet-endpoint 填入 Google Apps Script URL 啟用自動寫入。";
      bankInfo?.classList.remove("is-hidden");
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response) throw new Error("request failed");
      orderStatus.textContent = "訂單已送出，請依下方資訊完成轉帳。";
      bankInfo?.classList.remove("is-hidden");
      orderForm.reset();
      syncAddressVisibility();
    } catch (error) {
      orderStatus.textContent = "送出失敗，請稍後再試或改以 Email 聯繫。";
    }
  });
};

const bindEventForm = () => {
  const eventForm = document.querySelector("#event-form");
  const eventStatus = document.querySelector("#event-status");
  if (!eventForm || !eventStatus) return;

  eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = eventForm.dataset.sheetEndpoint?.trim();
    const formData = new FormData(eventForm);
    const payload = Object.fromEntries(formData.entries());
    payload.formType = "event";
    payload.createdAt = new Date().toISOString();
    eventStatus.textContent = "正在送出預約...";

    if (!endpoint) {
      eventStatus.textContent =
        "已完成預約填寫。請在 event-form 的 data-sheet-endpoint 填入 Google Apps Script URL 啟用自動寫入。";
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response) throw new Error("request failed");
      eventStatus.textContent = "預約已送出，我們會盡快與你確認。";
      eventForm.reset();
    } catch (error) {
      eventStatus.textContent = "送出失敗，請稍後再試或改以 Email 聯繫。";
    }
  });
};

window.addEventListener("DOMContentLoaded", () => {
  revealOnLoad();
  revealOnScroll();
  bindOrderForm();
  bindEventForm();
});
