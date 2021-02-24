// Declare globals
const db = firebase.firestore()
const storage = firebase.storage()
const auth = firebase.auth()
const posts = db.collection('posts')
const users = db.collection('users')
var currentUser

// Get data on initialise
auth.onAuthStateChanged(function(user){
    currentUser = auth.currentUser
    if(user) {
        posts.orderBy("postedDate", "desc")
            .limit(20)
            .get()
            .then(querySnapshot => {
                clearPosts()
                querySnapshot.forEach(doc => {
                    let timePosted = formatDate(doc.data().postedDate)
                    renderPost(doc, timePosted)
                })
            })
        }
        getNotifications()
        startPostStatic()
})

// Start writing post
function startPostStatic() {
    if (!document.querySelector('#startNewPost')) {
        const postContainer = `
            <div id="postCategories" class="ctx-post-categories">
                <div class="ctx-post-category ctx-category-selected" id="cat_everything" onclick="renderPostCategory('Everything', this.id)">All Posts</div>
                <div class="ctx-post-category" id="cat_esc" onclick="renderPostCategory('Erosion & Sediment Control', this.id)">Erosion & Sediment Control</div>
                <div class="ctx-post-category" id="cat_blockretaining" onclick="renderPostCategory('Block Retaining Systems', this.id)">Block Retaining Systems</div>
                <div class="ctx-post-category" id="cat_srp" onclick="renderPostCategory('Sediment Retention Ponds', this.id)">Sediment Retention Ponds</div>
                <div class="ctx-post-category" id="cat_pavements" onclick="renderPostCategory('Pavements', this.id)">Pavements</div>
                <div class="ctx-post-category" id="cat_slopestability" onclick="renderPostCategory('Slope Stability', this.id)">Slope Stability</div>
                <div class="ctx-post-category" id="cat_stormwater" onclick="renderPostCategory('Stormwater', this.id)">Stormwater</div>
                <div class="ctx-post-category" id="cat_paving" onclick="renderPostCategory('Permeable Paving', this.id)">Permeable Paving</div>
            </div>
            <div class="ctx-post ctx-new-post" id="startNewPost" style="z-index:1">
                <div class="ctx-profile-img">
                    <img id="userPostProfileImg" src="">
                </div>
                <div class="ctx-post-content" onclick="renderCreatePost()">
                <input maxlength="40" class="start-post" type="text" placeholder="Enter a title or topic to start a new post">
                </div>
            </div>
            `
        document.querySelector('#posts').insertAdjacentHTML('beforebegin', postContainer)
        
        document.querySelector('#userPostProfileImg').src = `img/default-user-icon.jpg`
        getProfilePic()
            .then((value) => {
                if (value) {
                    document.querySelector('#userPostProfileImg').src = `${value}`
                }
            })
    }
}

// Return Profile Pictures on Posts
const returnImages = async (doc) => {
    if (storage.ref(`users/${doc.data().postedByID}/profile.jpg`)) {
        return await storage.ref(`users/${doc.data().postedByID}/profile.jpg`).getDownloadURL()
    } else {
        return "img/default-user-icon.jpg"
    }
}


// Return users profile image
const getProfilePic = async () => {
    if (storage.ref(`users/${currentUser.uid}/profile.jpg`)) {
        return await storage.ref(`users/${currentUser.uid}/profile.jpg`).getDownloadURL()
    } else {
        return "img/default-user-icon.jpg"
    }
}

// Return Profile Picture on Comments
const returnCommentPic = async (doc) => {
    if (storage.ref(`users/${doc.data().commentByID}/profile.jpg`)) {
        return await storage.ref(`users/${doc.data().commentByID}/profile.jpg`).getDownloadURL()
    }
}

// Return Pictures posted on Posts
const returnPostPic = async (doc) => {
    return await storage.ref(`posts/${doc.data().postedByID}/${doc.id}/postPic.jpg`).getDownloadURL()
}

