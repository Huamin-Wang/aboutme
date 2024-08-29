// 获取帖子详情
async function getPostDetails(postId) {
    try {
        const { content } = await getFileContent();
        const post = content.find(p => p.id === postId);
        if (!post) {
            throw new Error("Post not found");
        }
        return post;
    } catch (error) {
        console.error('Error in getPostDetails:', error.message);
        alert('Error fetching post details');
    }
}

// 删除帖子
async function deletePost(postId) {
    try {
        let { sha, content: fileContent } = await getFileContent();
        const postIndex = fileContent.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            alert('Post not found');
            return;
        }

        fileContent.splice(postIndex, 1);
        await updateFileContent(fileContent, sha);
        alert('Post deleted successfully');
        loadPostsForAdmin();  // 重新加载帖子列表
    } catch (error) {
        console.error('Error in deletePost:', error.message);
        alert('Error deleting post');
    }
}

// 删除评论
async function deleteReply(postId, replyIndex) {
    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        if (!post) {
            alert('Post not found');
            return;
        }

        post.replies.splice(replyIndex, 1);
        await updateFileContent(fileContent, sha);
        alert('Reply deleted successfully');
        loadPostsForAdmin();  // 重新加载帖子列表
    } catch (error) {
        console.error('Error in deleteReply:', error.message);
        alert('Error deleting reply');
    }
}

// 编辑帖子
async function editPost(postId) {
    try {
        const post = await getPostDetails(postId);
        if (!post) return;

        const newTitle = prompt('Enter new title:', post.title);
        const newContent = prompt('Enter new content:', post.content);

        if (newTitle !== null && newContent !== null) {
            post.title = newTitle;
            post.content = newContent;

            let { sha, content: fileContent } = await getFileContent();
            const postIndex = fileContent.findIndex(p => p.id === postId);
            fileContent[postIndex] = post;

            await updateFileContent(fileContent, sha);
            alert('Post updated successfully');
            loadPostsForAdmin();  // 重新加载帖子列表
        }
    } catch (error) {
        console.error('Error in editPost:', error.message);
        alert('Error editing post');
    }
}
// 获取帖子列表并显示
async function loadPostsForAdmin() {
    try {
        const { content } = await getFileContent();
        const postsList = document.getElementById('postsList');
        postsList.innerHTML = '';

        // 按最新发帖或回复时间排序
        content.sort((a, b) => {
            const lastActivityA = a.replies.length ? new Date(a.replies[a.replies.length - 1].timestamp) : new Date(a.timestamp);
            const lastActivityB = b.replies.length ? new Date(b.replies[b.replies.length - 1].timestamp) : new Date(b.timestamp);
            return lastActivityB - lastActivityA;
        });

        content.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <button onclick="deletePost('${post.id}')">Delete Post</button>
                <button onclick="editPost('${post.id}')">Edit Post</button>
                <div id="replies-${post.id}"></div>
            `;
            postsList.appendChild(postElement);

            // 显示评论
            displayRepliesForAdmin(post.replies, post.id);
        });
    } catch (error) {
        console.error('Error in loadPostsForAdmin:', error.message);
    }
}

// 显示评论
function displayRepliesForAdmin(replies, postId) {
    const repliesContainer = document.getElementById(`replies-${postId}`);
    repliesContainer.innerHTML = '<h4>Replies:</h4>';

    replies.forEach((reply, index) => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('reply');
        replyElement.innerHTML = `
            ${index + 1}楼: ${reply.content}
            <span class="reply-timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
            <button onclick="deleteReply('${postId}', ${index})">Delete Reply</button>
        `;
        repliesContainer.appendChild(replyElement);
    });
}

// 初始化加载帖子列表
document.addEventListener('DOMContentLoaded', loadPostsForAdmin);