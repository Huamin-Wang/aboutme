import base64
import requests
import json

# 配置信息
owner = "wang_hua_min"
repo = "we-chat-data"
image_folder = "images"
token = "4918bb3947dbf1402d7331a65bab1b3e"

# 本地图片路径和文件名
local_image_path = "img/weixin_code.png"  # 替换为本地图片的路径
image_filename = "image_weixin.jpg"  # 替换为你想要保存的图片文件名

# Gitee API URL
api_url = f"https://gitee.com/api/v5/repos/{owner}/{repo}/contents/{image_folder}/{image_filename}"

# 读取图片文件并进行 Base64 编码
with open(local_image_path, "rb") as image_file:
    image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# 上传请求的 payload
payload = {
    "access_token": token,
    "content": image_base64,
    "message": f"Upload {image_filename}"
}

# 设置请求头
headers = {
    "Content-Type": "application/json"
}

# 发送请求
response = requests.post(api_url, headers=headers, data=json.dumps(payload))

# 检查响应
if response.status_code == 201:
    print(f"Image '{image_filename}' uploaded successfully.")
else:
    print(f"Failed to upload image. Status code: {response.status_code}, Response: {response.text}")

