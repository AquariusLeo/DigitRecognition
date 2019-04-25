import os
import tensorflow as tf
import numpy as np
# 加载mnist_cnn.py和mnist_train.py中定义的常量和前向传播的函数
import mnist_cnn
import mnist_train

def digit_recog():
    # 占位符，输入的格式
    x = tf.placeholder(tf.float32, [1,mnist_cnn.IMAGE_SIZE,mnist_cnn.IMAGE_SIZE,mnist_cnn.NUM_CHANNEL], name='x-input')

    # 直接通过调用封装好的函数来计算前向传播的结果，测试时不关注过拟合问题，所以正则化输入为None
    y=mnist_cnn.interence(x,None,None)

    # 使用tf.argmax(y, 1)就可以得到输入样例的预测类别
    result=tf.argmax(y,1)

    # 通过变量重命名的方式来加载模型
    variable_averages=tf.train.ExponentialMovingAverage(mnist_train.MOVING_AVERAGE_DECAY)
    variable_to_restore=variable_averages.variables_to_restore()
    # 所有滑动平均的值组成的字典，处在/ExponentialMovingAverage下的值  
    # 为了方便加载时重命名滑动平均量，tf.train.ExponentialMovingAverage类提供了variables_to_store函数来生成tf.train.Saver类所需要的变量
    saver=tf.train.Saver(variable_to_restore)

    with tf.Session() as sess:
        # tf.train.get_checkpoint_state函数会通过checkpoint文件自动找到目录中最新模型的文件名
        ckpt = tf.train.get_checkpoint_state(os.path.join(os.path.dirname(__file__), mnist_train.MODEL_PATH))
        if ckpt and ckpt.model_checkpoint_path:
            # 加载模型
            saver.restore(sess, ckpt.model_checkpoint_path)

            # 读取本地图片，进行转换flaot32、灰度化、转换np数组操作
            image_raw_data=tf.gfile.GFile('temp.png','rb').read()
            image_data=tf.image.decode_png(image_raw_data)
            float_image = tf.image.convert_image_dtype(image_data, dtype=tf.float32)
            gray_image = tf.image.rgb_to_grayscale(float_image)
            reshaped_image = tf.reshape(gray_image, [1,mnist_cnn.IMAGE_SIZE,mnist_cnn.IMAGE_SIZE,mnist_cnn.NUM_CHANNEL])
            nparray_image = reshaped_image.eval(session=sess)

            # 运行图
            res = sess.run(result, feed_dict={x: nparray_image})

            res_y = sess.run(y, feed_dict={x: nparray_image})
            print(res_y)

    # 重置默认图
    tf.reset_default_graph()
    # 返回识别结果
    return res[0]