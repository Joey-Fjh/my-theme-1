import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('mediaVideo', () => ({
    ...useDisposable(),
    isPlaying: false,
    isMuted: true,
    hasPlayed: false,
    _videoCleanups: [],

    init() {
        const videos = this._getAllVideos();
        if (!videos.length) return;

        const visible = this._getVideo();
        if (visible) {
            this.isMuted = visible.muted;
            this.isPlaying = !visible.paused;
        }

        const onPlay = () => {
            const shouldMoveFocus = document.activeElement === this.$refs?.playButton;
            const current = this._getVideo();
            if (current && !current.paused) {
                this.isPlaying = true;
                this.hasPlayed = true;
                if (shouldMoveFocus) {
                    this.$nextTick(() => this._focusPlaybackControl('pauseButton'));
                }
            }
        };
        const onPause = () => {
            const shouldMoveFocus = document.activeElement === this.$refs?.pauseButton;
            const current = this._getVideo();
            if (current && current.paused) {
                this.isPlaying = false;
                if (shouldMoveFocus) {
                    this.$nextTick(() => this._focusPlaybackControl('playButton'));
                }
            }
        };
        const onVolumeChange = () => {
            const current = this._getVideo();
            if (current) {
                this.isMuted = current.muted;
            }
        };

        videos.forEach((video) => {
            video.addEventListener('play', onPlay);
            video.addEventListener('pause', onPause);
            video.addEventListener('volumechange', onVolumeChange);
        });

        this._videoCleanups.push(() => {
            videos.forEach((video) => {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
                video.removeEventListener('volumechange', onVolumeChange);
            });
        });

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            this.pause();
                        }
                    });
                },
                { threshold: 0.15 },
            );
            observer.observe(this.$el);
            this._videoCleanups.push(() => observer.disconnect());
        }
    },

    _getAllVideos() {
        const el = this.$el;
        if (!el) return [];
        return Array.from(el.querySelectorAll('video'));
    },

    _getVideo() {
        const el = this.$el;
        if (!el) return null;
        const desktop = el.querySelector('[data-video-desktop]');
        const mobile = el.querySelector('[data-video-mobile]');
        const desktopVideo = desktop?.querySelector('video');
        const mobileVideo = mobile?.querySelector('video');
        if (mobileVideo && mobile.offsetParent !== null) return mobileVideo;
        if (desktopVideo && desktop.offsetParent !== null) return desktopVideo;
        return desktopVideo || mobileVideo || el.querySelector('video');
    },

    _pauseOthers(currentVideo) {
        const videos = this._getAllVideos();
        videos.forEach((v) => {
            if (v !== currentVideo && !v.paused) v.pause();
        });
    },

    _focusPlaybackControl(refName) {
        const control = this.$refs?.[refName];
        if (!(control instanceof HTMLElement)) return;

        control.focus({ preventScroll: true });
    },

    play() {
        const video = this._getVideo();
        if (video) {
            this._pauseOthers(video);
            video.play().catch(() => {});
        }
    },

    pause() {
        const video = this._getVideo();
        if (video) {
            video.pause();
        }
    },

    toggleMute() {
        const video = this._getVideo();
        if (video) {
            video.muted = !video.muted;
            this.isMuted = video.muted;
        }
    },

    destroy() {
        this._videoCleanups.forEach((fn) => fn());
        this._videoCleanups = [];
        const videos = this._getAllVideos();
        videos.forEach((v) => {
            if (!v.paused) v.pause();
        });
        this.dispose();
    },
}));
