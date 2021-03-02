const Timeline = document.getElementById("Timeline");

const refreshImage = async () => {
  try {
    await fetch("/image");
    Timeline.textContent = "Got image";
  } catch (e) {
    console.log("Fail to fetch", e);
  }
};

Timeline.addEventListener("load", refreshImage);

refreshImage();
