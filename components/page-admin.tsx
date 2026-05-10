"use client"

import React, { useState, useEffect, useCallback } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Modal, Tag, EmptyState, Inp, TA } from "@/components/ui-atoms"
import {
  Users, CheckCircle, XCircle, Clock, Eye, Download, Search,
  GraduationCap, BookOpen, AlertCircle, RefreshCw, LayoutDashboard,
  FileText, Flag, ScrollText, Shield, Trash2, Ban, UserCog,
  AlertTriangle, ChevronRight, MoreVertical, Edit, EyeOff, MessageSquare
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User, Report, AdminLog, Preparation, ForumPost, Innovation } from "@/lib/types"

interface DBUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'teacher' | 'student'
  user_role?: 'user' | 'moderator' | 'admin'
  institution: string
  country: string
  proof_url: string | null
  account_status: string
  is_admin: boolean
  is_suspended: boolean
  suspended_reason?: string
  created_at: string
  points: number
}

const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "content", label: "Contenus", icon: FileText },
  { id: "reports", label: "Signalements", icon: Flag },
  { id: "logs", label: "Logs Admin", icon: ScrollText },
]

export function PageAdmin({ user, preps, posts, innovations, setPreps, setPosts, setInnovations }: {
  user: User
  preps?: Preparation[]
  posts?: ForumPost[]
  innovations?: Innovation[]
  setPreps?: React.Dispatch<React.SetStateAction<Preparation[]>>
  setPosts?: React.Dispatch<React.SetStateAction<ForumPost[]>>
  setInnovations?: React.Dispatch<React.SetStateAction<Innovation[]>>
}) {
  const [adminPage, setAdminPage] = useState("dashboard")
  const [dbUsers, setDbUsers] = useState<DBUser[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0, pendingUsers: 0, totalContent: 0, totalReports: 0,
    recentUsers: [] as DBUser[], recentReports: [] as Report[]
  })

  // Permission check
  const isAdmin =
    user.email === "1@educ.be" || 'lucas@educsport.be'
  user.isAdmin ||
    user.role === "admin"
  const isModerator =
    user.email === "lucas@educsport.be" ||
    user.isAdmin ||
    user.role === "moderator"
  const hasAccess = isAdmin || isModerator

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersData) {
      setDbUsers(usersData)
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.length,
        pendingUsers: usersData.filter(u => u.account_status === 'pending_verification').length,
        recentUsers: usersData.slice(0, 5)
      }))
    }

    // Fetch reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (reportsData) {
      setReports(reportsData.map(r => ({
        id: r.id,
        reporterId: r.reporter_id,
        reporterName: r.reporter_name,
        targetType: r.target_type,
        targetId: r.target_id,
        targetTitle: r.target_title,
        reason: r.reason,
        description: r.description,
        status: r.status,
        createdAt: r.created_at,
        resolvedAt: r.resolved_at,
        resolvedBy: r.resolved_by,
        resolution: r.resolution
      })))
      setStats(prev => ({
        ...prev,
        totalReports: reportsData.filter(r => r.status === 'pending').length,
        recentReports: reportsData.slice(0, 5).map(r => ({
          id: r.id,
          reporterId: r.reporter_id,
          reporterName: r.reporter_name,
          targetType: r.target_type,
          targetId: r.target_id,
          targetTitle: r.target_title,
          reason: r.reason,
          status: r.status,
          createdAt: r.created_at,
        })) as Report[]
      }))
    }

    // Fetch admin logs
    const { data: logsData } = await supabase
      .from('admin_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    if (logsData) {
      setLogs(logsData.map(l => ({
        id: l.id,
        adminId: l.admin_id,
        adminName: l.admin_name,
        action: l.action,
        targetType: l.target_type,
        targetId: l.target_id,
        targetName: l.target_name,
        details: l.details,
        timestamp: l.timestamp
      })))
    }

    // Calculate total content
    const totalContent = (preps?.length || 0) + (posts?.length || 0) + (innovations?.length || 0)
    setStats(prev => ({ ...prev, totalContent }))

    setLoading(false)
  }, [preps, posts, innovations])

  useEffect(() => { fetchData() }, [fetchData])

  // Log admin action
  const logAction = async (action: AdminLog['action'], targetType: AdminLog['targetType'], targetId: string, targetName?: string, details?: string) => {
    const supabase = createClient()
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      admin_name: user.name,
      action,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      details,
      timestamp: new Date().toISOString()
    })
    fetchData()
  }

  // Check access
  if (!hasAccess) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={28} color={C.red} />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: C.dark }}>Acces refuse</h2>
        <p style={{ color: C.gray, fontSize: 14 }}>Vous n'avez pas les permissions pour acceder a cette page.</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", gap: 24, minHeight: "calc(100vh - 120px)" }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <Card style={{ padding: 12, position: "sticky", top: 80 }}>
          <div style={{ padding: "8px 12px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={18} color={C.red} />
              <span style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>Admin Panel</span>
            </div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 4 }}>
              {isAdmin ? "Administrateur" : "Moderateur"}
            </div>
          </div>
          <div style={{ height: 1, background: "#f1f5f9", margin: "8px 0" }} />
          {ADMIN_NAV.map(nav => {
            const Icon = nav.icon
            const active = adminPage === nav.id
            // Hide certain pages for moderators
            if (!isAdmin && nav.id === 'logs') return null
            return (
              <button key={nav.id} onClick={() => setAdminPage(nav.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, border: "none",
                  background: active ? C.redLight : "transparent",
                  color: active ? C.red : C.gray, cursor: "pointer",
                  fontWeight: active ? 600 : 500, fontSize: 14, fontFamily: "inherit",
                  marginBottom: 4, textAlign: "left", transition: "all .15s"
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f9fafb" }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}>
                <Icon size={16} />
                {nav.label}
              </button>
            )
          })}
        </Card>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {adminPage === "dashboard" && (
          <DashboardPage stats={stats} loading={loading} setAdminPage={setAdminPage} />
        )}
        {adminPage === "users" && (
          <UsersPage
            users={dbUsers}
            loading={loading}
            fetchData={fetchData}
            logAction={logAction}
            isAdmin={isAdmin}
          />
        )}
        {adminPage === "content" && (
          <ContentPage
            preps={preps || []}
            posts={posts || []}
            innovations={innovations || []}
            setPreps={setPreps}
            setPosts={setPosts}
            setInnovations={setInnovations}
            logAction={logAction}
          />
        )}
        {adminPage === "reports" && (
          <ReportsPage
            reports={reports}
            loading={loading}
            fetchData={fetchData}
            logAction={logAction}
            isAdmin={isAdmin}
          />
        )}
        {adminPage === "logs" && isAdmin && (
          <LogsPage logs={logs} loading={loading} />
        )}
      </div>
    </div>
  )
}

