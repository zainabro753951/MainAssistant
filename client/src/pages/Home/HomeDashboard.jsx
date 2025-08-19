import Header from '../../common/Components/Header'
import Sidebar from '../../common/Components/Sidebar'
import { UseSideBarContext } from '../../Context/SideBarOpenProvider'
import Hero from './Components/Hero'

const HomeDashboard = () => {
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()

  return (
    <>
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <div className="w-full h-screen flex overflow-hidden bg-[#0f1126] text-white">
        <Sidebar isSideBarOpen={isSideBarOpen} />
        <main className="flex-1 overflow-auto sidebar-scrollbar">
          <Hero />
        </main>
      </div>
    </>
  )
}

export default HomeDashboard
