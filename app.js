const form = document.querySelector("#attendanceForm");
const fields = {
  client: document.querySelector("#client"),
  machine: document.querySelector("#machine"),
  osNumber: document.querySelector("#osNumber"),
  description: document.querySelector("#description"),
  technician: document.querySelector("#technician")
};
const preview = document.querySelector("#messagePreview");
const feedback = document.querySelector("#feedback");
const shareButton = document.querySelector("#shareButton");
const copyButton = document.querySelector("#copyButton");
const clearButton = document.querySelector("#clearButton");

function formatClientName(name) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // Avoid duplicating the honorific if the technician already entered it.
  return /^sr\.?\s/i.test(trimmed) ? trimmed : `Sr. ${trimmed}`;
}

function buildMessage() {
  const client = formatClientName(fields.client.value);
  const machine = fields.machine.value.trim();
  const os = fields.osNumber.value.trim();
  const description = fields.description.value.trim();
  const technician = fields.technician.value;

  if (![client, machine, os, description, technician].every(Boolean)) return "";

  return `⚙️ *_Conversado com ${client} referente à máquina ${machine} [#${os}]._*\n\n` +
    `*_Descrição: ${description}_*\n\n` +
    `*_Técnico: ${technician}_*\n\n` +
    `Qualquer dúvida estamos à disposição! 😉\n\n` +
    `------------------------------------------------------------------\n` +
    `⚠️ _MENSAGEM PARA FINS DE REGISTRO._\n` +
    `_FAVOR IGNORAR._ ⚠️\n` +
    `------------------------------------------------------------------`;
}

function refreshPreview() {
  const message = buildMessage();
  preview.textContent = message || "Preencha os campos obrigatórios acima para montar a mensagem.";
  feedback.textContent = "";
  return message;
}

Object.values(fields).forEach(field => {
  field.addEventListener("input", refreshPreview);
  field.addEventListener("change", refreshPreview);
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const temporary = document.createElement("textarea");
  temporary.value = text;
  temporary.setAttribute("readonly", "");
  temporary.style.position = "fixed";
  temporary.style.opacity = "0";
  document.body.appendChild(temporary);
  temporary.select();
  const ok = document.execCommand("copy");
  temporary.remove();
  if (!ok) throw new Error("Não foi possível copiar automaticamente.");
}

function requireMessage() {
  const message = buildMessage();
  if (message) return message;
  form.reportValidity();
  feedback.textContent = "Preencha todos os campos obrigatórios.";
  const firstEmpty = Object.values(fields).find(field => !field.value.trim());
  if (firstEmpty) firstEmpty.focus();
  return "";
}

shareButton.addEventListener("click", async () => {
  const message = requireMessage();
  if (!message) return;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Registro de atendimento Intelimaq", text: message });
      feedback.textContent = "Menu de compartilhamento aberto.";
    } else {
      await copyText(message);
      feedback.textContent = "Compartilhamento não disponível neste navegador. Mensagem copiada; cole no WhatsApp.";
    }
  } catch (error) {
    if (error && error.name === "AbortError") {
      feedback.textContent = "Compartilhamento cancelado.";
      return;
    }
    try {
      await copyText(message);
      feedback.textContent = "Não foi possível abrir o compartilhamento. Mensagem copiada para colar no WhatsApp.";
    } catch {
      feedback.textContent = "Não foi possível compartilhar nem copiar. Selecione e copie o texto da prévia.";
    }
  }
});

copyButton.addEventListener("click", async () => {
  const message = requireMessage();
  if (!message) return;
  try {
    await copyText(message);
    feedback.textContent = "Mensagem copiada! Agora é só colar no WhatsApp.";
  } catch {
    feedback.textContent = "Não foi possível copiar automaticamente. Selecione e copie o texto da prévia.";
  }
});

clearButton.addEventListener("click", () => {
  form.reset();
  fields.technician.value = "Alison Moura";
  refreshPreview();
  fields.client.focus();
});

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      document.querySelector("#connectionStatus").textContent = "Modo navegador";
    });
  });
}
