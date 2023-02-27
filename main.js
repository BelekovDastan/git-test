const API = "http://localhost:8000/products";
console.log("Dosy");
// ? переменные для инпутов: добавление товаров

let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let image = document.querySelector("#image");

let btnAdd = document.querySelector("#btn-add");

// ? переменные для инпутов: редактирование товаров

let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImage = document.querySelector("#edit-image");

let editSaveBtn = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");

// console.log(title, price, descr, image, btnAdd); ПРОВЕРКА НА ТО ЧТО ВЫТАЩИЛИ НУЖНЫЕ ОБЪЕКТЫ
// ? БЛОК, Куда добавляются карточки

let list = document.querySelector("#product-list");

// ? PAGINATION

let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
let currentPage = 1;
let pageTotalCount = 1;

// console.log(paginationList, prev, next);

// ? search

let searchInp = document.querySelector("#search");
let searchVal = "";

btnAdd.addEventListener("click", async (e) => {
  // * ФОРМИРУЕМ ОБЪЕКТ С ДАННЫМИ ИЗ ИНПУТА

  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };
  //   console.log(obj); // ПРОВЕРКА НА СОДЕРЖИМОЕ ИНПУТА

  // * ПРОВЕРКА НА ЗАПОЛНЕННОСТЬ

  if (
    !obj.title.trim() ||
    !obj.price.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  // * ОТПРАВЛЯЕМ POST ЗАПРОС
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });

  // ! Отработает после того как сработает запрос (сверху) - очищает инпуты
  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = "";

  render();
});

// ? ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ КАРТОЧЕК ПРОДУКТА

async function render() {
  let res = await fetch(`${API}?q=${searchVal}&_page=${currentPage}&_limit=3`);
  let products = await res.json();
  // console.log(products);

  drawPaginationButtons();

  list.innerHTML = "";
  products.forEach((element) => {
    let newElem = document.createElement("div");
    newElem.id = element.id;

    newElem.innerHTML = `
    <div class="card m-5" style="width: 18rem; text-align: center; background-color: silver; color: white">
  <img src="${element.image}" class="card-img-top" style="width: 260px; height: 300px;margin: auto; margin-top: 10px; padding: 5px; border: white 2px solid; box-shadow: 8px 15px 15px black" alt="...">
  <div class="card-body">
    <h5 class="card-title">${element.title}</h5>
    <p class="card-text">${element.descr}</p>
    <p class="card-text">${element.price}</p>
    <a href="#" id=${element.id} class="btn btn-danger btn-delete">DELETE</a>
    <a href="#" id=${element.id} class="btn btn-warning btn-edit" data-bs-toggle="modal" data-bs-target="#exampleModal">EDIT</a>
  </div>
</div>
    `;
    list.append(newElem);
    // console.log(newElem);
  });
}

render();

// ? УДАЛЕНИЕ ПРОДУКТА

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    console.log("delete clicked");
    let id = e.target.id;
    fetch(`${API}/${id}`, { method: "DELETE" }).then(() => render());
  }

  // // ALTERNATE
  // вешаем слушатель событий на весь документ
  // document.addEventListener("click",async (e) => {
  // делаем проверку, для того, чтобы отловить клик именно по элементу с классом // * btn-delete //
  //   if (e.target.classList.contains("btn-delete")) {
  // вытаскиваем id
  //     console.log("delete clicked");
  // делаем запрос на удаление
  //     let id = e.target.id;
  //     await fetch(`${API}/${id}`, { method: "DELETE" })
  //  делаем запрос
  //     render();
  //   }
});

// редактирование продукта

// Отлавливаем клик по кнопке edit
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    // вытаскиваем id
    let id = e.target.id;

    // получаем данные редактируемого продукта
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // заполняем инпуты модального окна, данными, которые стянули с сервера
        editTitle.value = data.title;
        editPrice.value = data.price;
        editDescr.value = data.descr;
        editImage.value = data.image;

        // задаём id кнопке save changes
        editSaveBtn.setAttribute("id", data.id);
      });
  }
});

// ФУНКЦИЯ для отправки отредактированных данных на сервер

editSaveBtn.addEventListener("click", function () {
  let id = this.id;
  // console.log(id); // ПРОВЕРЯЕМ ПО АЙДИ НА КНОПКЕ SAVEBTN

  // вытаскиваем данные из инпутов модального окна
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;
  let image = editImage.value;

  // проверка на заполненность
  if (!title.trim() || !descr.trim() || !price.trim() || !image.trim()) {
    alert("Заполните поле");
    return;
  }

  // формируем объект на основе данных из инпута
  let editedProduct = {
    title: title,
    price: price,
    descr: descr,
    image: image,
  };

  // console.log(editedProduct);

  // вызываем функцию для сохранения на сервере
  saveEdit(editedProduct, id);
});

// Функция для сохранения на сервере
function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(editedProduct),
  }).then(() => render());

  // закрываем модальное окно после клика на кнопку Save
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

// PAGINATION

// * функция для отрисовки кнопок НАВИГАЦИИ

function drawPaginationButtons() {
  // * отправляем запрос для получения общего кол-ва продуктов
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      // рассчитываем общее кол-во страниц
      pageTotalCount = Math.ceil(data.length / 3);
      console.log(pageTotalCount);

      paginationList.innerHTML = ""; // очищаем (чтобы не было дублирования)
      // * создаём кнопки с цифрами и для текущей страницы задаём класс active
      for (let i = 1; i <= pageTotalCount; i++) {
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = `
          <li class="page-item active"><a class="page-link page_number" href="#">${i}</a></li>`;
          paginationList.append(page1);
        } else {
          let page1 = document.createElement("li");
          page1.innerHTML = `
            <li class="page-item"><a class="page-link page_number" href="#">${i}</a></li>`;
          paginationList.append(page1);
        }
      }

      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}

// * слушатель событий для кнопки prev
prev.addEventListener("click", () => {
  // делаем проверку, на то не находимся ли мы на первой странице
  if (currentPage <= 1) {
    return;
  }

  // если не находимся на первой странице, то перезаписываем currentPage и вызываем render
  currentPage--;
  render();
});

next.addEventListener("click", () => {
  // делаем проверку, на то не находимся ли мы на последней странице
  if (currentPage >= pageTotalCount) {
    return;
  }

  // если не находимся на последней странице, то перезаписываем currentPage и вызываем render
  currentPage++;
  render();
});

document.addEventListener("click", function (e) {
  // * отлавливаем клик по цифре из пагинации
  if (e.target.classList.contains("page_number")) {
    // console.log("pagination number clicked");

    // * перезаписываем currentPage на то значение, которое содержит элемент, на который нажали
    currentPage = e.target.innerText;

    // вызываем render с перезаписыванием currentPage
    render();
  }
});

// SEARCH

searchInp.addEventListener("input", () => {
  searchVal = searchInp.value;
  render();
});
