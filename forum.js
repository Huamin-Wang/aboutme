// forum.js
// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    const postButton = document.getElementById('postButton');
    const postForm = document.getElementById('postForm');
    const postFormElement = document.getElementById('postFormElement');

    // Toggle post form visibility
    if (postButton && postForm) {
        postButton.addEventListener('click', () => {
            postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
        });
    } else {
        console.error('postButton or postForm element not found');
    }

    // Bind submitPost function to form submission
    if (postFormElement) {
        postFormElement.addEventListener('submit', submitPost);
    } else {
        console.error('postFormElement not found');
    }
});

// Function to handle post submission
// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    const postButton = document.getElementById('postButton');
    const postForm = document.getElementById('postForm');
    const postFormElement = document.getElementById('postFormElement');

    // Toggle post form visibility
    if (postButton && postForm) {
        postButton.addEventListener('click', () => {
            postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
        });
    } else {
        console.error('postButton or postForm element not found');
    }

    // Bind submitPost function to form submission
    if (postFormElement) {
        postFormElement.addEventListener('submit', submitPost);
    } else {
        console.error('postFormElement not found');
    }
});

// Function to handle post submission
async function submitPost(event) {
    event.preventDefault();  // Prevent default form submission behavior
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const timestamp = new Date().toISOString();
    const id = generateUniqueId();
    let imageUrl = '';

    if (imageFile) {
        try {
            imageUrl = await uploadImage(imageFile);
        } catch (error) {
            console.error('Error uploading image:', error.message);
            return;
        }
    }

    const newPost = { id, title, content, imageUrl, timestamp, replies: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();  // Refresh post list

        // Clear form
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
    } catch (error) {
        console.error('Error in submitPost:', error.message);
    }
}

async function uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('message', 'Upload post image');
    formData.append('branch', 'main');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/images/${imageFile.name}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.content.download_url;
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

async function getFileContent() {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: { "Authorization": `token ${token}`, "Accept": "application/vnd.github.v3+json" }
    });

    if (response.status === 404) {
        return { sha: null, content: [] };
    } else if (!response.ok) {
        throw new Error('Failed to fetch file content');
    }

    const fileData = await response.json();
    let content;
    try {
        content = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
    } catch (error) {
        content = [];
    }
    return { sha: fileData.sha, content };
}

async function updateFileContent(content, sha) {
    const updatedData = btoa(unescape(encodeURIComponent(JSON.stringify(content))));
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({ message: "Update forum data", content: updatedData, sha })
    });

    if (!response.ok) {
        throw new Error('Failed to update file content');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('postButton').addEventListener('click', () => {
        const postForm = document.getElementById('postForm');
        postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('postFormElement').addEventListener('submit', submitPost);
    loadPosts(1);

    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', submitReply);
    }
});

async function submitPost(event) {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const timestamp = new Date().toISOString();
    const id = generateUniqueId();
    let imageUrl = '';

    if (imageFile) {
        try {
            imageUrl = await uploadImage(imageFile);
        } catch (error) {
            console.error('Error uploading image:', error.message);
            return;
        }
    }

    const newPost = { id, title, content, imageUrl, timestamp, replies: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();

        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
    } catch (error) {
        console.error('Error in submitPost:', error.message);
    }
}

async function uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('message', 'Upload post image');
    formData.append('branch', 'main');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/images/${imageFile.name}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: 'Upload post image',
            content: await toBase64(imageFile),
            branch: 'main'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.content.download_url;
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}
// Generate unique ID
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Load posts list and sort by latest activity
async function loadPosts(page = 1, pageSize = 10) {
    const loadingMessage = document.getElementById('loadingMessage');
    const postsContainer = document.getElementById('posts');
    loadingMessage.style.display = 'block';
    postsContainer.innerHTML = '';  // Clear old posts

    try {
        let { content: posts } = await getFileContent();
        // Sort posts by latest activity (post creation or latest reply)
        posts.sort((a, b) => {
            const lastActivityA = a.replies.length ? new Date(a.replies[a.replies.length - 1].timestamp) : new Date(a.timestamp);
            const lastActivityB = b.replies.length ? new Date(b.replies[b.replies.length - 1].timestamp) : new Date(b.timestamp);
            return lastActivityB - lastActivityA;
        });

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedPosts = posts.slice(start, end);

        displayPosts(paginatedPosts);
        setupPagination(Math.ceil(posts.length / pageSize), page);
    } catch (error) {
        console.error('Error in loadPosts:', error.message);
    } finally {
        loadingMessage.style.display = 'none';
    }
}

