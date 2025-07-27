import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PasswordResetForm from "./pages/PasswordResetForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import UserProfile from "./pages/UserProfile";
import CreateCourseForm from "./pages/CreateCourseForm";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import LogoutButton from "./components/LogoutButton";
import PracticalExercicesPage from "./pages/PracticalExercicesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRankedExercices from "./pages/AdminPracticalExercices";
import { jwtDecode } from "jwt-decode";
import PackList from "./pages/PackList";
import MyPacks from "./pages/MyPack";
import AdminPackForm from "./pages/AdminPackForm";
import AdminPackStudents from "./pages/AdminPackStudents";
import AdminPackList from "./pages/AdminPackList";
import AdminManageCourses from "./pages/AdminManageCourses";
import PracticalExerciceRunnerPage from "./pages/PracticalExerciceRunnerPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CreditPage from "./pages/CreditPage";
import LiveSessionsCalendar from "./pages/LiveSessionsCalendar";
import AdminCreditPage from "./pages/AdminCreditPage";
import LiveSessionDetail from "./pages/LiveSessionDetail";
import ContactPage from "./pages/ContactPage";
import PracticalExerciceSolutionsPage from "./pages/PracticalExerciceSolutionsPage";
import MyRankPage from "./pages/MyRankPage";
import ManageRankingPage from "./pages/ManageRankingPage";
import AdminManageThemes from "./pages/AdminManageThemes";
import AdminReductionCodeList from "./pages/AdminReductionCodeList";
import AdminEditPracticalExercice from "./pages/AdminEditPracticalExercice";
import AdminExercice from "./pages/AdminExercice";
import AdminEditExercice from "./pages/AdminEditExercice";
import AdminNewExercice from "./pages/AdminNewExercice";
import ExercicesPage from "./pages/ExercicesPage";
import ExercicesDetailPage from "./pages/ExercicesDetailPage";
import AdminManageStudents from "./pages/AdminManageStudents";
import AdminVerifyPayments from "./pages/AdminVerifyPayments";
import Header from "./components/Header/Header";
import "./styles/global.css";

