import { useState, useEffect } from "react";
import styled from "styled-components";

export const Spinner = () => {
  const emojis = ["🌎", "🌍", "🌏"];
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
    }, 200);

    return () => clearInterval(interval);
  }, [emojis.length]);

  return (
    <SpinnerStyle>
      <Emoji>{emojis[currentEmojiIndex]}</Emoji>
    </SpinnerStyle>
  );
};

const SpinnerStyle = styled.div`
  font-size: 3rem; /* Adjust the font size to make the emoji bigger */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px; /* Set the height and width to make a square container */
  width: 100px;
`;

const Emoji = styled.div`
  transition: transform 0.25s ease-in-out;
`;
