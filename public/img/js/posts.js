// Check for Data and log to console
firebase.auth().onAuthStateChanged(function(user){
    if(user) {
        firebase.firestore().collection('posts').orderBy("postedDate", "desc").limit(10).get().then(querySnapshot => {
            clearPosts()
            querySnapshot.forEach(doc => {
                let user = firebase.auth().currentUser
                let timePosted = formatDate(doc.data().postedDate)
                firebase.storage().ref(`users/${doc.data().postedByID}/profile.jpg`).getDownloadURL().then(imgUrl => {
                    firebase.storage().ref(`posts/${doc.data().postedByID}/${doc.id}/postPic.jpg`).getDownloadURL().then(postPic => {
                        renderPost(doc, user, timePosted, postPic, imgUrl) 
                    }).catch(() => {
                        renderPost(doc, user, timePosted, null, imgUrl)  
                    })
                })
            })
        })
    }
})

function addDeleteBtn(doc) {
    return `<i id="${doc}" onclick="deletePost(this.id)" class="fal fa-trash-alt post-edit-btn"></i>`
}

function addDeleteBtnComment(doc) {
    return `<i style="margin-top:15px" id="${doc}" onclick="deleteComment(this.id)" class="fal fa-trash-alt post-edit-btn"></i>`
}

function addEditBtn() {
    return `<i class="fal fa-pencil-alt post-edit-btn"></i>`
}

// Create and render existing posts
function clearPosts() {
    // Clear previously loaded posts
    let parent = document.querySelector('#posts')
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

// Create new post window
function createPost() {
    let user = firebase.auth().currentUser
    firebase.storage().ref(`users/${user.uid}/profile.jpg`).getDownloadURL().then(imgUrl => {
        renderCreatePost(imgUrl)
    }).catch(error => {
        renderCreatePost("img/default-user-icon.jpg")
    })
}

function renderCreatePost(imgUrl) {
    const postContainer = `
        <div class="ctx-post ctx-new-post" id="newPost">
            <div class="ctx-profile-img">
                <img src="${imgUrl}">
            </div>
            <div class="ctx-post-content">
                <input maxlength="40" class="start-post" type="text" id="postTitle" placeholder="Enter a title or topic for this post">
                <textarea maxlength="400" class="start-post" id="postContent" placeholder="What would you like to say?" contenteditable></textarea>
                <div class="ctx-post-img">
                    <img id="postPicPreview">
                </div>
                <input onchange="postPicPreview()" style="display:none" id="postUpload" type="file">
                <div class="post-actions likeComment">
                    <div onclick="document.querySelector('#postUpload').click()">
                        <i class="fal fa-image-polaroid"></i> Upload Photo
                    </div>
                    <div class="post-btn" onclick="sendPost()">
                        <i class="fal fa-paper-plane"></i>&nbsp;Post
                    </div>
                </div>
            </div>
        </div>
        `
    document.querySelector('#posts').insertAdjacentHTML('beforebegin', postContainer)
    document.querySelector('.ctx-background-blur').style.display = "block"
    document.querySelector('.ctx-background-blur').style.backdropFilter = "blur(4px)"
}

function postPicPreview() {
    let e = document.querySelector('#postUpload')
    var output = document.querySelector('#postPicPreview');
    output.src = URL.createObjectURL(e.files[0]);
    output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
    }
}

// Store the uploaded file into object
let postFile = {}

// Adds new post to the firebase and updates the page
function sendPost() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let ref = firebase.firestore().collection("posts").doc() // Get reference for Post ID
            firebase.firestore().collection("users").get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    let dbCheck = doc.data().email
                    if (dbCheck == user.email) {
                        postFile = document.querySelector('#postUpload').files[0]
                        if(postFile) { // CREATE POST WITH PHOTO
                            if(postFile.size < 2097152){
                                addPostToDB(ref, doc, user)

                                // Get the uploaded file and add to firebse under posts / user ID / post ID
                                firebase.storage().ref(`posts/${user.uid}/${ref.id}/postPic.jpg`).put(postFile).then(() => {
                                }).catch(error => {
                                    alert(error.message + ".. Please try again later.")
                                })
                                
                            } else {
                                alert("File is too big! Image must be less than 2MB");
                            }
                        } else { // CREATE POST WITHOUT PHOTO
                            addPostToDB(ref, doc, user)
                        }
                    }
                })
            })
        }
    });
}

