const API_URL =
"https://script.google.com/macros/s/AKfycbyvFEyFyDlH4luPIyLzm1rlSQaCdJXXppWswJOSwob430dIloOftSBtZbPs-hckRp1W/exec?action=menu";


let data = {};
let cart = {};
let total = 0;

async function loadMenu() {

  const menu = document.getElementById("menu");

  try {

    const res = await fetch(API_URL);
    const json = await res.json();

    console.log("Response API mentah:", json);

    if (!json.success || !json.data) {
      menu.innerHTML =
        "Gagal memuat menu: " +
        (json.message || "data kosong");
      console.error("Response API:", json);
      return;
    }

    data = json.data;

    render();

  } catch (err) {

    menu.innerHTML =
      "Gagal memuat menu, cek koneksi atau API.";
    console.error("Gagal load menu:", err);

  }

}

function formatRp(v) {

  return Number(v).toLocaleString("id-ID");

}

function toggle(id) {

  const panel =
    document.getElementById(id);

  const isOpen =
    panel.style.display === "block";

  document
    .querySelectorAll(".panel")
    .forEach(p => {
      p.style.display = "none";
    });

  panel.style.display =
    isOpen ? "none" : "block";

}

function render() {

  const menu =
    document.getElementById("menu");

  let html = "";

  Object.keys(data).forEach(
    (kategori, index) => {

      html += `
      <div class="acc"
        onclick="toggle('p${index}')">
        ${kategori}
      </div>

      <div class="panel"
        id="p${index}">
      `;

      Object.keys(
        data[kategori]
      ).forEach(item => {

        const obj =
          data[kategori][item];

        const price =
          obj.price;

        const id =
          (kategori + "_" + item)
          .replace(/\W/g, "_");

        const hasOpt =
          obj.options && obj.options.length;

        const hasLvl =
          obj.levels && obj.levels.length;

        html += `
        <div class="menu-item">

          <div class="menu-top">

            <div>
              <b>${item}</b>
              <br>
              Rp ${formatRp(price)}
            </div>
        `;

        if (!hasOpt && !hasLvl) {

          html += `
            <div class="qty">

              <button
                onclick="removeItem(
                '${id}',
                ${price})">
                -
              </button>

              <span id="q_${id}">
                0
              </span>

              <button
                onclick="addItem(
                '${item}',
                '${id}',
                ${price})">
                +
              </button>

            </div>
          `;

        }

        html += `</div>`;

        if (hasOpt && hasLvl) {

          html += `
          <select
            id="opt_${id}">

            <option value="">
              Pilih Varian
            </option>

            ${obj.options
              .map(
                v =>
                `<option>${v}</option>`
              )
              .join("")}

          </select>

          <select
            id="lvl_${id}">

            <option value="">
              Pilih Level
            </option>

            ${obj.levels
              .map(
                v =>
                `<option>${v}</option>`
              )
              .join("")}

          </select>

          <div class="qty">

            <button
              onclick="removeItem(
              '${id}',
              ${price})">
              -
            </button>

            <span id="q_${id}">
              0
            </span>

            <button
              onclick="addItem(
              '${item}',
              '${id}',
              ${price})">
              +
            </button>

          </div>
          `;

        } else if (hasOpt || hasLvl) {

          const dim =
            hasOpt ? "opt" : "lvl";

          const values =
            hasOpt ? obj.options : obj.levels;

          html += `<div class="variant-rows">`;

          values.forEach(v => {

            const safe =
              String(v).replace(/\W/g, "_");

            const elId =
              `q_${id}__${dim}_${safe}`;

            const label =
              dim === "lvl" ? `Level ${v}` : v;

            html += `
            <div class="variant-row">
              <span>${label}</span>
              <div class="qty">
                <button
                  onclick="removeQuickVariant(
                  '${id}',
                  '${dim}',
                  '${v}')">
                  -
                </button>
                <span id="${elId}">0</span>
                <button
                  onclick="addQuickVariant(
                  '${item}',
                  '${id}',
                  ${price},
                  '${dim}',
                  '${v}')">
                  +
                </button>
              </div>
            </div>
            `;

          });

          html += `</div>`;

        }

        html += `
          <input
            id="note_${id}"
            placeholder="Catatan item">

        </div>
        `;

      });

      html += "</div>";

    }
  );

  menu.innerHTML = html;

}

