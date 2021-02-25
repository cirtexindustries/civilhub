// Set default category
let currentCategory = "Everything"
let selectedCategory = "cat_everything"
let filter = "postedDate" // postedDate, likedBy
let order = "desc" // asc, desc

// Get data on initialise
auth.onAuthStateChanged(function(user){
    currentUser = auth.currentUser
    if(user) {
        posts.orderBy(filter, order)
            .where("category", "array-contains", `${currentCategory}`)
            .limit(4)
            .get()
            .then(querySnapshot => {
                clearPosts()
                querySnapshot.forEach(doc => {
                    let timePosted = formatDate(doc.data().postedDate)
                    renderPost(doc, timePosted)
                })

                let postContainer = document.querySelector('#posts')
                let renderedLength = postContainer.children.length - 1

                // Insert "Load more posts" button
                if (querySnapshot.docs.length > renderedLength) {
                    const morePosts = `
                        <div id="loadPosts" onclick="loadMorePosts()" class="ctx-load-posts">
                            <a>Load more posts</a>
                        </div>
                    `
                    postContainer.insertAdjacentHTML('beforeend', morePosts)
                }
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
                <div class="ctx-scroll-fade"></div>
            </div>
            <div class="ctx-post-categories">
                <p style="margin-right:10px">Filter posts</p>
                <div class="ctx-dropdown-wrapper">
                    <select id="filterPostType">
                        <option value="postedDate">Newest First</option>
                        <option value="likedBy">Top Votes</option>
                    </select>
                </div>
                <div class="ctx-dropdown-wrapper">
                    <select id="filterPostOrder">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>
            <div class="ctx-post ctx-new-post" id="startNewPost" style="z-index:1">
                <div class="ctx-profile-img">
                    <img id="userPostProfileImg" src="public/img/default-user-icon.jpg">
                </div>
                <div class="ctx-post-content" onclick="renderCreatePost()">
                <input maxlength="40" class="start-post ctx-post-inputs" type="text" placeholder="Start a discussion or ask a question">
                </div>
            </div>
            `
        document.querySelector('#posts').insertAdjacentHTML('beforebegin', postContainer)

        document.querySelector('#filterPostType').addEventListener("change", (event) => {
            let selection = event.target.value
            filter = selection
            order = "desc"
            if (selection == "likedBy") {
                order = "asc"
            }
            renderPostCategory(currentCategory, selectedCategory)
        })

        document.querySelector('#filterPostOrder').addEventListener("change", (event) => {
            let selection = event.target.value
            order = selection
            renderPostCategory(currentCategory, selectedCategory)
        })
    }
}

// Return Profile Pictures on Posts
const returnImages = async (doc) => {
    if (storage.ref(`users/${doc.data().postedByID}`)) {
        return await storage.ref(`users/${doc.data().postedByID}/profile.jpg`).getDownloadURL()
    }
}

// Return users profile image
const getProfilePic = async () => {
    if (storage.ref(`users/${currentUser.uid}`)) {
        return await storage.ref(`users/${currentUser.uid}/profile.jpg`).getDownloadURL()
    }
}

// Return Profile Picture on Comments
const returnCommentPic = async (doc) => {
    if (storage.ref(`users/${doc.data().commentByID}`)) {
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
            <div class="ctx-post" id="${doc.id}">
                <div class="ctx-profile-img">
                    <img id=${doc.id + 'profilepic'} src="public/img/default-user-icon.jpg">
                    <div class="likesComments">
                        <div><p><span id="likes${doc.id}">0</span> Upvotes</p></div>
                        <div><p><span id="comments${doc.id}">0</span> Replies</p></div>
                    </div>
                </div>
                <div class="ctx-post-content" id=POSTBODY${doc.id}>
                    <div class="ctx-post-header">
                        <div class="ctx-user-post-details">
                            <span>${postData.postedBy}</span>
                            <span>${postData.posterCompany}</span>
                        </div>
                        <div class="ctx-post-details">
                            ${(postData.postedByID == currentUser.uid)
                                ?`<i class="far fa-ellipsis-h icon-clickable" id="POSTELLIPSES${doc.id}"></i>
                                    <div class="ctx-post-dropdown" style="display:none" id="POSTOPTIONS${doc.id}">
                                        <div class="ctx-dropdown-option" onclick="editSinglePost('${doc.id}')">
                                            <i class="fad fa-pencil"></i> Edit Post
                                        </div>
                                        <div class="ctx-dropdown-option" onclick="deletePost(${doc.id})">
                                            <i class="fad fa-trash"></i> Delete Post
                                        </div>
                                    </div>`
                                :`<i class="far fa-ellipsis-h icon-clickable" id="POSTELLIPSES${doc.id}"></i>
                                    <div class="ctx-post-dropdown" style="display:none" id="POSTOPTIONS${doc.id}">
                                        <div class="ctx-dropdown-option" onclick="reportPost('${doc.id}')">
                                            <i class="fad fa-comment-alt-exclamation"></i> Report Post
                                        </div>
                                    </div>
                                `}

                            <span>${timePosted}</span>
                        </div>
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
                    <div class="post-actions ctx-post-reactions">
                        <div class="likeComment">
                            <div onclick="startComment('${doc.id}')">
                            <i class="fad fa-comment-lines"></i> Reply to Post
                            </div>
                            <div style="margin: 0 0 0 10px;" id="${doc.id}liked" onclick="likePost('${doc.id}', event)">
                            <i class="fad fa-thumbs-up"></i> Upvote Post
                            </div>
                        </div>
                    </div>
                    <div id="COMMENTCONTAINER${doc.id}"></div>
                </div>
            </div>
        </div>
    `
    document.querySelector('#posts').insertAdjacentHTML('beforeend', postContainer)
    
    // Handle opening menu for editing etc
    document.querySelector(`#POSTELLIPSES${doc.id}`).addEventListener("click", () => { 
        const comment = document.querySelector(`#POSTOPTIONS${doc.id}`)
        if (comment.style.display == "none") {
            comment.style.display = "flex"
        } else {
            comment.style.display = "none"
        }
    })

    // Get profile images
    let profilePic = document.querySelector(`[id='${doc.id + "profilepic"}']`)
    profilePic.src = `public/img/default-user-icon.jpg`
    returnImages(doc)
        .then((value) => {
            if (value) {
                profilePic.src = value
            }
        }).catch(() => {
            profilePic.src = `public/img/default-user-icon.jpg`
        })

    // Get post images
    if (postData.postImg) {
        document.querySelector(`#postImg${doc.id}`).src = `public/img/blank.jpg`
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
                <img id="userProfileImg" src="${document.querySelector('#uploadProfilePicture').src}">
            </div>
            <div class="ctx-post-content">
                <input maxlength="40" class="start-post ctx-post-inputs" type="text" id="postTitle" autocomplete="off" placeholder="Enter a title or topic for this post">
                <textarea maxlength="400" oninput="autoGrow(this)" class="start-post ctx-post-inputs" autocomplete="off" id="postContent" placeholder="What would you like to say?" contenteditable></textarea>
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

    document.querySelector('.ctx-background-blur').style.display = "block"
    document.querySelector('.ctx-background-blur').style.backdropFilter = "blur(4px)"
}

// Expand textarea fields when more lines are added
function autoGrow(element) {
    element.style.height = "10px"
    element.style.height = (element.scrollHeight) + "px"

    // Tagging in posts

    let content = element.value
    let tag = content.split(" ")

    if (element.value.includes("@")) {
        for (i = 0; i < tag.length; i++) {
            if (tag[i].includes('@')) {
                let tagName = tag[i].replace("@","")
    
                const tagBody = `
                    <div class="ctx-user-tagged">
                        <img id="taggedUserImg" src="">
                        <p id="taggedUserName"></p>
                    </div>
                `
            
                const loader = `
                    <i class="fad fa-spinner fa-spin"></i>
                `

                const tagPopup = document.querySelector('#postUserTagPopup')
                tagPopup.style.display = "block"
                tagPopup.innerHTML = loader
    
                if (tagName.length >= 4) {
                    users.get()
                        .then(snapshot => {
                            snapshot.docs.forEach(doc => {
                                let userData = doc.data()
                                let taggedUserName = `${userData.fname} ${userData.lname}`
                                let taggedUserEmail = userData.email
                                let taggedUserID = userData.id
                                if (taggedUserName.toLowerCase().includes(tagName.toLowerCase())) {
                                    tagPopup.style.display = "block"
                                    tagPopup.innerHTML = tagBody
                                    document.querySelector('#taggedUserImg').src = `public/img/default-user-icon.jpg`
                                    getUserImg(taggedUserID)
                                        .then((img) => {
                                            if (img) {
                                                document.querySelector('#taggedUserImg').src = img
                                            }
                                        })
                                    document.querySelector('#taggedUserName').innerHTML = taggedUserName
                                    tagPopup.onclick = () => {
                                        tagPopup.style.display = "none"
                                        userTagged = taggedUserEmail
                                    }
                                }
                            })
                    })
                }
            }
        }
    }
}

// Show preview of picture uploaded to posts
function postPicPreview() {
    const e = document.querySelector('#postUpload')
    var output = document.querySelector('#postPicPreview');
    output.src = URL.createObjectURL(e.files[0]);
    output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
    }
    document.querySelector('#uploadPhoto').innerHTML = `<i class="fad fa-image-polaroid"></i>&nbsp;Change Photo`
    document.querySelector('.ctx-post-img').style.display = "block"
}

function postTagging() {
    const tagInput = document.querySelector('#tagging')
    tagInput.style.display = "block"
}

let userTagged = ""

// Search users, display tooltip of the user matching input
function searchTag(value) {
    const tagInput = document.querySelector('#tagging')
    const tagPopup = document.querySelector('#userTagPopup')

    const tag = `
        <div class="ctx-user-tagged">
            <img id="taggedUserImg" src="">
            <p id="taggedUserName"></p>
        </div>
    `

    const loader = `
        <i class="fad fa-spinner fa-spin"></i>
    `

    tagInput.style.color = "#222"
    tagInput.classList.remove('add-tag')
    tagPopup.style.display = "block"
    tagPopup.innerHTML = loader
    
    if (value.length >= 4) {
        users.get()
            .then(snapshot => {
                snapshot.docs.forEach(doc => {
                    let userData = doc.data()
                    let taggedUserName = `${userData.fname} ${userData.lname}`
                    let taggedUserEmail = userData.email
                    let taggedUserID = userData.id
                    if (taggedUserName.toLowerCase().includes(value.toLowerCase())) {
                        tagInput.style.color = "#222"
                        tagInput.classList.remove('add-tag')
                        tagPopup.style.display = "block"
                        tagPopup.innerHTML = tag
                        document.querySelector('#taggedUserImg').src = `public/img/default-user-icon.jpg`
                        getUserImg(taggedUserID)
                            .then((img) => {
                                if (img) {
                                    document.querySelector('#taggedUserImg').src = img
                                }
                            })
                        document.querySelector('#taggedUserName').innerHTML = taggedUserName
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
}

const getUserImg = async (id) => {
    return await storage.ref(`users/${id}/profile.jpg`).getDownloadURL()
}

// Store the uploaded file into object
let postFile = {}

// Adds new post to the firebase and updates the page
function sendPost() {
    let ref = posts.doc() // Get reference for Post ID
    let tag = ""
    if (document.querySelector('#tagging').value != "") {
        tag = document.querySelector('#tagging').value
        sendTagNotification(userTagged, ref.id, currentUser)
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
                            storage.ref(`posts/${currentUser.uid}/${ref.id}/postPic.jpg`)
                                .put(postFile)
                                .then(() => {
                                    img = true
                                    addPostToDB(ref, doc, tag, cat, img)
                                })
                        } else {
                            alert("File is too big! Image must be less than 2MB", "Error!");
                        }
                    } else { // CREATE POST WITHOUT PHOTO
                        addPostToDB(ref, doc, tag, cat, img)
                    }
                }
            })
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
            postImg: img,
            postID: ref.id
        })
    removeCreatePost()
    clearPosts()
    document.querySelector('.ctx-background-blur').style.display = "none"
    renderPostCategory('Everything', 'cat_everything')
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

// Load posts by selected category
function renderPostCategory(category, highlightedCategory) {
    currentCategory = category
    selectedCategory = highlightedCategory
    let postCatParent = document.querySelector('#postCategories')
    for (i = 0; i < postCatParent.children.length; i++) {
        postCatParent.children[i].classList.remove('ctx-category-selected')
    }

    document.querySelector(`#${highlightedCategory}`).classList.add('ctx-category-selected')
    clearPosts()

    posts.where("category", "array-contains", `${currentCategory}`)
        .orderBy(filter, order)
        .limit(4)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const postData = doc.data()
                let timePosted = formatDate(postData.postedDate)
                renderPost(doc, timePosted)
            })

            let postContainer = document.querySelector('#posts')
            let renderedLength = postContainer.children.length - 1

            // Insert "Load more posts" button
            if (querySnapshot.docs.length > renderedLength) {
                const morePosts = `
                    <div id="loadPosts" onclick="loadMorePosts()" class="ctx-load-posts">
                        <a>Load more posts</a>
                    </div>
                `
                postContainer.insertAdjacentHTML('beforeend', morePosts)
            }
        })
}

// Load more posts
function loadMorePosts() {
    document.querySelector('#loadPosts').innerHTML = `<i class="fad fa-spinner fa-spin"></i>`

    let postContainer = document.querySelector('#posts')
    let renderedLength = postContainer.children.length - 1

    // Reference the post thread
    const lastDoc = posts.where("category", "array-contains", `${currentCategory}`)
        .orderBy(filter, order)
        .limit(renderedLength)

    // Find the last past in the currently rendered thread, use that as a start point to load 3 more posts
    return lastDoc.get().then((snapshotDoc) => {
        
        let lastPost = snapshotDoc.docs[snapshotDoc.docs.length - 1]

        const next = posts.where("category", "array-contains", `${currentCategory}`)
            .orderBy(filter, order)
            .startAfter(lastPost)
            .limit(4)

        next.get()
            .then(snapshot => {
                snapshot.docs.forEach(doc => {
                    let timePosted = formatDate(doc.data().postedDate)
                    renderPost(doc, timePosted)
                })

                // Remove "Load more posts" button from current position
                let postContainer = document.querySelector('#posts')
                let loadPostsBtn = document.querySelector(`#loadPosts`)
                postContainer.removeChild(loadPostsBtn)
        
                // Insert "Load more posts" button at the bottom
                const morePosts = `
                    <div id="loadPosts" onclick="loadMorePosts()" class="ctx-load-posts">
                        <a>Load more posts</a>
                    </div>
                `
                postContainer.insertAdjacentHTML('beforeend', morePosts)

                /*
                let renderedLength = postContainer.children.length - 1
                if (snapshot.docs.length > renderedLength) {
                }
                */
            })
    })
}


// Load single post
function renderSinglePost(postID) {
    // Unselect all post categories when rendering the notification
    let postCatParent = document.querySelector('#postCategories')
    for (i = 0; i < postCatParent.children.length; i++) {
        postCatParent.children[i].classList.remove('ctx-category-selected')
    }
    // Clear all posts from timeline
    clearPosts()
    //document.querySelector('.ctx-background-blur').style.display = "none"
    // Render notification post
    posts.where("postID", "==", `${postID}`)
        .get()
        .then(doc => {
            let timePosted = formatDate(doc.docs[0].data().postedDate)
            renderPost(doc.docs[0], timePosted)
            document.querySelector(`#POST${postID}`).children[0].children[0].style.zIndex = "11"
            document.querySelector(`#POST${postID}`).children[0].children[1].style.zIndex = "11"
            setTimeout(() => {
                document.querySelector('.ctx-background-blur').style.display = "block"
            }, 500)
            return;
    })
}

// Edit single post
function editSinglePost(postID) {
    // Unselect all post categories when rendering the notification
    const postCatParent = document.querySelector('#postCategories')
    for (i = 0; i < postCatParent.children.length; i++) {
        postCatParent.children[i].classList.remove('ctx-category-selected')
    }
    // Clear all posts from timeline
    clearPosts()
    //document.querySelector('.ctx-background-blur').style.display = "none"
    // Render notification post
    posts.doc(`${postID}`)
        .get()
        .then(doc => {
            renderSinglePostEdit(doc)
    })
}

// Render individual/single post
function renderSinglePostEdit(post) {
    console.log(post)
    const postData = post.data()
    const postContainer = `
        <div class="ctx-post ctx-new-post" id="newPost">
            <div class="ctx-profile-img">
                <img id="userProfileImg" src="">
            </div>
            <div class="ctx-post-content">
                <input maxlength="40" class="start-post ctx-post-inputs" type="text" id="postTitle" autocomplete="off" placeholder="Enter a title or topic for this post" value="${postData.postTitle}">
                <textarea maxlength="400" oninput="autoGrow(this)" class="start-post ctx-post-inputs" autocomplete="off" id="postContent" placeholder="What would you like to say?" contenteditable>${postData.postContent}</textarea>
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
                    <div class="post-btn" onclick="updatePost('${post.id}')">
                        <i class="fad fa-paper-plane"></i>&nbsp;Update
                    </div>
                </div>
            </div>
        </div>
        `

        document.querySelector('#posts').insertAdjacentHTML('beforebegin', postContainer)
        document.querySelector('#postTitle').focus()

        if (postData.tagged != "") {
            let tagInput = document.querySelector('#tagging')
            tagInput.style.display = "block"
            tagInput.classList.add('add-tag')
            tagInput.value = postData.tagged
        }

        if (postData.postImg == true) {
            document.querySelector('.ctx-post-img').style.display = "block"
            document.querySelector('#uploadPhoto').innerHTML = `<i class="fad fa-image-polaroid"></i>&nbsp;Change Photo`
            returnPostPic(post)
                .then(img => {
                    document.querySelector('#postPicPreview').src = img
                })
                .catch(err => {
                    console.log(err.message)
                })
        }

        autoGrow(document.querySelector('#postContent'))
    
        // Get profile Pic
        let profilePic = document.querySelector('#userProfileImg')
        profilePic.src = `public/img/default-user-icon.jpg`
        getProfilePic()
            .then((value) => {
                if (value) {
                    profilePic.src = value
                }
            }).catch(() => {
                profilePic.src = `public/img/default-user-icon.jpg`
            })
    
        document.querySelector('.ctx-background-blur').style.display = "block"
        document.querySelector('.ctx-background-blur').style.backdropFilter = "blur(4px)"
}

// Update Post
function updatePost(postID) {
    posts.doc(`${postID}`)
        .update({
            postTitle: document.querySelector('#postTitle').value,
            postContent: document.querySelector('#postContent').value
        }).then(() => {
            removeCreatePost()
            clearPosts()
            document.querySelector('.ctx-background-blur').style.display = "none"
            renderPostCategory('Everything', 'cat_everything')
        }).catch(err => {console.log(err.message)})
}

// Removes the generated fields for creating a new post
function removeCreatePost() {
    document.querySelector('#startNewPost').style.display = "flex"
    document.querySelector('.ctx-background-blur').style.backdropFilter = "blur(0)"
    document.querySelector('.ctx-background-blur').style.display = "none"
    const container = document.querySelector('#newsFeed')
    const post = document.querySelector('#newPost')
    if (post) {
        container.removeChild(post)
    }
}

// Deletes an existing post & it's comments, add's loading spinner while it processes
function deletePost(postID) {
    //document.querySelector(`[id='${postID}']`).className = "fad fa-spinner fa-spin"
    posts.doc(`${postID.id}`)
        .get()
        .then(result => {
            posts.doc(`${postID.id}`)
                .collection("comments")
                .get()
                .then(snapshot => {
                    snapshot.docs.forEach(singleComment => {
                        // Delete post comments
                        posts.doc(`${postID.id}`).collection("comments").doc(`${singleComment.id}`)
                            .delete()
                            .then(() => {})
                    })
                    // Delete parent post
                    posts.doc(`${postID.id}`)
                        .delete()
                        .then(() => {
                            // Remove post from front end
                            const container = document.querySelector('#posts')
                            const post = document.querySelector(`[id="POST${postID.id}"]`)
                            container.removeChild(post)
                            alert("Your post has been deleted.", "Success!")
                    })
                    // Delete any associated post image
                    storage.ref()
                        .child(`posts/${currentUser.uid}/${postID.id}/postPic.jpg`)
                        .delete()
                        .then(() => {})
                })
        })

    // Delete notifications associated with the post for the relevant user
    users.where("id", "==", currentUser.uid)
                .get()
                .then(user => {
                    users.doc(`${user.docs[0].id}`)
                        .collection('notifications')
                        .get()
                        .then(snapshot => {
                            snapshot.docs.forEach(doc => {
                                if (doc.data().postID == postID) {
                                    users.doc(`${user.docs[0].id}`)
                                        .collection('notifications')
                                        .doc(doc.id)
                                        .delete()
                                        .then(() => {})
                                }
                            })
                        })
                })
}

// COMMENT FUNCTIONS //

function startComment(id) {
    if (document.getElementById(`#${id}comment`) == null) {
        const post = document.querySelector(`#COMMENTCONTAINER${id}`)
        const commentContainer =`
        <div class="ctx-comment-wrapper" id="${id}comment">
            <div class="ctx-comment-wrapper ctx-comment-content ctx-start-comment" style="flex-direction: row;">
                <textarea maxlength="400" oninput="autoGrow(this)" class="start-post" id="commentContent${id}" placeholder="What would you like to say?" contenteditable></textarea>
                <div class="tag-popup" id="postUserTagPopup" style="display:none"></div>
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
                    let ref = posts.doc()
                        .collection("comments")
                        .doc()
                    // Set reference for Comment
                    posts.doc(postID)
                        .collection("comments")
                        .doc(`${ref.id}`)
                        .set({
                            comment: document.querySelector(`#commentContent${postID}`).value,
                            commentBy: `${thisUser.fname} ${thisUser.lname}`,
                            commentByCompany: `${thisUser.company}`,
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
                                    renderComment(doc, postID)
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
        <div class="ctx-comment-wrapper" id="${postInfo.id}">
            <div class="ctx-profile-img">
                <img class="ctx-profile-img img comment-img" id="profilePic${postInfo.id}" src="public/img/default-user-icon.jpg">
            </div>
            <div class="ctx-comment-wrapper ctx-comment-content">
                <div class="ctx-comment-header">
                    <div>
                        <span style="font-weight:bold">${postInfo.data().commentBy}</span>
                        <span>${postInfo.data().commentByCompany}</span>
                    </div>
                    <div>
                    ${(postInfo.data().commentByID == currentUser.uid)
                        ?`<i class="far fa-ellipsis-h icon-clickable" id="ELLIPSES${postInfo.id}"></i>
                            <div class="ctx-post-dropdown" style="display:none" id="COMMENTOPTIONS${postInfo.id}">
                                <div class="ctx-dropdown-option">
                                    <i class="fad fa-pencil"></i> Edit Comment
                                </div>
                                <div class="ctx-dropdown-option" onclick="deleteComment('${postInfo.id}', '${postID}')">
                                    <i class="fad fa-trash"></i> Delete Comment
                                </div>
                            </div>`
                        :`<i class="far fa-ellipsis-h icon-clickable" id="ELLIPSES${postInfo.id}"></i>
                            <div class="ctx-post-dropdown" style="display:none" id="COMMENTOPTIONS${postInfo.id}">
                                <div class="ctx-dropdown-option" onclick="reportComment('${postID}', '${postInfo.id}')">
                                    <i class="fad fa-comment-alt-exclamation"></i> Report Comment
                                </div>
                            </div>
                        `}
                        <span style="font-weight:500;color:#555">${formatDate(postInfo.data().commentDate)}</span>
                    </div>
                </div>
                <div style="margin-top:10px">
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
        </div>
    `

    post.insertAdjacentHTML('beforeend', comment)
    
    // Handle opening menu for editing etc
    document.querySelector(`#ELLIPSES${postInfo.id}`).addEventListener("click", (event) => { 
        const comment = document.querySelector(`#COMMENTOPTIONS${postInfo.id}`)
        if (comment.style.display == "none") {
            comment.style.display = "flex"
        } else {
            comment.style.display = "none"
        }
    })

    // Get profile images
    const profilePic = document.querySelector(`#profilePic${postInfo.id}`)
    profilePic.src = `public/img/default-user-icon.jpg`
    returnCommentPic(postInfo)
        .then((value) => {
            profilePic.src = value
        }).catch(() => {
            profilePic.src = `public/img/default-user-icon.jpg`
        })
}

