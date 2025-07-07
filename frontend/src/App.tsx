import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PasswordResetForm from "./components/PasswordResetForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UserProfile from "./components/UserProfile";
import CreateCourseForm from "./components/CreateCourseForm";
import CourseList from "./components/CourseList";
import CourseDetail from "./components/CourseDetail";
import LogoutButton from "./components/LogoutButton";
import RankedExercisesPage from "./pages/PracticalExercisesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRankedExercises from "./pages/AdminPracticalExercises";
import { jwtDecode } from "jwt-decode";
import PackList from "./components/PackList";
import MyPacks from "./components/MyPack";
import AdminPackForm from "./components/AdminPackForm";
import AdminPackStudents from "./components/AdminPackStudents";
import AdminPackList from "./components/AdminPackList";
import AdminManageCourses from "./components/AdminManageCourses";
import RankedExerciseRunnerPage from "./pages/PracticalExerciseRunnerPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CreditPage from "./pages/CreditPage";
import LiveSessionsCalendar from "./components/LiveSessionsCalendar";
import AdminCreditPage from "./pages/AdminCreditPage";
import LiveSessionDetail from "./pages/LiveSessionDetail";
import ContactPage from "./pages/ContactPage";
import RankedExerciseSolutionsPage from "./pages/PracticalExerciseSolutionsPage";
import MyRankPage from "./pages/MyRankPage";
import ManageRankingPage from "./pages/ManageRankingPage";
import AdminManageThemes from "./pages/AdminManageThemes";

function Home() {
  return <h2>Welcome to the Platform!</h2>;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const handleStorage = () => setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string }>(token);
        setUserRole(decoded.role);
      } catch {
        setUserRole("");
        localStorage.removeItem("token"); // Remove invalid token
      }
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <div>
        <nav>
          {isAuthenticated && (userRole === "student") && (
            <>
              <Link to='/courses'>Cours</Link>| <Link to='/my-rank'>Mon Rang</Link>{" "}
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to='/login'>Connexion</Link> | <Link to='/register'>S'inscrire</Link> |{" "}
            </>
          )}
          <Link to='/contact'>Contact</Link> |{" "}
          {isAuthenticated && (
            <>
              <Link to='/profile'>Profil</Link> | <Link to='/live-sessions'>Sessions en Direct</Link> |{" "}
              {( userRole === "admin" || userRole === "superadmin") && (
                <>
                  <Link to='/create-course'>Créer un Cours</Link> |{" "}
                </>
              )}
              {/* Only students can see practical Exercises */}
              {(userRole === "student" || userRole === "admin" || userRole === "superadmin") && (
                <>
                  <Link to='/practical-exercises'>Exercices Pratiques</Link> |{" "}
                </>
              )}
              {userRole === "student" && (
                <>
                  <Link to='/packs'>Tous les Packs</Link> | <Link to='/my-pack'>Mon Pack</Link> |{" "}
                  <Link to='/credit'>Mon Crédit</Link>
                </>
              )}
              {(userRole === "admin" || userRole === "superadmin") && (
                <>
                  <Link to='/manage-courses'>Gérer les Cours</Link> |{" "}
                </>
              )}
              <LogoutButton onLogout={() => setIsAuthenticated(false)} /> |{" "}
            </>
          )}
          {isAuthenticated && (userRole === "admin" || userRole === "superadmin") && (
            <>
              <Link to='/admin/packs/new'>Create Pack</Link> |{" "}
              <Link to='/admin/packs'>Manage Packs</Link> |{" "}
              <Link to='/admin/practical-exercises'>Gérer les Exercices</Link> |{" "}
              <Link to='/admin/credit'>Gestion des Crédits</Link> |{" "}
              <Link to='/admin/manage-ranking'>Gérer le Classement</Link>|{" "}
              <Link to='/admin/manage-themes'>Gérer les Thèmes</Link> |{" "}
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
                <CourseList userRole={userRole} />
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
            path='/practical-exercises'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student", "admin", "superadmin"]}
                userRole={userRole}
              >
                <RankedExercisesPage />
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
            path='/admin/practical-exercises'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["admin"]}
                userRole={userRole}
              >
                <AdminRankedExercises />
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
            path='/practical-exercises/:exerciseId'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student", "admin", "superadmin"]}
                userRole={userRole}
              >
                <RankedExerciseRunnerPage />
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
                <LiveSessionsCalendar
                  userRole={userRole}
                  token={localStorage.getItem("token") || ""}
                />
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
            path='/practical-exercises/:exerciseId/solutions'
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                roles={["student"]}
                userRole={userRole}
              >
                <RankedExerciseSolutionsPage />
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
        </Routes>
      </div>
    </Router>
  );
};

export default App;
