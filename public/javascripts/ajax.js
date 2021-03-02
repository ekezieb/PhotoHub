const Timeline = document.getElementById("Timeline");

const refreshImage = async () => {
  try {
    await fetch("/image")
      .then((response) => response.json())
      .then((data) => {
        Timeline.innerText = data;
      });
  } catch (e) {
    console.log("Fail to fetch", e);
  }
};

Timeline.addEventListener("load", refreshImage);
