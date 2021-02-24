// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyAPN8aOY0ZauNlIgdfLevSFAZPw3oBfnaQ",
    authDomain: "cirtex-civil-hub.firebaseapp.com",
    databaseURL: "https://cirtex-civil-hub.firebaseio.com",
    projectId: "cirtex-civil-hub",
    storageBucket: "cirtex-civil-hub.appspot.com",
    messagingSenderId: "479356543714",
    appId: "1:479356543714:web:120d165eb61ab7728734bb",
    measurementId: "G-XPF363QW18"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
firebase.auth();
firebase.firestore();

// Sign UP
function signUp() {
    let email = document.querySelector('#email').value
    let password = document.querySelector('#password').value
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        sendError('show', error.message)
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
    firebase.firestore().collection('users').doc().set({
        fname: document.querySelector('#fname').value,
        lname: document.querySelector('#lname').value,
        company: document.querySelector('#company').value,
        email: document.querySelector('#email').value
    })

    let user = firebase.auth().currentUser;
    firebase.storage().ref(`users/${user.uid}/profile.jpg`).put(file).then(() => {
        console.log("File uploaded")
    }).catch(error => {
        console.log(error.message)
    })
    
    .then(function() {
       loader()
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}
// Sign IN
function signIn() {
    let email = document.querySelector('#email').value
    let password = document.querySelector('#password').value
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        sendError('show', error.message)
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
    loader()
}

function signOut() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}

function resetPassword() {
    loader()
    let emailAddress = document.querySelector('#email').value
    firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
        setTimeout(() => {
            switchSignUp('login')
        },1000)
      }).catch(function(error) {
        // An error happened.
      });
}

firebase.auth().onAuthStateChanged(function(user){
    if(user) {
        document.querySelector('#signInForm').style.display = "none"
        document.querySelector('#ctxDashboard').style.display = "block"
        getUserID(user)
        setTimeout(() => {
            document.querySelector('.ctx-loader').style.display = "none"
        },600)
    } else {
        document.querySelector('#signInForm').style.display = "none"
        document.querySelector('#ctxDashboard').style.display = "none"
        document.querySelector('.ctx-loader').style.display = "flex"
        document.querySelector('.ctx-hub-bg').style.height = "100%"
        setTimeout(() => {
            document.querySelector('#signInForm').style.display = "block"
            document.querySelector('.ctx-loader').style.display = "none"
        },600)
    }
})

function setPreferences(uid) {
    firebase.firestore().collection("users").doc(`${uid}`).get().then((snapshot) => {
        document.querySelector('#welcomeUsername').innerHTML = snapshot.data().fname
    })
    document.querySelector('.ctx-hub-bg').style.height = "auto"
}

function getUserID(user) {
    firebase.firestore().collection("users").get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
            let dbCheck = doc.data().email
            if (dbCheck == user.email) {
                setPreferences(doc.id)
            }
        })
    })
}

function loader() {
    let authBtn = document.querySelector('#authBtn')
    authBtn.innerHTML = '<i class="far fa-spinner fa-spin"></i>'
    setTimeout(() => {
        let authBtn = document.querySelector('#authBtn')
        authBtn.innerHTML = 'Sign In'
    },1000)
}

renderInput('email', 'email', 'Email Address')
renderInput('password', 'password', 'Password')

function renderInput(ID, type, name) {
    let inputFields = document.querySelector('#inputFields')
    let item = document.createElement('input')
    item.type = type
    item.id = ID
    item.placeholder = name
    inputFields.appendChild(item)
}

function sendError(status, message) {
    document.querySelector('#err').style.display = "none"
    if (status == 'show') {
        document.querySelector('#err').style.display = "block"
        document.querySelector('#err').innerHTML = message
    }
}

function switchSignUp(current) {
    let authBtn = document.querySelector('#authBtn')
    let authTitle = document.querySelector('#authTitle')
    let switcher = document.querySelector('#switcher')
    sendError(false, null)
    let myNode = document.querySelector('#inputFields');
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
    switch (current) {
        case 'login':
            authTitle.innerHTML = 'Sign In'
            switcher.innerHTML = `New? Register an account`
            switcher.setAttribute("onclick", "switchSignUp('signup')")
            authBtn.innerHTML = 'Sign In'
            authBtn.setAttribute("onclick", "signIn()")
            renderInput('email', 'email', 'Email Address')
            renderInput('password', 'password', 'Password')
            break
        case 'signup': 
            authTitle.innerHTML = 'Sign Up'
            switcher.innerHTML = `Already have an account? Sign in`
            switcher.setAttribute("onclick", "switchSignUp('login')")
            authBtn.innerHTML = 'Sign Up'
            authBtn.setAttribute("onclick", "signUp()")
            renderInput('fname', 'text', 'First Name')
            renderInput('lname', 'text', 'Last Name')
            renderInput('company', 'text', 'Company Name')
            renderInput('email', 'email', 'Email Address')
            renderInput('password', 'password', 'Password')
            break
        case 'reset':
            authTitle.innerHTML = 'Reset Password'
            switcher.innerHTML = `Already have an account? Sign in`
            switcher.setAttribute("onclick", "switchSignUp('login')")
            authBtn.innerHTML = 'Reset'
            authBtn.setAttribute("onclick", "resetPassword()")
            renderInput('email', 'email', 'Email Address')
        break
    }
}