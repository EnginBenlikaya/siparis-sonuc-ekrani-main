import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<OrderList />} />
          <Route path="/order/:id" element={<OrderDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
