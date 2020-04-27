const loginForm = document.getElementById("connection_form");
const clientId = document.getElementById("clientId");
const clientSecret = document.getElementById("clientSecret");

const alertBoxSuccess = document.getElementsByClassName("alert_success")[0];
const alertBoxWarning = document.getElementsByClassName("alert_warning")[0];

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
  loginForm.style.display = "none";
  alertBoxSuccess.style.display = "flex";
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
}

function connect() {
  if (clientId.value.length === 0 || clientSecret.value.length === 0) {
    alertBoxWarning.style.display = "flex";
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
        alertBoxWarning.style.display = "none";
        loginForm.style.display = "none";
        alertBoxSuccess.style.display = "flex";
      } else {
        alertBoxWarning.style.display = "flex";
      }
    });
  }
}
