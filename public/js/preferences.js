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
        storage.ref()
            .child(`users`)
            .child(`${user.uid}`)
            .child(`profile.jpg`)
            .getDownloadURL()
            .then((file) => {
                document.querySelector('#uploadProfilePicture').src = file
                if (document.querySelector('#userPostProfileImg')) {
                    document.querySelector('#userPostProfileImg').src = document.querySelector('#uploadProfilePicture').src
                }
                    
        }).catch(() => {
            setTimeout(() => {
                document.querySelector('.ctx-popup-tip').style.display = "flex"
                document.querySelector('#profilePicToolTip').addEventListener("click", () => {
                    document.querySelector('#updateProfilePicture').click()
                })
            }, 1000);
        })
    }
})