// Load posts
function renderPost(doc, timePosted) {
    const postData = doc.data()
    // Inline HTML
    const postContainer = `
        <div class="ctx-post-wrapper" id="POST${doc.id}">
            <div class="ctx-post">
                <div class="ctx-profile-img">
                    <img id=${doc.id + 'profilepic'} src="img/default-user-icon.jpg">
                    <div class="post-edit-options">
                        ${(postData.postedByID == currentUser.uid)?addDeleteBtn(doc.id):""}
                        <!--${(postData.postedByID == currentUser.uid)?addEditBtn():""}-->
                    </div>
                </div>
                <div class="ctx-post-content" id=POSTBODY${doc.id}>
                    <div class="ctx-post-header">
                        <div class="ctx-user-post-details">
                            <span>${postData.postedBy}</span>
                            <span>${postData.posterCompany}</span>
                        </div>
                        <span>${timePosted}</span>
                    </div>
                    <div>
                        <h3>${postData.postTitle}</h3>
                        <p>${ // Detect URLs in post content
                            anchorme({
                                input: postData.postContent,
                                // use some options
                                options: {
                                attributes: {
                                    target: "_blank",
                                    class: "detected"
                                }
                                },
                                // and extensions
                                extensions: [
                                // an extension for hashtag search
                                {
                                    test: /#(\w|_)+/gi,
                                    transform: string =>
                                    `<a href="https://a.b?s=${string.substr(1)}">${string}</a>`
                                },
                                // an extension for mentions
                                {
                                    test: /@(\w|_)+/gi,
                                    transform: string =>
                                    `<a href="https://a.b/${string.substr(1)}">${string}</a>`
                                }
                                ]
                            })
                        }</p>
                        ${(postData.tagged != "")?`<p class="add-tag">@${postData.tagged}</p>`:""}
                    </div>
                    ${(postData.postImg == true) ? 
                    `<!-- Post Image -->
                        <div class="ctx-post-img" id="postImgContainer${doc.id}">
                            <div onclick="openLightbox('LIGHTBOX${doc.id}')">
                                <div class="ctx-post-img-wrapper">
                                    <img id="postImg${doc.id}" src="">
                                </div>
                            </div>
                        </div>
                        <div class="lightbox" onclick="closeLightbox(this.id)" id="LIGHTBOX${doc.id}"><img id="LIGHTBOXIMG${doc.id}" src=""></div>
                    <!-- End Post Image -->`
                    : ""
                    }
                    <div class="post-actions">
                        <div class="likesComments">
                            <div><p><span id="likes${doc.id}">0</span> Upvotes</p></div>
                            &nbsp;&nbsp;
                            <div><p><span id="comments${doc.id}">0</span> Comments</p></div>
                        </div>
                        <div class="likeComment">
                            <div onclick="startComment('${doc.id}')">
                            <i class="fad fa-comment-lines"></i> Comment
                            </div>
                            <div style="margin: 0 0 0 10px;" id="${doc.id}liked" onclick="likePost('${doc.id}', event)">
                            <i class="fad fa-thumbs-up"></i> Upvote
                            </div>
                        </div>
                    </div>
                    <div id="COMMENTCONTAINER${doc.id}"></div>
                </div>
            </div>
        </div>
    `
    document.querySelector('#posts').insertAdjacentHTML('beforeend', postContainer)

    // Get profile images
    document.querySelector(`[id='${doc.id + "profilepic"}']`).src = `img/default-user-icon.jpg`
    returnImages(doc)
        .then((value) => {
            if (value) {
                document.querySelector(`[id='${doc.id + "profilepic"}']`).src = value
            }
        })

    // Get post images
    if (postData.postImg) {
        returnPostPic(doc)
            .then((value) => {
                if(value) {
                    document.querySelector(`#postImgContainer${doc.id}`).style.display = "block"
                    document.querySelector(`#postImg${doc.id}`).src = value
                    document.querySelector(`#LIGHTBOXIMG${doc.id}`).src = value
                }
            })
    }

    // Get all likes on this post
    posts.doc(doc.id)
        .get()
        .then(result => {
            let likes = result.data().likedBy
            document.querySelector(`[id='likes${doc.id}']`).innerHTML = likes.length
            if(likes.includes(currentUser.email)) {
                document.querySelector(`[id='${doc.id}liked']`).innerHTML = `<i style="color:#e31936" class="fad fa-thumbs-up"></i> Upvoted`
            }
        })

    let postID = doc.id
    fetchComments(postID)
    
}

function addDeleteBtn(doc) {
    return `<i id="${doc}" onclick="deletePost(this.id)" class="fad fa-trash-alt post-edit-btn"></i>`
}

