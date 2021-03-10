import * as utils from "./utils.js";

// On load
// 1. log in
// 2. fetch all users
// 3. fetch information of images
// 4. generate timeline by scrolling
let users, images;
utils.login().then(() => {
  utils
    .getAllUsers()
    .then((res) => {
      users = res;
    })
    .then(() => {
      fetchImages()
        .then((res) => {
          images = res;
        })
        .then(() => {
          let observer = new IntersectionObserver(renderTimeline);
          observer.observe(timeline);
        });
    });
});

// render a block on given image information
// image
// - image_name
// - username
// - url
// - number_liked
// - comments[]
async function renderBlock(image) {
  const profile_img = document.createElement("img");
  const author = document.createElement("div");
  const del_btn = document.createElement("div");
  const del_icon = document.createElement("svg");
  const block_top = document.createElement("div");
  const img = document.createElement("img");
  const comments = document.createElement("form");
  const comment_inputbox = document.createElement("input");
  const post_btn = document.createElement("button");
  const comment0 = document.createElement("div");
  const comment1 = document.createElement("div");
  const block = document.createElement("div");
  const user = await utils.getUser(users, image.username);
  profile_img.setAttribute("src", user.profile_photo);
  profile_img.setAttribute("width", "20px");
  profile_img.setAttribute("height", "20px");
  profile_img.classList.add("rounded-circle");

  author.innerHTML = image.username;
  del_btn.addEventListener("click", async () => {
    try {
      const resRaw = await fetch("/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: image.url }),
      });
      if (!resRaw.ok) {
        const res = await resRaw.text();
        alert(res);
      } else {
        document.querySelector("#timeline").removeChild(block);
      }
    } catch (e) {
      console.log("Err ", e);
    }
  });
  del_btn.appendChild(del_icon);
  block_top.appendChild(profile_img);
  block_top.appendChild(author);
  block_top.appendChild(del_btn);

  img.setAttribute("src", image.url);
  img.setAttribute("alt", "user_photo");

  comment_inputbox.setAttribute("placeholder", "Add a comment...");
  comment_inputbox.setAttribute("type", "text");
  comment_inputbox.setAttribute("name", "comment");

  post_btn.innerText = "post";
  post_btn.setAttribute("type", "submit");

  try {
    const c0 = image.comments[0];
    const c1 = image.comments[1];
    comment0.innerText = Object.keys(c0)[0] + ": " + Object.values(c0)[0];
    comment1.innerText = Object.keys(c1)[0] + ": " + Object.values(c1)[0];
  } catch (err) {
    console.log("Comments not found", err);
  }
  comments.addEventListener("submit", async (event) => {
    event.preventDefault();
    const c = comment_inputbox.value;
    if (c === "") {
      alert("Comment cannot be empty");
      return;
    }
    comments.reset();
    const new_comment = document.createElement("div");
    // const profile_photo_url = getUser(document.cookie.username).profile_photo;
    // new_comment.innerHTML = document.cookie.username + ": " + c;
    new_comment.innerHTML = c;
    new_comment.classList.add("align-self", "m-2");
    comments.insertBefore(new_comment, comments[0]);

    //TODO
    const resRaw = await fetch("/add-comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: c, image_name: image.image_name }),
    });
    if (!resRaw.ok) {
      const res = await resRaw.text();
      alert(res);
    }
  });

  comments.appendChild(comment0);
  comments.appendChild(comment1);
  comments.appendChild(comment_inputbox);
  comments.appendChild(post_btn);

  block.appendChild(block_top);
  block.appendChild(img);
  block.appendChild(comments);

  profile_img.classList.add("d-inline-block", "align-self-center", "m-2");
  author.classList.add("d-inline-block", "align-self-center", "m-2", "me-auto");
  del_btn.classList.add("d-inline-block", "align-self-center", "m-2");
  del_icon.classList.add("fas", "fa-times", "fas-2x");
  block_top.classList.add("d-flex");
  img.classList.add("img-fluid");
  comment0.classList.add("align-self-center", "m-2");
  comment1.classList.add("align-self-center", "m-2");
  block.classList.add(
    "block",
    "m-3",
    "border",
    "border-1",
    "border-secondary",
    "bg-light"
  );
  return block;
}
// end of render block

// render the timeline on query results
// generate 3 blocks once
let block_counter = 0;
let flag;
const timeline = document.querySelector("#timeline");
async function renderTimeline(entries, observer) {
  flag = true;
  for (let i = 0; i < 3; i++) {
    if (block_counter === images.length) {
      const prompt = document.createElement("div");
      const endLine = document.createElement("hr");

      prompt.innerHTML = "You have reached the Mariana Trench";
      prompt.classList.add("mt-5", "mb-2", "text-center");
      endLine.classList.add("mb-5");
      timeline.appendChild(prompt);
      timeline.appendChild(endLine);

      observer.disconnect();
      break;
    }
    if (entries.length !== 0 && entries[0].isIntersecting) {
      const image = images[block_counter];
      const new_block = await renderBlock(image);
      await timeline.appendChild(new_block);
      if (flag) {
        observer.disconnect();
        observer.observe(new_block);
        flag = false;
      }
      block_counter++;
    }
  }
}

// fetch images
async function fetchImages() {
  let images;
  const resRaw = await fetch("/images");
  if (!resRaw.ok) {
    const res = await resRaw.text();
    alert(res);
  } else {
    images = await resRaw.json();
  }
  return images;
}

// Log out
document.querySelector("#logout_link").addEventListener("click", utils.logout);

// Call upload window
const shade = document.querySelector("#shade");
const upload_button = document.querySelector("#upload_button");
const upload_window = document.querySelector("#upload_window");

function callUploadWindow() {
  upload_window.classList.remove("d-none");
  shade.classList.remove("d-none");
  shade.addEventListener("click", hideUploadWindow, { once: true });
}

function hideUploadWindow() {
  upload_window.classList.add("d-none");
  shade.classList.add("d-none");
  upload_button.addEventListener("click", callUploadWindow, { once: true });
}

upload_button.addEventListener("click", callUploadWindow, { once: true });

// Thumbnail
const upload_image_form = document.querySelector("#upload_image_form");
const upload_image = document.querySelector("#upload_image");
const upload = document.querySelector("#upload");
upload.addEventListener("change", () => {
  const oFReader = new FileReader();
  oFReader.readAsDataURL(upload.files[0]);
  oFReader.onload = function (oFREvent) {
    upload_image.src = oFREvent.target.result;
  };
  upload_image.classList.remove("d-none");
});

// Upload an image
upload_image_form.addEventListener("submit", async (event) => {
  event.preventDefault();
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
});
