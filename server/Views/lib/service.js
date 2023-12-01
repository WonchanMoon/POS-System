'use strict';

// 시간 표시 함수
function showTime() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1; // JavaScript에서 월은 0부터 시작합니다.
  var day = date.getDate();
  var week = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]; // 요일을 배열에서 가져옵니다.
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hour >= 12 ? '오후' : '오전';
  hour = hour % 12;
  hour = hour ? hour : 12; // 0시는 12시로 표시합니다.
  minutes = minutes < 10 ? '0' + minutes : minutes;

  var strTime1 = `${year}.${month}.${day} [${week}] ${ampm} ${hour}:${minutes}`;
  var strTime2 = `${year}-${month}-${day} (${week})`;
  document.getElementById('big-time').innerHTML = strTime1;
  document.getElementById('small-time').innerHTML = strTime2;
}

setInterval(showTime, 1000);

// 테이블
// 상품을 테이블에 추가하는 함수
function addProduct(name, price, quantity, discount) {
  var table = document.getElementById('productTable');
  var productExists = false;

  // 테이블에서 동일한 상품 찾기
  for (var i = 1; i < table.rows.length; i++) {
    var productName = table.rows[i].cells[1].innerHTML;
    if (productName === name) {
      // 동일한 상품이 이미 테이블에 있을 경우, 수량만 증가
      var quantityCell = table.rows[i].cells[3];
      var currentQuantity = parseInt(quantityCell.innerHTML);
      quantityCell.innerHTML = currentQuantity + quantity;
      var cell6 = table.rows[i].cells[5]; // 금액 셀
      cell6.innerHTML = calculateAmount(
        price,
        currentQuantity + quantity,
        discount
      );
      productExists = true;
      break;
    }
  }

  // 테이블에 상품이 없을 경우, 새로 추가
  if (!productExists) {
    var row = table.insertRow(-1);
    row.insertCell(0); // No.
    row.insertCell(1).innerHTML = name; // 상품명
    row.insertCell(2).innerHTML = price; // 단가
    row.insertCell(3).innerHTML = quantity; // 수량
    row.insertCell(4).innerHTML = discount ? discount + '%' : ''; // 할인
    row.insertCell(5).innerHTML = calculateAmount(price, quantity, discount); // 금액

    row.onclick = onRowClick; // 클릭 이벤트 리스너 추가
    updateNumbers(); // 번호 업데이트
  }
}

// 금액을 계산하는 함수
function calculateAmount(price, quantity, discount) {
  var amount = price * quantity;
  if (discount) {
    amount -= amount * (discount / 100);
  }
  return amount;
}

// 번호를 업데이트하는 함수
function updateNumbers() {
  var table = document.getElementById('productTable');
  for (var i = 1; i < table.rows.length; i++) {
    table.rows[i].cells[0].innerHTML = i; // 행 번호 설정
  }
}

// 상품 제거 함수 (행 번호를 기반으로)
function removeProduct(rowNumber) {
  document.getElementById('productTable').deleteRow(rowNumber);
  updateNumbers(); // 번호 업데이트
}

// 행 클릭 이벤트 핸들러
function onRowClick(event) {
  var row = event.currentTarget;
  var table = document.getElementById('productTable');

  // 모든 행의 선택 상태 제거
  for (var i = 1; i < table.rows.length; i++) {
    table.rows[i].classList.remove('selected');
  }

  // 현재 행에 'selected' 클래스 추가
  row.classList.add('selected');
}

// 클릭 이벤트 리스너를 모든 행에 추가하는 함수
function addClickEventToRows() {
  var rows = document.getElementById('productTable').getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
    rows[i].onclick = onRowClick;
  }
}

// 예시를 위한 상품 추가
function loadExampleProducts() {
  addProduct('상품 A', 1000, 2, 10);
}
// SUMMARY
function updateAmounts() {
  var totalAmount = 0;
  var discountAmount = 0;
  var table = document.getElementById('productTable');

  for (var i = 1; i < table.rows.length; i++) {
    var price = parseInt(table.rows[i].cells[2].innerHTML);
    var quantity = parseInt(table.rows[i].cells[3].innerHTML);
    var discount = table.rows[i].cells[4].innerHTML;

    var productAmount = price * quantity;
    totalAmount += productAmount;

    if (discount) {
      var discountValue = parseFloat(discount.replace('%', ''));
      discountAmount += productAmount * (discountValue / 100);
    }
  }

  var dueAmount = totalAmount - discountAmount;

  document.getElementById('totalAmount').innerText = totalAmount;
  document.getElementById('discountAmount').innerText = discountAmount;
  document.getElementById('dueAmount').innerText = dueAmount;
}
// 거스름돈
function calculateChange() {
  var receivedAmount = parseInt(
    document.getElementById('receivedAmount').innerText
  );
  var dueAmount = parseInt(document.getElementById('dueAmount').innerText);
  var changeAmount = receivedAmount - dueAmount;
  document.getElementById('changeAmount').innerText = changeAmount;
}

// 전체 목록 제거
function removeAllProducts() {
  var table = document.getElementById('productTable');
  var rowCount = table.rows.length;
  for (var i = rowCount - 1; i > 0; i--) {
    table.deleteRow(i);
  }
  updateAmounts();
  updateNumbers();
}

// 선택한 목록 제거
function removeSelectedProduct() {
  var table = document.getElementById('productTable');
  for (var i = 1; i < table.rows.length; i++) {
    if (table.rows[i].classList.contains('selected')) {
      table.deleteRow(i);
      break; // 한 번에 하나의 행만 제거
    }
  }
  updateAmounts();
  updateNumbers();
}

