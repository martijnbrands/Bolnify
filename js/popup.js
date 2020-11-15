const loginForm = document.getElementById("connection_form");
const clientId = document.getElementById("clientId");
const clientSecret = document.getElementById("clientSecret");

const loginView = document.getElementById("login_view");
const connectView = document.getElementById("connected_view");
const warningView = document.getElementById("warning_view");

const outOfStockAlert = document.getElementById("out_of_stock_alert");
const outOfStockText = document.getElementById("out_of_stock_text")

const connectButton = document.getElementById("connect_button");
const disconnectButton = document.getElementById("disconnect_button");

clientId.value = localStorage.getItem("TempClientId");
clientSecret.value = localStorage.getItem("TempClientSecret");

setTemporaryClientId();
setTemporaryClientSecret();

if ("OutOfStockItems" in localStorage) {
  showInventory()
}

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

function showInventory(){
  let outOfStockItems = JSON.parse(localStorage.getItem("OutOfStockItems"))
  
  if (outOfStockItems && outOfStockItems.length > 0 ) {
    outOfStockAlert.style.display = "flex"
    outOfStockText.innerHTML = `Let op! Op dit momement is/zijn er ${outOfStockItems.length} producten niet op voorraad.`
  }
  else{
    outOfStockAlert.style.display = "none"
  }
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
        Accept: "application/vnd.retailer.v4+json",
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
        loginView.style.display = "none";
        warningView.style.display = "block";
      }
    });
  }
}