// Display post titles
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';  // Clear old posts

    posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="post-title">${post.title}</a>
            <div class="timestamp">${new Date(post.timestamp).toLocaleString()}</div>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" class="post-image">` : ''}
        `;
        postsContainer.appendChild(postElement);
    });
}

// Setup pagination controls
function setupPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('button');
        pageLink.textContent = i;

        if (i === currentPage) {
            pageLink.classList.add('active');
        }

        pageLink.onclick = () => loadPosts(i);
        paginationContainer.appendChild(pageLink);
    }
}

// Load post details
// Load post details and display image if exists
async function loadPostDetail(postId) {
    try {
        let { content: posts } = await getFileContent();
        const post = posts.find(p => p.id === postId);

        if (post) {
            document.getElementById('postTitle').textContent = post.title;
            document.getElementById('postContent').textContent = post.content;
            document.getElementById('postTimestamp').textContent = new Date(post.timestamp).toLocaleString();
            if (post.imageUrl) {
                const postImage = document.createElement('img');
                postImage.src = post.imageUrl;
                postImage.alt = 'Post Image';
                postImage.classList.add('post-image');
                document.getElementById('postContent').appendChild(postImage);
            }
            displayReplies(post.replies);
        } else {
            console.error('Post not found');
        }
    } catch (error) {
        console.error('Error in loadPostDetail:', error.message);
    }
}
// Display replies
async function displayReplies(replies) {
    const repliesContainer = document.getElementById('replies');
    repliesContainer.innerHTML = '';

    replies.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const userIP = await getUserIP();

    replies.forEach((reply, index) => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('reply');
        replyElement.innerHTML = `
            ${index + 1}楼: ${reply.content}
            <span class="reply-timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
            <button class="like-button" data-reply-index="${index}">Like (${reply.likes || 0})</button>
            <button class="dislike-button" data-reply-index="${index}">Dislike (${reply.dislikes || 0})</button>
        `;
        repliesContainer.appendChild(replyElement);

        // Set button color based on user interaction
        if (reply.likedIPs && reply.likedIPs.includes(userIP)) {
            replyElement.querySelector('.like-button').style.backgroundColor = 'green';
        }
        if (reply.dislikedIPs && reply.dislikedIPs.includes(userIP)) {
            replyElement.querySelector('.dislike-button').style.backgroundColor = 'green';
        }
    });

    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLike);
    });

    document.querySelectorAll('.dislike-button').forEach(button => {
        button.addEventListener('click', handleDislike);
    });
}

// Get user IP address
async function getUserIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

// Handle like
async function handleLike(event) {
    const button = event.target;
    const replyIndex = button.getAttribute('data-reply-index');
    const postId = new URLSearchParams(window.location.search).get('id');
    const userIP = await getUserIP();

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        const reply = post.replies[replyIndex];

        if (reply.likedIPs && reply.likedIPs.includes(userIP)) {
            // If already liked, remove the like
            reply.likes -= 1;
            reply.likedIPs = reply.likedIPs.filter(ip => ip !== userIP);
        } else {
            // If disliked, remove the dislike
            if (reply.dislikedIPs && reply.dislikedIPs.includes(userIP)) {
                reply.dislikes -= 1;
                reply.dislikedIPs = reply.dislikedIPs.filter(ip => ip !== userIP);
            }
            // Add the like
            reply.likes = (reply.likes || 0) + 1;
            reply.likedIPs = reply.likedIPs || [];
            reply.likedIPs.push(userIP);
        }
        button.style.backgroundColor = 'green'; // Change button color to green

        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);
    } catch (error) {
        console.error('Error in handleLike:', error.message);
    }
}

// Handle dislike
async function handleDislike(event) {
    const button = event.target;
    const replyIndex = button.getAttribute('data-reply-index');
    const postId = new URLSearchParams(window.location.search).get('id');
    const userIP = await getUserIP();

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        const reply = post.replies[replyIndex];

        if (reply.dislikedIPs && reply.dislikedIPs.includes(userIP)) {
            // If already disliked, remove the dislike
            reply.dislikes -= 1;
            reply.dislikedIPs = reply.dislikedIPs.filter(ip => ip !== userIP);
        } else {
            // If liked, remove the like
            if (reply.likedIPs && reply.likedIPs.includes(userIP)) {
                reply.likes -= 1;
                reply.likedIPs = reply.likedIPs.filter(ip => ip !== userIP);
            }
            // Add the dislike
            reply.dislikes = (reply.dislikes || 0) + 1;
            reply.dislikedIPs = reply.dislikedIPs || [];
            reply.dislikedIPs.push(userIP);
        }
        button.style.backgroundColor = 'green'; // Change button color to green

        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);
    } catch (error) {
        console.error('Error in handleDislike:', error.message);
    }
}

// Handle post submission
async function submitPost(event) {
    event.preventDefault();  // Prevent default form submission behavior
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const timestamp = new Date().toISOString();
    const id = generateUniqueId();
    let imageUrl = '';

    if (imageFile) {
        try {
            imageUrl = await uploadImage(imageFile);
            console.log("Image uploaded successfully:", imageUrl);  // Debug log
        } catch (error) {
            console.error('Error uploading image:', error.message);  // Output error message
            return;  // Stop execution if image upload fails
        }
    }

    const newPost = { id, title, content, imageUrl, timestamp, replies: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();  // Refresh post list

        // Clear form
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
    } catch (error) {
        console.error('Error in submitPost:', error.message);  // Output error message
    }
}

// Handle reply submission
document.getElementById('replyForm').addEventListener('submit', submitReply);

async function submitReply(event) {
    event.preventDefault();  // Prevent default form submission behavior
    const replyContent = document.getElementById('replyInput').value;
    const postId = new URLSearchParams(window.location.search).get('id');  // Get post ID from URL
    const timestamp = new Date().toISOString();
    const userIP = await getUserIP();

    const newReply = { content: replyContent, timestamp, likedIPs: [], dislikedIPs: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        post.replies.push(newReply);
        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);  // Refresh post details

        // Clear form
        document.getElementById('replyInput').value = '';
    } catch (error) {
        console.error('Error in submitReply:', error.message);
    }
}

async function uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('message', 'Upload post image');
    formData.append('branch', 'main');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/images/${imageFile.name}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: 'Upload post image',
            content: await toBase64(imageFile),
            branch: 'main'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.content.download_url;
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}