// Delete an existing comment
function deleteComment(commentID, postID) {
    // Add loading spinner
    //document.querySelector(`[id="${commentID}"]`).className = "fad fa-spinner fa-spin"
    posts.get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                posts.doc(`${doc.id}`)
                    .collection("comments")
                    .doc(`${commentID}`)
                    .delete()
                    .then(() => {
                        // Remove the comment from front end
                        document.querySelector(`[id="${commentID}"]`).parentElement.remove()
                        // Minus 1 to comment count
                        let currentComments = document.querySelector(`#comments${postID}`).innerHTML
                        document.querySelector(`#comments${postID}`).innerHTML = parseInt(currentComments) - 1
                        alert("Your comment has been deleted.", "Success!")
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
        .limit(2)
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

    // Find the last comment in the currently rendered thread, use that as a start point to load 2 more comments
    return lastDoc.get().then((snapshotDoc) => {
        
        let lastComment = snapshotDoc.docs[snapshotDoc.docs.length - 1]

        const next = posts.doc(postID)
            .collection("comments")
            .orderBy("commentDate", "desc")
            .startAfter(lastComment)
            .limit(4)

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
                                e.target.innerHTML = `<i class="fad fa-thumbs-up"></i> Upvote Post`
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

function reportComment(postID, commentID) {
    document.querySelector(`#COMMENTOPTIONS${commentID}`).innerHTML = `<i class="fad fa-spinner fa-spin"></i>`
    Email.send({
        SecureToken : "ff27d002-dfcb-44ee-a21b-d3fbb0963431",
        To : 'andrew.landes@cirtex.co.nz',
        From : "andrew.landes@cirtex.co.nz",
        Subject : "New Comment Report - Civil Hub",
        Body : `User: ${currentUser.email} has reported the following comment:<br><br>
        Post ID: ${postID}<br>
        Comment ID: ${commentID}`
    }).then(
    message => {
        alert("Thanks, this post has been reported.", "Success!")
        document.querySelector(`#COMMENTOPTIONS${commentID}`).innerHTML = ``
        setTimeout(() => {
            document.querySelector(`#COMMENTOPTIONS${commentID}`).style.display = "none"
        }, 2000);
    })
}

function reportPost(postID) {
    document.querySelector(`#POSTOPTIONS${postID}`).innerHTML = `<i class="fad fa-spinner fa-spin"></i>`
    Email.send({
        SecureToken : "ff27d002-dfcb-44ee-a21b-d3fbb0963431",
        To : 'andrew.landes@cirtex.co.nz',
        From : "andrew.landes@cirtex.co.nz",
        Subject : "New Post Report - Civil Hub",
        Body : `User: ${currentUser.email} has reported the following post:<br><br>
        Post ID: ${postID}`
    }).then(
    message => {
        alert("Thanks, this post has been reported.", "Success!")
        document.querySelector(`#POSTOPTIONS${postID}`).innerHTML = ``
        setTimeout(() => {
            document.querySelector(`#POSTOPTIONS${postID}`).style.display = "none"
        }, 2000);
    })
}