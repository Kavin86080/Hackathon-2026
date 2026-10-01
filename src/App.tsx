import React, { useState } from 'react';
import { User, Role } from './types/index.ts';
import { Header } from './components/Header.tsx';
import { Sidebar, ActiveTab } from './components/Sidebar.tsx';
import { AnswerEvaluations } from './pages/AnswerEvaluations.tsx';
import { QuestionsArchitect } from './pages/QuestionsArchitect.tsx';
import { FeedbackReport } from './pages/FeedbackReport.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { FacultyDashboard } from './pages/FacultyDashboard.tsx';
import { KnowledgeBase } from './pages/KnowledgeBase.tsx';
import { FacultyAnalytics } from './pages/FacultyAnalytics.tsx';
import { StudentAnswerEditor } from './pages/StudentAnswerEditor.tsx';
import { StudentAssessments } from './pages/StudentAssessments.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { NewRubricModal } from './components/NewRubricModal.tsx';
import { KnowledgeUploadModal } from './components/KnowledgeUploadModal.tsx';
import { api } from './services/api.ts';

const FACULTY_USER: User = {
  id: 'usr-fac-1',
  name: 'Prof. Elena Vance',
  email: 'elena.vance@stanford.edu',
  role: 'faculty',
  title: 'CS Chair & Evaluator',
  department: 'Dept. of Computer Science',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida/AEtjO1VwitBe-3mMutump2lTEGq4Eb2qoTFTarX9zGZxvOsK45C2QKCjutDOCs6RtbnGmjVs5Fss6DhxBj5R8ch0T-jxZZ8mwuOVyvvO4VHkLz4N_08wd6rBXgLxDZlOE7qPTLcolFruYskWz-ynoB6Rkeok1Tu59MxY7_piiLKFcrGC9Rj6HL7E4-T1pKy5Nl7th31CHT6V7Q3H_4pzcB2Q0IBdv_pE43YgzbrruMcyyTswxfARb7kCnxd_7To',
};

const STUDENT_USER: User = {
  id: 'usr-stu-1',
  name: 'Alex Chen',
  email: 'alex.chen@stanford.edu',
  role: 'student',
  title: 'Undergrad · AI Specialization',
  department: 'Computer Science',
  studentId: 'CS-2024-883',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCdTw4MunwNqvV9FBxMGoTfVCgLz760JQDn4sbQpCAMeewe8Kep3cs3Hxgg5OUUszTmA3gpAZye9yp5dHexfgXUF_ZeY42ejcRkZvqSMHQ4QAd-ta0j9r_9jlmXyhHNEO2YUd3OE4guyOpk82CL64Lc7-k4Q-G4KlpB1cZmgJFe10zJMLfSk95UOVF16fr6bkOfEsQNZ4Q3Xgl3mcdKlc_vxZz6KLKbP6KC4ZUTtTAlLRycRtKohd9d',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(FACULTY_USER);
  const [activeTab, setActiveTab] = useState<ActiveTab>('answer-evaluations');
  const [isNewRubricOpen, setIsNewRubricOpen] = useState(false);
  const [isKnowledgeUploadOpen, setIsKnowledgeUploadOpen] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState('ans-alex-cs231n-04');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleToggle = (newRole: Role) => {
    if (newRole === 'student') {
      setCurrentUser(STUDENT_USER);
      setActiveTab('student-dashboard');
    } else {
      setCurrentUser(FACULTY_USER);
      setActiveTab('answer-evaluations');
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateToFeedback = (answerId: string) => {
    setSelectedAnswerId(answerId);
    if (currentUser.role === 'student') {
      setActiveTab('student-feedback');
    } else {
      setActiveTab('feedback-explanations');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface antialiased font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar: Fixed width ~300px, stays fixed on the left, own vertical scroll */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-200 ease-in-out shrink-0 w-[300px] h-full`}
      >
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Area: Top Header + Page Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onRoleToggle={handleRoleToggle}
          onOpenNewRubric={() => setIsNewRubricOpen(true)}
          onResetDemo={handleResetDemo}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Page Content: Centered Container max-width: 1440px, padding: 24px 32px */}
        <main
          className="w-full flex-1 box-border"
          style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 32px' }}
        >
          {/* FACULTY TABS */}
          {activeTab === 'faculty-dashboard' && (
            <FacultyDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewRubric={() => setIsNewRubricOpen(true)}
              onOpenKnowledgeUpload={() => setIsKnowledgeUploadOpen(true)}
            />
          )}

          {activeTab === 'questions-rubrics' && (
            <QuestionsArchitect onOpenNewRubricModal={() => setIsNewRubricOpen(true)} />
          )}

          {activeTab === 'answer-evaluations' && (
            <AnswerEvaluations onNavigateToFeedback={handleNavigateToFeedback} />
          )}

          {activeTab === 'feedback-explanations' && (
            <FeedbackReport answerId={selectedAnswerId} />
          )}

          {activeTab === 'knowledge-base' && (
            <KnowledgeBase onOpenUpload={() => setIsKnowledgeUploadOpen(true)} />
          )}

          {activeTab === 'faculty-analytics' && <FacultyAnalytics />}

          {/* STUDENT TABS */}
          {activeTab === 'student-dashboard' && (
            <StudentDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenWhyModal={() => setActiveTab('student-feedback')}
            />
          )}

          {activeTab === 'student-assessments' && (
            <StudentAssessments onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'student-editor' && (
            <StudentAnswerEditor
              questionId="q-cs231n-04"
              onSubmitted={(ansId) => {
                setSelectedAnswerId(ansId);
                setActiveTab('student-feedback');
              }}
            />
          )}

          {activeTab === 'student-feedback' && (
            <FeedbackReport answerId={selectedAnswerId} />
          )}

          {activeTab === 'student-progress' && (
            <StudentDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenWhyModal={() => setActiveTab('student-feedback')}
            />
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsPage currentUser={currentUser} onResetDemo={handleResetDemo} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewRubricModal
        isOpen={isNewRubricOpen}
        onClose={() => setIsNewRubricOpen(false)}
        onSuccess={() => {
          setActiveTab('questions-rubrics');
        }}
      />

      <KnowledgeUploadModal
        isOpen={isKnowledgeUploadOpen}
        onClose={() => setIsKnowledgeUploadOpen(false)}
        onSuccess={() => {
          setActiveTab('knowledge-base');
        }}
      />
    </div>
  );
}