function addDeleteBtnComment(commentID, originalPostID) {
    return `<i style="margin-top:15px" id="${commentID}" onclick="deleteComment('${commentID}', '${originalPostID}')" class="fad fa-trash-alt post-edit-btn"></i>`
}

function addEditBtn() {
    return `<i class="fad fa-pencil post-edit-btn"></i>`
}

function openLightbox(id) {
    document.querySelector(`#${id}`).style.display = "flex"
}

function closeLightbox(id) {
    document.querySelector(`#${id}`).style.display = "none"
}

// Create and render existing posts
function clearPosts() {
    // Clear previously loaded posts
    let parent = document.querySelector('#posts')
    while(parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

function renderCreatePost() {
    document.querySelector('#startNewPost').style.display = "none"
    const postContainer = `
        <div class="ctx-post ctx-new-post" id="newPost">
            <div class="ctx-profile-img">
                <img id="userProfileImg" src="">
            </div>
            <div class="ctx-post-content">
                <input maxlength="40" class="start-post" type="text" id="postTitle" placeholder="Enter a title or topic for this post">
                <textarea maxlength="400" oninput="autoGrow(this)" class="start-post" id="postContent" placeholder="What would you like to say?" contenteditable></textarea>
                <input type="text" class="tag-post" autocomplete="off" onkeyup="searchTag(this.value)" id="tagging" placeholder="Type the name of someone to tag" style="display:none">
                <div class="tag-popup" id="userTagPopup" style="display:none"></div>
                <div class="ctx-post-img" style="display:none">
                    <div class="ctx-post-img-wrapper">
                        <img id="postPicPreview">
                    </div>
                </div>
                <input onchange="postPicPreview()" style="display:none" id="postUpload" type="file">
                <div class="post-actions likeComment post-creation">
                    <section class="ctx-post-options">
                        <div id="uploadPhoto" onclick="document.querySelector('#postUpload').click()">
                            <i class="fad fa-image-polaroid"></i>&nbsp;Upload Photo
                        </div>
                        <div onclick="postTagging()">
                            <i class="fad fa-at"></i>&nbsp;Tag Someone
                        </div>
                    </section>
                    <div class="post-btn" onclick="sendPost()">
                        <i class="fad fa-paper-plane"></i>&nbsp;Post
                    </div>
                </div>
            </div>
        </div>
        `
    document.querySelector('#posts').insertAdjacentHTML('beforebegin', postContainer)
    document.querySelector('#postTitle').focus()

    // Get profile Pic
    document.querySelector('#userProfileImg').src = `img/default-user-icon.jpg`
    getProfilePic()
        .then((value) => {
            if (value) {
                
            }
        }).catch(err => {console.log(err)})

    document.querySelector('.ctx-background-blur').style.display = "block"
    document.querySelector('.ctx-background-blur').style.backdropFilter = "blur(4px)"
}

// Expand textarea fields when more lines are added
function autoGrow(element) {
    element.style.height = "10px";
    element.style.height = (element.scrollHeight)+"px";
}

// Show preview of picture uploaded to posts
function postPicPreview() {
    let e = document.querySelector('#postUpload')
    var output = document.querySelector('#postPicPreview');
    output.src = URL.createObjectURL(e.files[0]);
    output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
    }
    document.querySelector('#uploadPhoto').innerHTML = `<i class="fad fa-image-polaroid"></i>&nbsp;Change Photo`
    document.querySelector('.ctx-post-img').style.display = "block"
}

function postTagging() {
    let tagInput = document.querySelector('#tagging')
    tagInput.style.display = "block"
}

let userTagged = ""

// Search users, display tooltip of the user matching input
function searchTag(value) {
    let tagInput = document.querySelector('#tagging')
    let tagPopup = document.querySelector('#userTagPopup')

    users.get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                let userData = doc.data()
                let taggedUserName = `${userData.fname} ${userData.lname}`
                let taggedUserEmail = userData.email
                if (taggedUserName.toLowerCase().includes(value.toLowerCase())) {
                    tagInput.style.color = "#222"
                    tagInput.classList.remove('add-tag')
                    tagPopup.style.display = "block"
                    tagPopup.innerHTML = taggedUserName
                    tagPopup.onclick = () => {
                        tagPopup.style.display = "none"
                        tagInput.value = taggedUserName
                        tagInput.classList.add('add-tag')
                        userTagged = taggedUserEmail
                    }
                }
            })
    })
}

