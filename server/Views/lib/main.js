const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const Employee = document.getElementById('EmployeeButton');
const Manager = document.getElementById('ManagerButton');

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

function selectRole(role) {
  // 'selected' 상태인 모든 버튼을 제거
  Employee.classList.remove('selected');
  Manager.classList.remove('selected');

  // 누른 버튼을 'selected' 상태로 추가
  document.getElementById(role + 'Button').classList.add('selected');
}

function signUp() {
  var storeName = document.querySelector('.sign-up-container input[placeholder="StoreName"]').value;
  var name = document.querySelector('.sign-up-container input[placeholder="Name"]').value;
  var id = document.querySelector('.sign-up-container input[placeholder="ID"]').value;
  var password = document.querySelector('.sign-up-container input[placeholder="Password"]').value;
  
  var selectedRoleButton = document.querySelector('.selected');
  var role = selectedRoleButton ? selectedRoleButton.textContent : null;

  if (!storeName || !name || !id || !password || !role) {
    alert('모든 빈칸을 채워주세요.');
  } else {
    $.ajax({
    type: 'POST', 
    url: '/register',
    async: false, // 동기
    data: {"ID": id, "password": password, "name": name, 
            "role": role, "storeName": storeName}, dataType: "json"
    }).done((result)=>{
      alert('등록 성공!\nName: ' + name + '\nID: ' + id + 
      '\nRole: ' + role + '\nStore name: ' + storeName);
      console.log(result);
      console.log(result.message);
    }).fail(()=>{
      alert('중복된 ID가 존재합니다.');
      console.log('ID already in use');
    })

  }
}

function login() {
  var id = document.querySelector('.sign-in-container input[placeholder="ID"]').value;
  var password = document.querySelector('.sign-in-container input[placeholder="Password"]').value;

  if (!id || !password) {
    alert('모든 빈칸을 채워주세요.');
  } else {
    $.ajax({
    type: 'POST', 
    url: '/login',
    async: false,
    data: {"ID": id, "password": password},
    success: function(response) {
      console.log(response.message);
      alert('로그인 성공!');
      // window.location.href = '/business';
    },
  })}
}