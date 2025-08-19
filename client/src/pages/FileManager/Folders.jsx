// src/pages/Folder/Folders.jsx
import React, { useEffect } from 'react'
import { UseSideBarContext } from '../../Context/SideBarOpenProvider'
import Header from '../../common/Components/Header'
import Sidebar from '../../common/Components/Sidebar'
import FolderSection from './Components/FolderSection'
import axios from 'axios'
import { getQuery } from '../../Queries/GetRepo'
import { useDispatch } from 'react-redux'
import { setRepos } from '../../features/Repos'

const Folders = () => {
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()
  const dispatch = useDispatch()
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // Getting Repo Data
  const getRepo = async () => {
    const response = await axios.get(`${backendUrl}/get/repos`, {
      withCredentials: true,
    })
    return response
  }

  const { data, isLoading, isSuccess } = getQuery('repos', getRepo)

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setRepos(data?.data?.repos))
    }
  }, [isSuccess, data, dispatch])

  return (
    <>
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <div className="w-full h-screen flex overflow-hidden bg-[#0b1224] text-white">
        <Sidebar isSideBarOpen={isSideBarOpen} />

        {/* Main content area */}
        <main className="flex-1 overflow-auto sidebar-scrollbar">
          <FolderSection isLoading={isLoading} />
        </main>
      </div>
    </>
  )
}

export default Folders