// Store the uploaded file into object
let postFile = {}

// Adds new post to the firebase and updates the page
function sendPost() {
    auth.onAuthStateChanged(() => {
        if (currentUser) {
            let ref = posts.doc() // Get reference for Post ID
            let tag = ""
            if (document.querySelector('#tagging').value != "") {
                tag = document.querySelector('#tagging').value
                sendTagNotification(userTagged, ref, currentUser)
            }
            let postContent = document.querySelector('#postContent').value
            let cat = categorisePost(postContent)
            let img = false
            users.get()
                .then((snapshot) => {
                    snapshot.docs.forEach(doc => {
                        let dbCheck = doc.data().email
                        if (dbCheck == currentUser.email) {
                            postFile = document.querySelector('#postUpload').files[0]
                            if (postFile) { // CREATE POST WITH PHOTO
                                if (postFile.size < 2097152) {
                                    // Get the uploaded file and add to firebse under posts / user ID / post ID
                                    storage.ref(`posts/${currentUser.uid}/${ref.id}/postPic.jpg`).put(postFile)
                                        .then(() => {
                                            img = true
                                            addPostToDB(ref, doc, tag, cat, img)
                                        })
                                } else {
                                    alert("File is too big! Image must be less than 2MB");
                                }
                            } else { // CREATE POST WITHOUT PHOTO
                                addPostToDB(ref, doc, tag, cat, img)
                            }
                        }
                    })
            })
        }
    })
}

function addPostToDB(ref, doc, tag, cat, img) {
    posts.doc(`${ref.id}`)
        .set({
            postTitle: document.querySelector('#postTitle').value,
            postContent: document.querySelector('#postContent').value,
            postedBy: `${doc.data().fname} ${doc.data().lname}`,
            postedDate: new Date().getTime() / 1000,
            postedByID: currentUser.uid,
            posterID: doc.id,
            posterCompany: doc.data().company,
            likedBy: [],
            tagged: tag,
            category: cat,
            postImg: img
        })
    removeCreatePost()
    clearPosts()
    document.querySelector('.ctx-background-blur').style.display = "none"
    posts.orderBy("postedDate", "desc")
        .limit(20)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                let timePosted = formatDate(doc.data().postedDate)
                renderPost(doc, timePosted)
            })
        })
}

// Category detection keywords
let industryCats = {
    cat_esc: ["Erosion & Sediment Control", "esc", "erosion", "sediment", "siltfence", "filterpod", "cesspit", "fence", "silt", "envirohemp", "spill kit", "envirosieve", "silt curtain", "turbidity curtain", "coir log", "filter bag", "filter pod", "sandbag", "sand bag", "sandbags", "silt socks", "siltsock", "silt sock", "sock", "barrier mesh", "biocoir", "biowool", "ecomat", "hessian", "enviroforce"],
    cat_stormwater: ["Stormwater", "stormwater", "drainage", "subsurface", "triton", "rainsmart", "drain", "draincell", "smartsoak", "vault", "chambers", "chamber system", "stormwater modules"],
    cat_pavements: ["Pavements", "roading", "pavement", "pavements", "duragrid", "geogrid", "stratagrid", "geoter", "road", "asphalt", "tenax", "tenax 3d", "tenax3d", "gridtex"],
    cat_blockretaining: ["Block Retaining Systems", "allan", "block", "allanblock", "magnumstone", "magnum stone", "rocklok", "rocklock", "block retaining", "sleeveit", "sleeve it", "sleeve-it", "concrete block", "segmental", "gravity wall", "gravity system"],
    cat_srp: ["Sediment Retention Ponds", "sediment retention pond", "srp", "pond", "decant", "flocbox", "floc box", "flocshed", "floc", "floc shed", "portafloc", "porta floc", "dosing", "danline", "ctmp", "anti seep", "anti-seep", "pac", "chemical treatment", "polyaluminium", "dewatering", "decanting"],
    cat_slopestability: ["Slope Stability", "slope stability", "anchors", "anchor", "platipus", "args", "civil anchors", "t-recs", "trecs", "platidrain", "plati-drain", "plati", "duramat", "shearlock", "shear lock", "rockfall"],
    cat_paving: ["Permeable Paving", "permeable", "paving", "surepave", "sure pave", "aluexcel", "sureflex", "sure flex", "porous", "grass protection"]
}