function addPostToDB(ref, doc, user) {
    firebase.firestore().collection("posts").doc(`${ref.id}`).set({
        postTitle: document.querySelector('#postTitle').value,
        postContent: document.querySelector('#postContent').value,
        postedBy: `${doc.data().fname} ${doc.data().lname}`,
        postedDate: new Date().getTime() / 1000,
        postedByID: user.uid,
        posterID: doc.id,
        posterCompany: doc.data().company,
        likedBy: [],
    })
    removeCreatePost()
    clearPosts()
    document.querySelector('.ctx-background-blur').style.display = "none"
    firebase.firestore().collection("posts").orderBy("postedDate", "desc").limit(10).get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
        let user = firebase.auth().currentUser
            let timePosted = formatDate(doc.data().postedDate)
            firebase.storage().ref(`users/${doc.data().postedByID}/profile.jpg`).getDownloadURL().then(imgUrl => {
                firebase.storage().ref(`posts/${doc.data().postedByID}/${doc.id}/postPic.jpg`).getDownloadURL().then(postPic => {
                    renderPost(doc, user, timePosted, postPic, imgUrl) 
                }).catch(() => {
                    renderPost(doc, user, timePosted, null, imgUrl)  
                })
            })
        })
    })
}

// Removes the generated fields for creating a new post
function removeCreatePost() {
    document.querySelector('.ctx-background-blur').style.backdropFilter = "blur(0)"
    document.querySelector('.ctx-background-blur').style.display = "none"
    const container = document.querySelector('#newsFeed')
    const post = document.querySelector('#newPost')
    container.removeChild(post)
}

