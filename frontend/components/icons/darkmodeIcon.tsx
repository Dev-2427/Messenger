import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../../stores/useThemeStore';

const DarkModeIcon = () => {

  const mode = useThemeStore((state) => state.mode)
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
        fill={ mode === 'light' ? "black" : 'rgba(225, 225, 225, 0.25)'}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.75 13.2499C16.75 18.2205 20.7794 22.2499 25.75 22.2499C26.5976 22.2499 27.4179 22.1327 28.1955 21.9137L28.5642 21.8011C28.8854 21.6937 29.2329 21.8671 29.3403 22.1883C29.3743 22.2899 29.3808 22.3979 29.3603 22.5018L29.3307 22.6039C27.8845 26.3459 24.2522 28.9999 20 28.9999C14.4772 28.9999 10 24.5228 10 18.9999C10 14.9354 12.4249 11.4373 15.9069 9.87327L16.0305 9.8198L16.1679 9.76426C16.5422 9.61755 16.9646 9.80209 17.1113 10.1764C17.1589 10.2979 17.1728 10.4294 17.1524 10.557L17.1306 10.6519C16.883 11.4746 16.75 12.3467 16.75 13.2499Z"
        fill="white"
      />
    </Svg>
  );
};

export default DarkModeIcon;
