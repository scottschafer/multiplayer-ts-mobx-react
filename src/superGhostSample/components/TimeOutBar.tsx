import { observer } from 'mobx-react';
import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

export interface TimeOutBarProps {
  running: boolean;
  startTime: number;
  currentTime: number;
  timeoutDuration: number;
}

const TimeOutBar = (props: TimeOutBarProps) => {
  const { currentTime, startTime, timeoutDuration } = props;

  const elapsedPercentage = (currentTime - startTime) / timeoutDuration;
  return (
    <ProgressBar animated now={Math.min(100, 100 * elapsedPercentage)}></ProgressBar>
  );
}



export default observer(TimeOutBar);
