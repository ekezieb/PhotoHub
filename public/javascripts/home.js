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
