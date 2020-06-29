const settedNotificationSound = localStorage.getItem("NotificationSound");
const settedNotificationTimer = localStorage.getItem("NotificationTimer");

const testNotificationButton = document.getElementById("notification_buttton");
const radios = document.getElementsByClassName("radio_input");
const slider = document.getElementById("notification_slider");
const slider_output = document.getElementById("slider_output");

const saveSettingsButton = document.getElementById("saveSettings");
const cancelButton = document.getElementById("cancelSettings");

saveSettingsButton.addEventListener("click", function (e) {
  e.preventDefault();
  saveSettings();
});
cancelButton.addEventListener("click", function (e) {
  e.preventDefault();
  window.close();
});

slider_output.innerHTML = slider.value;

slider.oninput = function () {
  slider_output.innerHTML = `Stuur een notificatie om de ${this.value} minuten`;
};

checkSettedSettings();

testNotificationButton.addEventListener("click", function (e) {
  e.preventDefault();
  sendTestPushNotification();

  if (settedNotificationSound != 0) {
    notificationSound = new Audio(
      `assets/sounds/notification_sound_${settedNotificationSound}.mp3`
    );
    notificationSound.play();
  }
});

function saveSettings() {
  localStorage.setItem("NotificationTimer", slider.value);
  for (let index = 0; index < radios.length; index++) {
    if (radios[index].checked === true) {
      localStorage.setItem("NotificationSound", radios[index].value);
    }
  }
  location.reload();
  chrome.runtime.reload();
}

function checkSettedSettings() {
  for (let index = 0; index < radios.length; index++) {
    if (settedNotificationSound === radios[index].value) {
      radios[index].checked = true;
    }
  }
  slider.value = settedNotificationTimer;
  slider_output.innerHTML = `Stuur een notificatie om de ${settedNotificationTimer} minuten`;
}

function sendTestPushNotification() {
  var options = {
    type: "basic",
    title: `Nieuwe bestelling (Test)`,
    message: `Hier komt de waarde van de bestelling te staan.`,
    iconUrl: "assets/icons/icon128.png",
  };
  chrome.notifications.create("notification", options);
  chrome.notifications.clear("notification");
}