// 금액을 변경하고 금액을 업데이트하는 함수
function updateProductAmount(row) {
  var price = parseInt(row.cells[2].innerHTML); // 단가
  var quantity = parseInt(row.cells[3].innerHTML); // 수량
  var discountCell = row.cells[4].innerHTML; // 할인
  var discount = discountCell ? parseFloat(discountCell.replace('%', '')) : 0;

  var newAmount = calculateAmount(price, quantity, discount); // 새 금액 계산
  row.cells[5].innerHTML = newAmount; // 금액 업데이트

  updateAmounts(); // 총 금액 업데이트
}

// 수량 늘리기
function increaseQuantity() {
  var table = document.getElementById('productTable');
  for (var i = 1; i < table.rows.length; i++) {
    if (table.rows[i].classList.contains('selected')) {
      var quantityCell = table.rows[i].cells[3];
      var quantity = parseInt(quantityCell.innerHTML) + 1;
      quantityCell.innerHTML = quantity;

      updateProductAmount(table.rows[i]);
      break;
    }
  }
}

// 수량 줄이기
function decreaseQuantity() {
  var table = document.getElementById('productTable');
  for (var i = 1; i < table.rows.length; i++) {
    if (table.rows[i].classList.contains('selected')) {
      var quantityCell = table.rows[i].cells[3];
      var quantity = parseInt(quantityCell.innerHTML);
      if (quantity > 1) {
        quantityCell.innerHTML = quantity - 1;
        updateProductAmount(table.rows[i]);
      }
      break;
    }
  }
}

// 상단 상품 선택
function selectPreviousProduct() {
  var table = document.getElementById('productTable');
  for (var i = 1; i < table.rows.length; i++) {
    if (table.rows[i].classList.contains('selected') && i > 1) {
      table.rows[i].classList.remove('selected');
      table.rows[i - 1].classList.add('selected');
      break;
    }
  }
}

// 하단 상품 선택
function selectNextProduct() {
  var table = document.getElementById('productTable');
  for (var i = 1; i < table.rows.length - 1; i++) {
    if (table.rows[i].classList.contains('selected')) {
      table.rows[i].classList.remove('selected');
      table.rows[i + 1].classList.add('selected');
      break;
    }
  }
}

// 숫자 버튼을 눌렀을 때
function pressKey(key) {
  var display = document.querySelector('.number_display');
  var currentDisplay = display.innerText;
  // '00'을 눌렀고, 현재 디스플레이가 '0'이거나 비어있는 경우에는 아무것도 추가하지 않음
  if (key === '00' && (currentDisplay === '0' || currentDisplay === '')) {
    return;
  }
  if (currentDisplay === '0') {
    // 현재 디스플레이가 '0'이면, 새로운 숫자로 대체
    display.innerText = key;
  } else {
    // 그렇지 않으면 숫자 추가
    display.innerText += key;
  }
}

// 받은 금액을 입력
function enterReceivedAmount() {
  var display = document.querySelector('.number_display');
  var receivedAmount = parseInt(display.innerText);
  document.getElementById('receivedAmount').innerText = receivedAmount;
  calculateChange(); // 거스름돈 계산
  display.innerText = ''; // 숫자 디스플레이 초기화
}

// 마지막 숫자 삭제
function deleteLastDigit() {
  var display = document.querySelector('.number_display');
  display.innerText = display.innerText.slice(0, -1);
}

// 입력 초기화
function clearReceivedAmount() {
  document.querySelector('.number_display').innerText = '';
}

// 상품을 로드하고 표시하는 함수
function loadProducts() {
  var products = [];
  $.ajax({
    type: 'GET',
    url: '/products',
    data: {},
    dataType: 'json',
  }).done((result1) => {
    for (let i = 0; i < result1.length; i++) {
      $.ajax({
        type: 'GET',
        url: '/discount/name/' + result1[i].name,
        data: {},
        dataType: 'json',
        success: function (result2) {
          result1[i].discount = result2.discount;
        },
        error: function (error) {
          console.error(
            'Error fetching discount for',
            result1[i].name,
            ':',
            error
          );
        },
      });
    }

    setTimeout(function () {
      products = result1;
      var productCatalog = document.querySelector('.product-catalog');
      products.forEach(function (product) {
        var productButton = document.createElement('button');
        productButton.className = 'product-item';
        productButton.innerHTML =
          product.name +
          '<br>' +
          product.price +
          '원<br>' +
          (Number(product.discount) > 0
            ? '할인율: ' + product.discount + '%'
            : '할인 없음');

        productButton.onclick = function () {
          addProduct(product.name, product.price, 1, product.discount);
          updateAmounts();
        };
        productCatalog.appendChild(productButton);
      });
    }, 1000);
  });
}

// 결제 요청보내기
function sendPaymentData() {
  var table = document.getElementById('productTable');
  var data = [];

  // 테이블의 각 행을 순회
  for (var i = 1; i < table.rows.length; i++) {
    var row = table.rows[i];
    var name = row.cells[1].innerHTML; // 상품명
    var price = parseInt(row.cells[5].innerHTML); // 금액
    var counts = parseInt(row.cells[3].innerHTML); // 수량

    data.push({ name: name, price: price, counts: counts });
  }

  console.log(data);
  $.ajax({
    url: '/salesList',
    type: 'POST',
    contentType: 'application/json',
    data: data,
    success: function (response) {
      console.log('Payment successful:', response);
    },
    error: function (error) {
      console.error('Payment failed:', error);
    },
  });

  removeAllProducts();
}

window.onload = function () {
  loadProducts();
  addClickEventToRows();
  updateAmounts();
};
