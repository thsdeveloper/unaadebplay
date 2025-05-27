import { StyleSheet } from 'react-native';
import { SCREEN_DIMENSIONS, CAROUSEL_CONFIG, COLORS, SIZES, Z_INDEX } from '../constants';

export const styles = StyleSheet.create({
  // Container styles
  container: {
    height: SCREEN_DIMENSIONS.height * CAROUSEL_CONFIG.CONTAINER_HEIGHT_RATIO,
    width: SCREEN_DIMENSIONS.width,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  // Item styles
  itemContainer: {
    width: SCREEN_DIMENSIONS.width,
    height: SCREEN_DIMENSIONS.height * CAROUSEL_CONFIG.ITEM_HEIGHT_RATIO,
    position: 'relative',
  },
  
  // Poster styles
  posterContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    overflow: 'hidden', // Prevent content from going outside bounds during animation
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  
  // Overlay styles
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: Z_INDEX.OVERLAY,
  },
  generalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.GENERAL_OVERLAY,
  },
  
  // Gradient styles
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  
  // Content styles
  contentContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80,
    alignItems: 'center',
    paddingHorizontal: SIZES.SPACING_LG,
    zIndex: Z_INDEX.CONTENT,
  },
  
  // Tag styles
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.SPACING_LG,
    flexWrap: 'wrap',
  },
  tagText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: SIZES.TEXT_BODY,
  },
  tagDot: {
    width: SIZES.TAG_DOT_SIZE,
    height: SIZES.TAG_DOT_SIZE,
    backgroundColor: COLORS.TEXT_PRIMARY,
    opacity: 0.6,
    borderRadius: SIZES.TAG_DOT_SIZE / 2,
    marginHorizontal: SIZES.SPACING_SM,
  },
  
  // Button styles
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: SIZES.SPACING_LG,
  },
  sideButton: {
    alignItems: 'center',
    width: SIZES.BUTTON_SIDE_WIDTH,
  },
  playButton: {
    backgroundColor: COLORS.BUTTON_PRIMARY_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.BUTTON_PADDING_H,
    paddingVertical: SIZES.BUTTON_PADDING_V,
    borderRadius: SIZES.BORDER_RADIUS,
  },
  playButtonText: {
    color: COLORS.BUTTON_PRIMARY_TEXT,
    fontWeight: 'bold',
    marginLeft: SIZES.SPACING_SM,
    fontSize: SIZES.TEXT_BODY + 2,
  },
  buttonSmallText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: SIZES.TEXT_SMALL,
    marginTop: SIZES.SPACING_XS,
  },
  
  // Loading styles
  imageLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.IMAGE_LOADER_BG,
    zIndex: Z_INDEX.IMAGE_LOADER,
  },
  
  // Skeleton styles
  skeletonContainer: {
    width: SCREEN_DIMENSIONS.width,
    height: SCREEN_DIMENSIONS.height * CAROUSEL_CONFIG.ITEM_HEIGHT_RATIO,
    backgroundColor: COLORS.BACKGROUND,
    position: 'relative',
  },
  skeletonContent: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    alignItems: 'center',
  },
  
  // Error styles
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.ERROR_CONTAINER_BG,
  },
  errorText: {
    color: COLORS.TEXT_MUTED,
    fontSize: SIZES.TEXT_BODY,
    marginTop: SIZES.SPACING_SM,
  },
  
  // Empty state styles
  emptyContainer: {
    height: SCREEN_DIMENSIONS.height * CAROUSEL_CONFIG.CONTAINER_HEIGHT_RATIO,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  emptyText: {
    color: COLORS.TEXT_MUTED,
    fontSize: SIZES.TEXT_ERROR,
  },
  
  // Refresh indicator styles
  refreshIndicator: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: COLORS.REFRESH_INDICATOR_BG,
    padding: SIZES.REFRESH_INDICATOR_PADDING,
    borderRadius: SIZES.REFRESH_INDICATOR_RADIUS,
    zIndex: Z_INDEX.REFRESH_INDICATOR,
  },
});