/* ─── Dashboard Page ─── */
function DashboardPage({ stats, loading, setAdminPage }: { stats: any; loading: boolean; setAdminPage: (p: string) => void }) {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.dark }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: 14, color: C.gray }}>Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} color={C.blue} />
        <StatCard icon={FileText} label="Contenus" value={stats.totalContent} color={C.green} />
        <StatCard icon={Flag} label="Signalements" value={stats.totalReports} color={C.red} />
        <StatCard icon={Clock} label="En attente" value={stats.pendingUsers} color={C.amber} />
      </div>

      {/* Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.dark }}>Comptes recents</h3>
            <button onClick={() => setAdminPage("users")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: C.gray, fontSize: 13, padding: 20, textAlign: "center" }}>Chargement...</div>
          ) : stats.recentUsers.length === 0 ? (
            <div style={{ color: C.gray, fontSize: 13, padding: 20, textAlign: "center" }}>Aucun utilisateur</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.recentUsers.map((u: DBUser) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: u.role === 'teacher' ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12 }}>
                    {u.first_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{u.first_name} {u.last_name}</div>
                    <div style={{ fontSize: 11, color: C.gray }}>{u.email}</div>
                  </div>
                  <Tag color={u.account_status === 'verified' ? C.green : u.account_status === 'rejected' ? C.red : C.amber}>
                    {u.account_status === 'verified' ? 'Verifie' : u.account_status === 'rejected' ? 'Refuse' : 'En attente'}
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.dark }}>Signalements recents</h3>
            <button onClick={() => setAdminPage("reports")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: C.gray, fontSize: 13, padding: 20, textAlign: "center" }}>Chargement...</div>
          ) : stats.recentReports.length === 0 ? (
            <div style={{ color: C.gray, fontSize: 13, padding: 20, textAlign: "center" }}>Aucun signalement</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.recentReports.map((r: Report) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Flag size={14} color={C.red} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{r.targetTitle || r.targetType}</div>
                    <div style={{ fontSize: 11, color: C.gray }}>{r.reason}</div>
                  </div>
                  <Tag color={r.status === 'pending' ? C.amber : C.green}>
                    {r.status === 'pending' ? 'En attente' : 'Resolu'}
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={22} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>{value}</div>
          <div style={{ fontSize: 13, color: C.gray }}>{label}</div>
        </div>
      </div>
    </Card>
  )
}

/* ─── Users Page ─── */
function UsersPage({ users, loading, fetchData, logAction, isAdmin }: {
  users: DBUser[]; loading: boolean; fetchData: () => void;
  logAction: (action: AdminLog['action'], targetType: AdminLog['targetType'], targetId: string, targetName?: string, details?: string) => Promise<void>
  isAdmin: boolean
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'suspended'>('all')
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'moderator' | 'admin'>('all')
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null)
  const [actionModal, setActionModal] = useState<'role' | 'suspend' | 'delete' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [suspendReason, setSuspendReason] = useState("")
  const [newRole, setNewRole] = useState<'user' | 'moderator' | 'admin'>('user')

  const filteredUsers = users.filter(u => {
    const matchesStatus = filter === 'all' ||
      (filter === 'pending' && u.account_status === 'pending_verification') ||
      (filter === 'verified' && u.account_status === 'verified') ||
      (filter === 'suspended' && u.is_suspended)
    const matchesRole = roleFilter === 'all' || u.user_role === roleFilter ||
      (roleFilter === 'admin' && u.is_admin)
    const matchesSearch = !searchQuery ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesRole && matchesSearch
  })

  const handleAction = async (action: 'approve' | 'reject' | 'suspend' | 'unsuspend' | 'delete' | 'change_role') => {
    if (!selectedUser) return
    setActionLoading(true)
    const supabase = createClient()

    try {
      switch (action) {
        case 'approve':
          await supabase.from('profiles').update({ account_status: 'verified' }).eq('id', selectedUser.id)
          await logAction('approve_user', 'user', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`)
          break
        case 'reject':
          await supabase.from('profiles').update({ account_status: 'rejected' }).eq('id', selectedUser.id)
          await logAction('reject_user', 'user', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`)
          break
        case 'suspend':
          await supabase.from('profiles').update({ is_suspended: true, suspended_reason: suspendReason }).eq('id', selectedUser.id)
          await logAction('suspend_user', 'user', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`, suspendReason)
          setSuspendReason("")
          break
        case 'unsuspend':
          await supabase.from('profiles').update({ is_suspended: false, suspended_reason: null }).eq('id', selectedUser.id)
          await logAction('unsuspend_user', 'user', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`)
          break
        case 'delete':
          await supabase.from('profiles').delete().eq('id', selectedUser.id)
          await logAction('delete_user', 'user', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`)
          break
        case 'change_role':
          await supabase.from('profiles').update({
            user_role: newRole,
            is_admin: newRole === 'admin'
          }).eq('id', selectedUser.id)
          await logAction('change_role', 'user', selectedUser.id, `${selectedUser.first_name} ${selectedUser.last_name}`, `Nouveau role: ${newRole}`)
          break
      }
      fetchData()
      setSelectedUser(null)
      setActionModal(null)
    } catch (error) {
      console.error("Action error:", error)
    }
    setActionLoading(false)
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.dark }}>Gestion des utilisateurs</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.gray }}>{users.length} utilisateurs au total</p>
        </div>
        <Btn outline color={C.gray} onClick={fetchData}><RefreshCw size={14} /> Actualiser</Btn>
      </div>

      {/* Filters */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {['all', 'pending', 'verified', 'suspended'].map(f => (
              <button key={f} onClick={() => setFilter(f as any)}
                style={{
                  padding: "6px 12px", borderRadius: 6, border: filter === f ? `1.5px solid ${C.blue}` : "1.5px solid #e5e7eb",
                  background: filter === f ? C.blueLight : "white", color: filter === f ? C.blue : C.gray,
                  fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                }}>
                {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'verified' ? 'Verifies' : 'Suspendus'}
              </button>
            ))}
          </div>
          <div style={{ height: 20, width: 1, background: "#e5e7eb" }} />
          {isAdmin && (
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb", fontSize: 12, fontFamily: "inherit" }}>
              <option value="all">Tous les roles</option>
              <option value="user">Utilisateurs</option>
              <option value="moderator">Moderateurs</option>
              <option value="admin">Admins</option>
            </select>
          )}
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <Search size={14} color={C.gray} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: "6px 10px 6px 32px", borderRadius: 6, border: "1.5px solid #e5e7eb", fontSize: 12, width: 200, fontFamily: "inherit" }} />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.gray }}>Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState icon="users" title="Aucun utilisateur" subtitle="Aucun resultat pour ces criteres" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.gray }}>Utilisateur</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.gray }}>Role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.gray }}>Statut</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.gray }}>Institution</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: C.gray }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.role === 'teacher' ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>
                          {u.first_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: C.dark }}>{u.first_name} {u.last_name}</div>
                          <div style={{ fontSize: 11, color: C.gray }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Tag color={u.role === 'teacher' ? C.teal : C.blue}>
                          {u.role === 'teacher' ? 'Enseignant' : 'Etudiant'}
                        </Tag>
                        {(u.is_admin || u.user_role === 'admin') && <Tag color={C.red}>Admin</Tag>}
                        {u.user_role === 'moderator' && <Tag color={C.purple}>Modo</Tag>}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.is_suspended ? (
                        <Tag color={C.red}><Ban size={10} /> Suspendu</Tag>
                      ) : (
                        <Tag color={u.account_status === 'verified' ? C.green : u.account_status === 'rejected' ? C.red : C.amber}>
                          {u.account_status === 'verified' ? 'Verifie' : u.account_status === 'rejected' ? 'Refuse' : 'En attente'}
                        </Tag>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: C.gray, fontSize: 12 }}>{u.institution || '-'}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => setSelectedUser(u)} style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>
                          <Eye size={14} color={C.gray} />
                        </button>
                        {u.account_status === 'pending_verification' && (
                          <>
                            <Btn sm color={C.green} onClick={() => { setSelectedUser(u); handleAction('approve') }}>
                              <CheckCircle size={12} />
                            </Btn>
                            <Btn sm outline color={C.red} onClick={() => { setSelectedUser(u); handleAction('reject') }}>
                              <XCircle size={12} />
                            </Btn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      <Modal open={!!selectedUser && !actionModal} onClose={() => setSelectedUser(null)} title="Detail utilisateur" width={500}>
        {selectedUser && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: selectedUser.role === 'teacher' ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 20 }}>
                {selectedUser.first_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: C.dark }}>{selectedUser.first_name} {selectedUser.last_name}</div>
                <div style={{ fontSize: 13, color: C.gray }}>{selectedUser.email}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <InfoItem label="Role" value={selectedUser.role === 'teacher' ? 'Enseignant' : 'Etudiant'} />
              <InfoItem label="Institution" value={selectedUser.institution || '-'} />
              <InfoItem label="Pays" value={selectedUser.country || '-'} />
              <InfoItem label="Points" value={String(selectedUser.points || 0)} />
              <InfoItem label="Inscrit le" value={new Date(selectedUser.created_at).toLocaleDateString('fr-FR')} />
              <InfoItem label="Statut" value={selectedUser.is_suspended ? 'Suspendu' : selectedUser.account_status === 'verified' ? 'Verifie' : 'En attente'} />
            </div>
            {selectedUser.proof_url && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>Preuve d'affiliation</div>
                <a href={selectedUser.proof_url} target="_blank" rel="noopener noreferrer">
                  <Btn outline color={C.blue}><Download size={14} /> Telecharger</Btn>
                </a>
              </div>
            )}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedUser.account_status === 'pending_verification' && (
                <>
                  <Btn color={C.green} onClick={() => handleAction('approve')} disabled={actionLoading}>
                    <CheckCircle size={14} /> Approuver
                  </Btn>
                  <Btn outline color={C.red} onClick={() => handleAction('reject')} disabled={actionLoading}>
                    <XCircle size={14} /> Refuser
                  </Btn>
                </>
              )}
              {!selectedUser.is_suspended ? (
                <Btn outline color={C.amber} onClick={() => setActionModal('suspend')}>
                  <Ban size={14} /> Suspendre
                </Btn>
              ) : (
                <Btn color={C.green} onClick={() => handleAction('unsuspend')} disabled={actionLoading}>
                  Reactiver
                </Btn>
              )}
              {isAdmin && !selectedUser.is_admin && (
                <Btn outline color={C.purple} onClick={() => { setNewRole(selectedUser.user_role || 'user'); setActionModal('role') }}>
                  <UserCog size={14} /> Changer role
                </Btn>
              )}
              {isAdmin && !selectedUser.is_admin && (
                <Btn outline color={C.red} onClick={() => setActionModal('delete')}>
                  <Trash2 size={14} /> Supprimer
                </Btn>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Suspend Modal */}
      <Modal open={actionModal === 'suspend'} onClose={() => setActionModal(null)} title="Suspendre l'utilisateur" width={400}>
        <p style={{ color: C.gray, fontSize: 14, marginBottom: 16 }}>
          L'utilisateur ne pourra plus acceder a son compte.
        </p>
        <TA placeholder="Raison de la suspension..." value={suspendReason} onChange={e => setSuspendReason(e.target.value)} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn outline color={C.gray} onClick={() => setActionModal(null)}>Annuler</Btn>
          <Btn color={C.amber} onClick={() => handleAction('suspend')} disabled={actionLoading || !suspendReason}>
            Suspendre
          </Btn>
        </div>
      </Modal>

      {/* Change Role Modal */}
      <Modal open={actionModal === 'role'} onClose={() => setActionModal(null)} title="Changer le role" width={400}>
        <p style={{ color: C.gray, fontSize: 14, marginBottom: 16 }}>
          Selectionnez le nouveau role pour cet utilisateur.
        </p>
        <select value={newRole} onChange={e => setNewRole(e.target.value as any)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit" }}>
          <option value="user">Utilisateur</option>
          <option value="moderator">Moderateur</option>
          <option value="admin">Administrateur</option>
        </select>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn outline color={C.gray} onClick={() => setActionModal(null)}>Annuler</Btn>
          <Btn color={C.purple} onClick={() => handleAction('change_role')} disabled={actionLoading}>
            Changer
          </Btn>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={actionModal === 'delete'} onClose={() => setActionModal(null)} title="Supprimer l'utilisateur" width={400}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={28} color={C.red} />
          </div>
          <p style={{ color: C.dark, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Etes-vous sur de vouloir supprimer cet utilisateur ?
          </p>
          <p style={{ color: C.gray, fontSize: 13 }}>
            Cette action est irreversible.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn outline color={C.gray} onClick={() => setActionModal(null)}>Annuler</Btn>
          <Btn color={C.red} onClick={() => handleAction('delete')} disabled={actionLoading}>
            Supprimer
          </Btn>
        </div>
      </Modal>
    </>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.gray, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{value}</div>
    </div>
  )
}

/* ─── Content Page ─── */
function ContentPage({ preps, posts, innovations, setPreps, setPosts, setInnovations, logAction }: {
  preps: Preparation[]; posts: ForumPost[]; innovations: Innovation[]
  setPreps?: React.Dispatch<React.SetStateAction<Preparation[]>>
  setPosts?: React.Dispatch<React.SetStateAction<ForumPost[]>>
  setInnovations?: React.Dispatch<React.SetStateAction<Innovation[]>>
  logAction: (action: AdminLog['action'], targetType: AdminLog['targetType'], targetId: string, targetName?: string, details?: string) => Promise<void>
}) {
  const [contentType, setContentType] = useState<'preparations' | 'forum' | 'innovations'>('preparations')
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteModal, setDeleteModal] = useState<{ type: string; id: string | number; title: string } | null>(null)

  const handleDelete = async () => {
    if (!deleteModal) return
    const { type, id, title } = deleteModal

    // Call the appropriate API to delete from database
    const apiPath = type === 'forum' ? 'forum' : type === 'preparations' ? 'preparations' : 'innovations'
    try {
      await fetch(`/api/${apiPath}?id=${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Delete error:', err)
    }

    if (type === 'preparations' && setPreps) {
      setPreps(prev => prev.filter(p => p.id !== id))
    } else if (type === 'forum' && setPosts) {
      setPosts(prev => prev.filter(p => p.id !== id))
    } else if (type === 'innovations' && setInnovations) {
      setInnovations(prev => prev.filter(i => i.id !== id))
    }

    await logAction('delete_content', type === 'forum' ? 'forum_post' : type === 'preparations' ? 'preparation' : 'innovation', String(id), title)
    setDeleteModal(null)
  }

  const getContent = () => {
    switch (contentType) {
      case 'preparations':
        return preps.filter(p => !searchQuery || p.titre.toLowerCase().includes(searchQuery.toLowerCase()))
      case 'forum':
        return posts.filter(p => !searchQuery || p.titre.toLowerCase().includes(searchQuery.toLowerCase()))
      case 'innovations':
        return innovations.filter(i => !searchQuery || i.titre.toLowerCase().includes(searchQuery.toLowerCase()))
      default:
        return []
    }
  }

  const content = getContent()

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.dark }}>Moderation des contenus</h1>
        <p style={{ margin: 0, fontSize: 14, color: C.gray }}>Gerez les contenus publies par les utilisateurs</p>
      </div>

      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { key: 'preparations', label: 'Preparations', count: preps.length },
              { key: 'forum', label: 'Forum', count: posts.length },
              { key: 'innovations', label: 'Innovations', count: innovations.length },
            ].map(t => (
              <button key={t.key} onClick={() => setContentType(t.key as any)}
                style={{
                  padding: "6px 12px", borderRadius: 6, border: contentType === t.key ? `1.5px solid ${C.blue}` : "1.5px solid #e5e7eb",
                  background: contentType === t.key ? C.blueLight : "white", color: contentType === t.key ? C.blue : C.gray,
                  fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                }}>
                {t.label} ({t.count})
              </button>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} color={C.gray} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: "6px 10px 6px 32px", borderRadius: 6, border: "1.5px solid #e5e7eb", fontSize: 12, width: 200, fontFamily: "inherit" }} />
          </div>
        </div>
      </Card>

      <Card style={{ overflow: "hidden" }}>
        {content.length === 0 ? (
          <EmptyState icon="doc" title="Aucun contenu" subtitle="Aucun contenu trouve" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.gray }}>Titre</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.gray }}>Auteur</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.gray }}>Date</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: C.gray }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.map((item: any, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx < content.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: C.dark }}>{item.titre}</div>
                      {item.discipline && <div style={{ fontSize: 11, color: C.gray }}>{item.discipline}</div>}
                      {item.categorie && <div style={{ fontSize: 11, color: C.gray }}>{item.categorie}</div>}
                    </td>
                    <td style={{ padding: "12px 16px", color: C.gray }}>{item.auteur || '-'}</td>
                    <td style={{ padding: "12px 16px", color: C.gray, fontSize: 12 }}>{item.date}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>
                          <Eye size={14} color={C.gray} />
                        </button>
                        <button onClick={() => setDeleteModal({ type: contentType, id: item.id, title: item.titre })}
                          style={{ padding: 6, borderRadius: 6, border: "1px solid #fee2e2", background: "#fef2f2", cursor: "pointer" }}>
                          <Trash2 size={14} color={C.red} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Supprimer le contenu" width={400}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Trash2 size={28} color={C.red} />
          </div>
          <p style={{ color: C.dark, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Supprimer "{deleteModal?.title}" ?
          </p>
          <p style={{ color: C.gray, fontSize: 13 }}>Cette action est irreversible.</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn outline color={C.gray} onClick={() => setDeleteModal(null)}>Annuler</Btn>
          <Btn color={C.red} onClick={handleDelete}>Supprimer</Btn>
        </div>
      </Modal>
    </>
  )
}

