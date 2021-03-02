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
}

// Initialise Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()
firebase.auth()
firebase.firestore()

// Declare globals
const db = firebase.firestore()
const storage = firebase.storage()
const auth = firebase.auth()
const posts = db.collection('posts')
const users = db.collection('users')
let currentUser

// Sign UP
function signUp() {
    let email = document.querySelector('#email').value
    let password = document.querySelector('#password').value
    let displayName = document.querySelector('#fname').value + " " + document.querySelector('#lname').value
    if (email.includes('cirtex.co.nz')) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(function(result) {

                // Set users display name
                result.user.updateProfile({
                    displayName: displayName
                })
        
                // Set user in a collection in Firestore
                firebase.firestore().collection('users').doc().set({
                    fname: document.querySelector('#fname').value,
                    lname: document.querySelector('#lname').value,
                    company: document.querySelector('#company').value,
                    email: document.querySelector('#email').value,
                    id: result.user.uid,
                    pricing: null
                })
            }).catch(err => {
                alert(err, "Error!")
            })
    } else {
        alert("The Civil Hub is still currently in development, check back soon!", "Sorry!")
    }
}
// Sign IN
function signIn() {
    let email = document.querySelector('#email').value
    let password = document.querySelector('#password').value
    auth.signInWithEmailAndPassword(email, password)
        .catch(function(error) {
            alert(error.message, "Error!")
        });
    loader()
}

function signOut() {
    auth.signOut()
        .then(function() {
            let bg = document.querySelector('.ctx-hub-bg')
            bg.style.background = "url(https://civilhub.co.nz/public/img/cirtex-civil-hub.jpg)"
            bg.style.backgroundSize = "cover"
            bg.style.backgroundRepeat = "no-repeat"
            bg.style.backgroundPosition = "center"
            location.reload()
        }).catch(function(error) {
            alert(error.message, "Error!")
        });
}

function resetPassword() {
    loader()
    let emailAddress = document.querySelector('#email').value
    auth.sendPasswordResetEmail(emailAddress)
        .then(function() {
            setTimeout(() => {
                switchSignUp('login')
            },1000)
        }).catch(function(error) {
            alert(error.message, "Error!")
        });
}

auth.onAuthStateChanged(function(user){
    if(user) {
        document.querySelector('#signInForm').style.display = "none"
        document.querySelector('#ctxDashboard').style.display = "block"
        document.querySelector('.ctx-hub-bg').style.background = "#f5f5f5"
        getUserID(user)
        setTimeout(() => {
            document.querySelector('.ctx-loader').style.display = "none"
        },200)
    } else {
        document.querySelector('#signInForm').style.display = "none"
        document.querySelector('#ctxDashboard').style.display = "none"
        document.querySelector('.ctx-loader').style.display = "flex"
        document.querySelector('.ctx-hub-bg').style.height = "100%"
        setTimeout(() => {
            document.querySelector('#signInForm').style.display = "block"
            document.querySelector('.ctx-loader').style.display = "none"
        },200)
    }
})

function setPreferences(uid) {
    users.doc(`${uid}`)
        .get()
        .then((snapshot) => {
            document.querySelector('#welcomeUsername').innerHTML = snapshot.data().fname
        })
    document.querySelector('.ctx-hub-bg').style.height = "auto"
}

function getUserID(user) {
    users.get()
        .then((snapshot) => {
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

function switchSignUp(current) {
    let authBtn = document.querySelector('#authBtn')
    let authTitle = document.querySelector('#authTitle')
    let switcher = document.querySelector('#switcher')
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