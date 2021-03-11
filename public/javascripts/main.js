import * as utils from "./utils.js";
import { fadeIn } from "./utils.js";

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
      getImages()
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
  const authorCol = document.createElement("div");
  const author = document.createElement("div");
  const bio = document.createElement("div");
  const del_btn = document.createElement("div");
  const del_icon = document.createElement("svg");
  const block_top = document.createElement("div");
  const img = document.createElement("img");
  const comments = document.createElement("form");
  const comment_inputbox = document.createElement("input");
  const post_btn = document.createElement("button");
  const comment0 = document.createElement("div");
  const block = document.createElement("div");
  const user = await utils.getUser(users, image.username);

  // Set block top
  {
    profile_img.setAttribute("src", user.profile_photo);
    profile_img.setAttribute("width", "30px");
    profile_img.setAttribute("height", "30px");
    profile_img.classList.add("rounded-circle");

    author.innerHTML = image.username;
    author.style.fontWeight = "bold";
    bio.innerHTML = user.biography;
    bio.style.fontSize = "xx-small";
    authorCol.appendChild(author);
    authorCol.appendChild(bio);

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
    block_top.appendChild(authorCol);
    block_top.appendChild(del_btn);
  }

  // Set image
  img.setAttribute("src", image.url);
  img.setAttribute("alt", "user_photo");

  // Set comments
  {
    comments.setAttribute("id", "comments-form");
    comments.setAttribute("action", "/add-comment");
    comments.setAttribute("method", "POST");

    comment_inputbox.setAttribute("placeholder", "Add a comment...");
    comment_inputbox.setAttribute("type", "text");
    comment_inputbox.setAttribute("name", "comment");

    post_btn.innerText = "post";
    post_btn.setAttribute("type", "submit");

    comment0.setAttribute("id", "show_comments");

    //comment0.innerHTML = images.comments[0][0] + ": " + images.comments[0][1];
    image.comments.forEach(function (comment) {
      console.log(comment);
    });

    /*
    try {
      const c0 = image.comments[0];
      comment0.innerHTML = Object.keys(c0)[0] + ": " + Object.values(c0)[0];
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
      });
    */

    comments.appendChild(comment0);
    comments.appendChild(comment_inputbox);
    comments.appendChild(post_btn);
  }

  block.appendChild(block_top);
  block.appendChild(img);
  block.appendChild(comments);

  // Set classes
  profile_img.classList.add("d-inline-block", "align-self-center", "m-2");
  author.classList.add("align-self-center", "my-1");
  bio.classList.add("align-self-center", "my-1");
  authorCol.classList.add("d-inline-block", "m-2", "me-auto");
  del_btn.classList.add("d-inline-block", "align-self-center", "m-3");
  del_icon.classList.add("fas", "fa-times", "del-icon");

  block_top.classList.add("d-flex");
  img.classList.add("img-fluid");
  comment0.classList.add("align-self-center", "m-2");
  comments.classList.add("m-3");
  block.classList.add("block", "m-3", "bg-white", "border", "fade-in");
  return block;
}
// end of render block

// render the timeline on query results
// generate 2 blocks once
let block_counter = 0;
let flag;
const timeline = document.querySelector("#timeline");
async function renderTimeline(entries, observer) {
  flag = true;
  const fadeObserver = new IntersectionObserver(fadeIn, { threshold: 0.1 });
  for (let i = 0; i < 2; i++) {
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
      timeline.appendChild(new_block);
      fadeObserver.observe(new_block);
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
async function getImages() {
  let images;
  const resRaw = await fetch("/get-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!resRaw.ok) {
    const res = await resRaw.text();
    alert(res);
  } else {
    images = await resRaw.json();
  }
  return images;
}

// fetch comments
async function viewComment() {
  let comments;
  const resRaw = await fetch("/view-comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!resRaw.ok) {
    const res = await resRaw.text();
    alert(res);
  } else {
    images = await resRaw.json();
  }
  return comments;
}

// Log out
document.querySelector("#logout_link").addEventListener("click", utils.logout);

// Set upload window
const upload_button = document.querySelector("#upload_button");
upload_button.addEventListener("click", utils.callUploadWindow, { once: true });

// Preview
const upload = document.querySelector("#upload");
upload.addEventListener("change", utils.preview);

// Upload an image
const upload_image_form = document.querySelector("#upload_image_form");
upload_image_form.addEventListener("submit", utils.uploadImage);
