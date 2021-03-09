// render a block on given image information
// image
// - image_name
// - username
// - url
// - number_liked
// - comments[]
const renderBlock = (image) => {
  console.log(image.url);
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
  block_top.appendChild(author);
  block_top.appendChild(del_btn);

  img.setAttribute("src", image.url);
  img.setAttribute("alt", "user_photo");

  comments.setAttribute("id", "comments-form");
  comments.setAttribute("action", "/add-comment");
  comments.setAttribute("method", "POST");

  comment_inputbox.setAttribute("placeholder", "Add a comment...");
  comment_inputbox.setAttribute("type", "text");
  comment_inputbox.setAttribute("name", "comment");

  comments.appendChild(comment_inputbox);

  post_btn.innerText = "post";
  post_btn.setAttribute("type", "submit");

  // post_btn.addEventListener("click", async () => {
  //   comment_list = [];
  //   try {
  //     const resRaw = await fetch("/view-comment");
  //   }
  // });

  comments.appendChild(post_btn);

  comment0.innerText = image.comments[0] === undefined ? "" : image.comments[0];
  comment1.innerText = image.comments[1] === undefined ? "" : image.comments[1];

  comments.appendChild(comment0);
  comments.appendChild(comment1);

  block.appendChild(block_top);
  block.appendChild(img);
  block.appendChild(comments);

  author.classList.add("d-inline-block", "align-self-center", "m-2", "me-auto");
  del_btn.classList.add("d-inline-block", "align-self-center", "m-2");
  del_icon.classList.add("fas", "fa-window-close", "fas-2x");
  block_top.classList.add("d-flex");
  img.classList.add("img-fluid");
  block.classList.add(
    "block",
    "m-3",
    "border",
    "border-1",
    "border-secondary",
    "bg-light"
  );
  return block;
};
// end of render block

/*
const renderComment = (image, comments) => {

};
*/

// render the timeline on query results
function renderTimeline(images) {
  const timeline = document.querySelector("#timeline");
  timeline.innerHTML = "";
  //TODO load async by scrolling
  /*
  images.images.comments.forEach((image, comments, index) => {
    comments[index] = 
  });
  */

  images.images.forEach((image) => {
    timeline.appendChild(renderBlock(image));
  });
}

// Log in
// User
// - username
// - password
// - description
// - profile_photo
const login = async () => {
  try {
    const name = document.querySelector("#username");
    const des = document.querySelector("#bio");
    const img = document.querySelector("#profile_photo");
    const imgL = document.querySelector("#profile_photo_large");
    const resRaw = await fetch("/get-user");
    if (!resRaw) {
      const res = await resRaw.text();
      alert(res);
    } else {
      const res = await resRaw.json();
      console.log(res);
      img.setAttribute("src", res.profile_photo);
      imgL.setAttribute("src", res.profile_photo);
      name.innerHTML = res.username;
      des.innerHTML = res.biography;

      document.querySelector("#logout_link").classList.remove("d-none");
      document.querySelector("#login_link").classList.add("d-none");

      document.querySelectorAll(".a_log").forEach((value) => {
        value.setAttribute("href", "home.html");
      });
    }
  } catch (e) {
    console.log("Err", e);
  }
};

// Log out
document.querySelector("#logout_link").addEventListener("click", () => {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.querySelector("#logout_link").classList.add("d-none");
  document.querySelector("#login_link").classList.remove("d-none");
  document.querySelectorAll(".a_log").forEach((value) => {
    value.setAttribute("href", "login.html");
  });
});

// fetch information of images
window.addEventListener("load", async () => {
  const resRaw = await fetch("/images");
  if (!resRaw.ok) {
    const res = await resRaw.text();
    alert(res);
  } else {
    const res = await resRaw.json();
    renderTimeline(res);
  }

  if (document.cookie.search("username") !== -1) {
    login().then();
  }
});

// Upload an image
// const upload_image_form = document.querySelector("#upload_image_form");
// upload_image_form.addEventListener("submit", async (event) => {
//   event.preventDefault();
//   try {
//     const formData = new FormData(upload_image_form);
//     const resRaw = await fetch("/upload-image", {
//       method: "POST",
//       body: formData,
//     });
//     console.log("upload_image", resRaw);
//     if (!resRaw.ok) {
//       const res = await resRaw.text();
//       alert(res);
//     }
//     location.reload();
//   } catch (err) {
//     console.log("Err", err);
//   }
// });