function renderPost(doc, user, timePosted, postPic, imgUrl) {
    // Load posts
    const postContainer = `
    <div class="ctx-post-wrapper" id="${doc.data().postedDate}">
        <div class="ctx-post">
            <div class="ctx-profile-img">
                <img id=${doc.id + 'profilepic'} src="img/default-user-icon.jpg">
                ${(doc.data().postedByID == user.uid)?addDeleteBtn(doc.id):""}
                &nbsp;
                <!--${(doc.data().postedByID == user.uid)?addEditBtn():""}-->
            </div>
            <div class="ctx-post-content">
                <div class="ctx-post-header">
                    <div class="ctx-user-post-details">
                        <span>${doc.data().postedBy}</span>
                        <span>${doc.data().posterCompany}</span>
                    </div>
                    <span>${timePosted}</span>
                </div>
                <div>
                    <h3>${doc.data().postTitle}</h3>
                    <p>${doc.data().postContent}</p>
                </div>
                ${(postPic != undefined)
                    ?`<div class="ctx-post-img"><a href='#${doc.id}lightbox'><img src="${postPic}"></a></div>
                    <a href="#" class="lightbox" id="${doc.id}lightbox"><img src="${postPic}"></a>`
                    :""}
                <div class="post-actions">
                    <div class="likesComments">
                        <div><p><span id=${doc.id + 'likes'}>0</span> Upvotes</p></div>
                        &nbsp;&nbsp;
                        <div><p><span id=${doc.id + 'comments'}>0</span> Comments</p></div>
                    </div>
                    <div class="likeComment">
                        <div onclick="startComment(${doc.data().postedDate}, event, '${doc.id}')">
                        <i class="fal fa-comment-dots"></i> Comment
                        </div>
                        <div style="margin: 0 0 0 30px;" id="${doc.id + 'liked'}" onclick="likePost('${doc.id}', event)">
                        <i class="fal fa-caret-circle-up"></i> Upvote
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    document.querySelector('#posts').insertAdjacentHTML('beforeend', postContainer)
    document.querySelector(`[id='${doc.id + "profilepic"}']`).src = imgUrl
    let mainPostDate = doc.data().postedDate

    // Get all likes on this post
    firebase.firestore().collection("posts").doc(doc.id).get().then(result => {
        let likes = result.data().likedBy
        document.querySelector(`[id='${doc.id}likes']`).innerHTML = likes.length
        if(likes.includes(user.email)) {
            document.querySelector(`[id='${doc.id}liked']`).innerHTML = `<i style="color:#e31936" class="fas fa-caret-circle-up"></i> Upvoted`
        }
    })

    // Get all comments on this post
    firebase.firestore().collection("posts").doc(doc.id).collection("comments").orderBy("commentDate", "desc").limit(4).get().then(snapshot => {
        let commentArr = []
        snapshot.docs.forEach(doc => {
            commentArr.push(doc.id)
            firebase.storage().ref(`users/${doc.data().commentByID}/profile.jpg`).getDownloadURL().then(imgUrl => {
                renderComment(mainPostDate, doc, imgUrl)
            }).catch(() => {
                let imgURL = "img/default-user-icon.jpg"
                renderComment(mainPostDate, doc, imgURL)
            })
        })
        document.querySelector(`[id='${doc.id}comments']`).innerHTML = commentArr.length
    })
}


// Deletes an existing post & it's comments, add's loading spinner while it processes
function deletePost(postID) {
    let user = firebase.auth().currentUser
    document.querySelector(`[id='${postID}']`).className = "fal fa-spinner fa-spin"
    firebase.firestore().collection("posts").doc(`${postID}`).get().then(result => {
        firebase.firestore().collection("posts").doc(`${postID}`).collection("comments").get().then(snapshot => {
            snapshot.docs.forEach(singleComment => {
                firebase.firestore().collection("posts").doc(`${postID}`).collection("comments").doc(`${singleComment.id}`).delete().then(() => {})
            })
            firebase.firestore().collection("posts").doc(`${postID}`).delete().then(() => {
                const container = document.querySelector('#posts')
                const post = document.querySelector(`[id="${result.data().postedDate}"]`)
                container.removeChild(post)
            })
            firebase.storage().ref().child(`users/${user.uid}/${postID}/postPic.jpg`).delete().then(() => {
                // File Deleted
            }).catch(() => {})
        })
    })
}

// Deletes an existing comment, add's loading spinner while it processes
function deleteComment(postID) {
    document.querySelector(`[id='${postID}']`).className = "fal fa-spinner fa-spin"
    firebase.firestore().collection("posts").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            firebase.firestore().collection("posts").doc(`${doc.id}`).collection("comments").doc(`${postID}`).delete().then(() => {
                document.querySelector(`[id='${postID}']`).parentElement.remove()
                console.log(postID)
                // Minus 1 to comment count
                let currentComments = document.querySelector(`[id='${postID}comments']`).innerHTML
                document.querySelector(`[id='${postID}comments']`).innerHTML = parseInt(currentComments) - 1
            }).catch(() => {})
        })
    })
}

function startComment(postTime, e, id) {
    let postID = id
    e.target.onclick = ""
    const post = document.querySelector(`[id="${postTime}"]`)
    const commentContainer =
    `<div class="ctx-comment-wrapper" id="${postID}comment">
        <div class="ctx-comment-wrapper ctx-comment-content" style="flex-direction: row;">
            <textarea maxlength="400" class="start-post" id="commentContent" placeholder="What would you like to say?" contenteditable></textarea>
            <div class="ctx-comment-post">
                <div class="post-btn" onclick="sendComment('${postTime}', '${postID}', '${postID}comment')">
                <i class="fal fa-paper-plane"></i>
                </div>
            </div>
        </div>
        <div class="ctx-profile-img">
            <img class="ctx-profile-img img comment-img" src="${document.querySelector('#uploadProfilePicture').src}">
        </div>
    </div>`
    post.insertAdjacentHTML('beforeend', commentContainer)
    //firebase.firestore().collection("posts").doc(postID.id).collection("comments").doc(`${postID.id}comments`).get().then((snapshot) => {
        //console.log(snapshot.data())
    //})
}

// Send comment to DB
function sendComment(postTime, postID, startCommentID) {
    let user = firebase.auth().currentUser
    // Add this comment data to the comments on this post
    firebase.firestore().collection("users").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            if (doc.data().email == user.email) {
                let thisUser = doc.data()
                // Get reference for Comment ID
                let ref = firebase.firestore().collection("posts").doc().collection("comments").doc()
                // Set reference for Comment
                firebase.firestore().collection("posts").doc(postID).collection("comments").doc(`${ref.id}`).set({
                    comment: document.querySelector('#commentContent').value,
                    commentBy: `${thisUser.fname} ${thisUser.lname}`,
                    commentDate: new Date().getTime() / 1000,
                    commentByID: user.uid
                })
                // Add 1 to comment count
                let currentComments = document.querySelector(`[id='${postID}comments']`).innerHTML
                document.querySelector(`[id='${postID}comments']`).innerHTML = parseInt(currentComments) + 1
                // Remove comment input container
                document.querySelector(`[id="${startCommentID}"]`).remove()
                firebase.firestore().collection("posts").doc(postID).collection("comments").get().then(snapshot => {
                    snapshot.docs.forEach(doc => {
                        if(doc.id == ref.id) {
                            firebase.storage().ref(`users/${doc.data().commentByID}/profile.jpg`).getDownloadURL().then(imgUrl => {
                                renderComment(postTime, doc, imgUrl)
                            }).catch(error => {
                                let imgURL = "img/default-user-icon.jpg"
                                renderComment(postTime, doc, imgURL)
                            })
                        }
                    })
                })
            }
        })
    })
}

function renderComment(postTime, postInfo, imgUrl) {
    const post = document.querySelector(`[id="${postTime}"]`)
    let user = firebase.auth().currentUser
    const comment =
    `<div class="ctx-comment-wrapper">
        ${(postInfo.data().commentByID == user.uid)?addDeleteBtnComment(postInfo.id):""}
        <div class="ctx-comment-wrapper ctx-comment-content">
            <div class="ctx-comment-header">
                <span style="font-weight:bold">${postInfo.data().commentBy}</span>
                <span>${formatDate(postInfo.data().commentDate)}</span>
            </div>
            <div style="margin-top:6px">
                <p>${postInfo.data().comment}</p>
            </div>
        </div>
        <div class="ctx-profile-img">
            <img class="ctx-profile-img img comment-img" src="${imgUrl}">
        </div>
    </div>`
    post.insertAdjacentHTML('beforeend', comment)
}

// Format the date posted on existing posts
function formatDate(postedDate) {
    //postedDate = String(postedDate).substring(18, 28)
    let currentDate = new Date()
    let currentSeconds = Math.floor(currentDate.getTime()/1000)
    let seconds = parseInt(currentSeconds) - parseInt(postedDate)
    // more that two days
    if (seconds > 2*24*3600) {
        return Math.floor(seconds/86400) + " days";
    }
    // a day
    if (seconds > 24*3600) {
        return "yesterday";
    }
    if (seconds > 7200) {
        return Math.floor(seconds/3600) + " hrs";
    }
    if (seconds > 3600) {
        return 1 + " hr";
    }
    if (seconds > 1800) {
        return "30 min";
    }
    if (seconds > 120) {
        return Math.floor(seconds/60) + " mins";
    }
    if (seconds > 60) {
        return "1 min";
    }
    if (seconds < 60) {
        return "just now";
    }
    //let date = new Date(doc.data().postedDate *1000)
}

// Likes a post
function likePost(id, e) {
    let user = firebase.auth().currentUser
    firebase.firestore().collection("posts").get(id).then((snapshot) => {
        snapshot.docs.forEach(doc => {
            if(doc.id == id) {
                firebase.firestore().collection("posts").doc(doc.id).get().then(result => {
                    if(!result.data().likedBy.includes(user.email)) { // Like Post
                        e.target.innerHTML = `<i style="color:#e31936" class="fas fa-caret-circle-up"></i> Upvoted`
                        firebase.firestore().collection("posts").doc(result.id).update({
                            likedBy: firebase.firestore.FieldValue.arrayUnion(user.email)
                        })
                        let currentLikes = document.querySelector(`[id='${doc.id}likes']`).innerHTML
                        document.querySelector(`[id='${doc.id}likes']`).innerHTML = parseInt(parseInt(currentLikes) + 1)
                    } else { // Unlike Post
                        e.target.innerHTML = `<i class="fal fa-caret-circle-up"></i> Upvote`
                        firebase.firestore().collection("posts").doc(result.id).update({
                            likedBy: firebase.firestore.FieldValue.arrayRemove(user.email)
                        })
                        let currentLikes = document.querySelector(`[id='${doc.id}likes']`).innerHTML
                        document.querySelector(`[id='${doc.id}likes']`).innerHTML = parseInt(parseInt(currentLikes) - 1)
                    }
                })
            }
        })
    })
}

// Comment on post
function commentPost() {
    
}