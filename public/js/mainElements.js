let rightColumn = `
<div class="ctx-sidebar-wrapper">
  <div class="news-feed-options">
    <a href="#" onclick="location.reload()"><i class="fad fa-sync"></i> Refresh Discussion</a>
  </div>
  <div class="ctx-dash-body">
    <div class="ctx-dash-welcome">
      <div class="ctx-popup-tip">
        <div class="ctx-popup-close" onclick="closePopup()"><i class="fal fa-times"></i></div>
        <span id="profilePicToolTip">Click here to update your profile picture!</span>
      </div>
      <div class="ctx-profile-img update-profile">
          <img id="uploadProfilePicture" class="dashboard-profile-pic" src="public/img/default-user-icon.jpg">
          <input type="file" onchange="chooseProfilePic(event)" id="updateProfilePicture" style="display:none">
      </div>
      <p><span id="welcomeMessage">Good afternoon</span>,<br><b id="welcomeUsername">Andrew</b></p>
    </div>
    <div id="notificationContainer"></div>
  </div>

  <!-- Promos -->

  <div class="ctx-dash-body ctx-dash-body-promo">
    <a href="https://cirtexcivil.co.nz/competition/" target="_blank">
      <div class="ctx-promo">
        <img src="https://d3kkkvz3vcvzu4.cloudfront.net/wp-content/uploads/2020/11/19073210/photo-comp-bg-website.jpg">
        <div class="ctx-promo-body">
          <h4>Photo Competition</h4>
          <button>Learn more</button>
        </div>
      </div>
    </a>
  </div>

  <div class="ctx-dash-body ctx-dash-body-promo" style="top:640px">
    <a href="https://cirtexcivil.co.nz/caplab-application/" target="_blank">
      <div class="ctx-promo">
        <img src="https://d3kkkvz3vcvzu4.cloudfront.net/wp-content/uploads/2020/03/17111334/caplab-mockup-laptop.jpg">
        <div class="ctx-promo-body">
          <h4>CAPLab 2020</h4>
          <button>Launch</button>
        </div>
      </div>
    </a>
  </div>
</div>
`
document.querySelector('#rightColumn').insertAdjacentHTML('beforeend', rightColumn)

const renderMenu = `
    <p>Civil Hub</p>
    <ul>
        <li onclick='window.location.href = "https://civilhub.co.nz";'><i class="fad fa-comments"></i> Discussion</li>
    </ul>
    <p>My Cirtex</p>
    <ul>
      <li onclick='window.location.href = "mycirtex.html";'><i class="fad fa-cart-plus"></i> Order Product</li>
      <li onclick='window.location.href = "mycirtex.html";'><i class="fad fa-file-alt"></i> My Documents</li>
    </ul>
    <p>Academy</p>
    <ul>
        <li onclick='window.location.href = "academy.html";'><i class="fad fa-users-class"></i> Webinars On-Demand</li>
    </ul>
    <p>Tools & Applications</p>
    <ul>
        <li onclick='window.open("https://cirtexcivil.co.nz/caplab-application/", "_blank");'><i class="fad fa-cogs"></i> CAPLab 2020</li>
        <li onclick='window.open("https://cirtexcivil.co.nz/rads-calc-application/", "_blank");'><i class="fad fa-cogs"></i> Dosing Calculator</li>
    </ul>
    <p>Technical Downloads</p>
    <ul>
        <li onclick='window.location.href = "downloads.html"'><i class="fad fa-book"></i> Technical Documents</li>
    </ul>
    <br>
    <span class="ctx-version">Beta Version 0.92 | <a href="mailto:andrew.landes@cirtex.co.nz">Report a Bug</a></span>
    <span class="ctx-version">Powered by Cirtex®</span>
    `
document.querySelector('#menu').insertAdjacentHTML('beforeend', renderMenu)

