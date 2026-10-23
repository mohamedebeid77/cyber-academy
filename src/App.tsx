import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AcademyProvider } from './context/AcademyContext';
import { AppLayout } from './components/layout/AppLayout';
import { androidAcademy, networkAcademy, iosAcademy } from './academies';
import type { AcademyDefinition } from './academies';
import Landing from './pages/Landing';
import NetworkHome from './pages/NetworkHome';
import IOSHome from './pages/IOSHome';
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import MyLearningPath from './pages/MyLearningPath';
import Roadmap from './pages/Roadmap';
import LabsPage from './pages/LabsPage';
import LabDetailPage from './pages/LabDetailPage';
import CTFPage from './pages/CTFPage';
import CTFDetailPage from './pages/CTFDetailPage';
import ToolkitPage from './pages/ToolkitPage';
import ToolDetailPage from './pages/ToolDetailPage';
import CheatsheetsPage from './pages/CheatsheetsPage';
import CheatsheetDetailPage from './pages/CheatsheetDetailPage';
import GlossaryPage from './pages/GlossaryPage';
import NotesPage from './pages/NotesPage';
import BookmarksPage from './pages/BookmarksPage';
import ProgressPage from './pages/ProgressPage';
import SourcesPage from './pages/SourcesPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

/** One academy instance = its own provider (own content + own progress storage) around the shared shell. */
function AcademyShell({ academy }: { academy: AcademyDefinition }) {
  return (
    <AcademyProvider key={academy.id} academy={academy}>
      <AppLayout />
    </AcademyProvider>
  );
}

/** The shared page tree mounted under every academy's route base. */
function academyRoutes(index: ReactNode) {
  return (
    <>
      <Route index element={index} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="path" element={<LearningPath />} />
      <Route path="path/module/:moduleId" element={<ModulePage />} />
      <Route path="lesson/:lessonId" element={<LessonPage />} />
      <Route path="my-path" element={<MyLearningPath />} />
      <Route path="roadmap" element={<Roadmap />} />
      <Route path="labs" element={<LabsPage />} />
      <Route path="labs/:labId" element={<LabDetailPage />} />
      <Route path="ctf" element={<CTFPage />} />
      <Route path="ctf/:challengeId" element={<CTFDetailPage />} />
      <Route path="toolkit" element={<ToolkitPage />} />
      <Route path="toolkit/:toolId" element={<ToolDetailPage />} />
      <Route path="cheatsheets" element={<CheatsheetsPage />} />
      <Route path="cheatsheets/:sheetId" element={<CheatsheetDetailPage />} />
      <Route path="glossary" element={<GlossaryPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="bookmarks" element={<BookmarksPage />} />
      <Route path="progress" element={<ProgressPage />} />
      <Route path="sources" element={<SourcesPage />} />
      <Route path="admin" element={<AdminPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Landing: the Android academy home + platform hub (existing page, unchanged behavior). */}
      <Route
        path="/"
        element={
          <AcademyProvider academy={androidAcademy}>
            <Landing />
          </AcademyProvider>
        }
      />
      {/* Android Pentesting Academy — original routes, untouched. */}
      <Route path="/app" element={<AcademyShell academy={androidAcademy} />}>
        {academyRoutes(<Navigate to="/app/dashboard" replace />)}
      </Route>
      {/* Network Security & Pentesting Academy — separate academy, same engine. */}
      <Route path="/network" element={<AcademyShell academy={networkAcademy} />}>
        {academyRoutes(<NetworkHome />)}
      </Route>
      {/* iOS Application Pentesting Academy — separate academy, same engine. */}
      <Route path="/ios" element={<AcademyShell academy={iosAcademy} />}>
        {academyRoutes(<IOSHome />)}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
