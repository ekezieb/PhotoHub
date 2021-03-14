const login_form = document.querySelector("#login_form");
const signup_form = document.querySelector("#signup_form");

document.querySelector("#login").addEventListener("click", showLogin);

function showLogin() {
  signup_form.classList.remove("d-block");
  login_form.classList.remove("d-none");
  signup_form.classList.add("d-none");
  login_form.classList.add("d-block");
}
document.querySelector("#signup").addEventListener("click", () => {
  login_form.classList.remove("d-block");
  signup_form.classList.remove("d-none");
  login_form.classList.add("d-none");
  signup_form.classList.add("d-block");
});

// Log in
login_form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = login_form[0].value;
  const password = login_form[1].value;
  const checked = document.querySelector(".form-check-input").checked;
  try {
    const resRaw = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        checked: checked,
      }),
    });
    login_form.reset();
    if (!resRaw.ok) {
      const res = await resRaw.text();
      alert(res);
    } else {
      location.replace("/");
    }
  } catch (e) {
    console.log("Err", e);
  }
});

// Sign up
signup_form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = signup_form[0].value;
  const password = signup_form[1].value;
  console.log("signup", username, password);
  try {
    const resRaw = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    });
    signup_form.reset();
    if (!resRaw.ok) {
      const res = await resRaw.text();
      alert(res);
    } else {
      showLogin();
    }
  } catch (e) {
    console.log("Err", e);
  }
});
