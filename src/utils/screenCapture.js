class ScreenCaptureService {
  constructor() {
    this.mediaStream = null;
    this.isCapturing = false;
    this.canvas = null;
    this.context = null;
    this.video = null;
  }

  async startScreenCapture() {
    try {
      console.log('ScreenCapture: Requesting screen capture...');

      // Request screen capture permission with simpler constraints
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 5, max: 10 }
        },
        audio: false
      });

      console.log('ScreenCapture: Got media stream:', this.mediaStream);
      console.log('ScreenCapture: Video tracks:', this.mediaStream.getVideoTracks());

      // Create video element to display the stream
      this.video = document.createElement('video');
      this.video.autoplay = true;
      this.video.muted = true;
      this.video.playsInline = true;

      // Set up the video source
      this.video.srcObject = this.mediaStream;

      console.log('ScreenCapture: Video element created and source set');

      // Create canvas for capturing frames
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      // Add video to DOM first (required for some browsers)
      this.video.style.position = 'fixed';
      this.video.style.top = '10px';
      this.video.style.right = '10px';
      this.video.style.width = '200px';
      this.video.style.height = '150px';
      this.video.style.border = '2px solid red';
      this.video.style.zIndex = '9999';
      document.body.appendChild(this.video);
      console.log('ScreenCapture: Added video to DOM');

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('ScreenCapture: Video loading timeout');
          reject(new Error('Video loading timeout'));
        }, 15000);

        const onReady = () => {
          console.log('ScreenCapture: Video ready', {
            width: this.video.videoWidth,
            height: this.video.videoHeight,
            readyState: this.video.readyState
          });

          // Set canvas dimensions
          if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            clearTimeout(timeout);
            resolve();
          } else {
            console.warn('ScreenCapture: Video dimensions are 0, waiting...');
          }
        };

        this.video.onloadedmetadata = onReady;
        this.video.oncanplay = onReady;

        // Try to play the video
        this.video.play().catch(error => {
          console.error('ScreenCapture: Error playing video:', error);
        });
      });

      // Wait a bit more for the video to actually start playing
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('ScreenCapture: Final video state:', {
        readyState: this.video.readyState,
        videoWidth: this.video.videoWidth,
        videoHeight: this.video.videoHeight,
        currentTime: this.video.currentTime,
        paused: this.video.paused
      });

      this.isCapturing = true;

      // Handle stream end (user stops sharing)
      this.mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenCapture();
      });

      // Test capture immediately
      const testCapture = this.captureFrame();
      if (testCapture) {
        console.log('ScreenCapture: Test capture successful');
      } else {
        console.warn('ScreenCapture: Test capture failed, but continuing...');
      }

      return true;
    } catch (error) {
      console.error('ScreenCapture: Error starting screen capture:', error);
      this.cleanup();

      // Provide more helpful error message
      if (error.name === 'NotAllowedError') {
        throw new Error('Screen sharing permission denied. Please allow screen sharing and try again.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Screen sharing is not supported in this browser.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Screen sharing setup timed out. Please try again.');
      } else {
        throw error;
      }
    }
  }

  cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
      if (this.video.parentNode) {
        this.video.parentNode.removeChild(this.video);
      }
      this.video = null;
    }

    this.canvas = null;
    this.context = null;
    this.isCapturing = false;
  }

  stopScreenCapture() {
    this.cleanup();
    console.log('Screen capture stopped');
  }

  captureFrame() {
    if (!this.isCapturing || !this.video || !this.canvas || !this.context) {
      console.warn('ScreenCapture: Missing components for capture');
      return null;
    }

    // Check if video is ready
    if (this.video.readyState < 2) {
      console.warn('ScreenCapture: Video not ready for capture, readyState:', this.video.readyState);
      return null;
    }

    // Check video dimensions
    if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
      console.warn('ScreenCapture: Video has no dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
      return null;
    }

    try {
      // Clear canvas first
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Add a test pattern to see if canvas is working
      console.log('ScreenCapture: Drawing video frame', {
        videoWidth: this.video.videoWidth,
        videoHeight: this.video.videoHeight,
        canvasWidth: this.canvas.width,
        canvasHeight: this.canvas.height,
        currentTime: this.video.currentTime
      });

      // Draw current video frame to canvas
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      // Check if we actually drew something by sampling a pixel
      const imageData = this.context.getImageData(0, 0, 1, 1);
      console.log('ScreenCapture: Sample pixel:', imageData.data);

      // Convert to base64 image data
      const base64Data = this.canvas.toDataURL('image/jpeg', 0.8);
      console.log('ScreenCapture: Frame captured, size:', base64Data.length);

      return base64Data;
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  }

  // Start continuous frame capture
  startFrameCapture(callback, interval = 1000) {
    if (!this.isCapturing) {
      console.warn('Screen capture not started');
      return null;
    }

    const captureInterval = setInterval(() => {
      if (!this.isCapturing) {
        clearInterval(captureInterval);
        return;
      }

      const frameData = this.captureFrame();
      if (frameData && callback) {
        callback(frameData);
      }
    }, interval);

    return captureInterval;
  }

  // Get current stream for WebRTC
  getMediaStream() {
    return this.mediaStream;
  }

  // Check if browser supports screen capture
  static isSupported() {
    return navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  }
}

export default ScreenCaptureService;
