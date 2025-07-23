import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardOverview } from '@/components/DashboardOverview';
import { ProjectsManagement } from '@/components/ProjectsManagement';
import { SkillsManagement } from '@/components/SkillsManagement';
import { MessagesManagement } from '@/components/MessagesManagement';
import { UrlManagement } from '@/components/UrlManagement';
import { authAPI, projectsAPI, skillsAPI, messagesAPI, urlAPI } from '@/lib/api';
import './App.css';

interface Project {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  demoLink: string;
  sourceCodeLink: string;
}

interface Skill {
  _id: string;
  name: string;
  image: string;
}

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phoneNo?: string;
  subject: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
}

interface ShortenedUrl {
  _id: string;
  shortenUrl: string;
  fullUrl: string;
  clicks: number;
  userId: string;
  isDeleted: boolean;
  createdAt?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  
  // Pagination states
  const [urlPagination, setUrlPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [currentUrlPage, setCurrentUrlPage] = useState(1);

  useEffect(() => {
    // Check if user is already authenticated (you might want to implement proper token storage)
    const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(isLoggedIn);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      const [projectsData, skillsData, messagesData] = await Promise.all([
        projectsAPI.getAll().catch(() => []),
        skillsAPI.getAll().catch(() => []),
        messagesAPI.getAll().catch(() => []),
      ]);

      setProjects(projectsData);
      setSkills(skillsData);
      setMessages(messagesData);
      
      // Load URLs separately with pagination
      await loadUrlsData(currentUrlPage);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadUrlsData = async (page: number = 1) => {
    try {
      const urlsResponse = await urlAPI.getAll(page, 20);
      setUrls(urlsResponse.data);
      setUrlPagination(urlsResponse.pagination);
    } catch (error) {
      console.error('Failed to load URLs:', error);
      setUrls([]);
      setUrlPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false
      });
    }
  };

  const handleUrlPageChange = async (page: number) => {
    setCurrentUrlPage(page);
    await loadUrlsData(page);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await authAPI.login(email, password);
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setActiveSection('overview');
  };

  // Project handlers
  const handleAddProject = async (projectData: Omit<Project, '_id'> | FormData) => {
    await projectsAPI.create(projectData);
    await loadDashboardData();
  };

  const handleUpdateProject = async (id: string, projectData: Omit<Project, '_id'> | FormData) => {
    await projectsAPI.update(id, projectData);
    await loadDashboardData();
  };

  const handleDeleteProject = async (id: string) => {
    await projectsAPI.delete(id);
    await loadDashboardData();
  };

  // Skill handlers
  const handleAddSkill = async (skillData: Omit<Skill, '_id'> | FormData) => {
    await skillsAPI.create(skillData);
    await loadDashboardData();
  };

  const handleUpdateSkill = async (id: string, skillData: Omit<Skill, '_id'> | FormData) => {
    await skillsAPI.update(id, skillData);
    await loadDashboardData();
  };

  const handleDeleteSkill = async (id: string) => {
    await skillsAPI.delete(id);
    await loadDashboardData();
  };

  // URL handlers
  const handleAddUrl = async (urlData: { fullUrl: string }) => {
    await urlAPI.create(urlData);
    await loadUrlsData(currentUrlPage);
  };

  const handleUpdateUrl = async (id: string, urlData: { fullUrl: string; shortCode: string }) => {
    await urlAPI.update(id, urlData);
    await loadUrlsData(currentUrlPage);
  };

  const handleDeleteUrl = async (id: string) => {
    await urlAPI.delete(id);
    await loadUrlsData(currentUrlPage);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <DashboardOverview 
            stats={{
              projects: projects.length,
              skills: skills.length,
              messages: messages.length,
              urls: urlPagination.totalItems,
            }}
          />
        );
      case 'projects':
        return (
          <ProjectsManagement
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case 'skills':
        return (
          <SkillsManagement
            skills={skills}
            onAddSkill={handleAddSkill}
            onUpdateSkill={handleUpdateSkill}
            onDeleteSkill={handleDeleteSkill}
          />
        );
      case 'messages':
        return <MessagesManagement messages={messages} />;
      case 'urls':
        return (
          <UrlManagement
            urls={urls}
            pagination={urlPagination}
            currentPage={currentUrlPage}
            onPageChange={handleUrlPageChange}
            onAddUrl={handleAddUrl}
            onUpdateUrl={handleUpdateUrl}
            onDeleteUrl={handleDeleteUrl}
          />
        );
      default:
        return <DashboardOverview stats={{ projects: 0, skills: 0, messages: 0, urls: 0 }} />;
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default App