// Categorise post based on content
function categorisePost(postContent) {
    let industries = Object.entries(industryCats)
    let cats = ["Everything", ]

    for(i = 0; i < industries.length; i++) {
        let list = industries[i][1]
        for(x = 0; x < list.length; x++) {
            if (postContent.toLowerCase().includes(list[x])) {
                if (!cats.includes(industries[i][1][0])) {
                    cats.push(industries[i][1][0])
                }
            }
        }
    }
    return cats
}

// Set default category
let currentCategory = "Everything"

// Load posts by selected category
function renderPostCategory(selectedCategory, highlightedCategory) {
    currentCategory = selectedCategory
    let postCatParent = document.querySelector('#postCategories')
    for (i = 0; i < postCatParent.children.length; i++) {
        postCatParent.children[i].classList.remove('ctx-category-selected')
    }
    document.querySelector(`#${highlightedCategory}`).classList.add('ctx-category-selected')
    clearPosts()
    posts.orderBy("postedDate", "desc")
        .limit(20)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const postData = doc.data()
                if (postData.category.includes(selectedCategory)) {
                    let timePosted = formatDate(postData.postedDate)
                    renderPost(doc, timePosted)
                    return;
                } else {
                    let warning = `<p class="ctx-unmatched-filter">No posts matched your filter type. Try a different filter.</p>`
                    //document.querySelector('#posts').insertAdjacentHTML('afterbegin', warning)
                    return;
                }
            })
        })
}

// Load notification for tagged user
function renderPostNotification(postID) {
    // Unselect all post categories when rendering the notification
    let postCatParent = document.querySelector('#postCategories')
    for (i = 0; i < postCatParent.children.length; i++) {
        postCatParent.children[i].classList.remove('ctx-category-selected')
    }
    // Clear all posts from timeline
    clearPosts()
    //document.querySelector('.ctx-background-blur').style.display = "none"
    // Render notification post
    posts.orderBy("postedDate", "desc")
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                if (doc.id == postID) {
                    let timePosted = formatDate(doc.data().postedDate)
                    renderPost(doc, timePosted)
                    document.querySelector(`#POST${postID}`).children[0].children[0].style.zIndex = "11"
                    document.querySelector(`#POST${postID}`).children[0].children[1].style.zIndex = "11"
                    setTimeout(() => {
                        document.querySelector('.ctx-background-blur').style.display = "block"
                    }, 500)
                    return;
                }
            })
    })
}

// Removes the generated fields for creating a new post
function removeCreatePost() {
    document.querySelector('#startNewPost').style.display = "flex"
    document.querySelector('.ctx-background-blur').style.backdropFilter = "blur(0)"
    document.querySelector('.ctx-background-blur').style.display = "none"
    const container = document.querySelector('#newsFeed')
    const post = document.querySelector('#newPost')
    container.removeChild(post)
}

// Deletes an existing post & it's comments, add's loading spinner while it processes
function deletePost(postID) {
    document.querySelector(`[id='${postID}']`).className = "fad fa-spinner fa-spin"
    posts.doc(`${postID}`)
        .get()
        .then(result => {
            posts.doc(`${postID}`)
                .collection("comments")
                .get()
                .then(snapshot => {
                    snapshot.docs.forEach(singleComment => {
                        // Delete post comments
                        posts.doc(`${postID}`).collection("comments").doc(`${singleComment.id}`)
                            .delete()
                            .then(() => {})
                    })
                    // Delete parent post
                    posts.doc(`${postID}`)
                        .delete()
                        .then(() => {
                            // Remove post from front end
                            const container = document.querySelector('#posts')
                            const post = document.querySelector(`[id="POST${result.id}"]`)
                            container.removeChild(post)
                    })
                    // Delete any associated post image
                    storage.ref().child(`posts/${currentUser.uid}/${postID}/postPic.jpg`).delete().then(() => {})
                })
        })

    // Delete notifications associated with the post
    posts.get()
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                const postData = doc.data()
                if (doc.id == postID) {
                    let personTagged = postData.tagged
                    users.get()
                        .then((snapshot) => {
                        snapshot.docs.forEach(doc => {
                            if (`${postData.fname} ${postData.lname}` == personTagged) {
                                personTagged = doc.id
                                users.doc(doc.id).collection("notifications")
                                    .get()
                                    .then((snapshot) => {
                                    snapshot.docs.forEach(doc => {
                                        let notificationID = postData
                                        if (notificationID.postID.id == postID) {
                                            users.doc(`${personTagged}`).collection("notifications").doc(`${doc.id}`)
                                                .delete()
                                                .then(() => {})
                                        }
                                    })
                                })
                            }
                        })
                    })
                }
            })
        })
}

