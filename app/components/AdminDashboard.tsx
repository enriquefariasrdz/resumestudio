'use client'

import React, { useEffect, useState } from 'react'
import { getAllUsersAndResumes, updateUserRole } from '../actions/adminActions'
import { Shield, ShieldAlert, Users, FileText, Calendar, Search, RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name?: string | null
  role: 'USER' | 'ADMIN'
  createdAt: Date | string
  updatedAt: Date | string
  resumes: {
    id: string
    title: string
    versionName: string
    content: string
    createdAt: Date | string
    updatedAt: Date | string
  }[]
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [selectedResumeContent, setSelectedResumeContent] = useState<{ userEmail: string; title: string; content: string } | null>(null)
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null)

  const fetchAdminData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAllUsersAndResumes()
      if (res.success && res.users) {
        setUsers(res.users as AdminUser[])
      } else {
        setError(res.error || 'Failed to load administrator data')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const handleRoleToggle = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    setUpdatingRoleUserId(userId)
    try {
      const res = await updateUserRole(userId, newRole)
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
      } else {
        alert(res.error || 'Failed to update role')
      }
    } catch (err: any) {
      alert(err.message || 'Role update failed')
    } finally {
      setUpdatingRoleUserId(null)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalResumes = users.reduce((acc, u) => acc + u.resumes.length, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Shield className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
              <p className="text-sm text-slate-400">
                System-wide overview of all users, credentials, and resume documents.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Users</p>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total User Resumes</p>
            <p className="text-2xl font-bold text-white">{totalResumes}</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Administrators</p>
            <p className="text-2xl font-bold text-white">
              {users.filter((u) => u.role === 'ADMIN').length}
            </p>
          </div>
        </div>
      </div>

      {/* User Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter users by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* User Accounts List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">User Accounts & Access Control</h2>
          <span className="text-xs text-slate-400">Showing {filteredUsers.length} user(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-3" />
            <p>Loading all user profiles and resumes...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No user accounts found matching your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredUsers.map((user) => {
              const isExpanded = expandedUser === user.id
              return (
                <div key={user.id} className="p-4 sm:p-6 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-white text-base">
                          {user.name || user.email.split('@')[0]}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center font-medium text-slate-300">
                          <FileText className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                          {user.resumes.length} resume(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleRoleToggle(user.id, user.role)}
                        disabled={updatingRoleUserId === user.id}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
                      >
                        {updatingRoleUserId === user.id
                          ? 'Updating...'
                          : user.role === 'ADMIN'
                          ? 'Demote to User'
                          : 'Make Admin'}
                      </button>

                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                        className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <span>{isExpanded ? 'Hide Resumes' : 'View Resumes'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Resume Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 pl-2 sm:pl-4 space-y-3 animate-in slide-in-from-top-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {user.email}'s Resumes ({user.resumes.length})
                      </h4>

                      {user.resumes.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">This user has not created any resumes yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {user.resumes.map((resume) => (
                            <div
                              key={resume.id}
                              className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm text-slate-200">{resume.title}</span>
                                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                    {resume.versionName}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  Updated: {new Date(resume.updatedAt).toLocaleString()}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  setSelectedResumeContent({
                                    userEmail: user.email,
                                    title: resume.title,
                                    content: resume.content,
                                  })
                                }
                                className="mt-3 text-xs text-indigo-400 hover:underline font-medium text-left"
                              >
                                Inspect Full Content →
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Resume Content Inspection Modal */}
      {selectedResumeContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedResumeContent.title}</h3>
                <p className="text-xs text-slate-400">Owner: {selectedResumeContent.userEmail}</p>
              </div>
              <button
                onClick={() => setSelectedResumeContent(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
              {selectedResumeContent.content}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedResumeContent(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
