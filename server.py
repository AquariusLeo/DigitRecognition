import tornado.ioloop
import tornado.web
import tornado.websocket
import numpy as np
import json
import os.path
import digitRecog
from PIL import Image
# import matplotlib.pyplot as plt

#/路径处理程序
class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

#/ws/路径处理程序
class WSHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("-------------[WebSocket Opened!]------------")

    def on_message(self, message):
        # 从JSON字符串读取图片数据
        jsonObj=json.loads(message)
        data=[]
        for value in jsonObj["imgData"].values():
            data.append(value)
        # 将透明的像素换为黑色，书写轨迹换为白色
        for i in range(784):
            if data[i*4+3]<=127:
                data[i*4]=data[i*4+1]=data[i*4+2]=0
            else:
                data[i*4]=data[i*4+1]=data[i*4+2]=255
        # 删除Alpha通道值
        i=0
        count=0
        while i<len(data):
            if count==3:
                del data[i]
                count=0
                continue
            i=i+1
            count=count+1
        
        # 生成RGB格式的Image对象，并保存本地
        arr=np.asarray(data,dtype=np.uint8)
        arr=np.reshape(arr,(28,28,3))
        img=Image.fromarray(arr,"RGB")
        img.save("temp.png")

        # 灰度化并用matplotlib显示图片————调试使用
        # img = img.convert('L')
        # plt.ion() # 开启interactive mode
        # plt.figure("Image") # 图像窗口名称
        # plt.imshow(img,cmap='gray')
        # plt.axis('on')
        # plt.title('image') # 图像题目
        # plt.pause(2)
        # plt.close("Image")

        # 调用识别函数
        print("==================识别开始==================")
        result = digitRecog.digit_recog()
        print("==================识别结束==================")
        # 将结果返回网页
        self.write_message(str(result))

    def on_close(self):
        print("-------------[WebSocket Closed!]------------")

handlers=[
    (r"/",IndexHandler),
    (r"/connect",WSHandler)
]

if __name__=="__main__":
    app=tornado.web.Application(handlers,static_path=os.path.join(os.path.dirname(__file__),"static"),debug=True)
    app.listen(8100)
    tornado.ioloop.IOLoop.current().start()