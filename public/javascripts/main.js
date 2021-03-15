import * as utils from "./utils.js";

// On load
// 1. log in
// 2. fetch all users
// 3. fetch information of images
// 4. generate timeline by scrolling
let users, images, observer;
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
          observer = new IntersectionObserver(renderTimeline);
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
  const comments = document.createElement("div");
  const comment_form = document.createElement("form");
  const comment_input_box = document.createElement("input");
  const post_btn = document.createElement("button");
  const block = document.createElement("div");
  const user = await utils.getUser(users, image.username);

  // Set block top
  {
    profile_img.setAttribute("src", user.profile_photo);
    profile_img.setAttribute("width", "30px");
    profile_img.setAttribute("height", "30px");
    profile_img.classList.add("rounded-circle");

    author.innerHTML = image.username;
    author.setAttribute("id", "author");
    //author.style.fontWeight = "bold";
    bio.innerHTML = user.biography;
    bio.setAttribute("id", "bio_content");
    //bio.style.fontSize = "xx-small";
    authorCol.appendChild(author);
    authorCol.appendChild(bio);

    // if this image belongs to the user
    if (image.username === utils.getCookie("username")) {
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
    }

    block_top.appendChild(profile_img);
    block_top.appendChild(authorCol);
    block_top.appendChild(del_btn);
  }

  // Set image
  img.setAttribute("src", image.url);
  img.setAttribute("alt", "user_photo");
  // Set comments
  {
    // display existing comments
    if (image.comments !== undefined) {
      comments.classList.remove("d-none");
      for (let comment of image.comments) {
        const new_comment = document.createElement("div");
        const name = document.createElement("div");
        const body = document.createElement("div");
        name.innerHTML = comment.username + ":";
        body.innerHTML = comment.comment_body;
        new_comment.appendChild(name);
        new_comment.appendChild(body);

        name.setAttribute("id", "name_in_comments");
        new_comment.classList.add(
          "d-flex",
          "m-2",
          "align-self-center",
          "position-relative"
        );
        body.classList.add("align-self-center");
        body.setAttribute("id", "text_in_comments");
        name.classList.add("me-2", "align-self-center");
        if (utils.getCookie("username") === comment.username) {
          body.style.cursor = "pointer";
          utils.addDeleteCommentBtn(new_comment);
        }
        comments.appendChild(new_comment);
      }
    } else {
      // hide the comments
      comments.classList.add("d-none");
    }

    // set comment form
    {
      // post a new comment
      comment_form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const comment_body = comment_input_box.value;
        if (comment_body === "") {
          alert("Comment cannot be empty");
          return;
        }
        comment_form.reset();
        const resRaw = await fetch("/add-comment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: comment_body,
            image_name: image.image_name,
          }),
        });
        const res = await resRaw.text();
        if (!resRaw.ok) {
          alert(res);
        } else {
          const name = document.createElement("div");
          const body = document.createElement("div");
          const new_comment = document.createElement("div");
          name.innerHTML = res + ":";
          body.innerHTML = comment_body;
          new_comment.appendChild(name);
          new_comment.appendChild(body);
          name.style.fontWeight = "bold";
          body.style.cursor = "pointer";
          new_comment.classList.add(
            "d-flex",
            "m-2",
            "align-self-center",
            "position-relative"
          );
          body.classList.add("align-self-center");
          name.classList.add("me-2", "align-self-center");
          utils.addDeleteCommentBtn(new_comment);
          comments.appendChild(new_comment);
          comments.classList.remove("d-none");
        }
      });

      // set comment form properties
      comment_input_box.setAttribute("placeholder", "Add a comment...");
      comment_input_box.setAttribute("type", "text");
      comment_input_box.setAttribute("name", "comment");

      post_btn.innerText = "post";
      post_btn.setAttribute("type", "submit");

      comment_form.appendChild(comment_input_box);
      comment_form.appendChild(post_btn);
    }
  }

  block.appendChild(block_top);
  block.appendChild(img);
  block.appendChild(comments);
  block.appendChild(comment_form);

  // Set all classes
  profile_img.classList.add("d-inline-block", "align-self-center", "m-2");
  author.classList.add("align-self-center", "my-1");
  bio.classList.add("align-self-center", "my-1");
  authorCol.classList.add("d-inline-block", "m-2", "me-auto");
  del_btn.classList.add("d-inline-block", "align-self-center", "m-3");
  del_icon.classList.add("fas", "fa-times", "del-icon");
  block_top.classList.add("d-flex");

  img.classList.add(
    "img-fluid",
    "position-relative",
    "translate-middle-x",
    "start-50"
  );

  comments.classList.add("m-1");
  comment_input_box.classList.add("form-control");
  post_btn.classList.add("btn", "btn-outline-secondary");
  comment_form.classList.add("m-3", "input-group");
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
  const fadeObserver = new IntersectionObserver(utils.fadeIn, {
    threshold: 0.1,
  });
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

// filter timeline
const filter_btn = document.querySelector("#filter_button");
filter_btn.addEventListener("click", async () => {
  const resRaw = await fetch("/get-my-images");
  if (!resRaw.ok) {
    const res = await resRaw.text();
    alert(res);
  } else {
    timeline.innerHTML = "";
    resRaw
      .json()
      .then((res) => {
        block_counter = 0;
        images = res;
      })
      .then(() => {
        observer.observe(timeline);
      });
  }
});

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
