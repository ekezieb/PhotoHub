// Update profile photo
const update_profile_photo = document.querySelector("#update_profile_photo");
update_profile_photo.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(update_profile_photo);
    const resRaw = await fetch("/update-profile-photo", {
      method: "PUT",
      body: formData,
    });
    console.log("update_profile_photo", resRaw);
    if (!resRaw.ok) {
      const res = await resRaw.text();
      alert(res);
    }
    location.reload();
  } catch (e) {
    console.log("Err", e);
  }
});

// Update biography
const update_bio_form = document.querySelector("#update_bio");
update_bio_form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const bio = update_bio_form[0].value;
  try {
    const resRaw = await fetch("/update-bio", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ biography: bio }),
    });
    console.log("update_bio", resRaw);
    if (!resRaw.ok) {
      const res = await resRaw.text();
      alert(res);
    }
    location.reload();
  } catch (err) {
    console.log("Err", err);
  }
});

window.addEventListener("load", login);
async function login() {
  const user = await getUser(getCookie("username"));
  if (user !== undefined) {
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

let users;
async function getUser(username) {
  if (users === undefined) {
    try {
      const usersRaw = await fetch("/get-all-users");
      if (!usersRaw.ok) {
        const res = await usersRaw.text();
        alert(res);
      } else {
        users = await usersRaw.json();
        users = await Object.values(users);
      }
    } catch (err) {
      console.log("Err", err);
    }
  }
  for (let user of users) {
    if (user.username === username) {
      return user;
    }
  }
  return undefined;
}

function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}
