// render a block on given image information
// image
// - image_name
// - user_name
// - url
// - number_liked
// - comments[]
const renderBlock = (image) => {
  console.log(image.url);
  const block = document.createElement("div");
  const del = document.createElement("button");
  const img = document.createElement("img");
  const comments = document.createElement("div");
  const comment0 = document.createElement("p");
  const comment1 = document.createElement("p");

  del.addEventListener("click", async () => {
    try {
      const resRaw = await fetch("/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: image.url }),
      });
      const res = await resRaw.json();
      console.log(res);
      document.querySelector("#timeline").removeChild(block);
    } catch (e) {
      console.log("Err ", e);
    }
  });
  block.appendChild(del);

  img.setAttribute("src", image.url);
  img.setAttribute("alt", "user_photo");
  img.setAttribute("width", "50px");
  img.setAttribute("height", "50px");
  block.appendChild(img);

  comment0.innerText = image.comments[0] === undefined ? "" : image.comments[0];
  comment1.innerText = image.comments[1] === undefined ? "" : image.comments[1];
  comments.appendChild(comment0);
  comments.appendChild(comment1);
  block.appendChild(comments);

  return block;
};

// render the timeline on query results
function renderTimeline(images) {
  const timeline = document.querySelector("#timeline");
  images.images.forEach((image) => {
    timeline.appendChild(renderBlock(image));
  });
}

// fetch information of images
document.querySelector("#temp").addEventListener("click", async () => {
  const resRaw = await fetch("/images");
  const res = await resRaw.json();
  renderTimeline(res);
});

// fetch user information
// User
// - user_name
// - password
// - description
// - profile_photo
const renderUser = async () => {
  document.querySelector("#login_form").style.display = "none";
  document.querySelector("#user_inf").style.display = "block";
  try {
    const name = document.querySelector("#user-name");
    const des = document.querySelector("#description");
    const img = document.querySelector("#profile-photo");
    const resRaw = await fetch("/get-user");
    const res = await resRaw.json();
    console.log(res);

    img.setAttribute("src", res.profile_photo);
    img.setAttribute("alt", "profile_photo");
    img.setAttribute("width", "50px");
    img.setAttribute("height", "50px");
    name.innerHTML = res.user_name;
    des.innerHTML = res.description;
  } catch (e) {
    console.log("Err", e);
  }
};

// Log in
const form = document.querySelector("#login_form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user_name = form[0].value;
  const password = form[1].value;
  try {
    const resRaw = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_name: user_name, password: password }),
    });
    console.log(resRaw);
    if (!resRaw.ok) {
      const res = await resRaw.json();
      alert(res.err);
    }
    form[1].value = "";
    renderUser().then();
  } catch (e) {
    console.log("Err", e);
  }
});

// Log out
document.querySelector("#logout").addEventListener("click", () => {
  document.cookie = "user_name=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.querySelector("#user_inf").style.display = "none";
  document.querySelector("#login_form").style.display = "block";
});

if (document.cookie.search("user_name") === -1) {
  document.querySelector("#user_inf").style.display = "none";
  document.querySelector("#login_form").style.display = "block";
} else {
  renderUser().then();
}
