# DigitRecognition

手写数字识别——基于TensorFlow LeNet-5模型

***
## 功能描述

用户在移动端网页用手指或在电脑端网页用鼠标书写一个0~9的数字，传输到后端上，后端利用训练好的LeNet-5模型识别数字后，发送给前端并显示给用户

## 运行环境

*后端*  
- Python
- Python库
  - tornado
  - tensorflow或tensorflow-gpu
  - 以上库可以在命令行界面用`pip install tornado`命令安装，tensorflow类似
  - pillow [安装教程](https://www.cnblogs.com/yuanzhoulvpi/p/9028713.html)

*前端*  
Internet Explorer 9、Firefox、Opera、Chrome 以及 Safari 浏览器

## 运行方法

*后端*  
Windows：按下win+r，输入`cmd`，回车，进入cmd命令行界面。输入`cd /d 你的代码存储目录`，进入代码存储目录，输入`python server.py`运行后端服务器  
![](https://ws1.sinaimg.cn/large/8d421749ly1g264u89wubj20di06gdfz.jpg)

训练模型：按下win+r，输入`cmd`，回车，进入cmd命令行界面。输入`cd /d 你的代码存储目录`，进入代码存储目录，输入`python mnist_train.py`进行模型训练。模型训练共需30万步，训练过程中可结束程序，下次再运行此程序将接着之前的步数继续训练。（源码中已给出训练好的模型，保存在model文件夹，无需训练）

*前端*  
在浏览器地址栏输入`服务器IP:8100`，回车即可进入网页。在方框内用手指或用鼠标书写一个0~9的数字，点击识别，稍等即可获得识别结果

## 项目结构

**DigitRecognition**  
│  digitRecog.py  
│  index.html  
│  list.txt  
│  mnist_cnn.py  
│  mnist_train.py  
│  server.py  
│  temp.png  
│  
├─doc  
│　　referece.txt  
│      
├─mni_data  
│　　t10k-images-idx3-ubyte.gz  
│　　t10k-labels-idx1-ubyte.gz  
│　　train-images-idx3-ubyte.gz  
│　　train-labels-idx1-ubyte.gz  
│      
├─model  
│　　checkpoint  
│　　model-295001.data-00000-of-00001  
│　　model-295001.index  
│　　model-295001.meta  
│　　model-296001.data-00000-of-00001  
│　　model-296001.index  
│　　model-296001.meta  
│　　model-297001.data-00000-of-00001  
│　　model-297001.index  
│　　model-297001.meta  
│　　model-298001.data-00000-of-00001  
│　　model-298001.index  
│　　model-298001.meta  
│　　model-299001.data-00000-of-00001  
│　　model-299001.index  
│　　model-299001.meta  
│      
└─static  
　　├─css   
　　│　　style.css  
　　│      
　　├─js  
　　│　　index.js  
　　│      
　　└─res  
　　　　 icon-dog.png  
            
## 作者列表

*zhangle*

## 历史版本

- **1.0    2019年4月18日**  
  初始版本，仅实现移动端

- **1.1    2019年4月19日**  
  增加了模型训练过程中的保存与恢复功能
  
- **1.2    2019年5月7日**  
  增加了对PC端网页的适配
  
## 联系方式

Email：zhangle1222@163.com