const headerMenu = `
    <div class="ctx-dash-menu">
    <a href="https://civilhub.co.nz">
      <img src="https://civilhub.co.nz/public/img/civil-hub-logo.png">
    </a>
    <div class="ctx-dash-user">
        <i class="fad fa-barcode-read menu-icon menu-disabled"></i>
        <div class="tooltip">
          <i class="fad fa-clipboard-list menu-icon" onclick='window.location.href = "mycirtex.html"'></i>
          <span class="tooltiptext">My Cirtex</span>
        </div>
        <i class="fad fa-building menu-icon menu-disabled"></i>
        <div class="tooltip">
          <i class="fad fa-comments menu-icon" onclick='window.location.href = "https://civilhub.co.nz"'></i>
          <span class="tooltiptext">Discussion</span>
        </div>
        <div class="tooltip">
          <i class="fad fa-shopping-cart menu-icon" onclick='window.location.href = "mycirtex.html"'></i>
          <span class="tooltiptext">Order Product</span>
        </div>
        <div class="tooltip">
          <i class="fad fa-book menu-icon" onclick='window.location.href = "downloads.html"'></i>
          <span class="tooltiptext">Downloads</span>
        </div>
        <div class="tooltip">
          <i class="fad fa-cogs menu-icon" onclick='window.location.href = "applications.html"'></i>
          <span class="tooltiptext">Applications</span>
        </div>
        <div class="tooltip">
          <i class="fad fa-users-class menu-icon" onclick='window.location.href = "academy.html"'></i>
          <span class="tooltiptext">Academy</span>
        </div>
    </div>
    <i onclick="signOut()" class="fad fa-sign-out ctx-sign-out" aria-hidden="true"></i>
    </div>
    `
document.querySelector('#headerMenu').insertAdjacentHTML('beforeend', headerMenu)

// Accordion Function
var acc = document.getElementsByClassName("accordion");

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}

// Assign welcome text based on hours
let welcome = document.querySelector('#welcomeMessage')
let currentTime = (new Date()).getHours()
if (currentTime >= 5 && currentTime < 12) {
  welcome.innerHTML = "Good morning"
} else if (currentTime >= 12 && currentTime <= 18) {
  welcome.innerHTML = "Good afternoon"
} else {
  welcome.innerHTML = "Good evening"
}

