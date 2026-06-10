import { useWindowDimensions } from 'react-native';

// Phone < 600 <= tablet < 900 <= large. Content is capped so cards don't
// ugly-stretch on tablets; grids go 2-up on tablet, 1-up on phone.
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600;
  const isLarge = width >= 900;
  return {
    width,
    height,
    isPhone: !isTablet,
    isTablet,
    isLarge,
    maxContentWidth: 640,
    numColumns: isTablet ? 2 : 1,
  };
}
