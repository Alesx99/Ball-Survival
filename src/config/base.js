export const BASE_CONFIG = {
    FPS: 60,
    timing: {
        RETENTION_CHECK_FRAMES: 30 * 60,
        AUTO_BALANCE_FRAMES: 60 * 60,
        ACHIEVEMENT_CHECK_FRAMES: 10 * 60,
        CLOUD_SYNC_INTERVAL_MS: 20 * 60 * 1000
    },
    world: { width: 8000, height: 6000, gridSize: 100 },
    effects: {
        screenShakeDecay: 0.90,
        screenShakeMax: 10,
        screenShakeScale: 0.5,
        cameraLerp: 0.1,
        hitFlashFrames: 10,
    },
    accessibility: {
        reduceMotion: false,
        highContrast: false,
    }
};
