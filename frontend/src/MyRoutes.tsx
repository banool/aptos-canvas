import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import MainLayout from "./layouts/MainLayout";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ViewPage } from "./pages/ViewPage";
import { CreatePage } from "./pages/CreatePage";

export default function MyRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/create"
        element={
          <MainLayout>
            <CreatePage />
          </MainLayout>
        }
      />
      <Route path="/view">
        <Route
          path=":address"
          element={
            <MainLayout>
              <ViewPage />
            </MainLayout>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFoundPage />
          </MainLayout>
        }
      />
    </Routes>
  );
}
