// postDetail.js
document.addEventListener('DOMContentLoaded', () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    loadPostDetail(postId);
});

async function loadPostDetail(postId) {
    try {
        const { content } = await getFileContent();
        const post = content.find(p => p.id === postId);
        if (!post) throw new Error("Post not found");

        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postContent').textContent = post.content;
        document.getElementById('postTimestamp').textContent = new Date(post.timestamp).toLocaleString();
        document.title = post.title;

        if (post.uniqueFilename) {
            const imagePath = `https://gitee.com/api/v5/repos/${owner}/${imgs_repo}/contents/${image_folder}/${post.uniqueFilename}`;
            const imageUrl = await fetchImage(imagePath, token);
            document.getElementById('postImage').src = imageUrl;
            document.getElementById('postImage').style.display = 'block';
        } else {
            document.getElementById('postImage').style.display = 'none';
        }

        displayReplies(post.replies);

        const replyForm = document.getElementById('replyForm');
        const newReplyForm = replyForm.cloneNode(true);
        replyForm.parentNode.replaceChild(newReplyForm, replyForm);

        newReplyForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitReply(postId);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function fetchImage(imagePath, token) {
    const response = await fetch(imagePath, {
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const fileData = await response.json();
    const fileContentBase64 = fileData.content;
    return URL.createObjectURL(new Blob([new Uint8Array(atob(fileContentBase64).split("").map(char => char.charCodeAt(0)))]));
}

async function displayReplies(replies) {
    try {
        const repliesContainer = document.getElementById('replies');
        repliesContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const userIP = await getUserIP();

        replies.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        replies.forEach((reply, index) => {
            const replyElement = document.createElement('div');
            replyElement.classList.add('reply');

            const hasLiked = reply.likedIPs && reply.likedIPs.includes(userIP);
            const hasDisliked = reply.dislikedIPs && reply.dislikedIPs.includes(userIP);

            const likeButtonClass = hasLiked ? 'like-button liked' : 'like-button';
            const dislikeButtonClass = hasDisliked ? 'dislike-button disliked' : 'dislike-button';

            replyElement.innerHTML = `
                ${index + 1}楼: ${reply.content}
                <span class="reply-timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
                <button class="${likeButtonClass}" data-reply-index="${index}">👍 (${reply.likes || 0})</button>
                <button class="${dislikeButtonClass}" data-reply-index="${index}">👎 (${reply.dislikes || 0})</button>
            `;

            fragment.appendChild(replyElement);
        });

        repliesContainer.appendChild(fragment);

        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', handleLike, { once: true });
        });

        document.querySelectorAll('.dislike-button').forEach(button => {
            button.addEventListener('click', handleDislike, { once: true });
        });
    } catch (error) {
        console.error('Error displaying replies:', error.message);
    }
}

async function submitReply(postId) {
    const replyContent = document.getElementById('replyInput').value;
    if (!replyContent.trim()) return;

    const newReply = {
        content: replyContent,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        likedIPs: [],
        dislikedIPs: []
    };

    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);

        if (!post.replies) {
            post.replies = [];
        }

        post.replies.push(newReply);
        await updateFileContent(fileContent, sha);

        document.getElementById('replyForm').reset();
        await loadPostDetail(postId);
    } catch (error) {
        console.error('Error submitting reply:', error.message);
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

async function handleLike(event) {
    await handleReaction(event, 'like');
}

async function handleDislike(event) {
    await handleReaction(event, 'dislike');
}

async function handleReaction(event, type) {
    event.preventDefault();
    const replyIndex = event.target.getAttribute('data-reply-index');
    const postId = new URLSearchParams(window.location.search).get('id');

    try {
        const userIP = await getUserIP();
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);

        if (!post || !post.replies || !post.replies[replyIndex]) {
            console.error('Post or reply not found');
            return;
        }

        const reply = post.replies[replyIndex];

        if (!reply.likedIPs) reply.likedIPs = [];
        if (!reply.dislikedIPs) reply.dislikedIPs = [];
        if (reply.likes === undefined) reply.likes = 0;
        if (reply.dislikes === undefined) reply.dislikes = 0;

        if (type === 'like') {
            if (reply.likedIPs.includes(userIP)) {
                reply.likes = Math.max(0, reply.likes - 1);
                reply.likedIPs = reply.likedIPs.filter(ip => ip !== userIP);
            } else {
                if (reply.dislikedIPs.includes(userIP)) {
                    reply.dislikes = Math.max(0, reply.dislikes - 1);
                    reply.dislikedIPs = reply.dislikedIPs.filter(ip => ip !== userIP);
                }
                reply.likes += 1;
                reply.likedIPs.push(userIP);
            }
        } else if (type === 'dislike') {
            if (reply.dislikedIPs.includes(userIP)) {
                reply.dislikes = Math.max(0, reply.dislikes - 1);
                reply.dislikedIPs = reply.dislikedIPs.filter(ip => ip !== userIP);
            } else {
                if (reply.likedIPs.includes(userIP)) {
                    reply.likes = Math.max(0, reply.likes - 1);
                    reply.likedIPs = reply.likedIPs.filter(ip => ip !== userIP);
                }
                reply.dislikes += 1;
                reply.dislikedIPs.push(userIP);
            }
        }

        await updateFileContent(fileContent, sha);
        await loadPostDetail(postId);
    } catch (error) {
        console.error(`Error in handle${type}:`, error);
    }
}

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            throw new Error('Failed to get IP address');
        }
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting user IP:', error);
        return 'user_' + Math.random().toString(36).substring(2, 15);
    }
}