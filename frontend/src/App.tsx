import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { LandingPage } from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import Dashboard from "./pages/Dashboard";
import CreateArticle from "./pages/CreateArticle";
import AppLayout from "./components/AppLayout";
import ArticleDetail from "./pages/ArticleDetailPage";
import MyArticlesPage from "./pages/MyArticles";
import ArticleEditPage from "./pages/ArticleEdit";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />


          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/article/:id" element={<ArticleDetail />} />

              <Route path="/create-article" element={<CreateArticle />} />
              <Route path="/my-articles" element={<MyArticlesPage />} />
              <Route path="/articles/edit/:id" element={<ArticleEditPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
