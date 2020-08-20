import React from 'react';
import { RootStore } from '../stores/rootStore';

export const storesContext = React.createContext({
  ...new RootStore()
});