const loadIcon = `
<svg class="fa-spin ctx-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 243.2 240.11"><defs><style>.cls-1{fill:#e31936;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M123,155.77c-4.86,1.81-9.64,3.92-14.61,5.38-18.82,5.54-37.33,4.76-54.85-4.51-13.61-7.21-24-18.12-32-31.21-6.78-11.11-11-23.09-11.26-36.22-.21-12.75,3-24.72,8.76-36.08,4.64-9.21,10.47-17.46,18.73-23.81,2.59-2,5.09-4.17,8.69-4.05,4,.14,6.17,2.9,5.15,6.75-1.81,6.8-4.11,13.49-5.52,20.36C43,67.28,42,82.29,47.15,97c11.05,31.19,32.41,50.71,65.35,56.78,3.39.62,6.84.89,10.26,1.32Z"/><path class="cls-1" d="M92,112.81c-.61-5.09-1.53-10.16-1.76-15.26-1.81-40.76,29.48-68.5,54.56-74.86,25.59-6.49,48.64-.7,68.59,16.81a55.45,55.45,0,0,1,14.89,21c1,2.48,2,5,1.08,7.81-1.21,3.68-4.28,5-7.74,3.31a15.33,15.33,0,0,1-2.39-1.52c-12-9.13-25.43-15-40.51-16.35-14.74-1.35-28.81,1.69-42.16,7.92C115,71.73,101.17,88.69,93.48,111c-.14.41-.26.83-.41,1.24-.07.2-.17.39-.26.59Z"/><path class="cls-1" d="M97.53,141.44c-2-1-4-1.9-5.88-3-21.12-12.26-33.6-30.39-37-54.62-2-14.57-1.14-28.94,5.53-42.19,11-21.74,28.48-35.4,52.54-40.34a55.87,55.87,0,0,1,28.86,1.34,13.42,13.42,0,0,1,4.22,2.17c3.83,3.05,3,8.16-1.61,9.79-3.14,1.12-6.43,1.81-9.56,3C107.06,27.75,90.8,47.83,84.34,76c-5.16,22.55-.36,43.4,12,62.7.49.77,1,1.53,1.51,2.29Z"/><path class="cls-1" d="M145.41,144.59c-3,14.26-9.3,26.75-19.49,37.13-12.55,12.78-28.12,19.46-45.64,22.2-32.7,5.11-61.14-16-72.36-37.69C2.61,156-.69,145.26.12,133.57A22.78,22.78,0,0,1,1,128.44,6,6,0,0,1,6.11,124c2.74-.38,4.31,1.23,5.61,3.33,3,4.87,5.74,10,9.17,14.54,13,17.25,30.58,26.59,51.83,29.41,26.61,3.54,49.3-4.67,68.68-22.85C142.71,147.16,144,145.92,145.41,144.59Z"/><path class="cls-1" d="M109.24,94.59c3-3.23,5.76-6.65,9-9.64,16.49-15.4,36.08-21.73,58.48-19.56,13.57,1.32,26.33,5.17,37.24,13.51,16.23,12.42,25.7,29,28.55,49.25A62.52,62.52,0,0,1,241,154.33c-1.34,4.64-3.58,9-5.61,13.43a10.77,10.77,0,0,1-2.92,3.47,5.78,5.78,0,0,1-6.34.91c-2.11-.95-2.65-2.93-2.89-5-.61-5.27-.88-10.61-1.94-15.78-5.37-26.13-21.26-44-44.86-55.24-21.26-10.17-43-9.89-64.81-1.69l-2,.71Z"/><path class="cls-1" d="M137.94,96a65.88,65.88,0,0,1,22.14,2.49c29.5,8.62,46.94,29,53.72,58.12,5.61,24.06-2.2,45.32-18.44,63.37-9.39,10.44-21,17.62-35.23,19.86a19.77,19.77,0,0,1-5.21.17,5.91,5.91,0,0,1-5.17-4.12c-.87-2.51.5-4.38,2.16-6,2.7-2.64,5.66-5,8.23-7.79,16.18-17.35,22.91-37.89,20.51-61.46-2.9-28.36-17.26-49.28-41.48-63.78C138.94,96.72,138.72,96.54,137.94,96Z"/><path class="cls-1" d="M152.74,117.07a61.68,61.68,0,0,1,10.49,15.67c4.81,9.81,7.68,20.24,7.32,31.12-.85,25.43-9.67,47.58-31.22,62.27C116.79,241.49,92.14,243.7,67,232.46c-5.13-2.29-9.52-6.31-14.09-9.76a7.43,7.43,0,0,1-3.1-6c0-3.69,2-5.74,5.68-5.58a31.65,31.65,0,0,1,4.29.69c49.66,9.09,86.07-28.88,92.41-63.65A91.67,91.67,0,0,0,152.74,117.07Z"/></g></g></svg>
`
document.querySelector('#ctxLoader').insertAdjacentHTML('beforeend', loadIcon)

// Notifications

// Send Notification to DB
function sendTagNotification(taggedEmail, postID, user) {
  users.get()
    .then(snapshot => {
        snapshot.docs.forEach(doc => {
            if ((`${doc.data().email}`) == taggedEmail) {
                // Create reference for notifications
                let ref = users.doc(doc.id).collection("notifications").doc()
                users.doc(doc.id)
                  .collection("notifications")
                  .doc(ref.id)
                  .set({
                      postedBy: user.displayName,
                      postID: postID,
                      dateTime: new Date().getTime() / 1000,
                      read: false
                  }).then(() => {
                    Email.send({
                      Host : "smtp.office365.com",
                      Username : "andrew.landes@cirtex.co.nz",
                      Password : "CirMAS885",
                      To : taggedEmail,
                      From : "andrew.landes@cirtex.co.nz",
                      Subject : "You've been tagged in a post | Civil Hub",
                      Body : 
                      `<center>
                      <br>
                      <table border="0" cellpadding="0" cellspacing="0" style="background:#f2f2f2;margin:5%;padding:5%;border-radius:10px;width:80%;border-spacing:0;">
                          <tr>
                              <td>
                                <img style="max-width:96px;max-height:32.125px" src="http://civilhub.co.nz/public/img/civilhub-logo-email.png" width="96px" height="32.125px">
                                <br><br>
                                ${user.displayName} has tagged you in a post on the Civil Hub.
                                <br><br>
                                  <table border="0" cellspacing="0" cellpadding="0">
                                    <tr style="padding: 12px 18px;text-decoration: none;">
                                      <td align="center" style="border-radius: 3px" bgcolor="#e80032">
                                      <a href="https://civilhub.co.nz?post=${postID}" target="_blank" style="
                                      font-size: 16px;
                                      font-family: Helvetica, Arial, sans-serif;
                                      color: #ffffff;
                                      text-decoration: none;
                                      border-radius: 3px;
                                      padding: 12px 18px;
                                      border: none;
                                      display: inline-block;">View the post on Civil Hub &rarr;</a>
                                    </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                      <br>
                      <a href="#" target="_blank" style="font-size:12px!important;color:#aaa;text-decoration:none;">Unsubscribe from notification emails</a>
                      <p style="font-size:12px;margin:0;">© Civil Hub 2021 | Powered by Cirtex</p>
                    </center>`
                    }).then(
                    message => {
                      console.log(message)
                      console.log(taggedEmail)
                    })
                  })
            }
        })
    })
  userTagged = ""
}