function variantLabel(opt, lvl) {

  const parts = [];

  if (opt) parts.push(opt);
  if (lvl) parts.push("Level " + lvl);

  return parts.length
    ? ` (${parts.join(", ")})`
    : "";

}

function lineKey(id, opt, lvl, note) {

  return `${id}__${opt}__${lvl}__${note}`;

}

function addItem(
  name,
  id,
  price
) {

  const opt =
    document.getElementById(`opt_${id}`)?.value || "";

  const lvl =
    document.getElementById(`lvl_${id}`)?.value || "";

  const note =
    document.getElementById(`note_${id}`)?.value.trim() || "";

  const key = lineKey(id, opt, lvl, note);

  if (!cart[key]) {

    cart[key] = {
      baseId: id,
      name: name,
      price: price,
      opt: opt,
      lvl: lvl,
      note: note,
      qty: 0,
      dispEl: `q_${id}`
    };

  }

  cart[key].qty++;

  refreshCart();

}

function removeItem(
  id,
  price
) {

  const opt =
    document.getElementById(`opt_${id}`)?.value || "";

  const lvl =
    document.getElementById(`lvl_${id}`)?.value || "";

  const note =
    document.getElementById(`note_${id}`)?.value.trim() || "";

  const key = lineKey(id, opt, lvl, note);

  if (cart[key] && cart[key].qty > 0) {

    cart[key].qty--;

    if (cart[key].qty === 0) {
      delete cart[key];
    }

    refreshCart();

  } else {

    alert(
      "Belum ada pesanan untuk varian/catatan yang sedang dipilih ini. Cek lagi pilihan varian, level, atau catatannya."
    );

  }

}

function addQuickVariant(
  name,
  id,
  price,
  dim,
  value
) {

  const note =
    document.getElementById(`note_${id}`)?.value.trim() || "";

  const safe =
    String(value).replace(/\W/g, "_");

  const key =
    `${id}__quick_${dim}_${safe}`;

  if (!cart[key]) {

    cart[key] = {
      baseId: id,
      name: name,
      price: price,
      opt: dim === "opt" ? value : "",
      lvl: dim === "lvl" ? value : "",
      note: note,
      qty: 0,
      dispEl: `q_${id}__${dim}_${safe}`
    };

  }

  cart[key].qty++;
  cart[key].note = note;

  refreshCart();

}

function removeQuickVariant(
  id,
  dim,
  value
) {

  const safe =
    String(value).replace(/\W/g, "_");

  const key =
    `${id}__quick_${dim}_${safe}`;

  if (cart[key] && cart[key].qty > 0) {

    cart[key].qty--;

    if (cart[key].qty === 0) {
      delete cart[key];
    }

    refreshCart();

  }

}

function incrementLine(key) {

  if (!cart[key]) return;

  cart[key].qty++;

  refreshCart();

}

function decrementLine(key) {

  if (!cart[key]) return;

  cart[key].qty--;

  if (cart[key].qty <= 0) {
    delete cart[key];
  }

  refreshCart();

}

function removeLine(key) {

  delete cart[key];

  refreshCart();

}

function refreshCart() {

  refreshDisplays();
  updateTotal();
  renderCartSummary();

}

function refreshDisplays() {

  document
    .querySelectorAll('[id^="q_"]')
    .forEach(el => {
      el.innerText = "0";
    });

  Object.values(cart).forEach(line => {

    const el =
      document.getElementById(line.dispEl);

    if (el) {
      el.innerText =
        (parseInt(el.innerText) || 0) + line.qty;
    }

  });

}

