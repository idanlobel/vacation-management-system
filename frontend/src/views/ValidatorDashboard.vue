<template>
  <div class="validator-dashboard">
    <div class="container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">Vacation Request Management</h1>
          <p class="dashboard-description">
            Review and manage vacation requests from your team members.
          </p>
        </div>
      </div>

      <!-- User Selection (if no validatorId prop) -->
      <div v-if="!validatorId" class="user-selection-section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Select Manager Profile</h2>
            <p class="card-description">Choose your manager profile to continue</p>
          </div>
          <UserSelector
            v-model="selectedValidatorId"
            role="validator"
            label="Select Manager"
            placeholder="Choose your profile..."
            @user-selected="handleValidatorSelected"
          />
        </div>
      </div>

      <!-- Main Dashboard (when validator is selected) -->
      <div v-if="currentValidator" class="dashboard-content">
        <!-- Validator Info Card -->
        <div class="validator-info-card card">
          <div class="validator-info-content">
            <div class="user-avatar-large">
              {{ currentValidator.name.charAt(0).toUpperCase() }}
            </div>
            <div class="validator-info-details">
              <h2>{{ currentValidator.name }}</h2>
              <p>{{ currentValidator.email }}</p>
              <span class="badge badge-approved">Manager</span>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <Alert
          v-if="alert.show"
          :type="alert.type"
          :title="alert.title"
          :message="alert.message"
          :auto-hide="true"
          @dismiss="alert.show = false"
        />

        <!-- Dashboard Overview -->
        <div class="overview-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon pending">📋</div>
              <div class="stat-content">
                <div class="stat-value">{{ getRequestsCountByStatus('pending') }}</div>
                <div class="stat-label">Pending Review</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon approved">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ getRequestsCountByStatus('approved') }}</div>
                <div class="stat-label">Approved</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon rejected">❌</div>
              <div class="stat-content">
                <div class="stat-value">{{ getRequestsCountByStatus('rejected') }}</div>
                <div class="stat-label">Rejected</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon total">📊</div>
              <div class="stat-content">
                <div class="stat-value">{{ requests.length }}</div>
                <div class="stat-label">Total Requests</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vacation Requests Section -->
        <div class="requests-section">
          <div class="card">
            <div class="card-header">
              <div class="requests-header">
                <div>
                  <h2 class="card-title">All Vacation Requests</h2>
                  <p class="card-description">
                    Review and manage vacation requests from employees
                  </p>
                </div>
                <button 
                  @click="fetchRequests" 
                  class="btn btn-outline"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner"></span>
                  Refresh
                </button>
              </div>
            </div>
            
            <VacationRequestsList
              :requests="filteredRequests"
              :loading="loading"
              user-role="validator"
              show-filters
              :empty-message="getEmptyMessage()"
              @filter-change="handleFilterChange"
              @approve-request="handleApproveRequest"
              @reject-request="handleRejectRequest"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Request Action Modal -->
    <RequestActionModal
      v-if="showActionModal"
      :request="selectedRequest"
      :action="currentAction"
      :validator-id="currentValidator.id"
      :loading="actionLoading"
      @confirm="handleActionConfirm"
      @cancel="handleActionCancel"
    />
  </div>
</template>

<script>
import { vacationRequestsAPI, usersAPI } from '@/services/api'
import { handleApiError } from '@/utils/helpers'
import UserSelector from '@/components/UserSelector.vue'
import VacationRequestsList from '@/components/VacationRequestsList.vue'
import Alert from '@/components/Alert.vue'
import RequestActionModal from '@/components/RequestActionModal.vue'

