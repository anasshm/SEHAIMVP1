import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';

/**
 * Processes an image for AI analysis by resizing and compressing it
 * Uses the full photo without cropping
 * @param uri The URI of the image to process
 * @param maxWidth Maximum width for the processed image
 * @param quality Compression quality (0-1)
 * @returns URI of the processed image
 */
export async function processImageForAI(
  uri: string, 
  maxWidth: number = 800, // Reduced width for faster processing
  quality: number = 0.7 // Reduced quality for faster processing
): Promise<string> {
  try {
    // Process the image while maintaining aspect ratio
    // No cropping is applied - we use the full photo
    const processedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }], // Only resize, no crop operation
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return processedImage.uri;
  } catch (error) {
    console.error('Error processing image:', error);
    return uri; // Return original if processing fails
  }
}

/**
 * Saves an image to the device's media library
 * @param uri The URI of the image to save
 * @param album Optional album name to save to
 * @returns The saved asset info or null if failed
 */
export async function saveImageToGallery(
  uri: string, 
  album: string = 'Foodnsap'
): Promise<MediaLibrary.Asset | null> {
  try {
    // Request permissions if not already granted
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Media library permission not granted');
      return null;
    }
    
    // Save the image
    const asset = await MediaLibrary.createAssetAsync(uri);
    
    // Create album if it doesn't exist and add the asset to it
    const albumObj = await MediaLibrary.getAlbumAsync(album);
    
    if (albumObj === null) {
      await MediaLibrary.createAlbumAsync(album, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], albumObj, false);
    }
    
    return asset;
  } catch (error) {
    console.error('Error saving image to gallery:', error);
    return null;
  }
}

/**
 * Gets the most recent photos from the media library
 * @param limit Maximum number of photos to return
 * @returns Array of assets
 */
export async function getRecentPhotos(limit: number = 20): Promise<MediaLibrary.Asset[]> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Media library permission not granted');
      return [];
    }
    
    const { assets } = await MediaLibrary.getAssetsAsync({
      first: limit,
      mediaType: 'photo',
      sortBy: MediaLibrary.SortBy.creationTime,
    });
    
    return assets;
  } catch (error) {
    console.error('Error getting recent photos:', error);
    return [];
  }
}
