# portfolio-parkingMonitor
All sensitive data has been removed, so some scripts will not work.

ImageDownloader contains scripts for getting training data for the camera.

UserClassifier contains tools to help the images be classified by a human. A server will serve batches of images that anyone on the same network can download into an app that will allow them to play through a sequence of images and classify them efficiently. The idea behind the app is that whether or not a car is in a spot (or any other features) doesn't change often, so the user can watch through a sequence of images until a feature change e.g. a car leaves a space. They can then update the label and continue playing through the images, classifying the images after the change with the new label. This allows users to classify on average 2-3 images per second.

MLClassifier contains the code for the convolutional network to classify the images.

API serves the API for the alexa skill (which is in AlexaSkill)
