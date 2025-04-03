// postForm.js
let uniqueFilename;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('postButton').addEventListener('click', togglePostForm);
    document.getElementById('postFormElement').addEventListener('submit', submitPost);
});

function togglePostForm() {
    const postForm = document.getElementById('postForm');
    const postsContainer = document.getElementById('posts');
    const isFormVisible = postForm.style.display === 'block';

    postForm.style.display = isFormVisible ? 'none' : 'block';
    if (isFormVisible) {
        postsContainer.classList.remove('posts-container-adjusted');
        postsContainer.style.top = '0';
        document.querySelector('.header h2').style.display = 'none';
    } else {
        postsContainer.classList.add('posts-container-adjusted');
        const header = document.querySelector('.header');
        postsContainer.style.top = `${header.offsetHeight}px`;
        const h2Element = document.querySelector('.header h2');
        h2Element.style.display = 'block';
        h2Element.classList.add('highlight-animation');
    }

    const pagination = document.getElementById('pagination');
    pagination.style.position = 'relative';
    pagination.style.top = postForm.style.display === 'block' ? '20px' : '0';
}

async function submitPost(event) {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const newPost = { id: generateUniqueId(), title, content, timestamp: new Date().toISOString(), uniqueFilename, replies: [] };

    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();
        document.getElementById('postFormElement').reset();
        togglePostForm();
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

document.getElementById('postFormElement').addEventListener('submit', async function(event) {
    event.preventDefault();
    const imageInput = document.getElementById('postImage');
    const file = imageInput.files[0];

    if (file) {
        const fileExtension = file.name.split('.').pop();
        uniqueFilename = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExtension}`;

        const reader = new FileReader();
        reader.onloadend = async function() {
            const base64Image = reader.result.split(',')[1];
            const owner = "wang_hua_min";
            const token = "4918bb3947dbf1402d7331a65bab1b3e";
            const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${imgs_repo}/contents/${image_folder}/${uniqueFilename}`;

            const payload = {
                access_token: token,
                content: base64Image,
                message: `Upload ${uniqueFilename}`
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (response.status === 201) {
                    document.getElementById('statusMessage').innerText = `图片 '${uniqueFilename}' 上传成功！`;
                } else {
                    document.getElementById('statusMessage').innerText = `图片上传失败。状态码：${response.status}, 响应：${result.message}`;
                }
            } catch (error) {
                document.getElementById('statusMessage').innerText = `发生错误：${error.message}`;
            }
        };

        reader.readAsDataURL(file);
    } else {
        uniqueFilename = null;
    }
});