function Home() {
  return <h2>Welcome to the Platform!</h2>;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const handleStorage = () => setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string; id?: string; userId?: string }>(token);
        setUserRole(decoded.role);
        // Try to get user id from token (id or userId field)
        if (decoded.id) setUserId(decoded.id);
        else if (decoded.userId) setUserId(decoded.userId);
        else setUserId("");
      } catch {
        setUserRole("");
        setUserId("");
        localStorage.removeItem("token"); // Remove invalid token
      }
    } else {
      setUserId("");
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="app">
        <Header />
        <nav>
          {isAuthenticated && userRole === "student" && (
            <>
              <Link to='/courses'>Cours</Link> | <Link to='/my-rank'>Mon Rang</Link> | <Link to='/practical-exercices'>Exercices Pratiques</Link> | <Link to='/packs'>Tous les Packs</Link> | <Link to='/my-pack'>Mon Pack</Link> | <Link to='/credit'>Mon Crédit</Link> | <Link to='/exercices'>Exercices</Link> | {" "}
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to='/login'>Connexion</Link> | <Link to='/register'>S'inscrire</Link> | {" "}
            </>
          )}
          <Link to='/contact'>Contact</Link> | {" "}
          {isAuthenticated && (
            <>
              <Link to='/profile'>Profil</Link> | <Link to='/live-sessions'>Sessions en Direct</Link> | {" "}
              {(userRole === "admin" || userRole === "superadmin") && (
                <>
                  <Link to='/create-course'>Créer un Cours</Link> | <Link to='/admin/students'>Gérer les Étudiants</Link> | {" "}
                </>
              )}
              <LogoutButton onLogout={() => setIsAuthenticated(false)} /> | {" "}
            </>
          )}
          {isAuthenticated && (userRole === "admin" || userRole === "superadmin") && (
            <>
              <Link to='/admin/packs/new'>Create Pack</Link> | <Link to='/admin/packs'>Manage Packs</Link> | <Link to='/admin/practical-exercices'>Gérer les Exercices Pratiques</Link> | <Link to='/admin/credit'>Gestion des Crédits</Link> | <Link to='/admin/manage-ranking'>Gérer le Classement</Link> | <Link to='/admin/manage-themes'>Gérer les Thèmes</Link> | <Link to='/admin/user-pack-reductions'>Gérer les Réductions</Link> | <Link to='/admin/verify-payments'>Vérifier les Paiements</Link> | {" "}
            </>
          )}
          {!isAuthenticated && <Link to='/request-password-reset'>Mot de passe oublié ?</Link>}
        </nav>
        <Routes>
          <Route path='/' element={<Home />} />

          {/* Public routes */}
          <Route
            path='/login'
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <LoginForm onLogin={() => setIsAuthenticated(true)} />
              </PublicRoute>
            }
          />
          <Route
            path='/register'
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <RegisterForm />
              </PublicRoute>
            }
          />
          <Route
            path='/request-password-reset'
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <PasswordResetForm />
              </PublicRoute>
            }
          />
          <Route
            path='/reset-password'
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <ResetPasswordForm />
              </PublicRoute>
            }
          />
          <Route path='/contact' element={<ContactPage />} />

          {/* Protected routes */}
          <Route
            path='/courses'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student", "admin", "superadmin"]}
                userRole={userRole}
              >
                <CourseList userRole={userRole} userId={userId} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/courses/:id'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student", "admin", "superadmin"]}
                userRole={userRole}
              >
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/create-course'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <CreateCourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path='/practical-exercices'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student", "admin", "superadmin"]}
                userRole={userRole}
              >
                <PracticalExercicesPage userId={userId} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/exercices'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <ExercicesPage token={localStorage.getItem("token") || ""} userId={userId} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/student/exercice/:id'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <ExercicesDetailPage />
              </ProtectedRoute>
            }
          />


          <Route
            path='/packs'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <PackList userRole={userRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/my-pack'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <MyPacks />
              </ProtectedRoute>
            }
          />
          <Route
            path='/credit'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <CreditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/packs/new'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminPackForm />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/packs/:id/edit'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminPackForm />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/packs'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminPackList />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/packs/:id/students'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminPackStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/practical-exercices'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin"]}
                userRole={userRole}
              >
                <AdminRankedExercices />
              </ProtectedRoute>
            }
          />
          <Route
            path='/manage-courses'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminManageCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path='/practical-exercices/:exerciceId'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student", "admin", "superadmin"]}
                userRole={userRole}
              >
                <PracticalExerciceRunnerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/verify-email'
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <VerifyEmailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/live-sessions'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student", "admin", "superadmin"]}
                userRole={userRole}
              >
                <LiveSessionsCalendar userRole={userRole} token={localStorage.getItem("token") || ""} userId=
                  {userId} />
              </ProtectedRoute>
            }
          />
          <Route
            path='/live-sessions/:id'
            element={
              <LiveSessionDetail userRole={userRole} token={localStorage.getItem("token") || ""} />
            }
          />
          <Route
            path='/admin/credit'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminCreditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/practical-exercices/:exerciceId/solutions'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <PracticalExerciceSolutionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path='/my-rank'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <MyRankPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/manage-ranking'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <ManageRankingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/manage-themes'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminManageThemes />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/user-pack-reductions'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminReductionCodeList />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/practical-exercices/edit/:exerciceId'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminEditPracticalExercice />
              </ProtectedRoute>
            }
          />

          <Route
            path='/admin/exercices'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminExercice />
              </ProtectedRoute>
            }
          />

          <Route
            path='/admin/exercices/edit/:exerciceId'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminEditExercice />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/exercices/new'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminNewExercice />
              </ProtectedRoute>
            }
          />

          <Route
            path='/admin/students'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminManageStudents />
              </ProtectedRoute>
            }
          />

                    <Route
            path='/admin/verify-payments'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin", "superadmin"]}
                userRole={userRole}
              >
                <AdminVerifyPayments />
              </ProtectedRoute>
            }
          />

          
        </Routes>
      </div>
    </Router>
  );
};

export default App;
