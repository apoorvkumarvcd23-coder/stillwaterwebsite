(() => {
  const STORAGE_KEY = "wellness_assessment";

  const readStorage = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (err) {
      return {};
    }
  };

  const writeStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const normalizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    return [String(value).trim()].filter(Boolean);
  };

  const collectFormData = (form) => {
    const data = {};
    const elements = Array.from(form.elements);
    const arrayFields = new Set();

    elements.forEach((el) => {
      if (!el.name || el.disabled) return;

      const name = el.name;
      const isArrayField = name.endsWith("[]");
      const key = isArrayField ? name.slice(0, -2) : name;

       if (isArrayField) {
        arrayFields.add(key);
      }

      if (el.type === "checkbox") {
        if (isArrayField) {
          if (!data[key]) data[key] = [];
          if (el.checked) data[key].push(el.value);
        } else {
          data[key] = el.checked;
        }
        return;
      }

      if (el.type === "radio") {
        if (el.checked) data[key] = el.value;
        return;
      }

      data[key] = el.value;
    });

    arrayFields.forEach((key) => {
      if (!Array.isArray(data[key])) {
        data[key] = [];
      }
    });

    return data;
  };

  const hydrateForm = (form, stored) => {
    const elements = Array.from(form.elements);

    elements.forEach((el) => {
      if (!el.name) return;

      const name = el.name;
      const isArrayField = name.endsWith("[]");
      const key = isArrayField ? name.slice(0, -2) : name;
      const storedValue = stored[key];

      if (el.type === "checkbox") {
        if (isArrayField) {
          el.checked = normalizeArray(storedValue).includes(el.value);
        } else {
          el.checked = Boolean(storedValue);
        }
        return;
      }

      if (el.type === "radio") {
        el.checked = storedValue === el.value;
        return;
      }

      if (storedValue !== undefined && storedValue !== null) {
        el.value = storedValue;
      }
    });
  };

  const submitIntake = async (data, form) => {
    const errorEl = document.getElementById("formError");
    if (errorEl) errorEl.textContent = "";

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;

    try {
      const payload = {
        ...data,
        symptoms: normalizeArray(data.symptoms),
        conditions: normalizeArray(data.conditions),
        goals: normalizeArray(data.goals),
      };

      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({ error: "" }));
        throw new Error(message.error || "Submission failed");
      }

      writeStorage({});
      window.location.href = form.dataset.next || "/recommendation/thank-you.html";
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || "Something went wrong.";
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };

  const initForm = (form) => {
    const stored = readStorage();
    hydrateForm(form, stored);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const updated = collectFormData(form);
      const merged = { ...stored, ...updated };
      writeStorage(merged);

      if (form.dataset.submit === "true") {
        submitIntake(merged, form);
        return;
      }

      if (form.dataset.next) {
        window.location.href = form.dataset.next;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form[data-assessment]");
    if (form) {
      initForm(form);
    }
  });
})();