/* ─── Reports Page ─── */
function ReportsPage({ reports, loading, fetchData, logAction, isAdmin }: {
  reports: Report[]; loading: boolean; fetchData: () => void
  logAction: (action: AdminLog['action'], targetType: AdminLog['targetType'], targetId: string, targetName?: string, details?: string) => Promise<void>
  isAdmin: boolean
}) {
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [resolution, setResolution] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter)

  const handleResolve = async (action: 'resolve' | 'dismiss') => {
    if (!selectedReport) return
    setActionLoading(true)
    const supabase = createClient()

    await supabase.from('reports').update({
      status: action === 'resolve' ? 'resolved' : 'dismissed',
      resolved_at: new Date().toISOString(),
      resolution
    }).eq('id', selectedReport.id)

    await logAction('resolve_report', 'report', selectedReport.id, selectedReport.targetTitle, `${action}: ${resolution}`)

    fetchData()
    setSelectedReport(null)
    setResolution("")
    setActionLoading(false)
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.dark }}>Signalements</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.gray }}>{reports.filter(r => r.status === 'pending').length} signalements en attente</p>
        </div>
        <Btn outline color={C.gray} onClick={fetchData}><RefreshCw size={14} /> Actualiser</Btn>
      </div>

      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {['pending', 'resolved', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f as any)}
              style={{
                padding: "6px 12px", borderRadius: 6, border: filter === f ? `1.5px solid ${C.blue}` : "1.5px solid #e5e7eb",
                background: filter === f ? C.blueLight : "white", color: filter === f ? C.blue : C.gray,
                fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
              }}>
              {f === 'pending' ? 'En attente' : f === 'resolved' ? 'Resolus' : 'Tous'}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.gray }}>Chargement...</div>
        ) : filteredReports.length === 0 ? (
          <EmptyState icon="flag" title="Aucun signalement" subtitle="Aucun signalement pour le moment" />
        ) : (
          <div>
            {filteredReports.map((r, idx) => (
              <div key={r.id} style={{ padding: 16, borderBottom: idx < filteredReports.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Flag size={18} color={C.red} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{r.targetTitle || r.targetType}</span>
                      <Tag color={r.status === 'pending' ? C.amber : r.status === 'resolved' ? C.green : C.gray}>
                        {r.status === 'pending' ? 'En attente' : r.status === 'resolved' ? 'Resolu' : 'Rejete'}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 13, color: C.gray, marginBottom: 6 }}>
                      <strong>Raison:</strong> {r.reason}
                    </div>
                    {r.description && (
                      <div style={{ fontSize: 13, color: C.gray, marginBottom: 6 }}>{r.description}</div>
                    )}
                    <div style={{ fontSize: 11, color: C.gray }}>
                      Signale par {r.reporterName} le {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  {r.status === 'pending' && (
                    <Btn sm outline color={C.blue} onClick={() => setSelectedReport(r)}>
                      Traiter
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Resolve Modal */}
      <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)} title="Traiter le signalement" width={500}>
        {selectedReport && (
          <>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: C.dark, marginBottom: 4 }}>{selectedReport.targetTitle}</div>
              <div style={{ fontSize: 13, color: C.gray }}>Raison: {selectedReport.reason}</div>
              {selectedReport.description && (
                <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>{selectedReport.description}</div>
              )}
            </div>
            <TA placeholder="Resolution / Notes (optionnel)..." value={resolution} onChange={e => setResolution(e.target.value)} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <Btn outline color={C.gray} onClick={() => { handleResolve('dismiss') }} disabled={actionLoading}>
                Rejeter
              </Btn>
              <Btn color={C.green} onClick={() => handleResolve('resolve')} disabled={actionLoading}>
                <CheckCircle size={14} /> Marquer resolu
              </Btn>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}

/* ─── Logs Page ─── */
function LogsPage({ logs, loading }: { logs: AdminLog[]; loading: boolean }) {
  const getActionLabel = (action: AdminLog['action']) => {
    const labels: Record<string, string> = {
      'delete_content': 'Contenu supprime',
      'edit_content': 'Contenu modifie',
      'hide_content': 'Contenu masque',
      'delete_user': 'Utilisateur supprime',
      'suspend_user': 'Utilisateur suspendu',
      'unsuspend_user': 'Utilisateur reactive',
      'change_role': 'Role modifie',
      'resolve_report': 'Signalement traite',
      'warn_user': 'Avertissement envoye',
      'approve_user': 'Compte approuve',
      'reject_user': 'Compte refuse',
    }
    return labels[action] || action
  }

  const getActionColor = (action: AdminLog['action']) => {
    if (action.includes('delete') || action.includes('suspend') || action.includes('reject')) return C.red
    if (action.includes('approve') || action.includes('unsuspend')) return C.green
    return C.blue
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.dark }}>Logs administrateur</h1>
        <p style={{ margin: 0, fontSize: 14, color: C.gray }}>Historique des actions administratives</p>
      </div>

      <Card style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.gray }}>Chargement...</div>
        ) : logs.length === 0 ? (
          <EmptyState icon="doc" title="Aucun log" subtitle="Aucune action enregistree" />
        ) : (
          <div>
            {logs.map((log, idx) => (
              <div key={log.id} style={{ padding: 14, borderBottom: idx < logs.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: getActionColor(log.action) + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ScrollText size={16} color={getActionColor(log.action)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{getActionLabel(log.action)}</span>
                    {log.targetName && <span style={{ fontSize: 12, color: C.gray }}>- {log.targetName}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.gray }}>
                    Par {log.adminName} {log.details && `• ${log.details}`}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.gray }}>
                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