// COMMENT FUNCTIONS //

function startComment(id) {
    if (document.getElementById(`#${id}comment`) == null) {
        const post = document.querySelector(`#COMMENTCONTAINER${id}`)
        const commentContainer =`
        <div class="ctx-comment-wrapper" id="${id}comment">
            <div class="ctx-comment-wrapper ctx-comment-content" style="flex-direction: row;">
                <textarea maxlength="400" oninput="autoGrow(this)" class="start-post" id="${id}commentContent" placeholder="What would you like to say?" contenteditable></textarea>
                <div class="ctx-comment-post">
                    <div class="post-btn" onclick="sendComment('${id}', '${id}comment')">
                    <i class="fad fa-paper-plane"></i>
                    </div>
                </div>
            </div>
            <div class="ctx-profile-img">
                <img class="ctx-profile-img img comment-img" src="${document.querySelector('#uploadProfilePicture').src}">
            </div>
        </div>`
        post.insertAdjacentHTML('beforebegin', commentContainer)
    }
}

// Send comment to DB
function sendComment(postID, startCommentID) {
    // Add this comment data to the comments on this post
    users.get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                if (doc.data().email == currentUser.email) {
                    let thisUser = doc.data()
                    // Get reference for Comment ID
                    let ref = posts.doc().collection("comments").doc()
                    // Set reference for Comment
                    posts.doc(postID)
                        .collection("comments")
                        .doc(`${ref.id}`)
                        .set({
                            comment: document.querySelector(`#${postID}commentContent`).value,
                            commentBy: `${thisUser.fname} ${thisUser.lname}`,
                            commentDate: new Date().getTime() / 1000,
                            commentByID: currentUser.uid
                        })
                    // Add 1 to comment count
                    let currentComments = document.querySelector(`#comments${postID}`).innerHTML
                    document.querySelector(`#comments${postID}`).innerHTML = parseInt(currentComments) + 1
                    // Remove comment input container
                    document.querySelector(`[id="${startCommentID}"]`).remove()

                    posts.doc(postID)
                        .collection("comments")
                        .orderBy("commentDate", "desc")
                        .get()
                        .then(snapshot => {
                            snapshot.docs.forEach(doc => {
                                let postID = doc.ref.parent.parent.id
                                if(doc.id == ref.id) {
                                    renderComment( doc, postID)
                                }
                            })
                        })
                }
            })
        })
}

function renderComment(postInfo, postID) {
    const post = document.querySelector(`#COMMENTCONTAINER${postID}`)
    const comment = `
        <div class="ctx-comment-wrapper">
            ${(postInfo.data().commentByID == currentUser.uid)?addDeleteBtnComment(postInfo.id, postID):""}
            <div class="ctx-comment-wrapper ctx-comment-content">
                <div class="ctx-comment-header">
                    <span style="font-weight:bold">${postInfo.data().commentBy}</span>
                    <span>${formatDate(postInfo.data().commentDate)}</span>
                </div>
                <div style="margin-top:6px">
                    <p>${ // Detect URLs in comment content
                        anchorme({
                            input: postInfo.data().comment,
                            // use some options
                            options: {
                            attributes: {
                                target: "_blank",
                                class: "detected"
                            }
                            },
                            // and extensions
                            extensions: [
                            // an extension for hashtag search
                            {
                                test: /#(\w|_)+/gi,
                                transform: string =>
                                `<a href="https://a.b?s=${string.substr(1)}">${string}</a>`
                            },
                            // an extension for mentions
                            {
                                test: /@(\w|_)+/gi,
                                transform: string =>
                                `<a href="https://a.b/${string.substr(1)}">${string}</a>`
                            }
                            ]
                        })
                    }</p>
                </div>
            </div>
            <div class="ctx-profile-img">
                <img class="ctx-profile-img img comment-img" id="profilePic${postInfo.id}" src="img/default-user-icon.jpg">
            </div>
        </div>
    `

    // Get profile images
    returnCommentPic(postInfo)
        .then((value) => {
            document.querySelector(`#profilePic${postInfo.id}`).src = value
        })

    post.insertAdjacentHTML('beforeend', comment)
}

