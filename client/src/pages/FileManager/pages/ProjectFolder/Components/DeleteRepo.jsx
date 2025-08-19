import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const DeleteRepo = ({
  repoName,
  onDelete,
  onClose,
  deleteConfirm,
  setDeleteConfirm,
  isDeletePopUpOpen,
}) => {
  return (
    <AnimatePresence>
      {isDeletePopUpOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 bg-[rgba(15,17,38,0.9)] border border-[#22334f] rounded-xl p-6 shadow-2xl"
          >
            <h3 className="text-xl md:text-2xl font-bold text-red-500 mb-3">
              Delete Repo "{repoName}"
            </h3>
            <p className="text-white/70 mb-4">
              Type <strong className="text-white">DELETE</strong> to confirm deletion.
            </p>

            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-[#08101b] border border-[#1f324a] rounded-md px-3 py-2 text-white mb-4 outline-none"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                disabled={deleteConfirm !== 'DELETE'}
                className={`px-4 py-2 rounded-md text-white ${
                  deleteConfirm === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-600/50 cursor-not-allowed'
                }`}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DeleteRepo
