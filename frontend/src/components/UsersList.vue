<template>
  <div class="users-list">
    <!-- Users Table -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="text-center">
              <div class="loading-row">
                <span class="spinner"></span>
                Loading users...
              </div>
            </td>
          </tr>
          
          <tr v-else-if="users.length === 0">
            <td colspan="5" class="text-center no-data">
              No users found. Create your first user above.
            </td>
          </tr>
          
          <tr v-else v-for="user in users" :key="user.id" class="user-row">
            <td class="user-cell">
              <div class="user-info">
                <div class="user-avatar">
                  {{ user.name ? user.name.charAt(0).toUpperCase() : '?' }}
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.name || 'Unknown' }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </div>
            </td>
            
            <td>
              <span class="email-text">{{ user.email || 'No email' }}</span>
            </td>
            
            <td>
              <span class="badge" :class="getRoleBadgeClass(user.role)">
                {{ formatRole(user.role) }}
              </span>
            </td>
            
            <td>
              <span class="date-text">{{ formatDate(user.created_at) }}</span>
            </td>
            
            <td class="actions-cell">
              <div class="action-buttons">
                <button
                  @click="$emit('edit-user', user)"
                  class="btn btn-sm btn-outline"
                  title="Edit User"
                >
                  Edit
                </button>
                <button
                  @click="$emit('delete-user', user)"
                  class="btn btn-sm btn-danger"
                  title="Delete User"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <div v-if="users.length > 0" class="users-summary">
      <p>
        Showing {{ users.length }} user{{ users.length !== 1 ? 's' : '' }}
        ({{ getUsersCountByRole('requester') }} employees, {{ getUsersCountByRole('validator') }} managers)
      </p>
    </div>
  </div>
</template>

<script>
import { formatDate, capitalize } from '@/utils/helpers'

export default {
  name: 'UsersList',
  props: {
    users: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit-user', 'delete-user'],
  methods: {
    getRoleBadgeClass(role) {
      return role === 'validator' ? 'badge-approved' : 'badge-pending'
    },

    formatRole(role) {
      const roleMap = {
        'requester': 'Employee',
        'validator': 'Manager'
      }
      return roleMap[role] || capitalize(role)
    },

    getUsersCountByRole(role) {
      return this.users.filter(user => user.role === role).length
    },

    formatDate(dateString) {
      if (!dateString) return 'Unknown'
      return formatDate(dateString, 'MMM d, yyyy')
    }
  }
}
</script>

<style scoped>
.users-list {
  width: 100%;
}

.table-responsive {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.table {
  margin: 0;
  background: var(--card-background);
}

.loading-row {
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.no-data {
  padding: 3rem;
  color: var(--text-muted);
  font-style: italic;
}

.user-row:hover {
  background-color: var(--background-color);
}

.user-cell {
  min-width: 200px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.user-id {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.email-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  word-break: break-word;
}

.date-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.actions-cell {
  min-width: 140px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.users-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--background-color);
  border-radius: 6px;
  text-align: center;
}

.users-summary p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Role-specific avatar colors */
.user-row:has(.badge-approved) .user-avatar {
  background: var(--success-color);
}

.user-row:has(.badge-pending) .user-avatar {
  background: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  .table {
    font-size: 0.8125rem;
  }

  .user-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }

  .users-summary {
    text-align: left;
  }
}

/* Animation for new rows */
.user-row {
  transition: background-color 0.2s ease;
}

/* Highlight newly added users */
@keyframes highlight {
  0% { background-color: rgba(16, 185, 129, 0.1); }
  100% { background-color: transparent; }
}

.user-row.newly-added {
  animation: highlight 2s ease-out;
}
</style>