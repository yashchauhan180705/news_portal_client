import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import EPapers from './pages/EPapers';
import EPaperViewer from './pages/EPaperViewer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Subscribe from './pages/Subscribe';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ArticleManager from './pages/admin/ArticleManager';
import EPaperManager from './pages/admin/EPaperManager';
import CharchapatraManager from './pages/admin/CharchapatraManager';
import EmployeeManager from './pages/admin/EmployeeManager';
import UserManager from './pages/admin/UserManager';
import Charchapatra from './pages/Charchapatra';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Home /><Footer /></>} />
            <Route path="/article/:id" element={<><ArticleView /><Footer /></>} />
            <Route path="/epapers" element={<><EPapers /><Footer /></>} />
            <Route path="/epapers/view" element={<EPaperViewer />} />
            <Route path="/charchapatra" element={<><Charchapatra /><Footer /></>} />
            <Route path="/subscribe" element={<><Subscribe /><Footer /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin/Employee Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="articles" element={<ArticleManager />} />
              <Route path="epapers" element={<EPaperManager />} />
              <Route path="charchapatra" element={<CharchapatraManager />} />
              <Route path="employees" element={<EmployeeManager />} />
              <Route path="users" element={<UserManager />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
