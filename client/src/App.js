import{ BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './pages/home';
import LoginPage from './pages/login';
import SignUpPage from './pages/signup';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/protectedRoute';
import Loader from './components/loader';
import { useSelector } from 'react-redux';
import Profile from './pages/profile';

function App() {
  const {loader} = useSelector(state=> state.loaderReducer);
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false}/>
      {loader && <Loader/>}
      <Router>
        <Routes>
          <Route path='/' element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>}/>

            <Route path='/profile' element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>}/>
            
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignUpPage/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
