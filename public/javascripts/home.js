import * as utils from "./utils.js";

// On load
// 1. log in
// 2. fetch information of images
// 3. generate image gallery
let images;
utils.login().then(() => {
  getMyImages()
    .then((res) => {
      images = res;
    })
    .then(() => {
      renderGallery().catch(console.log);
    });
});

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

// fetch the images for the homepage
async function getMyImages() {
  let images;
  const resRaw = await fetch("/get-my-images");
  if (!resRaw.ok) {
    const res = await resRaw.text();
    alert(res);
  } else {
    images = await resRaw.json();
  }
  return images;
}

// render a block of the gallery
async function renderBlock(image) {
  const img = document.createElement("div");
  const block = document.createElement("div");

  // A tricky way to make a square photo
  img.style.backgroundImage = `url(${image.url})`;
  img.style.paddingTop = "100%";
  img.style.backgroundSize = "cover";
  block.style.padding = "3%";

  block.appendChild(img);

  block.classList.add("col-lg-4");

  return block;
}

// render image gallery
async function renderGallery() {
  const gallery = document.querySelector("#gallery");
  for (let image of images) {
    const new_block = await renderBlock(image);
    await gallery.appendChild(new_block);
  }
}

function callUpdateProfileWindow() {
  const shade = document.querySelector("#shade");
  const update_profile_window = document.querySelector(
    "#update_profile_window"
  );
  update_profile_window.classList.remove("d-none");
  shade.classList.remove("d-none");
  shade.addEventListener("click", hideUpdateProfileWindow, { once: true });
}

function hideUpdateProfileWindow() {
  const update_profile_button = document.querySelector("#profile_photo_large");
  const update_profile_window = document.querySelector(
    "#update_profile_window"
  );
  const shade = document.querySelector("#shade");
  update_profile_window.classList.add("d-none");
  shade.classList.add("d-none");
  update_profile_button.addEventListener("click", callUpdateProfileWindow, {
    once: true,
  });
}

// Log out
document.querySelector("#logout_link").addEventListener("click", () => {
  utils.logout().then(() => {
    location.replace("/");
  });
});

// Set update profile window
const update_profile_button = document.querySelector("#profile_photo_large");
update_profile_button.addEventListener("click", callUpdateProfileWindow, {
  once: true,
});

// Set upload window
const upload_button = document.querySelector("#upload_button");
upload_button.addEventListener("click", utils.callUploadWindow, { once: true });

// Preview
const upload = document.querySelector("#upload");
upload.addEventListener("change", utils.preview);

// Upload an image
const upload_image_form = document.querySelector("#upload_image_form");
upload_image_form.addEventListener("submit", utils.uploadImage);
