// Project.jsx (replace your existing Project component with this)
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Header from '../../../../common/Components/Header'
import Sidebar from '../../../../common/Components/Sidebar'
import { UseSideBarContext } from '../../../../Context/SideBarOpenProvider'
import { setFilesForPrefix } from '../../../../features/Repos'
import ProjectDetails from './Components/ProjectDetails'

const backendUrl = import.meta.env.VITE_BACKEND_URL

export default function Project() {
  const { repoId, userBucket, repoName } = useParams()
  const location = useLocation()
  const pathname = location.pathname
  const decodedPathname = decodeURIComponent(pathname)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isSideBarOpen, setIsSiderOpen } = UseSideBarContext()
  const { files } = useSelector(state => state.Repos || {})

  const [localItems, setLocalItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [navLocked, setNavLocked] = useState(false) // prevent double navigation

  // base segments for this repo route
  const baseSegments = useMemo(
    () => ['file-manager', String(repoId), String(userBucket), String(repoName)],
    [repoId, userBucket, repoName]
  )

  // compute pathAfterRepo robustly (decoded form)
  const pathAfterRepo = useMemo(() => {
    const decodedBase = '/' + baseSegments.join('/')
    if (decodedPathname.startsWith(decodedBase)) {
      return decodedPathname.slice(decodedBase.length).replace(/^\/+|\/+$/g, '')
    }
    // fallback: try to find first occurrence and slice (still robust)
    const idx = decodedPathname.indexOf(decodedBase)
    if (idx !== -1) {
      return decodedPathname.slice(idx + decodedBase.length).replace(/^\/+|\/+$/g, '')
    }
    return ''
  }, [decodedPathname, baseSegments])

  // prefix used by backend calls (S3-like)
  const prefix = useMemo(() => {
    const cleaned = pathAfterRepo ? pathAfterRepo.replace(/^\/+|\/+$/g, '') : ''
    return cleaned ? `${userBucket}/${repoName}/${cleaned}` : `${userBucket}/${repoName}`
  }, [pathAfterRepo, userBucket, repoName])

  // helper: build normalized URL from segments (encodes each)
  const buildUrl = useCallback((...segments) => {
    const safe = segments.map(s => encodeURIComponent(String(s)).replace(/%2F/g, '%252F'))
    // note: replace %2F -> %252F so original slashes inside names don't break path segments
    return '/' + safe.join('/')
  }, [])

  // improved navigate helper with guard & lock
  const safeNavigate = useCallback(
    target => {
      if (navLocked) return
      // avoid pushing same URL repeatedly
      const current = decodeURIComponent(
        window.location.pathname + window.location.search + window.location.hash
      )
      if (target === current || target === pathname) return
      setNavLocked(true)
      navigate(target)
      // unlock after short delay
      setTimeout(() => setNavLocked(false), 350)
    },
    [navLocked, navigate, pathname]
  )

  // goToFolder: append folderKey to current pathAfterRepo segments
  const goToFolder = useCallback(
    folderKey => {
      const currentParts = pathAfterRepo ? pathAfterRepo.split('/').filter(Boolean) : []
      const newSegments = [...baseSegments, ...currentParts, folderKey]
      const target = buildUrl(...newSegments)
      safeNavigate(target)
    },
    [baseSegments, pathAfterRepo, buildUrl, safeNavigate]
  )

  // openFile: navigate to file-view with same segment logic
  const openFile = useCallback(
    fileKey => {
      const currentParts = pathAfterRepo ? pathAfterRepo.split('/').filter(Boolean) : []
      const newSegments = ['file-view', ...baseSegments.slice(1), ...currentParts, fileKey] // note file-view route structure
      // above: 'file-view', repoId, userBucket, repoName, <path...>, file
      const target = buildUrl(...newSegments)
      console.log(target)

      safeNavigate(target)
    },
    [baseSegments, pathAfterRepo, buildUrl, safeNavigate]
  )

  // fetch folder contents (cached by prefix in redux)
  const fetchRepoFolder = useCallback(async () => {
    const cached = files?.[prefix]
    if (cached?.fetched) {
      setLocalItems(cached.items)
      return
    }
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/repos/fetch/${encodeURIComponent(prefix)}`, {
        withCredentials: true,
      })
      const items = response?.data?.items ?? []
      dispatch(setFilesForPrefix({ prefix, items }))
      setLocalItems(items)
    } catch (err) {
      console.error('Fetch folder error', err)
      dispatch(setFilesForPrefix({ prefix, items: [] }))
      setLocalItems([])
    } finally {
      setLoading(false)
    }
  }, [prefix, files, dispatch])

  useEffect(() => {
    fetchRepoFolder()
  }, [fetchRepoFolder, prefix])

  return (
    <>
      <Header setIsSiderOpen={setIsSiderOpen} isSideBarOpen={isSideBarOpen} />
      <div className="w-full h-screen overflow-hidden inline-flex  ">
        <Sidebar isSideBarOpen={isSideBarOpen} />
        <ProjectDetails
          repoId={repoId}
          repoName={repoName}
          prefix={prefix}
          items={localItems}
          isLoading={loading}
          goToFolder={goToFolder}
          openFile={openFile}
        />
      </div>
    </>
  )
}
