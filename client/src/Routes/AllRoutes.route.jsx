import HomeDashboard from '../pages/Home/HomeDashboard'
import ChatBox from '../pages/AIChatBot/ChatBox'
import ImageGen from '../pages/ImageGenerator/ImageGen'
import Faqs from '../pages/FAQs/Faqs'
import ProfileSettings from '../pages/Profile/ProfileSettings'
import Folders from '../pages/FileManager/Folders'
import Project from '../pages/FileManager/pages/ProjectFolder/Project'
import Register from '../pages/Register'
import Login from '../pages/Login'
import CreateRepo from '../pages/FileManager/pages/CreateFolder/CreateRepo'
import FileContent from '../pages/FileManager/pages/FileContent/FileContent'
import ResetPassword from '../pages/ResetPassword'

export const AllRoutes = [
  {
    path: '/',
    element: <HomeDashboard />,
  },
  {
    path: '/virtual-ai-assistant',
    element: <ChatBox />,
  },
  {
    path: '/image-generator',
    element: <ImageGen />,
  },
  {
    path: '/faqs',
    element: <Faqs />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/profile-settings',
    element: <ProfileSettings />,
  },
  {
    path: '/file-manager',
    element: <Folders />,
  },
  {
    path: 'file-manager/create-repo',
    element: <CreateRepo />,
  },
  {
    path: '/file-manager/:repoId/:userBucket/:repoName/*',
    element: <Project />,
  },
  {
    path: '/file-view/:repoId/:userBucket/:repoName/*',
    element: <FileContent />,
  },
]
