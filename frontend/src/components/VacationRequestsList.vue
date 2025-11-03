<template>
  <div class="vacation-requests-list">
    <!-- Filter Controls (only for validators) -->
    <div v-if="showFilters" class="filters">
      <div class="filter-group">
        <label for="status-filter" class="form-label">Filter by Status:</label>
        <select
          id="status-filter"
          v-model="statusFilter"
          @change="$emit('filter-change', statusFilter)"
          class="form-select"
        >
          <option value="">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th v-if="showUserColumn">Employee</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
            <th>Reason</th>
            <th>Status</th>
            <th v-if="showValidatorColumn">Validator</th>
            <th v-if="showCommentsColumn">Comments</th>
            <th>Submitted</th>
            <th v-if="showActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columnCount" class="text-center">
              <div class="loading-row">
                <span class="spinner"></span>
                Loading requests...
              </div>
            </td>
          </tr>
          
          <tr v-else-if="requests.length === 0">
            <td :colspan="columnCount" class="text-center no-data">
              {{ emptyMessage }}
            </td>
          </tr>
          
          <tr v-else v-for="request in requests" :key="request.id" class="request-row">
            <td v-if="showUserColumn" class="user-cell">
              <div class="user-info">
                <div class="user-avatar">
                  {{ request.user_name ? request.user_name.charAt(0).toUpperCase() : '?' }}
                </div>
                <div class="user-details">
                  <div class="user-name">{{ request.user_name || 'Unknown' }}</div>
                  <div class="user-email">{{ request.user_email || '' }}</div>
                </div>
              </div>
            </td>
            
            <td>{{ formatDate(request.start_date) }}</td>
            <td>{{ formatDate(request.end_date) }}</td>
            <td>
              <span class="duration-badge">
                {{ calculateDuration(request.start_date, request.end_date) }} days
              </span>
            </td>
            <td class="reason-cell">
              <span v-if="request.reason" class="reason-text">
                {{ request.reason }}
              </span>
              <span v-else class="no-reason">No reason provided</span>
            </td>
            <td>
              <span class="badge" :class="getStatusBadgeClass(request.status)">
                {{ capitalize(request.status) }}
              </span>
            </td>
            <td v-if="showValidatorColumn">
              {{ request.validator_name || '-' }}
            </td>
            <td v-if="showCommentsColumn" class="comments-cell">
              <span v-if="request.comments" class="comments-text">
                {{ request.comments }}
              </span>
              <span v-else class="no-comments">-</span>
            </td>
            <td>{{ formatDate(request.created_at, 'MMM d, yyyy HH:mm') }}</td>
            <td v-if="showActions" class="actions-cell">
              <div class="action-buttons">
                <button
                  v-if="request.status === 'pending' && userRole === 'validator'"
                  @click="$emit('approve-request', request)"
                  class="btn btn-sm btn-success"
                  title="Approve Request"
                >
                  Approve
                </button>
                <button
                  v-if="request.status === 'pending' && userRole === 'validator'"
                  @click="$emit('reject-request', request)"
                  class="btn btn-sm btn-danger"
                  title="Reject Request"
                >
                  Reject
                </button>
                <button
                  v-if="request.status === 'pending' && userRole === 'requester'"
                  @click="$emit('delete-request', request)"
                  class="btn btn-sm btn-outline"
                  title="Delete Request"
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
    <div v-if="requests.length > 0" class="requests-summary">
      <p>
        Showing {{ requests.length }} request{{ requests.length !== 1 ? 's' : '' }}
        <span v-if="statusFilter">
          with status: <strong>{{ capitalize(statusFilter) }}</strong>
        </span>
      </p>
    </div>
  </div>
</template>

<script>
import { formatDate, calculateDuration, getStatusBadgeClass, capitalize } from '@/utils/helpers'

export default {
  name: 'VacationRequestsList',
  props: {
    requests: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    userRole: {
      type: String,
      default: 'requester',
      validator: (value) => ['requester', 'validator'].includes(value)
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    emptyMessage: {
      type: String,
      default: 'No vacation requests found.'
    }
  },
  emits: ['filter-change', 'approve-request', 'reject-request', 'delete-request'],
  data() {
    return {
      statusFilter: ''
    }
  },
  computed: {
    showUserColumn() {
      return this.userRole === 'validator'
    },
    
    showValidatorColumn() {
      return this.userRole === 'requester'
    },
    
    showCommentsColumn() {
      return this.userRole === 'requester'
    },
    
    showActions() {
      return true // Always show actions for both roles
    },
    
    columnCount() {
      let count = 6 // Base columns: start, end, duration, reason, status, submitted
      if (this.showUserColumn) count++
      if (this.showValidatorColumn) count++
      if (this.showCommentsColumn) count++
      if (this.showActions) count++
      return count
    }
  },
  methods: {
    formatDate,
    calculateDuration,
    getStatusBadgeClass,
    capitalize
  }
}
</script>

<style scoped>
.vacation-requests-list {
  width: 100%;
}

.filters {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group .form-label {
  margin-bottom: 0;
  white-space: nowrap;
}

.filter-group .form-select {
  max-width: 200px;
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

.request-row:hover {
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
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
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

.user-email {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.duration-badge {
  background: var(--background-color);
  color: var(--text-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
}

.reason-cell {
  max-width: 200px;
}

.reason-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-reason {
  font-style: italic;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.comments-cell {
  max-width: 200px;
}

.comments-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-comments {
  color: var(--text-muted);
  font-style: italic;
}

.actions-cell {
  min-width: 120px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.requests-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--background-color);
  border-radius: 6px;
  text-align: center;
}

.requests-summary p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group .form-select {
    max-width: none;
  }
  
  .table {
    font-size: 0.8125rem;
  }
  
  .user-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>