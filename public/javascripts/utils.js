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

export { getAllUsers, getUser, login, logout };
