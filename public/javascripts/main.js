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
  const img = document.createElement("img");
  const comments = document.createElement("div");
  const comment0 = document.createElement("p");
  const comment1 = document.createElement("p");

  img.setAttribute("src", image.url);
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

// upload an image
document.querySelector("#upload").addEventListener("click", async () => {
  const resRaw = await fetch("/upload-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: "value" }),
  });
  const res = await resRaw.json();
  console.log("Upload", res);
});
