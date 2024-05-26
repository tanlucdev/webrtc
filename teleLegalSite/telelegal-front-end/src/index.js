import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createStore } from 'redux' // lấy createStore method, vì thế có thể tạo redux-store  
import { Provider } from 'react-redux'; // lấy component Provider để bọc cả app
import rootReducer from './redux-elements/reducers/rootReducer';

const theStore = createStore(rootReducer)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={theStore}>
    <App />
  </Provider>
);

