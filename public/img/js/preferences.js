// Add event listener to the IMG that triggers input for file upload
document.querySelector('#uploadProfilePicture').addEventListener("click", () => {
    document.querySelector('#updateProfilePicture').click()
})

// Store the uploaded file into object
let file = {}

// Get the uploaded file and add to firebse under user s ID
function chooseProfilePic(e) {
    file = e.target.files[0]
    let user = firebase.auth().currentUser;
    firebase.storage().ref(`users/${user.uid}/profile.jpg`).put(file).then(() => {
        console.log("File uploaded")
        location.reload()
    }).catch(error => {
        console.log(error.message)
    })
}

// If logged in, assign users profile picture
firebase.auth().onAuthStateChanged(function(user){
    if (user) {
        firebase.storage().ref(`users/${user.uid}/profile.jpg`).getDownloadURL().then(imgUrl => {
            if (imgUrl) {
                document.querySelector('#uploadProfilePicture').src = imgUrl
            }
        })
    }
})