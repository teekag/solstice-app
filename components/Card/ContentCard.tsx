/**
 * ContentCard Component
 * Displays a card representing an exercise, movement, or action
 */
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Card } from '../../types/card';
import * as Colors from '../../constants/colors';

interface ContentCardProps {
  card: Card;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  card, 
  onPress, 
  onEdit,
  onDelete,
  isDragging = false
}) => {
  // Derive information to display
  const { title, description, thumbnail, duration, sets, reps } = card;
  
  // Format duration into MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <View style={[styles.container, isDragging && styles.dragging]}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Card Left: Thumbnail and metadata */}
        <View style={styles.cardContent}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholderThumbnail} />
          )}
          
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.description} numberOfLines={2}>{description}</Text>
            
            {/* Metadata row: duration, sets, reps */}
            <View style={styles.metadataRow}>
              {duration ? (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Duration</Text>
                  <Text style={styles.metadataValue}>{formatDuration(duration)}</Text>
                </View>
              ) : null}
              
              {sets ? (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Sets</Text>
                  <Text style={styles.metadataValue}>{sets}</Text>
                </View>
              ) : null}
              
              {reps ? (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Reps</Text>
                  <Text style={styles.metadataValue}>{reps}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {onDelete && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={onDelete}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          
          {onEdit && (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={onEdit}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.WHITE,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dragging: {
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.GRAY_LIGHT,
  },
  placeholderThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.GRAY_LIGHT,
  },
  textContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataItem: {
    marginRight: 16,
  },
  metadataLabel: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.BLACK,
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.GRAY_LIGHT,
    borderRadius: 6,
    marginVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.GRAY_DARK,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.ERROR,
    borderRadius: 6,
    marginVertical: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.WHITE,
  },
});

export default ContentCard; 