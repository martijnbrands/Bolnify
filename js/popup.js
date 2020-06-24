const loginForm = document.getElementById("connection_form");
const clientId = document.getElementById("clientId");
const clientSecret = document.getElementById("clientSecret");

const loginView = document.getElementById("login_view");
const connectView = document.getElementById("connected_view");
const warningView = document.getElementById("warning_view");

const connectButton = document.getElementById("connect_button");
const disconnectButton = document.getElementById("disconnect_button");

clientId.value = localStorage.getItem("TempClientId");
clientSecret.value = localStorage.getItem("TempClientSecret");

setTemporaryClientId();
setTemporaryClientSecret();

connectButton.addEventListener("click", function (e) {
  e.preventDefault();
  connect();
});

disconnectButton.addEventListener("click", function (e) {
  e.preventDefault();
  disconnect();
});

if ("ClientId" in localStorage) {
  loginView.style.display = "none";
  loginForm.style.display = "none";
  connectView.style.display = "block";
} else {
  loginForm.style.display = "block";
}

function setTemporaryClientId() {
  clientId.addEventListener("keyup", function (e) {
    localStorage.setItem("TempClientId", clientId.value);
  });
}

function setTemporaryClientSecret() {
  clientSecret.addEventListener("keyup", function (e) {
    localStorage.setItem("TempClientSecret", clientSecret.value);
  });
}

function disconnect() {
  localStorage.clear();
  loginView.style.display = "block";
  loginForm.style.display = "block";
  connectView.style.display = "none";
}

function connect() {
  if (clientId.value.length === 0 || clientSecret.value.length === 0) {
    loginView.style.display = "none";
    warningView.style.display = "block";
  } else {
    const token = window.btoa(clientId.value + ":" + clientSecret.value);

    fetch("https://login.bol.com/token?grant_type=client_credentials", {
      method: "POST",
      headers: {
        Accept: "application/vnd.retailer.v3+json",
        Authorization: `Basic ${token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        localStorage.setItem("ClientId", clientId.value);
        localStorage.setItem("ClientSecret", clientSecret.value);
        localStorage.removeItem("TempClientId");
        localStorage.removeItem("TempClientSecret");
        warningView.style.display = "none";
        loginView.style.display = "none";
        loginForm.style.display = "none";
        connectView.style.display = "block";
      } else {
        warningView.style.display = "block";
      }
    });
  }
}
