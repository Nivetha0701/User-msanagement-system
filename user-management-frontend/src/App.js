import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_URL = 'http://localhost:8080/api/users';

// Palette of refined, harmonious gradient backgrounds for user avatars
const AVATAR_PALETTES = [
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
  'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', // Sky
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Violet
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', // Teal
];

function getAvatarStyle(nameOrEmail = '') {
  let hash = 0;
  for (let i = 0; i < nameOrEmail.length; i++) {
    hash = nameOrEmail.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return { background: AVATAR_PALETTES[index] };
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setUsers(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to connect to user database. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.warning('Please provide both name and email.');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(API_URL, {
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      toast.success(`${formData.name.trim()} added to workspace!`);
      setFormData({ name: '', email: '' });
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.warning('Please provide both name and email.');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.put(`${API_URL}/${editingId}`, {
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      toast.success('Member profile updated successfully!');
      setFormData({ name: '', email: '' });
      setEditingId(null);
      setShowUpdateModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsSubmitting(true);
      await axios.delete(`${API_URL}/${userToDelete.id}`);
      toast.success(`Removed ${userToDelete.name} from workspace.`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', email: '' });
    setShowCreateModal(true);
  };

  const prepareEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email
    });
    setEditingId(user.id);
    setShowUpdateModal(true);
  };

  const prepareDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const copyEmailToClipboard = (email) => {
    navigator.clipboard.writeText(email);
    toast.info(`Copied "${email}" to clipboard`, { autoClose: 2000 });
  };

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(user => 
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.id && user.id.toString().includes(q))
    );
  }, [users, searchQuery]);

  return (
    <div className="app-shell">
      <ToastContainer 
        position="top-right" 
        autoClose={3200} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        pauseOnHover 
      />

      {/* Top Header / App Bar */}
      <header className="top-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="brand-badge">
            <div className="brand-icon-box">
              <i className="bi bi-people-fill"></i>
            </div>
            <div>
              <span>Pulse Workspace</span>
              <span className="d-block text-muted" style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: 'normal' }}>
                Directory & Access Control
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="live-indicator-pill d-none d-sm-inline-flex">
              <span className="pulse-dot"></span>
              <span>API Connected</span>
            </div>
            
            <button 
              className="btn-brand-primary"
              onClick={openCreateModal}
              id="btn-add-user-top"
            >
              <i className="bi bi-plus-lg"></i>
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="container flex-grow-1">
        {/* Page Hero */}
        <div className="page-hero">
          <div className="row align-items-end g-3">
            <div className="col-lg-8">
              <h1 className="hero-title">Team & User Directory</h1>
              <p className="hero-subtitle">
                Manage your team members, credentials, and account statuses from a single unified hub.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button 
                className="btn-subtle-refresh" 
                onClick={fetchUsers} 
                title="Refresh users list"
                disabled={loading}
              >
                <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <div>
                <div className="stat-label">Total Members</div>
                <div className="stat-value">{users.length}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <i className="bi bi-person-badge"></i>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div>
                <div className="stat-label">Active Directory</div>
                <div className="stat-value">{users.length}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card">
              <div>
                <div className="stat-label">System Status</div>
                <div className="stat-value" style={{ fontSize: '1.25rem', color: '#059669', paddingTop: '0.4rem' }}>
                  100% Operational
                </div>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <i className="bi bi-shield-check"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Main Directory Card */}
        <div className="content-card">
          {/* Action / Search Bar */}
          <div className="control-bar">
            <div className="search-box">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search member by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-users-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">
                Showing <strong>{filteredUsers.length}</strong> of {users.length} members
              </span>
            </div>
          </div>

          {/* Table or Empty State */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3 mb-0">Synchronizing team members...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <i className="bi bi-person-x"></i>
              </div>
              <h3 className="empty-state-title">
                {searchQuery ? 'No matching members found' : 'No team members registered yet'}
              </h3>
              <p className="empty-state-desc">
                {searchQuery 
                  ? `We couldn't find anyone matching "${searchQuery}". Check the spelling or clear the filter.`
                  : 'Get started by creating the first member account for your workspace.'}
              </p>
              {searchQuery ? (
                <button className="btn-secondary-custom" onClick={() => setSearchQuery('')}>
                  <i className="bi bi-x-lg me-1"></i> Clear Search Filter
                </button>
              ) : (
                <button className="btn-brand-primary" onClick={openCreateModal}>
                  <i className="bi bi-plus-lg me-1"></i> Add First Member
                </button>
              )}
            </div>
          ) : (
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email Address</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      {/* Name & Avatar */}
                      <td>
                        <div className="user-identity-cell">
                          <div 
                            className="user-avatar" 
                            style={getAvatarStyle(user.name || user.email)}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="user-name-title">{user.name}</div>
                            <div className="user-id-subtle">ID #{user.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <div className="email-cell">
                          <span className="email-text">{user.email}</span>
                          <button 
                            className="copy-email-btn"
                            title="Copy email to clipboard"
                            onClick={() => copyEmailToClipboard(user.email)}
                          >
                            <i className="bi bi-copy"></i>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="badge-status-active">
                          <span className="status-mini-dot"></span>
                          Active
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group">
                          <button
                            className="btn-action-edit"
                            onClick={() => prepareEdit(user)}
                            title="Edit member details"
                          >
                            <i className="bi bi-pencil"></i>
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn-action-delete"
                            onClick={() => prepareDelete(user)}
                            title="Delete member"
                          >
                            <i className="bi bi-trash3"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-footer">
                <div>
                  <i className="bi bi-info-circle me-1 text-primary"></i>
                  All member updates reflect in real-time on MySQL database.
                </div>
                <div>
                  Total records: <strong>{filteredUsers.length}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div 
          className="modal-backdrop-custom" 
          onClick={() => !isSubmitting && setShowCreateModal(false)}
        >
          <div 
            className="modal-dialog-custom" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h5 className="modal-header-title">
                <i className="bi bi-person-plus text-primary"></i>
                Add New Member
              </h5>
              <button 
                type="button" 
                className="modal-close-btn"
                disabled={isSubmitting}
                onClick={() => setShowCreateModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body-custom">
                <div className="form-group-custom">
                  <label className="form-label-custom">Full Name</label>
                  <div className="input-with-icon">
                    <i className="bi bi-person input-icon-left"></i>
                    <input
                      type="text"
                      className="form-control-custom"
                      name="name"
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-helper-text">
                    Enter the display name as it appears across the workspace.
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Email Address</label>
                  <div className="input-with-icon">
                    <i className="bi bi-envelope input-icon-left"></i>
                    <input
                      type="email"
                      className="form-control-custom"
                      name="email"
                      placeholder="alex.morgan@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-helper-text">
                    We will store this as their primary communication address.
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  disabled={isSubmitting}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      Create Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE USER MODAL */}
      {showUpdateModal && (
        <div 
          className="modal-backdrop-custom" 
          onClick={() => !isSubmitting && setShowUpdateModal(false)}
        >
          <div 
            className="modal-dialog-custom" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h5 className="modal-header-title">
                <i className="bi bi-pencil-square text-primary"></i>
                Edit Member Details
              </h5>
              <button 
                type="button" 
                className="modal-close-btn"
                disabled={isSubmitting}
                onClick={() => setShowUpdateModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="modal-body-custom">
                <div className="form-group-custom">
                  <label className="form-label-custom">Full Name</label>
                  <div className="input-with-icon">
                    <i className="bi bi-person input-icon-left"></i>
                    <input
                      type="text"
                      className="form-control-custom"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Email Address</label>
                  <div className="input-with-icon">
                    <i className="bi bi-envelope input-icon-left"></i>
                    <input
                      type="email"
                      className="form-control-custom"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  disabled={isSubmitting}
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && userToDelete && (
        <div 
          className="modal-backdrop-custom" 
          onClick={() => !isSubmitting && setShowDeleteModal(false)}
        >
          <div 
            className="modal-dialog-custom" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom" style={{ borderBottomColor: '#fecdd3' }}>
              <h5 className="modal-header-title text-danger">
                <i className="bi bi-exclamation-triangle-fill"></i>
                Remove Member
              </h5>
              <button 
                type="button" 
                className="modal-close-btn"
                disabled={isSubmitting}
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body-custom">
              <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
                Are you sure you want to remove this member from the workspace? This will immediately revoke their access and delete their record.
              </p>

              {/* Preview card of who is being deleted */}
              <div className="user-delete-preview">
                <div 
                  className="user-avatar" 
                  style={getAvatarStyle(userToDelete.name || userToDelete.email)}
                >
                  {getInitials(userToDelete.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {userToDelete.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {userToDelete.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn-secondary-custom"
                disabled={isSubmitting}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-custom"
                disabled={isSubmitting}
                onClick={handleDelete}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Removing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3 me-1"></i>
                    Remove Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;