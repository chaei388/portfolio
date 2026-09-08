import albamiCover from '../assets/images/projects/albami/cover.png'
import albamiScreenshot01 from '../assets/images/projects/albami/screenshot-01.png'
import albamiScreenshot02 from '../assets/images/projects/albami/screenshot-02.png'
import albamiScreenshot03 from '../assets/images/projects/albami/screenshot-03.png'
import campusConnectCover from '../assets/images/projects/campus-connect/cover.png'
import campusConnectScreenshot01 from '../assets/images/projects/campus-connect/screenshot-01.png'
import campusConnectScreenshot02 from '../assets/images/projects/campus-connect/screenshot-02.png'
import campusConnectScreenshot03 from '../assets/images/projects/campus-connect/screenshot-03.png'
import cheersTrackerCover from '../assets/images/projects/cheers-tracker/cover.png'
import cheersTrackerScreenshot01 from '../assets/images/projects/cheers-tracker/screenshot-01.png'
import cheersTrackerScreenshot02 from '../assets/images/projects/cheers-tracker/screenshot-02.png'
import cheersTrackerScreenshot03 from '../assets/images/projects/cheers-tracker/screenshot-03.png'
import cheersTrackerScreenshot04 from '../assets/images/projects/cheers-tracker/screenshot-04.png'
import cheersTrackerScreenshot05 from '../assets/images/projects/cheers-tracker/screenshot-05.png'
import cheeryCover from '../assets/images/projects/cheery/cover.png'
import cheeryScreenshot01 from '../assets/images/projects/cheery/screenshot-01.png'
import cheeryScreenshot02 from '../assets/images/projects/cheery/screenshot-02.png'
import cheeryScreenshot03 from '../assets/images/projects/cheery/screenshot-03.png'
import goalGroveCover from '../assets/images/projects/goal-grove/cover.png'
import goalGroveScreenshot01 from '../assets/images/projects/goal-grove/screenshot-01.png'
import goalGroveScreenshot02 from '../assets/images/projects/goal-grove/screenshot-02.png'
import goalGroveScreenshot03 from '../assets/images/projects/goal-grove/screenshot-03.png'
import nuguCover from '../assets/images/projects/nugu/cover.png'
import nuguScreenshot01 from '../assets/images/projects/nugu/screenshot-01.png'
import nuguScreenshot02 from '../assets/images/projects/nugu/screenshot-02.png'
import pickItCover from '../assets/images/projects/pick-it/cover.png'
import pickItScreenshot01 from '../assets/images/projects/pick-it/screenshot-01.png'
import pickItScreenshot02 from '../assets/images/projects/pick-it/screenshot-02.png'
import pickItScreenshot03 from '../assets/images/projects/pick-it/screenshot-03.png'
import watermelonCover from '../assets/images/projects/watermelon-ai-service/cover.png'
import watermelonScreenshot01 from '../assets/images/projects/watermelon-ai-service/screenshot-01.png'
import watermelonScreenshot02 from '../assets/images/projects/watermelon-ai-service/screenshot-02.png'
import watermelonScreenshot03 from '../assets/images/projects/watermelon-ai-service/screenshot-03.png'

// 이미지 import와 프로젝트 내용을 분리해 projects.ts의 가독성을 유지한다.
export const projectMedia = {
  watermelonAiService: {
    thumbnailUrl: watermelonCover,
    screenshotUrls: [
      watermelonScreenshot01,
      watermelonScreenshot02,
      watermelonScreenshot03,
    ],
  },
  pickIt: {
    thumbnailUrl: pickItCover,
    screenshotUrls: [
      pickItScreenshot01,
      pickItScreenshot02,
      pickItScreenshot03,
    ],
  },
  nugu: {
    thumbnailUrl: nuguCover,
    screenshotUrls: [nuguScreenshot01, nuguScreenshot02],
  },
  campusConnect: {
    thumbnailUrl: campusConnectCover,
    screenshotUrls: [
      campusConnectScreenshot01,
      campusConnectScreenshot02,
      campusConnectScreenshot03,
    ],
  },
  cheersTracker: {
    thumbnailUrl: cheersTrackerCover,
    screenshotUrls: [
      cheersTrackerScreenshot01,
      cheersTrackerScreenshot02,
      cheersTrackerScreenshot03,
      cheersTrackerScreenshot04,
      cheersTrackerScreenshot05,
    ],
  },
  goalGrove: {
    thumbnailUrl: goalGroveCover,
    screenshotUrls: [
      goalGroveScreenshot01,
      goalGroveScreenshot02,
      goalGroveScreenshot03,
    ],
  },
  albami: {
    thumbnailUrl: albamiCover,
    screenshotUrls: [
      albamiScreenshot01,
      albamiScreenshot02,
      albamiScreenshot03,
    ],
  },
  cheery: {
    thumbnailUrl: cheeryCover,
    screenshotUrls: [
      cheeryScreenshot01,
      cheeryScreenshot02,
      cheeryScreenshot03,
    ],
  },
}
