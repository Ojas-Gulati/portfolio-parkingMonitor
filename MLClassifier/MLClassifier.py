from __future__ import absolute_import, division, print_function, unicode_literals

import tensorflow as tf
from tensorflow.keras import datasets, layers, models
import datetime
import os
AUTOTUNE = tf.data.experimental.AUTOTUNE
import pathlib
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

import pathlib

from PIL import Image

np.set_printoptions(precision=4)

data_dir = pathlib.Path("data")

image_count = len(list(data_dir.glob('*/*/*.jpg')))
print(image_count)

#CLASS_NAMES = np.array([item.name for item in data_dir.glob('*') if item.name != "LICENSE.txt"])
#print(CLASS_NAMES)

BATCH_SIZE = 400
IMG_HEIGHT = 64
IMG_WIDTH = 64
STEPS_PER_EPOCH = np.ceil(image_count/BATCH_SIZE)

list_ds = tf.data.Dataset.list_files(str(data_dir/'*/*/*'))
for f in list_ds.take(5):
  print(f.numpy())

CLASS_NAMES = ["daycar", "dayno-car", "nightcar", "nightno-car"]
classcounts = [0, 0, 0, 0]

def get_label(file_path):
  # convert the path to a list of path components
  parts = tf.strings.split(file_path, os.path.sep)
  # The second to last is the class-directory
  #orig = [1 if (parts[-3] == "day") else 0, 1 if (parts[-2] == "car") else 0]
  return (parts[-3] + parts[-2]) == CLASS_NAMES

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
for image, label in labeled_ds:
  for x in range(4):
    if label[x]:
      classcounts[x] += 1
  #print(image.numpy())
total = classcounts[0] + classcounts[1] + classcounts[2] + classcounts[3]
class_weight = {0: total / (classcounts[0] * 2.0), 1: total / (classcounts[1] * 2.0), 2: total / (classcounts[2] * 2.0), 3: total / (classcounts[3] * 2.0)}
print(class_weight)
print(total)
print(classcounts)

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

def show_batch(image_batch, label_batch):
  plt.figure(figsize=(10,10))
  for n in range(25):
      ax = plt.subplot(5,5,n+1)
      plt.imshow(image_batch[n])
      plt.title(label_batch[n])
      plt.axis('off')

print("showing")
show_batch(train_images.numpy(), train_labels.numpy())
plt.show()

model = models.Sequential()
model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 3)))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(32, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.MaxPooling2D((2, 2)))
model.add(layers.Conv2D(64, (3, 3), activation='relu'))
model.add(layers.Flatten())
model.add(layers.Dense(64, activation='relu'))
model.add(layers.Dense(32, activation='relu'))
model.add(layers.Dense(4, activation='softmax'))

model.summary()

model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

log_dir="logs\\fit\\" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)

history = model.fit(train_images, train_labels, epochs=40, 
                    validation_data=(test_images, test_labels),
                    callbacks=[tensorboard_callback],
                    class_weight=class_weight)

plt.plot(history.history['accuracy'], label='accuracy')
plt.plot(history.history['val_accuracy'], label = 'val_accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.ylim([0.5, 1])
plt.legend(loc='lower right')

test_loss, test_acc = model.evaluate(test_images,  test_labels, verbose=2)

print(test_acc)
model.save("day-night.h5")

img2 = tf.io.read_file("data/day/car/70.jpg")
img2 = decode_img(img2)
print(img2)
print(tf.reshape(img2, [1, 64, 64, 3]))
print(model.predict(tf.reshape(img2, [1, 64, 64, 3])))

plt.show()

# predict on the training data
plt.plot(model.predict(test_images))
plt.plot(test_labels)

plt.show()