function updateTotal() {

  total = Object.values(cart)
    .reduce(
      (sum, l) => sum + l.qty * l.price,
      0
    );

  document
    .getElementById(
      "total"
    ).innerText =
    formatRp(total);

}

function renderCartSummary() {

  const el =
    document.getElementById("cartSummary");

  if (!el) return;

  const keys = Object.keys(cart);

  if (keys.length === 0) {

    el.innerHTML =
      "<p style='opacity:.6'>Belum ada menu dipilih.</p>";

    return;

  }

  let html = "";
  let no = 1;

  keys.forEach(key => {

    const line = cart[key];

    if (line.qty <= 0) return;

    html += `
    <div class="cart-line">
      <div>
        <b>${no}. ${line.name}${variantLabel(line.opt, line.lvl)}</b><br>
        ${line.note ? `<small>Catatan: ${line.note}</small><br>` : ""}
        Rp ${formatRp(line.price)} / porsi
        <br>
        <small>Subtotal: Rp ${formatRp(line.qty * line.price)}</small>
      </div>
      <div class="qty">
        <button onclick="decrementLine('${key}')">-</button>
        <span>${line.qty}</span>
        <button onclick="incrementLine('${key}')">+</button>
        <button onclick="removeLine('${key}')">Hapus</button>
      </div>
    </div>
    `;

    no++;

  });

  el.innerHTML = html;

}

function sendWA() {

  const nama =
    document.getElementById("nama").value.trim();

  const tanggal =
    document.getElementById("tanggal").value.trim();

  const jam =
    document.getElementById("jam").value.trim();

  const eventName =
    document.getElementById("eventName").value.trim();

  const lokasi =
    document.getElementById("lokasi").value;

  const pax =
    document.getElementById("pax").value.trim();

  const requiredFields = [
    { value: nama, label: "Nama Customer" },
    { value: tanggal, label: "Tanggal" },
    { value: jam, label: "Jam" },
    { value: eventName, label: "Nama Event" },
    { value: lokasi, label: "Lokasi" },
    { value: pax, label: "Jumlah Pax" }
  ];

  const kosong = requiredFields.filter(
    f => !f.value
  );

  if (kosong.length > 0) {

    alert(
      "Mohon lengkapi data berikut:\n- " +
      kosong.map(f => f.label).join("\n- ")
    );

    return;

  }

  if (total === 0) {

    alert(
      "Keranjang kosong."
    );

    return;

  }

  let text =
`RESERVASI ZERO SIX SKY LOUNGE

Nama:
${document.getElementById("nama").value}

Tanggal:
${document.getElementById("tanggal").value}

Jam:
${document.getElementById("jam").value}

Event:
${document.getElementById("eventName").value}

Lokasi:
${document.getElementById("lokasi").value}

Pax:
${document.getElementById("pax").value}

DETAIL PESANAN

`;

  let no = 1;

  Object.values(cart).forEach(line => {

    if (line.qty <= 0) return;

    text +=
`${no}. ${line.name}${variantLabel(line.opt, line.lvl)}
x${line.qty}
= Rp ${formatRp(
line.qty * line.price
)}
`;

    if (line.note) {
      text +=
        `   • Catatan: ${line.note}\n`;
    }

    text += "\n";

    no++;

  });

  text += `
CATATAN TAMBAHAN:
${document.getElementById("note").value}

TOTAL:
Rp ${formatRp(total)}
`;

  window.open(
    "https://wa.me/6285175313330?text=" +
      encodeURIComponent(text),
    "_blank"
  );

}

document
  .getElementById(
    "search"
  )
  .addEventListener(
    "input",
    function () {

      const keyword =
        this.value
          .toLowerCase();

      document
        .querySelectorAll(
          ".menu-item"
        )
        .forEach(el => {

          el.style.display =
            el.innerText
              .toLowerCase()
              .includes(keyword)
              ? "block"
              : "none";

        });

    }
  );

loadMenu();