// Get Notification
function getNotifications() {
  users.get()
    .then((snapshot) => {
        snapshot.docs.forEach(doc => {
            if (doc.data().email == currentUser.email) {
                users.doc(doc.id)
                  .collection("notifications")
                  .get()
                  .then((snapshot) => {
                      snapshot.docs.forEach(doc => {
                          if (doc.data().read != true) {
                              let taggedBy = doc.data().postedBy
                              let originalPost = doc.data().postID
                              renderNotification(taggedBy, originalPost, doc.id)
                          }
                      })
                  })
              }
        })
    })
}

// Render Notification
function renderNotification(taggedBy, originalPost, id) {
  let notification = `
      <div id="NOTIFICATION${id}" class="notification" onclick="goToNotification('${originalPost}', '${id}')">
        <i class="fad fa-bell-on"></i>
          <p><strong>${taggedBy}</strong> mentioned you in a post. Click to view.</p>
      </div>
      `
  document.querySelector('#notificationContainer').insertAdjacentHTML('beforeend', notification)
}

function goToNotification(post, id) {
  renderSinglePost(post)
  clearNotification(post, id)
}

// Clear Notification

function clearNotification(post, id) {
  users.get()
    .then((snapshot) => {
      snapshot.docs.forEach(doc => {
        if (doc.data().email == currentUser.email) {
          users.doc(`${doc.id}`)
            .collection("notifications")
            .doc(`${id}`)
            .update({
              read: true
            })
              document.querySelector(`#NOTIFICATION${id}`).style.display = "none"
              document.querySelector('.ctx-background-blur').addEventListener("click", () => {
              document.querySelector(`#POST${post}`).children[0].children[0].style.zIndex = "1"
              document.querySelector(`#POST${post}`).children[0].children[1].style.zIndex = "1"
              document.querySelector('.ctx-background-blur').addEventListener("click", removeCreatePost)
            })
        }
      })
    })
}

function alert(message, title) {
  const dashboard = document.querySelector('body')
    const alert = `
      <div class="ctx-alert" id="alert">
        <div class="ctx-alert-body">
          <h4>${title}</h4>
          <p>${message}</p>
        </div>
      </div>
    `
    
    if (document.querySelector('#alert')) {
      let alertBox = document.querySelector('#alert')
      while (alertBox.firstChild) {
        alertBox.removeChild(alertBox.firstChild)
      }
      dashboard.removeChild(alertBox)
    }

    dashboard.insertAdjacentHTML('beforeend', alert)

    let alertBox = document.querySelector('#alert')
    setTimeout(() => {
      alertBox.style.animation = "fadeOut ease 1.2s"
      setTimeout(() => {
        while (alertBox.firstChild) {
          alertBox.removeChild(alertBox.firstChild)
        }
        dashboard.removeChild(alertBox)
      }, 1000)
    }, 5000)
}

function closePopup() {
  document.querySelector('.ctx-popup-tip').style.display = "none"
}