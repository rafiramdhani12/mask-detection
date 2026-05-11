import matplotlib.pyplot as plt
import numpy as np
import PIL
import tensorflow as tf
import cv2
import pathlib

from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential

# ========== PATH DATASET ==========
train_path = "./Face_Mask_Dataset/Train"
val_path   = "./Face_Mask_Dataset/Validation"
test_path  = "./Face_Mask_Dataset/Test"

# ========== PARAMETERS ==========
IMG_SIZE   = (160, 160)
BATCH_SIZE = 32
EPOCHS     = 15

# ========== LOAD DATASET ==========
train_ds = tf.keras.utils.image_dataset_from_directory(
    train_path,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    val_path,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

test_ds = tf.keras.utils.image_dataset_from_directory(
    test_path,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = train_ds.class_names
print("Kelas:", class_names)

# ========== DATA AUGMENTATION (dipisah dari model) ==========
augmentation_layer = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
    layers.RandomBrightness(0.1),
])

# Apply augmentation HANYA ke training set
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.map(
    lambda x, y: (augmentation_layer(x, training=True), y),
    num_parallel_calls=AUTOTUNE
)
train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
val_ds   = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
test_ds  = test_ds.cache().prefetch(buffer_size=AUTOTUNE)

# ========== BUILD MODEL ==========
model = Sequential([
    keras.Input(shape=(160, 160, 3)),
    layers.Rescaling(1./255),

    layers.Conv2D(32, (3,3), activation='relu', padding='same'),
    layers.MaxPooling2D(),

    layers.Conv2D(64, (3,3), activation='relu', padding='same'),
    layers.MaxPooling2D(),

    layers.Conv2D(128, (3,3), activation='relu', padding='same'),
    layers.MaxPooling2D(),

    layers.Conv2D(256, (3,3), activation='relu', padding='same'),
    layers.MaxPooling2D(),

    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(2, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# ========== TRAINING ==========
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS
)

# ========== EVALUASI FINAL ==========
print("\n--- Evaluasi di Test Set ---")
test_loss, test_acc = model.evaluate(test_ds)
print(f"Test Accuracy: {test_acc*100:.2f}%")

# ========== SAVE MODEL ==========
model.save("mask_detector_update.keras")
print("Model saved!")