export default {
  name: 'ValidatorDashboard',
  components: {
    UserSelector,
    VacationRequestsList,
    Alert,
    RequestActionModal
  },
  props: {
    validatorId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      selectedValidatorId: this.validatorId,
      currentValidator: null,
      requests: [],
      filteredRequests: [],
      currentFilter: '',
      loading: false,
      alert: {
        show: false,
        type: 'info',
        title: '',
        message: ''
      },
      showActionModal: false,
      selectedRequest: null,
      currentAction: null,
      actionLoading: false
    }
  },
  async mounted() {
    if (this.validatorId) {
      this.selectedValidatorId = this.validatorId
      await this.loadValidatorData()
    }
  },
  watch: {
    validatorId(newValidatorId) {
      if (newValidatorId) {
        this.selectedValidatorId = newValidatorId
        this.loadValidatorData()
      }
    }
  },
  methods: {
    async handleValidatorSelected(validator) {
      this.currentValidator = validator
      if (validator) {
        await this.fetchRequests()
      } else {
        this.requests = []
        this.filteredRequests = []
      }
    },

    async loadValidatorData() {
      if (!this.selectedValidatorId) return

      try {
        const validatorResponse = await usersAPI.getById(this.selectedValidatorId)
        this.currentValidator = validatorResponse.data
        await this.fetchRequests()
      } catch (error) {
        console.error('Error loading validator data:', error)
        this.showAlert('error', 'Error', 'Failed to load validator data')
      }
    },

    async fetchRequests() {
      if (!this.currentValidator) return

      this.loading = true
      try {
        const response = await vacationRequestsAPI.getAll(this.currentFilter || null)
        this.requests = response.data || []
        this.applyFilter()
      } catch (error) {
        console.error('Error fetching requests:', error)
        this.showAlert('error', 'Error', 'Failed to load vacation requests')
        this.requests = []
        this.filteredRequests = []
      } finally {
        this.loading = false
      }
    },

    handleFilterChange(filter) {
      this.currentFilter = filter
      this.applyFilter()
    },

    applyFilter() {
      if (!this.currentFilter) {
        this.filteredRequests = [...this.requests]
      } else {
        this.filteredRequests = this.requests.filter(
          request => request.status === this.currentFilter
        )
      }
    },

    handleApproveRequest(request) {
      this.selectedRequest = request
      this.currentAction = 'approve'
      this.showActionModal = true
    },

    handleRejectRequest(request) {
      this.selectedRequest = request
      this.currentAction = 'reject'
      this.showActionModal = true
    },

    async handleActionConfirm(actionData) {
      this.actionLoading = true
      
      try {
        let response
        
        if (this.currentAction === 'approve') {
          response = await vacationRequestsAPI.approve(
            this.selectedRequest.id,
            actionData.validator_id,
            actionData.comments
          )
          this.showAlert('success', 'Request Approved', 
            `Vacation request for ${this.selectedRequest.user_name} has been approved.`)
        } else {
          response = await vacationRequestsAPI.reject(
            this.selectedRequest.id,
            actionData.validator_id,
            actionData.comments
          )
          this.showAlert('success', 'Request Rejected', 
            `Vacation request for ${this.selectedRequest.user_name} has been rejected.`)
        }

        // Update the request in our local data
        const updatedRequest = response.data
        const index = this.requests.findIndex(r => r.id === updatedRequest.id)
        if (index !== -1) {
          this.requests[index] = updatedRequest
          this.applyFilter()
        }

        this.handleActionCancel()
        
      } catch (error) {
        console.error(`Error ${this.currentAction}ing request:`, error)
        const errorMessage = handleApiError(error)
        this.showAlert('error', 
          `${this.currentAction === 'approve' ? 'Approval' : 'Rejection'} Failed`, 
          errorMessage)
      } finally {
        this.actionLoading = false
      }
    },

    handleActionCancel() {
      this.showActionModal = false
      this.selectedRequest = null
      this.currentAction = null
      this.actionLoading = false
    },

    getRequestsCountByStatus(status) {
      return this.requests.filter(request => request.status === status).length
    },

    getEmptyMessage() {
      if (this.currentFilter) {
        return `No ${this.currentFilter} vacation requests found.`
      }
      return 'No vacation requests found.'
    },

    showAlert(type, title, message) {
      this.alert = {
        show: true,
        type,
        title,
        message
      }
    }
  }
}
</script>

<style scoped>
.validator-dashboard {
  padding: 0;
}

.dashboard-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 3rem 0;
}

.header-content {
  text-align: center;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.dashboard-description {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.user-selection-section {
  padding: 2rem 0;
}

.dashboard-content {
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.validator-info-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
}

.validator-info-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar-large {
  width: 64px;
  height: 64px;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.validator-info-details h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.validator-info-details p {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
}

.overview-section {
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.pending {
  background: rgba(245, 158, 11, 0.1);
}

.stat-icon.approved {
  background: rgba(16, 185, 129, 0.1);
}

.stat-icon.rejected {
  background: rgba(239, 68, 68, 0.1);
}

.stat-icon.total {
  background: rgba(37, 99, 235, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}

.requests-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-description {
    font-size: 1rem;
  }

  .validator-info-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .user-avatar-large {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .requests-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>