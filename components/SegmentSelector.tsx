/**
 * SegmentSelector Component
 * A component for selecting start and end times of a video segment
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as Colors from '../constants/colors';

interface SegmentSelectorProps {
  mediaUrl: string;
  initialStartTime: number;
  initialEndTime: number;
  onSegmentChange: (startTime: number, endTime: number) => void;
}

const SegmentSelector: React.FC<SegmentSelectorProps> = ({
  mediaUrl,
  initialStartTime,
  initialEndTime,
  onSegmentChange
}) => {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime || 60); // Default to 60 seconds if not set
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Set up video player
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loadAsync(
        { uri: mediaUrl },
        {},
        false
      );
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, [mediaUrl]);

  // Update parent component when segment changes
  useEffect(() => {
    onSegmentChange(startTime, endTime);
  }, [startTime, endTime]);

  // Handle video load
  const handleVideoLoad = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis / 1000);
      setIsLoading(false);
      
      // If initial times are 0 or undefined, set default values
      if (initialStartTime === 0 && initialEndTime === 0) {
        const defaultEndTime = Math.min(60, status.durationMillis / 1000);
        setEndTime(defaultEndTime);
        onSegmentChange(0, defaultEndTime);
      } else if (initialEndTime > status.durationMillis / 1000) {
        // Ensure end time doesn't exceed video duration
        setEndTime(status.durationMillis / 1000);
        onSegmentChange(startTime, status.durationMillis / 1000);
      }
    } else {
      setError('Failed to load video');
      setIsLoading(false);
    }
  };

  // Handle video playback status update
  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      
      // Loop playback within selected segment
      if (status.positionMillis / 1000 >= endTime) {
        videoRef.current?.setPositionAsync(startTime * 1000);
      }
      
      // Update playing state
      setIsPlaying(status.isPlaying);
    }
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        // Ensure we're playing from the start position
        if (currentTime < startTime || currentTime >= endTime) {
          await videoRef.current.setPositionAsync(startTime * 1000);
        }
        await videoRef.current.playAsync();
      }
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle start time change
  const handleStartTimeChange = (value: number) => {
    // Ensure start time is at least 0 and less than end time
    const newStartTime = Math.max(0, Math.min(value, endTime - 1));
    setStartTime(newStartTime);
    
    // If currently playing and outside the new range, seek to new start
    if (isPlaying && (currentTime < newStartTime || currentTime >= endTime)) {
      videoRef.current?.setPositionAsync(newStartTime * 1000);
    }
  };

  // Handle end time change
  const handleEndTimeChange = (value: number) => {
    // Ensure end time is greater than start time and less than duration
    const newEndTime = Math.max(startTime + 1, Math.min(value, duration));
    setEndTime(newEndTime);
    
    // If currently playing and outside the new range, seek to start
    if (isPlaying && currentTime >= newEndTime) {
      videoRef.current?.setPositionAsync(startTime * 1000);
    }
  };

  // Seek to specific time
  const seekTo = async (time: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(time * 1000);
      setCurrentTime(time);
    }
  };

  // Preview start position
  const previewStart = () => {
    seekTo(startTime);
  };

  // Preview end position
  const previewEnd = () => {
    seekTo(Math.max(0, endTime - 3)); // Start 3 seconds before end
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      ) : (
        <>
          {/* Video Preview */}
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              style={styles.video}
              resizeMode="contain"
              onLoad={handleVideoLoad}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              useNativeControls={false}
            />
            
            {/* Play/Pause Button Overlay */}
            <TouchableOpacity
              style={styles.playPauseOverlay}
              onPress={togglePlayPause}
            >
              {!isPlaying && (
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            
            {/* Current Time Indicator */}
            <View style={styles.timeIndicator}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </View>
          </View>
          
          {/* Segment Controls */}
          <View style={styles.segmentControls}>
            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>Start: {formatTime(startTime)}</Text>
              <Text style={styles.timeLabel}>End: {formatTime(endTime)}</Text>
            </View>
            
            {/* Range Slider */}
            <View style={styles.rangeContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={startTime}
                onValueChange={handleStartTimeChange}
                minimumTrackTintColor="#CCCCCC"
                maximumTrackTintColor={Colors.PRIMARY}
                thumbTintColor={Colors.PRIMARY}
              />
              
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={endTime}
                onValueChange={handleEndTimeChange}
                minimumTrackTintColor={Colors.PRIMARY}
                maximumTrackTintColor="#CCCCCC"
                thumbTintColor={Colors.PRIMARY}
              />
            </View>
            
            {/* Preview Buttons */}
            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={previewStart}
              >
                <Ionicons name="play-skip-back" size={16} color="#FFFFFF" />
                <Text style={styles.previewButtonText}>Preview Start</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.previewButton}
                onPress={previewEnd}
              >
                <Ionicons name="play-skip-forward" size={16} color="#FFFFFF" />
                <Text style={styles.previewButtonText}>Preview End</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  videoContainer: {
    height: 200,
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  segmentControls: {
    padding: 12,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666666',
  },
  rangeContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default SegmentSelector;
