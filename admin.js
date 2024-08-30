// admin.js
async function handlePostAction(action, postId, replyIndex = null) {
    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        if (!post) throw new Error("Post not found");

        switch (action) {
            case 'deletePost':
                fileContent = fileContent.filter(p => p.id !== postId);
                break;
            case 'editPost':
                const newTitle = prompt('Enter new title:', post.title);
                const newContent = prompt('Enter new content:', post.content);
                if (newTitle && newContent) {
                    post.title = newTitle;
                    post.content = newContent;
                }
                break;
            case 'deleteReply':
                post.replies.splice(replyIndex, 1);
                break;
        }

        await updateFileContent(fileContent, sha);
        loadPostsForAdmin();
    } catch (error) {
        console.error(`Error in ${action}:`, error.message);
        alert(`Error ${action === 'editPost' ? 'editing' : 'deleting'} post`);
    }
}

async function loadPostsForAdmin() {
    try {
        const { content } = await getFileContent();
        const postsList = document.getElementById('postsList');
        postsList.innerHTML = '';

        content.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        content.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <button onclick="handlePostAction('deletePost', '${post.id}')">Delete Post</button>
                <button onclick="handlePostAction('editPost', '${post.id}')">Edit Post</button>
                <div id="replies-${post.id}"></div>
            `;
            postsList.appendChild(postElement);
            displayRepliesForAdmin(post.replies, post.id);
        });
    } catch (error) {
        console.error('Error in loadPostsForAdmin:', error.message);
    }
}

function displayRepliesForAdmin(replies, postId) {
    const repliesContainer = document.getElementById(`replies-${postId}`);
    repliesContainer.innerHTML = '<h4>Replies:</h4>';
    const fragment = document.createDocumentFragment();

    replies.forEach((reply, index) => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('reply');
        replyElement.innerHTML = `
            ${index + 1}楼: ${reply.content}
            <span class="reply-timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
            <button onclick="handlePostAction('deleteReply', '${postId}', ${index})">Delete Reply</button>
        `;
        fragment.appendChild(replyElement);
    });

    repliesContainer.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', loadPostsForAdmin);