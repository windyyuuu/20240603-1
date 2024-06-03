/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet

*/

let video, bodypose, pose, keypoint, detector;
let poses = [];

function preload(){
earImg = loadImage("upload_e7b8681276bf136e02f932e89ea6fe54.gif")
}
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
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  stroke(255);
  strokeWeight(5);
}

function draw() {
  image(video, 0, 0);
  drawSkeleton();
  // flip horizontal
  cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
}

function drawSkeleton() { 
  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
     pose = poses[i];
    
    partA = pose.keypoints[3]; //右耳
    partB = pose.keypoints[4]; //左耳
    
    if (partA.score > 0.1 ) {
      image(earImg,partA.x, partA.y-25, 50, 50);
    }
    if (partB.score > 0.1 ) {
      image(earImg,partB.x-40, partB.y-25, 50, 50);
    }
    partA = pose.keypoints[7]; //left elbow
    partB = pose.keypoints[8]; //right elbow
    
    if (partA.score > 0.1 ) {
      image(earImg,partA.x, partA.y-25, 50, 50);
    }
    if (partB.score > 0.1 ) {
      image(earImg,partB.x-40, partB.y-25, 50, 50);
    }
    partA = pose.keypoints[0]; 
    if (partA.score > 0.1 ) {
      push();
      textSize(20);
      fill(0); 
      textAlign(CENTER, CENTER); // 以文字中心為座標
      scale(-1, 1); // 左右顛倒
      text("412730342 蕭雯萱", -partA.x, partA.y - 50);
      pop();
    }
  }
}
