/* MoveNet + p5play Flow field by Steve's Makerspace

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet

p5play info:
Welcome to p5play Version 3!
Before using p5play take a look at the documentation:
https://p5play.org/learn

*/

let video;
let bodypose, pose, keypoint, z, zCount, readyCount, limbs;
let poses = [];
let detector;
let items = [];

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      // flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

async function setup() {
  angleMode(RADIANS);
  createCanvas(640, 480);
  cnv = createGraphics(width, height);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  len = width * 0.01;
  rez = 0.003;
  readyCount = 0;
  zCount = 0;
  size1 = width * 0.03;
  items = new Group();
  items.color = "red";
  limbs = new Group();
  limbs.visible = false;

  for (i = 0; i < 200; i++) {
    sprite = new items.Sprite(random(width), random(height), size1);
  }
  show = true;
}

function draw() {
  if (readyCount > 5) {
    limbs.removeAll();
    drawSkeleton();
  }
  readyCount++;
  //flip the video image
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);
  pop();

  makeFlowField();
}

function makeFlowField() {
  for (i = 0; i < items.length; i++) {
    sprite = items[i];
    x = sprite.x;
    y = sprite.y;
    n = noise(x * rez, y * rez, zCount * 0.1) + 0.033;
    ang = map(n, 0.3, 0.7, 0, PI * 2);
    if (ang > PI * 2) {
      ang -= PI * 2;
    }
    if (ang < 0) {
      ang += PI * 2;
    }

    newX = cos(ang) * size1 + x;
    newY = sin(ang) * size1 + y;
    sprite.moveTowards(newX, newY, 0.2);

    if (sprite.x > width * 1.06) {
      sprite.x = -width * 0.05;
    }
    if (sprite.x < -width * 0.06) {
      sprite.x = width * 1.05;
    }
    if (sprite.y > height * 1.06) {
      sprite.y = -height * 0.05;
    }
    if (sprite.y < -height * 0.06) {
      sprite.y = height * 1.05;
    }
    if (readyCount > 5) {
      for (let k = 0; k < poses.length; k++) {
        pose = poses[k];
        avgXright = (pose.keypoints[6].x + pose.keypoints[12].x) / 2;
        avgXleft = (pose.keypoints[5].x + pose.keypoints[11].x) / 2;
        avgYup = (pose.keypoints[5].y + pose.keypoints[6].y) / 2;
        avgYdown = (pose.keypoints[11].y + pose.keypoints[12].y) / 2;
        if (
          sprite.x > avgXright &&
          sprite.x < avgXleft &&
          sprite.y > avgYup &&
          sprite.y < avgYdown
        ) {
          sprite.x = random(width);
          sprite.y = random(height);
        }
      }
    }
  }
  zCount += 0.03;
}

function drawSkeleton() {
  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    pose = poses[i];
    // shoulder to wrist
    for (j = 5; j < 9; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        makeSprite();
      }
    }
    // shoulder to shoulder
    partA = pose.keypoints[5];
    partB = pose.keypoints[6];
    if (partA.score > 0.1 && partB.score > 0.1) {
      makeSprite();
    }
    // hip to hip
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      makeSprite();
    }
    // shoulders to hips
    partA = pose.keypoints[5];
    partB = pose.keypoints[11];
    if (partA.score > 0.1 && partB.score > 0.1) {
      makeSprite();
    }
    partA = pose.keypoints[6];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      makeSprite();
    }
    // hip to foot
    // for (j = 11; j < 15; j++) {
    //   if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
    //     partA = pose.keypoints[j];
    //     partB = pose.keypoints[j + 2];
    //       makeSprite();
    //   }
    // }
  }
}

function makeSprite() {
  // Calculating what's needed to make the limbs
  partA2 = createVector(
    ((width - partA.x) / 640) * width,
    (partA.y / 480) * height
  );
  partB2 = createVector(
    ((width - partB.x) / 640) * width,
    (partB.y / 480) * height
  );

  spriteX = (partA2.x + partB2.x) / 2;
  spriteY = (partA2.y + partB2.y) / 2;
  distance = dist(partA2.x, partA2.y, partB2.x, partB2.y);
  angle = atan((partA2.y - partB2.y) / (partA2.x - partB2.x));
  // making the limbs / skeleton
  sprite = new limbs.Sprite(spriteX, spriteY, distance, width * 0.05);
  sprite.rotation = angle;
}

/* Points (view on left of screen = left part - when mirrored)
  0 nose
  1 left eye
  2 right eye
  3 left ear
  4 right ear
  5 left shoulder
  6 right shoulder
  7 left elbow
  8 right elbow
  9 left wrist
  10 right wrist
  11 left hip
  12 right hip
  13 left kneee
  14 right knee
  15 left foot
  16 right foot
*/
