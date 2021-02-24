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
    storage.ref(`users/${user.uid}/profile.jpg`)
        .put(file)
        .then(() => {
            console.log("File uploaded")
            location.reload()
    }).catch(error => {
        console.log(error.message)
    })
}

// If logged in, assign users profile picture
auth.onAuthStateChanged(function(user){
    if (user) {
        if (storage.ref(`users/${user.uid}/profile.jpg`).getDownloadURL()) {
            storage.ref(`users/${user.uid}/profile.jpg`).getDownloadURL()
                .then(imgUrl => {
                    document.querySelector('#uploadProfilePicture').src = imgUrl
                    document.querySelector('#userPostProfileImg').src = document.querySelector('#uploadProfilePicture').src
                })
        }
    }
})