// Delete an existing comment
function deleteComment(commentID, postID) {
    // Add loading spinner
    document.querySelector(`[id="${commentID}"]`).className = "fad fa-spinner fa-spin"
    posts.get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                posts.doc(`${doc.id}`).collection("comments").doc(`${commentID}`)
                    .delete()
                    .then(() => {
                        // Remove the comment from front end
                        document.querySelector(`[id="${commentID}"]`).parentElement.remove()
                        // Minus 1 to comment count
                        let currentComments = document.querySelector(`#comments${postID}`).innerHTML
                        document.querySelector(`#comments${postID}`).innerHTML = parseInt(currentComments) - 1
                        return;
                })
            })
        })
}

function fetchComments(postID) {
    // Get all comments on this post
    return posts.doc(postID)
        .collection("comments")
        .orderBy("commentDate", "desc")
        .limit(3)
        .get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                renderComment(doc, postID)
            })
            getCommentCount(postID)
        })
}

function getCommentCount(postID) {
    posts.doc(postID)
        .collection("comments")
        .orderBy("commentDate", "desc")
        .get()
        .then(snapshot => {
            document.querySelector(`#comments${postID}`).innerHTML = snapshot.docs.length

            let post = document.querySelector(`#COMMENTCONTAINER${postID}`)
            let renderedLength = post.children.length
            
            // Insert "Load more comments" button
            if (snapshot.docs.length > renderedLength) {
                const moreComments = `
                    <div id="loadComments${postID}" onclick="loadMoreComments('${postID}')" class="ctx-load-comments">
                        <a>Load more comments</a>
                    </div>
                `
                post.insertAdjacentHTML('beforeend', moreComments)
            }
        })
}

// Load more comments on this post
function loadMoreComments(postID) {
    let post = document.querySelector(`#COMMENTCONTAINER${postID}`)
    let renderedLength = post.children.length - 1

    // Reference the comment thread
    const lastDoc = posts.doc(postID)
        .collection("comments")
        .orderBy("commentDate", "desc")
        .limit(renderedLength)

    // Find the last comment in the currently rendered thread, use that as a start point to load 5 more comments
    return lastDoc.get().then((snapshotDoc) => {
        
        let lastComment = snapshotDoc.docs[snapshotDoc.docs.length - 1]

        const next = posts.doc(postID)
            .collection("comments")
            .orderBy("commentDate", "desc")
            .startAfter(lastComment)
            .limit(3)

        next.get()
            .then(snapshot => {
                snapshot.docs.forEach(doc => {
                    renderComment(doc, postID)
                })
            })

        // Remove "Load more comments" button
        let loadCommentsBtn = document.querySelector(`#loadComments${postID}`)
        post.removeChild(loadCommentsBtn)

        getCommentCount(postID)
    })
    
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
    posts.get(id)
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                if(doc.id == id) {
                    posts.doc(doc.id)
                        .get()
                        .then(result => {
                            if(!result.data().likedBy.includes(currentUser.email)) { // Like Post
                                e.target.innerHTML = `<i style="color:#e31936" class="fad fa-thumbs-up"></i> Upvoted`
                                posts.doc(result.id).update({
                                    likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.email)
                                })
                                let currentLikes = document.querySelector(`[id='likes${doc.id}']`).innerHTML
                                document.querySelector(`[id='likes${doc.id}']`).innerHTML = parseInt(parseInt(currentLikes) + 1)
                            } else { // Unlike Post
                                e.target.innerHTML = `<i class="fad fa-thumbs-up"></i> Upvote`
                                posts.doc(result.id).update({
                                    likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.email)
                                })
                                let currentLikes = document.querySelector(`[id='likes${doc.id}']`).innerHTML
                                document.querySelector(`[id='likes${doc.id}']`).innerHTML = parseInt(parseInt(currentLikes) - 1)
                            }
                        })
                }
            })
        })
}