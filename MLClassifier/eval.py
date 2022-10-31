import tensorflow as tf
from tensorflow.keras import datasets, layers, models
import datetime
import os
AUTOTUNE = tf.data.experimental.AUTOTUNE
import pathlib
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

model = models.load_model('day-night.h5')

np.set_printoptions(precision=4)

data_dir = pathlib.Path("data")

image_count = len(list(data_dir.glob('*/*/*.jpg')))
print(image_count)

#CLASS_NAMES = np.array([item.name for item in data_dir.glob('*') if item.name != "LICENSE.txt"])
#print(CLASS_NAMES)

BATCH_SIZE = 200
IMG_HEIGHT = 64
IMG_WIDTH = 64
STEPS_PER_EPOCH = np.ceil(image_count/BATCH_SIZE)

list_ds = tf.data.Dataset.list_files(str(data_dir/'*/*/*'))
for f in list_ds.take(5):
  print(f.numpy())

def get_label(file_path):
  # convert the path to a list of path components
  parts = tf.strings.split(file_path, os.path.sep)
  # The second to last is the class-directory
  return [1 if (parts[-3] == "day") else 0, 1 if (parts[-2] == "car") else 0]

def decode_img(img):
  # convert the compressed string to a 3D uint8 tensor
  img = tf.image.decode_jpeg(img, channels=3)
  # Use `convert_image_dtype` to convert to floats in the [0,1] range.
  img = tf.image.convert_image_dtype(img, tf.float32)
  # resize the image to the desired size.
  return tf.image.resize(img, [IMG_WIDTH, IMG_HEIGHT])

def process_path(file_path):
  label = get_label(file_path)
  # load the raw data from the file as a string
  img = tf.io.read_file(file_path)
  img = decode_img(img)
  return img, label

labeled_ds = list_ds.map(process_path, num_parallel_calls=AUTOTUNE)
for image, label in labeled_ds.take(5):
  print("Image shape: ", image.numpy().shape)
  print("Label: ", label.numpy())
  #print(image.numpy())

def prepare_for_training(ds, cache=True, shuffle_buffer_size=1000):
  # This is a small dataset, only load it once, and keep it in memory.
  # use `.cache(filename)` to cache preprocessing work for datasets that don't
  # fit in memory.
  if cache:
    if isinstance(cache, str):
      ds = ds.cache(cache)
    else:
      ds = ds.cache()

  ds = ds.shuffle(buffer_size=shuffle_buffer_size)

  # Repeat forever
  ds = ds.repeat()

  ds = ds.batch(BATCH_SIZE)

  # `prefetch` lets the dataset fetch batches in the background while the model
  # is training.
  ds = ds.prefetch(buffer_size=AUTOTUNE)

  return ds

start_ds = prepare_for_training(labeled_ds)

test_dataset = start_ds.take(1000) 
train_dataset = start_ds.skip(1000)
print(train_dataset)
train_images, train_labels = next(iter(train_dataset))
test_images, test_labels = next(iter(test_dataset))

IMG_HEIGHT = 64
IMG_WIDTH = 64

def decode_img(img):
  # convert the compressed string to a 3D uint8 tensor
  img = tf.image.decode_jpeg(img, channels=3)
  # Use `convert_image_dtype` to convert to floats in the [0,1] range.
  img = tf.image.convert_image_dtype(img, tf.float32)
  # resize the image to the desired size.
  return tf.image.resize(img, [IMG_WIDTH, IMG_HEIGHT])

test_labels = test_labels.numpy()

test_labels_x = []
test_labels_y = []
pred_labels_x = []
pred_labels_y = []
prediction = model.predict(test_images)
for x in range(200):
    test_labels_x.append(test_labels[x][0])
    test_labels_y.append(test_labels[x][1])
    pred_labels_x.append(prediction[x][0])
    pred_labels_y.append(prediction[x][1])
plt.scatter(test_labels_x, test_labels_y)
plt.scatter(pred_labels_x, pred_labels_y)
plt.show()