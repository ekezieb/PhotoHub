async function getAllUsers() {
  try {
    const usersRaw = await fetch("/get-all-users");
    if (!usersRaw.ok) {
      const res = await usersRaw.text();
      alert(res);
    } else {
      let users = await usersRaw.json();
      return await Object.values(users);
    }
  } catch (err) {
    console.log("Err", err);
  }
}

async function getUser(users, username) {
  if (users === undefined) {
    users = await getAllUsers();
  }
  for (let user of users) {
    if (user.username === username) {
      return user;
    }
  }
  return undefined;
}

// Log in
// User
// - username
// - password
// - description
// - profile_photo
async function login() {
  const userRaw = await fetch("/get-user");
  if (userRaw.ok) {
    const user = await userRaw.json();
    const name = document.querySelector("#username");
    const des = document.querySelector("#bio");
    const img = document.querySelector("#profile_photo");
    const imgL = document.querySelector("#profile_photo_large");
    img.setAttribute("src", user.profile_photo);
    imgL.setAttribute("src", user.profile_photo);
    name.innerHTML = user.username;
    des.innerHTML = user.biography;
    document.querySelector("#logout_link").classList.remove("d-none");
    document.querySelector("#login_link").classList.add("d-none");
    document.querySelectorAll(".a_log").forEach((value) => {
      value.setAttribute("href", "home.html");
    });
  }
}

async function logout() {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.querySelector("#logout_link").classList.add("d-none");
  document.querySelector("#login_link").classList.remove("d-none");
  document.querySelectorAll(".a_log").forEach((value) => {
    value.setAttribute("href", "login.html");
  });
  const resRaw = await fetch("/logout");
  if (!resRaw.ok) {
    const res = await resRaw.text();
    alert(res);
  }
}

function callUploadWindow() {
  const shade = document.querySelector("#shade");
  const upload_window = document.querySelector("#upload_window");
  upload_window.classList.remove("d-none");
  shade.classList.remove("d-none");
  upload_window.classList.add("d-block");
  shade.classList.add("d-block");
  shade.addEventListener("click", hideUploadWindow, { once: true });
}

function hideUploadWindow() {
  const upload_button = document.querySelector("#upload_button");
  const upload_window = document.querySelector("#upload_window");
  const shade = document.querySelector("#shade");
  upload_window.classList.remove("d-block");
  shade.classList.remove("d-block");
  upload_window.classList.add("d-none");
  shade.classList.add("d-none");
  upload_button.addEventListener("click", callUploadWindow, { once: true });
}

function preview() {
  const upload = document.querySelector("#upload");
  const upload_image = document.querySelector("#upload_image");
  const oFReader = new FileReader();
  if (upload.files[0]) {
    oFReader.readAsDataURL(upload.files[0]);
    oFReader.onload = function (oFREvent) {
      upload_image.src = oFREvent.target.result;
    };
    upload_image.classList.remove("d-none");
    upload_image.classList.add("d-block");
  }
}

async function uploadImage(event) {
  event.preventDefault();
  const upload_image_form = document.querySelector("#upload_image_form");
  try {
    const formData = new FormData(upload_image_form);
    const resRaw = await fetch("/upload-image", {
      method: "POST",
      body: formData,
    });
    if (!resRaw.ok) {
      const res = await resRaw.text();
      alert(res);
    }
    location.reload();
  } catch (err) {
    console.log("Err", err);
  }
}

function fadeIn(entries, observer) {
  entries.forEach((entry) => {
    if (entry && entry.isIntersecting) {
      entry.target.classList.add("active");
      observer.unobserve(entry.target);
    }
  });
}

export {
  getAllUsers,
  getUser,
  login,
  logout,
  callUploadWindow,
  preview,
  uploadImage,
  fadeIn,
};