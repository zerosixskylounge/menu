const API_URL =
"https://script.google.com/macros/s/AKfycbyvFEyFyDlH4luPIyLzm1rlSQaCdJXXppWswJOSwob430dIloOftSBtZbPs-hckRp1W/exec";

let data = {};
let cart = {};
let total = 0;

async function loadMenu() {

  const res = await fetch(API_URL);
  const json = await res.json();

  data = json.data;

  render();

}

function formatRp(v) {

  return Number(v).toLocaleString("id-ID");

}

function toggle(id) {

  const panel =
    document.getElementById(id);

  panel.style.display =
    panel.style.display === "block"
      ? "none"
      : "block";

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

        html += `
        <div class="menu-item">

          <div class="menu-top">

            <div>
              <b>${item}</b>
              <br>
              Rp ${formatRp(price)}
            </div>

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

          </div>
        `;

        if (
          obj.options &&
          obj.options.length
        ) {

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
          `;

        }

        if (
          obj.levels &&
          obj.levels.length
        ) {

          html += `
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
          `;

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

function addItem(
  name,
  id,
  price
) {

  if (!cart[id]) {

    cart[id] = {
      name: name,
      qty: 0,
      price: price
    };

  }

  cart[id].qty++;

  total += price;

  document
    .getElementById(
      "q_" + id
    ).innerText =
    cart[id].qty;

  updateTotal();

}

function removeItem(
  id,
  price
) {

  if (
    cart[id] &&
    cart[id].qty > 0
  ) {

    cart[id].qty--;

    total -= price;

    document
      .getElementById(
        "q_" + id
      ).innerText =
      cart[id].qty;

    updateTotal();

  }

}

function updateTotal() {

  document
    .getElementById(
      "total"
    ).innerText =
    formatRp(total);

}

function sendWA() {

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

  for (const id in cart) {

    const item = cart[id];

    if (item.qty > 0) {

      text +=
`${no}. ${item.name}
x${item.qty}
= Rp ${formatRp(
item.qty * item.price
)}
`;

      const opt =
        document
        .getElementById(
          `opt_${id}`
        )?.value;

      const lvl =
        document
        .getElementById(
          `lvl_${id}`
        )?.value;

      const note =
        document
        .getElementById(
          `note_${id}`
        )?.value;

      if (opt) {
        text +=
          `   • ${opt}\n`;
      }

      if (lvl) {
        text +=
          `   • Level ${lvl}\n`;
      }

      if (note) {
        text +=
          `   • Catatan: ${note}\n`;
      }

      text += "\n";

      no++;

    }

  }

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
