const settedNotificationSound = localStorage.getItem("NotificationSound");
const settedNotificationTimer = localStorage.getItem("NotificationTimer");

if (settedNotificationSound === null || settedNotificationSound.length === 0) {
  localStorage.setItem("NotificationSound", 0);
}

chrome.runtime.onInstalled.addListener(() => {
  if (
    settedNotificationTimer === null ||
    settedNotificationTimer.length === 0
  ) {
    chrome.alarms.create("Check New Order", { delayInMinutes: 0.1, periodInMinutes: 5 });
  } else {
    chrome.alarms.create("Check New Order", {
      periodInMinutes: parseInt(settedNotificationTimer),
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(
    alarm.name,
    `Refreshing every ${alarm.periodInMinutes} minute(s)`
  );
  if ("ClientId" in localStorage) {
    bolnify();
  }
});

async function bolnify() {
  const bearerToken = await checkForAccesToken();
  const openOrders = await getOpenOrders(bearerToken);
  getInventory(bearerToken)

  if (openOrders) {
    saveNewOpenOrders(openOrders);
    const newOpenOrders = checkIfOpenOrderExcist();

    if (newOpenOrders.length > 0) {
      let TotalOrderToNotify = [];
      for (let order of newOpenOrders) {
        TotalOrderToNotify.push(await getSingleOrderData(bearerToken, order));
      }

      TotalOrderToNotify = TotalOrderToNotify.reduce((a, b) => a + b, 0);
      sendPushNotification(newOpenOrders, TotalOrderToNotify);
      if (settedNotificationSound != 0) {
        notificationSound = new Audio(
          `assets/sounds/notification_sound_${settedNotificationSound}.mp3`
        );
        notificationSound.play();
      }
    }
  }
}

async function checkForAccesToken() {
  const clientId = localStorage.getItem("ClientId");
  const clientSecret = localStorage.getItem("ClientSecret");
  const token = window.btoa(clientId + ":" + clientSecret);

  const bearerToken = await fetch(
    "https://login.bol.com/token?grant_type=client_credentials",
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.retailer.v4+json",
        Authorization: `Basic ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data.access_token;
    })

    .catch((err) => console.error(err));
  return bearerToken;
}

async function getOpenOrders(access_token) {
  const openOrders = await fetch(
    "https://api.bol.com/retailer/orders?fulfilment-method=FBB",
    {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.retailer.v4+json",
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => console.error(err));
  return openOrders.orders;
}

async function getSingleOrderData(access_token, orderId) {
  const singleOrder = await fetch(
    `https://api.bol.com/retailer/orders/${orderId}`,
    {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.retailer.v4+json",
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let totalOrderPrice = [];
      data.orderItems.forEach((item) => {
        totalOrderPrice.push(item.unitPrice);
      });
      totalOrderPrice = totalOrderPrice.reduce((a, b) => a + b, 0);
      return totalOrderPrice;
    })
    .catch((err) => console.error(err));
  return singleOrder;
}

function saveNewOpenOrders(orders) {
  let newOpenOrders = orders.map((order) => {
    return order.orderId;
  });
  localStorage.setItem("newOrders", JSON.stringify(newOpenOrders));
  return newOpenOrders;
}

function checkIfOpenOrderExcist() {
  let newOpenOrders = [];

  let newOrders = JSON.parse(localStorage.getItem("newOrders"));
  let oldOrders = JSON.parse(localStorage.getItem("oldOrders"));

  if (!oldOrders) {
    // Check if database excist
    localStorage.setItem("oldOrders", JSON.stringify([]));
  } else {
    // Check if new order already has been notified
    newOrders.forEach((order) => {
      let checkIfNotified = oldOrders.includes(order); // Check if new order exsist in storage
      if (checkIfNotified === true) {
      } else {
        newOpenOrders.push(order);
        oldOrders.push(order);
        localStorage.setItem("oldOrders", JSON.stringify(oldOrders));
      }
    });
  }
  return newOpenOrders;
}


async function getInventory (access_token){
  let outOfStockItems = []
  const inventory = await fetch(
    "https://api.bol.com/retailer/inventory",
    {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.retailer.v4+json",
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      data.inventory.forEach(inventoryItem => {
        if (inventoryItem.regularStock === 0) {
          outOfStockItems.push(inventoryItem.ean)
        }
      })      
    })
    .catch((err) => console.error(err));
    if (outOfStockItems.length > 0) {
      localStorage.setItem("OutOfStockItems", JSON.stringify(outOfStockItems));
      chrome.browserAction.setBadgeBackgroundColor({ color: "#FF7A00" });
      chrome.browserAction.setBadgeText({text: outOfStockItems.length.toString()});
    }
    else{
      localStorage.removeItem("OutOfStockItems");
      chrome.browserAction.setBadgeText({text: ""});
    }
   
  return inventory;
}

function sendPushNotification(totalOrderNumbers, totalOrderPrice) {
  var options = {
    type: "basic",
    title: `Je hebt ${totalOrderNumbers.length} nieuwe bestelling(en)`,
    message: `💰 De totale waarde is €${totalOrderPrice.toFixed(2)}`,
    iconUrl: "assets/icons/icon48.png",
  };
  chrome.notifications.create("notification", options);
  chrome.notifications.clear("notification");
}
